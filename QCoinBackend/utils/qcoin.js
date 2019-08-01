let Web3 = require('web3');
let web3 = new Web3();
let provider = new Web3.providers.HttpProvider("http://10.239.141.32:8200");
const abiDecoder = require('abi-decoder'); // NodeJS

web3.setProvider(provider);
const qcoinAbi = [
    {
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "allocateQcoin",
        "outputs": [
            {
                "name": "success",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_user",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "addFrozenBalance",
        "outputs": [
            {
                "name": "success",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_from",
                "type": "address"
            },
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_from",
                "type": "address"
            },
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "increaseApprovalByAdmin",
        "outputs": [
            {
                "name": "success",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "value_",
                "type": "uint256"
            }
        ],
        "name": "withdraw",
        "outputs": [
            {
                "name": "success",
                "type": "bool"
            }
        ],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "mint",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_user",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "releaseFrozenBalance",
        "outputs": [
            {
                "name": "success",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_subtractedValue",
                "type": "uint256"
            }
        ],
        "name": "decreaseApproval",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "action",
                "type": "uint8"
            },
            {
                "name": "userId",
                "type": "uint32"
            },
            {
                "name": "changeId",
                "type": "uint32"
            },
            {
                "name": "decision",
                "type": "int8"
            },
            {
                "name": "cost",
                "type": "uint256"
            },
            {
                "name": "value",
                "type": "int256"
            },
            {
                "name": "to",
                "type": "address"
            },
            {
                "name": "reviewType",
                "type": "uint8"
            }
        ],
        "name": "emitTransactionEvent",
        "outputs": [
            {
                "name": "success",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            }
        ],
        "name": "allocateEther",
        "outputs": [
            {
                "name": "success",
                "type": "bool"
            }
        ],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getFrozenBalance",
        "outputs": [
            {
                "name": "frozenBalance",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "deposit",
        "outputs": [
            {
                "name": "success",
                "type": "bool"
            }
        ],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_addedValue",
                "type": "uint256"
            }
        ],
        "name": "increaseApproval",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            },
            {
                "name": "_spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getAdminOwner",
        "outputs": [
            {
                "name": "admin",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "_admin",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "payable": true,
        "stateMutability": "payable",
        "type": "fallback"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "qcoinAddress",
                "type": "address"
            }
        ],
        "name": "QcoinCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Deposit",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Withdraw",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "Tokentype",
                "type": "string"
            }
        ],
        "name": "Allocate",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Mint",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "action",
                "type": "uint8"
            },
            {
                "indexed": false,
                "name": "time",
                "type": "uint256"
            },
            {
                "indexed": true,
                "name": "userId",
                "type": "uint32"
            },
            {
                "indexed": true,
                "name": "changeId",
                "type": "uint32"
            },
            {
                "indexed": false,
                "name": "decision",
                "type": "int8"
            },
            {
                "indexed": false,
                "name": "cost",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "int256"
            },
            {
                "indexed": false,
                "name": "balance",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "reviewType",
                "type": "uint8"
            }
        ],
        "name": "Transaction",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "from",
                "type": "address"
            }
        ],
        "name": "TokenIncoming",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    }
];
const qcoinAdminAbi = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "changeId",
                "type": "uint32"
            },
            {
                "indexed": false,
                "name": "outcome",
                "type": "bool"
            },
            {
                "indexed": true,
                "name": "time",
                "type": "uint256"
            }
        ],
        "name": "OutcomeSet",
        "type": "event"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_changeId",
                "type": "uint32"
            },
            {
                "name": "_userId",
                "type": "uint32"
            },
            {
                "name": "_decision",
                "type": "int8"
            }
        ],
        "name": "addBet",
        "outputs": [
            {
                "name": "success",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_userId",
                "type": "uint32"
            },
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "allocateQcoin",
        "outputs": [
            {
                "name": "success",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_changeId",
                "type": "uint32"
            }
        ],
        "name": "createChange",
        "outputs": [
            {
                "name": "change",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_userId",
                "type": "uint32"
            },
            {
                "name": "_userAddress",
                "type": "address"
            }
        ],
        "name": "createUser",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_changeId",
                "type": "uint32"
            },
            {
                "name": "minWinningRate",
                "type": "uint8"
            }
        ],
        "name": "setMinWinningRate",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_changeId",
                "type": "uint32"
            },
            {
                "name": "_isPass",
                "type": "bool"
            }
        ],
        "name": "setOutcome",
        "outputs": [
            {
                "name": "success",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getAdminOwner",
        "outputs": [
            {
                "name": "admin",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_userId",
                "type": "uint32"
            }
        ],
        "name": "getBalance",
        "outputs": [
            {
                "name": "qcoinBalance",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_changeId",
                "type": "uint32"
            },
            {
                "name": "_userId",
                "type": "uint32"
            }
        ],
        "name": "getBetInfo",
        "outputs": [
            {
                "name": "decision",
                "type": "int8"
            },
            {
                "name": "value",
                "type": "uint256"
            },
            {
                "name": "winning",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_changeId",
                "type": "uint32"
            }
        ],
        "name": "getChange",
        "outputs": [
            {
                "name": "changeAddress",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_changeId",
                "type": "uint32"
            }
        ],
        "name": "getChangeOutcome",
        "outputs": [
            {
                "name": "outcome",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_userId",
                "type": "uint32"
            }
        ],
        "name": "getFrozenBalance",
        "outputs": [
            {
                "name": "qcoinFrozenBalance",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getQcoin",
        "outputs": [
            {
                "name": "qcoin",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_changeId",
                "type": "uint32"
            }
        ],
        "name": "getReviewers",
        "outputs": [
            {
                "name": "reviewers",
                "type": "uint32[]"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_userId",
                "type": "uint32"
            }
        ],
        "name": "getUserAddress",
        "outputs": [
            {
                "name": "userAddress",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_changeId",
                "type": "uint32"
            }
        ],
        "name": "isChangeExisted",
        "outputs": [
            {
                "name": "isExisted",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_changeId",
                "type": "uint32"
            }
        ],
        "name": "isOutcomeSet",
        "outputs": [
            {
                "name": "isSet",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_address",
                "type": "address"
            }
        ],
        "name": "isOwner",
        "outputs": [
            {
                "name": "admin",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_userId",
                "type": "uint32"
            }
        ],
        "name": "isUserCreated",
        "outputs": [
            {
                "name": "isCreatedBefore",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];
const zeroAddress = "0x0000000000000000000000000000000000000000";
const qcoinAdminAddress = "0x73e4c537f7f8560926a3ba1829dca16c43fd79bc";

/**
 * @class Qcoin the util to access smart contract on blockchain
 */
class Qcoin {

    static get qcoinAbi() {
        return qcoinAbi;
    }

    static get qcoinAdminAbi() {
        return qcoinAdminAbi;
    }

    static get qcoinAdminAddress() {
        return qcoinAdminAddress;
    }

    static get zeroAddress() {
        return zeroAddress;
    }

    /**
     * @method
     * @desc Init the address of coinbase, init QcoinAdmin & Qcoin
     * @returns {Promise<void>}
     */
    async initBlockchain() {
        this.coinbase = await web3.eth.getCoinbase();
        this.defaultSend = {from: this.coinbase, gasPrice: 1, gas: 100000000};
        this.qcoinAdmin = new web3.eth.Contract(Qcoin.qcoinAdminAbi, Qcoin.qcoinAdminAddress, this.defaultSend);
        this.qcoin = new web3.eth.Contract(Qcoin.qcoinAbi, await this.qcoinAdmin.methods.getQcoin().call(), this.defaultSend)
        abiDecoder.addABI(qcoinAdminAbi);

    }

    /**
     * @method
     * @param {number|string} blockIdentifier - block Number/Hash
     * @desc get BlockDetail including parsing input and extraData to human readable format
     * @returns {Promise<Block>}
     */
    async getBlockDetailAt(blockIdentifier) {
        let blockDetail = await web3.eth.getBlock(blockIdentifier, true);
        delete blockDetail.logsBloom;//no using
        blockDetail.extraData = {
            hex: blockDetail.extraData,
            decoded: web3.utils.toAscii(blockDetail.extraData)
        };
        let transactions = blockDetail.transactions;
        if (transactions.length > 0) {
            let count = 0;
            let promise = new Promise(function (resolve) {
                transactions.forEach(async transaction => {
                    transactions[transaction.transactionIndex].input = {
                        hex: transaction.input,
                        decoded: abiDecoder.decodeMethod(transaction.input)
                    };
                    transactions[transaction.transactionIndex].receipt = await web3.eth.getTransactionReceipt(transaction.hash);
                    count++;
                    if (count === transactions.length) {
                        resolve()
                    }

                })
            });
            await promise;
        }
        return blockDetail;


    }

    /**
     * @method
     * @param {number} userId - The user's Id in gerrit
     * @desc get user's address in blockchain according to Id
     * @returns {Promise<string>} The user's address in blockchain``
     */
    async getUserAddress(userId) {
        return this.qcoinAdmin.methods.getUserAddress(userId).call();
    }

    /**
     * @method
     * @param {number} userId - The user's Id in gerrit
     * @desc get whether the user's account is created before on blockchain
     * @returns {Promise<boolean>} Whether the user's account is created before on blockchain
     */
    async isUserCreated(userId) {
        return await this.getUserAddress(userId) !== Qcoin.zeroAddress
    }

    /**
     * @method
     * @param {number} userId - The user's Id in gerrit
     * @desc get user's total balance and frozen balance according to Id
     * @returns {Promise<{total: number, frozen: number}>} The user's total balance and frozen balance
     */
    async getQcoinBalance(userId) {
        return {
            total: parseInt(await this.qcoinAdmin.methods.getBalance(userId).call()),
            frozen: parseInt(await this.qcoinAdmin.methods.getFrozenBalance(userId).call())
        };

    }

    /**
     * @method
     * @param {Object} change - The parsed change from gerrit
     * @example {"changeId":12345,"reviews":[{"value":2,"userId":123},{"value":1,"userId":345}]}
     * @desc create the change and bets on blockchain from a merged change in gerrit
     * @returns {Promise<String>}
     */
    async createChange(change) {
        if (!await this.qcoinAdmin.methods.isChangeExisted(change.changeId).call()) {//if change no existed, then created
            await this.qcoinAdmin.methods.createChange(change.changeId).send();
            change.reviews.forEach(async (review) => {
                if (await !this.isUserCreated(review.userId))//if the reviewer no created before, then created
                    await this.createAccount(review.userId);
                await this.qcoinAdmin.methods.addBet(change.changeId, review.userId, review.value).send();//add bet
                return this.qcoinAdmin.methods.getChange(change.changeId).call()
            });
        }

    }

    /**
     * @method
     * @param {Array<{
     *              changeId: number,
     *              reviewers: Array<{
     *                  value:number,
     *                  userId:number
     *                  }>
     *              }>
     *        } changes - the change lists
     * @param {boolean} isRandomOutcome - where set random outcome immediately
     * @param {function(array)} callback - callback when finished
     * @example
     [
     {
            "changeId": 502582,
            "reviews": [
             {
                "value": 2,
                "userId": 174
              }
            ]
          },
     {
            "changeId": 502589,
            "reviews": [
              {
                "value": 2,
                "userId": 174
              }
            ]
          }
     ]
     * @desc create the changes and bets on blockchain from mulitple merged changes in gerrit
     * @returns {Promise<Array[{changeId:number,changeAddress:string}]>}
     */
    async createChanges(changes, isRandomOutcome = false) {//Logics/grammars of the function unclear
        let users = [];
        changes.forEach(change => {//get all distinct reviewers
            change.reviews.forEach(review => {
                if (users.indexOf(review.userId) === -1)
                    users.push(review.userId)
            })
        });
        let userCount = 0;
        let changeCount = 0;
        let changesAddresses = [];
        users.forEach(async (userId) =>  {//create all reviewers if not existed yet
            if (await this.getUserAddress(userId) === Qcoin.zeroAddress)
                await this.createAccount(userId);
            userCount++;
            if (userCount === users.length) {//all reviewers' account has been created
                await new Promise(resolve => {//wait resolve promise
                    changes.forEach(async (change) => {//on every change
                        if (!await this.qcoinAdmin.methods.isChangeExisted(change.changeId).call()) //create change
                            await this.qcoinAdmin.methods.createChange(change.changeId).send();
                        let reviewCount = 0;
                        let addedReviewers = await this.qcoinAdmin.methods.getReviewers(change.changeId).call();//The statement above only added the change, not reviews(bets)
                        change.reviews.forEach(async (review) => {//add bet on every review in each change
                                if (addedReviewers.indexOf(review.userId.toString()) === -1)//if the bet is not added
                                    await this.qcoinAdmin.methods.addBet(change.changeId, review.userId, review.value).send();
                                reviewCount++;
                                if (change.reviews.length === reviewCount) {//all the reviews has been added on this change
                                    if (isRandomOutcome)//if choose to set random outcome
                                        this.setOutcome(change.changeId, Math.random() >= 0.2);
                                    changesAddresses.push({
                                        changeId: change.changeId,
                                        changeAddress: await this.qcoinAdmin.methods.getChange(change.changeId).call()
                                    });
                                    changeCount++;
                                    if (changeCount === changes.length)//all changes have finished processing
                                        resolve();
                                }
                            }
                        )
                    })

                });
                return changesAddresses;
            }
        })
    }

    /**
     *
     * @param {number} changeId
     * @param {boolean} outcome  whether the change is passed or not
     * @desc set the outcome by change Id and outcome
     * @returns {Promise<{recepit:Object,error:error}>}
     */
    async setOutcome(changeId, outcome) {
        let [receipt, error] = await this.qcoinAdmin.methods.setOutcome(changeId, outcome).send()
            .then(receipt => [receipt])
            .catch(e => [null, e]);
        return {
            receipt: receipt,
            error: error
        };

    }

    /**
     *
     * @param changeId
     * @desc get the change's existence status and outcome
     * @returns {Promise<{isExisted: boolean, outcome: boolean}>}
     */
    async getChangeInfo(changeId) {
        let isExisted = await this.qcoinAdmin.methods.isChangeExisted(changeId).call();
        let outcome = null;
        if (isExisted)
            outcome = await this.qcoinAdmin.methods.isOutcomeSet(changeId).call() ?
                await this.qcoinAdmin.methods.getChangeOutcome(changeId).call() : null
        return {
            isExisted: isExisted,
            outcome: outcome
        }


    }

    /**
     *
     * @param {number} changeId
     * @param {number} userId
     * @desc get Bet Info of one user on specific change
     * @returns {Promise<*>}
     * @example
     * {
     *     isExisted:true.
     *     isOutcomeSet: true,
     *     decision: 2,
     *     value: 200,
     *     winning: 100
     * }
     */
    async getBetInfo(changeId, userId) {
        if (await this.qcoinAdmin.methods.isChangeExisted(changeId).call()) {
            let isOutcomeSet = await this.qcoinAdmin.methods.isOutcomeSet(changeId).call();
            let result = await this.qcoinAdmin.methods.getBetInfo(changeId, userId).call();
            if (isOutcomeSet)
                return {
                    isExisted: true,
                    isOutcomeSet: true,
                    decision: parseInt(result.decision),
                    value: parseInt(result.value),
                    winning: parseInt(result.winning)
                };
            else
                return {
                    isExisted: true,
                    isOutcomeSet: false,
                    decision: parseInt(result.decision),
                    value: parseInt(result.value),
                }

        }
        else return {isExisted: false, isOutcomeSet: false}


    }

    /**
     * @method
     * @param {number} userId
     * @param {string} password
     * @returns {Promise<{userId: string, userAddr: string, qcoinBalance: {total: number, frozen: number}}>}
     */
    async createAccount(userId, password = 'password',) {
        let userAddr = await this.getUserAddress(userId);
        if (userAddr === Qcoin.zeroAddress) {//not created before
            let userAddr = await web3.eth.personal.newAccount(password);
            await this.qcoinAdmin.methods.createUser(userId, userAddr).send();
            return {
                userId: userId,
                userAddr: userAddr,
                qcoinBalance: await this.getQcoinBalance(userId)
            };
        }
        else {//the user is already created before
            return {
                userId: userId,
                userAddr: userAddr,
                qcoinBalance: await this.getQcoinBalance(userId)
            };

        }

    }

    /**
     *
     * @param {number} userId
     * @desc get all transaction history of the user
     * @returns {Promise<{results: Array, sum: {win: {"2": {"1": number, "2": number, "3": number, "4": number, sum: number}, "1": {"1": number, "2": number, "3": number, "4": number, sum: number}, "-1": {"1": number, "2": number, "3": number, "4": number, sum: number}}, lose: {"2": {"1": number, "2": number, "3": number, "4": number, sum: number}, "1": {"1": number, "2": number, "3": number, "4": number, sum: number}, "-1": {"1": number, "2": number, "3": number, "4": number, sum: number}}, total: {"2": {"1": number, "2": number, "3": number, "4": number, sum: number}, "1": {"1": number, "2": number, "3": number, "4": number, sum: number}, "-1": {"1": number, "2": number, "3": number, "4": number, sum: number}}}}>}
     */
    async getTransferHistory(userId) {
        let events = await this.qcoin.getPastEvents('Transaction', {
            filter: {userId: userId},
            fromBlock: 0,
            toBlock: 'latest'
        });
        let results = [];
        let sum = {
            win: {
                '2': {1: 0, 2: 0, 3: 0, 4: 0, sum: 0},
                '1': {1: 0, 2: 0, 3: 0, 4: 0, sum: 0},
                '-1': {1: 0, 2: 0, 3: 0, 4: 0, sum: 0}
            },
            lose: {
                '2': {1: 0, 2: 0, 3: 0, 4: 0, sum: 0},
                '1': {1: 0, 2: 0, 3: 0, 4: 0, sum: 0},
                '-1': {1: 0, 2: 0, 3: 0, 4: 0, sum: 0}
            },
            total: {
                '2': {1: 0, 2: 0, 3: 0, 4: 0, sum: 0},
                '1': {1: 0, 2: 0, 3: 0, 4: 0, sum: 0},
                '-1': {1: 0, 2: 0, 3: 0, 4: 0, sum: 0}
            }
        };
        events.forEach(event => {
            let r = event.returnValues;
            let type = parseInt(r.reviewType);
            let action = parseInt(r.action);
            let value = parseInt(r.value);
            let decision = r.decision;
            if (type > 0) {
                sum.total[decision][type] += value;
                sum.total[decision].sum += value;
                if (action === 2) {
                    sum.win[decision].sum += value;
                    sum.win[decision][type] += value;
                }
                else if (action === 3) {
                    sum.lose[decision][type] += Math.abs(value);
                    sum.lose[decision].sum += Math.abs(value);
                }

            }
            results.push({
                action: action,
                time: parseInt(r.time) * 1000,
                userId: r.userId,
                changeId: r.changeId,
                decision: parseInt(r.decision),
                cost: parseInt(r.cost),
                value: value,
                balance: parseInt(r.balance),
                type: type,
            })
        });
        return {results: results, sum: sum}
    }

    /**
     *
     * @param {number} blockNumber - the block number of which block is needed to get all events
     * @returns {Promise<Array>}
     */
    async getAllTransactionEventsAtBlock(blockNumber) {
        let events = await this.qcoin.getPastEvents('Transaction', {
            fromBlock: blockNumber,
            toBlock: blockNumber
        });
        let eventsArray = [];
        events.forEach(event => {
            let r = event.returnValues;
            eventsArray.push(
                {
                    action: parseInt(r.action),
                    time: parseInt(r.time) * 1000,
                    userId: r.userId,
                    changeId: r.changeId,
                    decision: parseInt(r.decision),
                    cost: parseInt(r.cost),
                    value: parseInt(r.value),
                    balance: parseInt(r.balance),
                    type: parseInt(r.reviewType),
                }
            )
        });
        return (eventsArray)
    }

    /**
     *
     * @param {string} address - the account address
     * @param {string} password
     * @param {number} time
     * @desc unlock the account by address and password, return true is password if valid, else false
     * @returns {Promise<boolean>} whether the password is valid
     */
    static async unlockAccount(address, password, time) {
        try {
            await web3.eth.personal.unlockAccount(address, password, time);
            return true
        } catch (e) {
            console.log(e);
            return false
        }
    }

}

module.exports = Qcoin;
