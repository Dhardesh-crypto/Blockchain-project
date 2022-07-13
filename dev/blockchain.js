const sha256 = require("sha256");
const { v4: uuidv4 } = require("uuid");
const currentNodeUrl = process.argv[3];

/* Constructor function for our Blockchain class */
function Blockchain() {
  this.chain = [];
  this.pendingTransactions = [];

  this.currentNodeUrl = currentNodeUrl;
  this.networkNodes = [];

  // Mining the genesis block
  this.createNewBlock(100, "0", "0");
}

/**
 * createNewBlock creates a new block on the blockchain and return is. The new block stores all
 * the pendingTransactions since the previous block was mined and resets the pendingTransactions array
 * for the next block to be mined
 * @param {numerical value} nonce
 * @param {SHA256 hashed string} previousBlockHash
 * @param {SHA256 hashed string} hash
 * @returns newBlock
 */
Blockchain.prototype.createNewBlock = function (
  nonce,
  previousBlockHash,
  hash
) {
  // The new block that is going to be added to the this.chain has the following properties
  const newBlock = {
    index: this.chain.length + 1,
    timestamp: Date.now(),
    transactions: this.pendingTransactions,
    nonce,
    hash,
    previousBlockHash,
  };

  // Since the new block stores all the pendingTransactions,
  // we are going to reset the pendingTransactions for the next block
  this.pendingTransactions = [];

  // Now push the newBlock onto the chain
  this.chain.push(newBlock);

  return newBlock;
};

/**
 * getLastBlock retrieves the last stored block in the chain array if there are any.
 * Otherwise it will return an empty object {}
 * @returns block
 */
Blockchain.prototype.getLastBlock = function () {
  if (this.chain?.length > 0) {
    return this.chain[this.chain.length - 1];
  } else {
    return {};
  }
};

/**
 * createNewTransaction creates a new transaction object and pushes it
 * onto the pendingTransactions array
 * @param {double} amount
 * @param {wallet address} sender
 * @param {wallet address} recipient
 * @returns index of block in which the new transaction will be stored
 */
Blockchain.prototype.createNewTransaction = function (
  amount,
  sender,
  recipient
) {
  // The new transaction has an amount, sender and recipient as properties
  const newTransaction = {
    amount,
    sender,
    recipient,
    transactionId: uuidv4().split("-").join(""),
  };

  return newTransaction;
};

Blockchain.prototype.addTransactionToPendingTransactions = function (
  transactionObj
) {
  // Adding the new transaction to the newTransactions array
  this.pendingTransactions.push(transactionObj);
  return this.getLastBlock()["index"] + 1;
};

/**
 * hashBlock creates a SHA256 hash based upon the previousBlockHash, nonce and currentBlockdata
 * @param {hashed string} previousBlockHash
 * @param {block object} currentBlockData
 * @param {number} nonce
 * @returns hash as string
 */
Blockchain.prototype.hashBlock = function (
  previousBlockHash,
  currentBlockData,
  nonce
) {
  // In order for a hash to work, we have to convert all used data into one long string
  const dataAsString =
    previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);

  const hash = sha256(dataAsString);

  return hash;
};

/**
 * proofOfWork will continuously hashBlock with a different nonce until the correct
 * nonce has been found that produces a hash that starts with 4 zero's
 * @param {string} previousBlockHash
 * @param {blockdata object} currentBlockData
 * @returns nonce
 */
Blockchain.prototype.proofOfWork = function (
  previousBlockHash,
  currentBlockData
) {
  // repeatedly hash block until if finds correct hash starting with 4 zero's
  // use currentBlockData for the hash, but also the previousBlockHash
  // continuously change the nonce value until it finds the correct hash

  let nonce = 0;
  let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
  while (hash.substring(0, 4) !== "0000") {
    nonce++;
    hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
  }

  // return to us the nonce value that creates the correct hash
  return nonce;
};

/**
 * chainIsValid will determine of the
 */
Blockchain.prototype.chainIsValid = function (blockchain) {
  let validChain = true;

  // Checking the validity of the genesis block with { 100, '0', '0', [] }
  const genesisBlock = blockchain[0];
  const correctNonce = genesisBlock['nonce'] === 100;
  const correctPreviousBlockHash = genesisBlock['previousBlockHash'] === '0';
  const correctHash = genesisBlock['hash'] === '0';
  const correctNumberOfTransactions = genesisBlock['transactions'].length === 0;

  if (!correctNonce || !correctPreviousBlockHash || !correctHash || !correctNumberOfTransactions) {
    validChain = false;
    return false;
  }

  // console.log(`Genesis block is valid = ${validChain}`);

  for (let i = 1; i < blockchain.length; i++) {
    const currentBlock = blockchain[i];
    const previousBlock = blockchain[i - 1];
    
    const currentBlockData = {
      transactions: currentBlock["transactions"],
      index: currentBlock["index"],
    };

    const blockHash = this.hashBlock(
      previousBlock["hash"],
      currentBlockData,
      currentBlock["nonce"]
    );

    console.log(`Block ${currentBlock["index"]} : ${currentBlock["previousBlockHash"]} = ${previousBlock["hash"]} : ${currentBlock["previousBlockHash"] === previousBlock["hash"]}`);

    if (
      blockHash.substring(0, 4) !== "0000" ||
      currentBlock["previousBlockHash"] !== previousBlock["hash"]
    ) {
      // Chain is not valid
      validChain = false;
      return false;
    }
    // console.log(`Block ${currentBlock.index} is valid = ${validChain}`);
  }

  return validChain;
};

Blockchain.prototype.getBlock = function(blockHash) {
  const correctBlockArray = this.chain.filter(block => block.hash === blockHash);
  return correctBlockArray.length > 0 ? correctBlockArray[0] : null;
};

Blockchain.prototype.getTransaction = function(transactionId) {
  let correctTransaction = null;
  let correctBlock = null;
  
  this.chain.forEach(block => {
    const foundTransactionArray = block.transactions.filter(transaction => transaction.transactionId === transactionId);
    
    if (foundTransactionArray.length > 0) { 
      correctBlock = block;
      correctTransaction = foundTransactionArray[0]; 
    }
  });

  return { 
    transaction: correctTransaction,
    block: correctBlock
  };
};

Blockchain.prototype.getAddressData = function(address) {
  let transactionArray = [];
  const blockArray = [];

  this.chain.forEach(block => {
    const foundTransactionArray = block.transactions.filter(transaction => transaction.sender === address || transaction.recipient === address);
    if (foundTransactionArray.length > 0) {
      transactionArray = [...transactionArray, ...foundTransactionArray];
      blockArray.push(block);
    }
  });

  let balance = 0;
  transactionArray.forEach(transaction => {
    if (transaction.recipient === address) {
      balance += transaction.amount;
    }
    else {
      balance -= transaction.amount;
    }
  })

  return {
    balance: balance,
    transactions: transactionArray.length > 0 ? transactionArray : [],
    blocks: blockArray.length > 0 ? blockArray : []
  }
}

module.exports = Blockchain;
