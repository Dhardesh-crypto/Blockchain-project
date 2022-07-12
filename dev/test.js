const Blockchain = require('./blockchain');

const bitcoin = new Blockchain();

const myBlockchain = {
    "chain": [
    {
    "index": 1,
    "timestamp": 1657624927762,
    "transactions": [],
    "nonce": 100,
    "hash": "0",
    "previousBlockHash": "0"
    },
    {
    "index": 2,
    "timestamp": 1657625152794,
    "transactions": [
    {
    "amount": 30,
    "sender": "ERIK12QW450DER",
    "recipient": "DAVID09RTY4561WE",
    "transactionId": "09b52f1693e94a07a27687a7551f11aa"
    },
    {
    "amount": 300,
    "sender": "ERIK12QW450DER",
    "recipient": "DAVID09RTY4561WE",
    "transactionId": "ce834bc29ed5498597a39ca0694c3a36"
    },
    {
    "amount": 35,
    "sender": "ERIK12QW450DER",
    "recipient": "DAVID09RTY4561WE",
    "transactionId": "84d3205c2c5d4dc7bf5171b3372fdea2"
    },
    {
    "amount": 40,
    "sender": "ERIK12QW450DER",
    "recipient": "DAVID09RTY4561WE",
    "transactionId": "be985042da3f4c57b6bea6a4e5d1c2e7"
    },
    {
    "amount": 400,
    "sender": "ERIK12QW450DER",
    "recipient": "DAVID09RTY4561WE",
    "transactionId": "113228874fc241b69f7d836eb418946c"
    },
    {
    "amount": 500,
    "sender": "ERIK12QW450DER",
    "recipient": "DAVID09RTY4561WE",
    "transactionId": "d703ec127199445aadd77c6012072d99"
    }
    ],
    "nonce": 66346,
    "hash": "0000206f4b6467344e86472b4ccb4a99ffa23bdd707e218510d43d36a221c7d4",
    "previousBlockHash": "0"
    },
    {
    "index": 3,
    "timestamp": 1657625175047,
    "transactions": [
    {
    "amount": 6.25,
    "sender": "00",
    "recipient": "d9ffd009c79b43fd825ecdf2cb7c7acd",
    "transactionId": "d416e0cb4d734c518ec274c2a20fec98"
    },
    {
    "amount": 500,
    "sender": "ERIK12QW450DER",
    "recipient": "DAVID09RTY4561WE",
    "transactionId": "55dfeb0fbae84f398b10789fd823d370"
    }
    ],
    "nonce": 24063,
    "hash": "000066f9a6d258057976a50f71da76bac306acdf03fe6fbba7688780248b033b",
    "previousBlockHash": "0000206f4b6467344e86472b4ccb4a99ffa23bdd707e218510d43d36a221c7d4"
    },
    {
    "index": 4,
    "timestamp": 1657625260907,
    "transactions": [
    {
    "amount": 6.25,
    "sender": "00",
    "recipient": "d9ffd009c79b43fd825ecdf2cb7c7acd",
    "transactionId": "78d0afc705974fb0abf11aefbee34ce9"
    },
    {
    "amount": 30,
    "sender": "ERIK12QW450DER",
    "recipient": "DAVID09RTY4561WE",
    "transactionId": "33b9f2b18d5b4c829c998340bab71b1d"
    },
    {
    "amount": 305,
    "sender": "ERIK12QW450DER",
    "recipient": "DAVID09RTY4561WE",
    "transactionId": "82bc3464975e4a69880177a1f060e033"
    }
    ],
    "nonce": 11335,
    "hash": "0000d3e5da74dcc971450a2b77ac572a1c08308fd6cf1c596afdd3f118557f8a",
    "previousBlockHash": "000066f9a6d258057976a50f71da76bac306acdf03fe6fbba7688780248b033b"
    },
    {
    "index": 5,
    "timestamp": 1657625374654,
    "transactions": [
    {
    "amount": 6.25,
    "sender": "00",
    "recipient": "d9ffd009c79b43fd825ecdf2cb7c7acd",
    "transactionId": "4d6798c7e25948869e6baa58faa9ae29"
    }
    ],
    "nonce": 26551,
    "hash": "0000d80b37df227749b2d62c8a5fa09378d8518d92af93990d213de09d69f52a",
    "previousBlockHash": "0000d3e5da74dcc971450a2b77ac572a1c08308fd6cf1c596afdd3f118557f8a"
    },
    {
    "index": 6,
    "timestamp": 1657625376188,
    "transactions": [
    {
    "amount": 6.25,
    "sender": "00",
    "recipient": "d9ffd009c79b43fd825ecdf2cb7c7acd",
    "transactionId": "5a28923211284a3f9be6578e4027902f"
    }
    ],
    "nonce": 39564,
    "hash": "0000c57abc57edd3186a556b5a63a768800c16823a7ffe3a680c4241ebc82b6c",
    "previousBlockHash": "0000d80b37df227749b2d62c8a5fa09378d8518d92af93990d213de09d69f52a"
    }
    ],
    "pendingTransactions": [
    {
    "amount": 6.25,
    "sender": "00",
    "recipient": "d9ffd009c79b43fd825ecdf2cb7c7acd",
    "transactionId": "d11fd0375c0d4b7aba7a7f8d651a34bc"
    }
    ],
    "currentNodeUrl": "http://127.0.0.1:3001",
    "networkNodes": []
    };

console.log(bitcoin.chainIsValid(myBlockchain.chain));