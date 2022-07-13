const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const Blockchain = require("./blockchain");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios").default;

// Determine our port address and currentNodeUrl
// from our start script command in package.json
// which has the port number as argument
const port = process.argv[2];

const excalibur = new Blockchain();
const MINING_REWARD = 6.25;
const MINING_SENDER_ADDRESS = "00";
const NODE_ADDRESS = uuidv4().split("-").join(""); // We do not want - in our nodeaddress

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/**
 * Endpoint for returning the entire blockchain in JSON format
 */
app.get("/blockchain", function (req, res) {
  res.send(excalibur);
});

/**
 * Endpoint for creating a new transaction in the pendingTransactions array
 */
app.post("/transaction", function (req, res) {
  const newTransaction = req.body;
  const blockIndex =
    excalibur.addTransactionToPendingTransactions(newTransaction);
  res.json({ note: `Transaction will be added in block ${blockIndex}.` });
});

app.post("/transaction/broadcast", function (req, res) {
  const { amount, sender, recipient } = req.body;
  const newTransaction = excalibur.createNewTransaction(
    amount,
    sender,
    recipient
  );
  excalibur.addTransactionToPendingTransactions(newTransaction);

  const requestPromises = [];

  excalibur.networkNodes.forEach((networkNodeUrl) => {
    const requestOptions = {
      method: "post",
      url: networkNodeUrl + "/transaction",
      data: newTransaction,
    };
    requestPromises.push(axios(requestOptions));
  });

  Promise.all(requestPromises)
    .then((data) => {
      res.json({ note: "Transaction broadcast successfully" });
    })
    .catch((error) => {
      console.log(error);
      res.json({ note: error });
    });
});

/**
 * Endpoint for mining a new block. This will use the PoW mechanism
 */
app.get("/mine", function (req, res) {
  const lastBlock = excalibur.getLastBlock();
  const previousBlockHash = lastBlock["hash"];

  const currentBlockData = {
    transactions: excalibur.pendingTransactions,
    index: lastBlock["index"] + 1,
  };

  const nonce = excalibur.proofOfWork(previousBlockHash, currentBlockData);
  const blockHash = excalibur.hashBlock(
    previousBlockHash,
    currentBlockData,
    nonce
  );
  const newBlock = excalibur.createNewBlock(
    nonce,
    previousBlockHash,
    blockHash
  );

  const requestPromises = [];
  excalibur.networkNodes.forEach((networkNodeUrl) => {
    const requestOptions = {
      method: "post",
      url: networkNodeUrl + "/receive-new-block",
      data: { newBlock: newBlock },
    };

    requestPromises.push(axios(requestOptions));
  });

  Promise.all(requestPromises)
    .then((data) => {
      const blockRewardRequestOptions = {
        method: "post",
        url: excalibur.currentNodeUrl + "/transaction/broadcast",
        data: {
          amount: MINING_REWARD,
          sender: MINING_SENDER_ADDRESS,
          recipient: NODE_ADDRESS,
        },
      };
      return axios(blockRewardRequestOptions);
    })
    .then((data) => {
      res.json({
        note: "New block mined and broadcast successfully",
        block: newBlock,
      });
    });
});

app.post("/receive-new-block", function (req, res) {
  const { newBlock } = req.body;

  /* Time to do some checks if the newBlock may be added to the local chain */
  const lastBlock = excalibur.getLastBlock();
  const correctHash = lastBlock.hash === newBlock.previousBlockHash;
  const correctIndex = lastBlock["index"] + 1 === newBlock["index"];

  if (correctHash && correctIndex) {
    excalibur.chain.push(newBlock);
    excalibur.pendingTransactions = []; // TODO: This line need an update to only clear our transactions inside the new block
    res.json({
      note: "New block received and accepted to local chain",
      newBlock: newBlock,
    });
  } else {
    res.json({
      note: "New block received and rejected",
      newBlock: newBlock,
      correctHash: correctHash,
      correctIndex: correctIndex,
    });
  }
});

/**
 * Endpoint for registering a new node and broadcasting it to the entire network
 */
app.post("/register-and-broadcast-node", function (req, res) {
  const { newNodeUrl } = req.body;
  if (excalibur.networkNodes.indexOf(newNodeUrl) == -1) {
    excalibur.networkNodes.push(newNodeUrl);
  }

  const regNodesPromises = [];
  excalibur.networkNodes.forEach((networkNodeUrl) => {
    const requestOptions = {
      method: "post",
      url: networkNodeUrl + "/register-node",
      data: {
        newNodeUrl: newNodeUrl,
      },
    };

    regNodesPromises.push(axios(requestOptions));

    Promise.all(regNodesPromises)
      .then((data) => {
        const bulkRegisterOptions = {
          method: "post",
          url: newNodeUrl + "/register-nodes-bulk",
          data: {
            allNetworkNodes: [
              ...excalibur.networkNodes,
              excalibur.currentNodeUrl,
            ],
          },
        };
        return axios(bulkRegisterOptions);
      })
      .then((data) => {
        res.json({ note: "New node registered with network successfully" });
      })
      .catch((error) => {
        console.log(error);
      });
  });
});

/**
 * Endpoint for registering a new node with the network which has been broadcasted
 * This is the receiver function for the broadcasted message
 */
app.post("/register-node", function (req, res) {
  const { newNodeUrl } = req.body;
  console.log(`Registering new node ${newNodeUrl}`);
  const notCurrentNode = excalibur.currentNodeUrl !== newNodeUrl;
  const nodeAlreadyPresent = excalibur.networkNodes.indexOf(newNodeUrl) != -1;
  if (!nodeAlreadyPresent && notCurrentNode) {
    excalibur.networkNodes.push(newNodeUrl);
    res.json({
      note: `New node ${newNodeUrl} registered successfully with node ${excalibur.currentNodeUrl}`,
    });
  } else {
    res.json({
      note: `Node ${newNodeUrl} already registered with node ${excalibur.currentNodeUrl}`,
    });
  }
});

/**
 * Endpoint for registering multiple nodes in one go.
 * This is to be used to update a new node with the already existing nodes in the network
 */
app.post("/register-nodes-bulk", function (req, res) {
  const { allNetworkNodes } = req.body;
  console.log(`Registering existing nodes ${allNetworkNodes}`);

  allNetworkNodes.forEach((newNodeUrl) => {
    const notCurrentNode = excalibur.currentNodeUrl !== newNodeUrl;
    const nodeAlreadyPresent = excalibur.networkNodes.indexOf(newNodeUrl) != -1;
    if (!nodeAlreadyPresent && notCurrentNode) {
      excalibur.networkNodes.push(newNodeUrl);
    }
  });
  res.json({
    note: `Registering existing nodes ${allNetworkNodes} on new node successfully`,
  });
});

/**
 * Endpoint for checking if the current node is a valid node with the longest chain.
 * If not then replace it with the chain and pending transactions from the longest chain.
 */
app.get("/consensus", function (req, res) {
  if (excalibur.networkNodes.length === 0) {
    res.json({
      note: "No other networknodes present",
    });
  } else {
    const requestPromises = [];
    excalibur.networkNodes.forEach((networkNodeUrl) => {
      const requestOptions = {
        method: "get",
        url: networkNodeUrl + "/blockchain",
      };
      requestPromises.push(axios(requestOptions));
    });

    Promise.all(requestPromises).then((blockchains) => {
      // Blockchain length of the current hosted node
      const currentChainLength = excalibur.chain.length;
      let maxChainLength = currentChainLength; // Starting position for loop
      let newLongestChain = null;
      let newPendingTransactions = null;

      blockchains.forEach((blockchain) => {
        // Now go look for a blockchain node that has a longer chain
        // The actual chain is within the blockchain.data since we
        // are dealing with a response body which we called blockchain (mistake??)
        if (blockchain.data.chain.length > maxChainLength) {
          maxChainLength = blockchain.data.chain.length;
          newLongestChain = blockchain.data.chain;
          newPendingTransactions = blockchain.data.pendingTransactions;
        }
      });

      if (
        !newLongestChain ||
        (newLongestChain && !excalibur.chainIsValid(newLongestChain))
      ) {
        // Our current chain is the longest valid chain
        res.json({
          note: "Current chain has not been replaced.",
          chain: excalibur.chain,
        });
      } else {
        // Our current chain is not the longest valid chain and needs to be updated/replaced
        excalibur.chain = newLongestChain;
        excalibur.pendingTransactions = newPendingTransactions;
        res.json({
          note: "This chain and pending transactions have been replaced.",
          chain: excalibur.chain,
        });
      }
    });
  }
});

app.get('/block/:blockHash', function(req, res) {
  const { blockHash} = req.params;
  const correctBlock = excalibur.getBlock(blockHash);
  res.json({
    block: correctBlock
  });
});

app.get('/transaction/:transactionId', function(req, res) {
  const { transactionId} = req.params;
  const { block, transaction } = excalibur.getTransaction(transactionId);
  res.json({
    transaction: transaction,
    block: block
  });
});

app.get('/address/:address', function(req, res) {
  const { address } = req.params;
  const { balance, transactions, blocks } = excalibur.getAddressData(address);
  res.json({
    addressData: {
    address: address,
    addressTransactions: transactions,
    addressBalance: balance /*,
    blocks: blocks */
    }
  });
});

app.get('/block-explorer', function(req, res) {
  res.sendFile('./block-explorer/index.html', { root: __dirname });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}... for addres ${NODE_ADDRESS}`);
});
