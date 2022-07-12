# Blockchain-project
A blockchain build with NodeJS and EpxressJS

# Initialize by running:
npm i --save

# Start all nodes by running each node in a seperate terminal
npm run node_1
npm run node_2
npm run node_3
npm run node_4
npm run node_5

# All nodes are found on 
- http://localhost:3001
- http://localhost:3002
- http://localhost:3003
- http://localhost:3004
- http://localhost:3005

Test it out with postman (endpoints to call can be found in the dev/networkNode.js)

# Endpoint: /register-and-broadcast-node
With this endpoint you can register new nodes in the blockchain network
The newNodeUrl will be registered and broadcast to all other nodes.
Any new transaction done after registering will be picked up by the new node as well.

- method = POST
- URL = http://127.0.0.1:3001/register-and-broadcast-node
- body = raw + JSON
- bodytext = 
{
    "newNodeUrl": "http://localhost:3002"
}

# Endpoint: /transaction/broadcast
With this endpoint you can register new transactions from sender to recipient for a certain amount.
All registered nodes on the network will receive this transaction in their pendingTransactions array

- method = POST
- URL = http://localhost:3001/transaction/broadcast
- body = raw + JSON
- bodytext = 
{
    "amount": 305,
    "sender": "ERIK12QW450DER",
    "recipient": "DAVID09RTY4561WE"
}

# Endpoint: /mine
With this endpoint you can create a new block on the blockchain network. All pendingTransactions will be used
to mine a new block. Proof of Work is being used as mechanism (nonce variable will be used to get a SHA256 hashing
that starts with '0000'). The block reward is created as a transaction which will be picked up in the next block to be mined

- method = GET
- URL = http://localhost:3001/mine

# Endpoint: http://localhost:3004/consensus
With this endpoint you can synchronize a network node to get a valid copy of the longest chain in the network.

- method = GET
- URL = http://localhost:3004/consensus






