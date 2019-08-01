var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var qcoinConfig = require('../qcoinConfig');
var Qcoin = require("../utils/qcoin");
var request = require("request");
var gerrit = require("../utils/gerrit");
var jira = require("../utils/jira")
const QuickBuildUtil = require("../utils/quickBuilderUtil");
const GithubUtil = require("../utils/githubUtil");
const HsdesUtil = require("../utils/hsdesUtil")
const WorkerUtil = require("../WorkerUtil")
const gitAnalysisUtil = require("../utils/gitAnalysisUtil")
const MongoUtil = require('../utils/mongodbUtil')
let mongoUtil = new MongoUtil();
const path = require('path');

request = request.defaults({jar: true});//enable cookie


let qcoin = new Qcoin();

qcoin.initBlockchain().then(o => {
  Qcoin.unlockAccount(qcoin.coinbase, 'password', 1500000).then(o => {
    //console.log(o)
  })
});

/**
 * @method ParseToken
 * @param {Object} req - request from client
 * @returns {string|null} - return token if existed, otherwise null
 */
function parseToken(req) {
  let auth;
  if (!req.headers || !(auth = req.headers.authorization))
    return null;
  let parts = auth.split(' ');
  if (parts.length !== 2)
    return null;
  let schema = parts[0].toLowerCase();
  if (schema !== 'bearer') return null;
  return parts[1];
}

let jwtSecret = qcoinConfig.jwtSecret;
console.log(jwt.sign(
  {
    'Role': ['User'],
    'Cookie': 'GerritAccount=aQ4bfeivdnTJq5uHEzDRRig7tupYJ-YG'
  }, jwtSecret));
jwt.verify("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJSb2xlIjpbIlVzZXIiXSwiQ29va2llIjoiR2Vycml0QWNjb3VudD1hVE9lZm9TMXJrWU1WTkpLTWEuWVZxUlRqWVYwRDVoZCIsImlhdCI6MTUzNTYxMzgzN30.eedyopwWXsqPkv4tkB-Hagu4WxqKYXVp_zT0uA7wpSw", jwtSecret, function (e, r) {
  console.log(e, r)

})
var token = jwt.sign({'Role': ['Admin']}, jwtSecret, {expiresIn: '7d'});


/**
 * @desc proceed before all routes
 * jwt token is provided in Request Header -- Authorization: Bearer <token>
 * 1)if no token is provided, and request /user/login
 *      go to /user/login directly
 * 2)if no token is provided, and request other url except /user/login
 *      send code:260 Authorization required, the frontend should redirect to login page
 * 3)if token is provided, is correct and not expired
 *      go to next()
 * 4)if token is provided, is correct but expired
 *      caculate new token and set in Response Header -- refresh-token:<new-token>
 *      go to next()
 * 5)if token is provided, is not corrected
 *      send code:261 Invalid token, the frontend should redirect to login page
 *
 */

router.all('*', function (req, res, next) {
  let token = parseToken(req);
  if (!token) {//if no token provided, the front end should redirect to login
    if (req.url.startsWith('/user/login') || req.url.startsWith('/block')) //if request login, go to it
      next();
    else //not request login, the front end should redirect to login
      res.status(260).send('Authorization required');
  }
  else {//the token is provided, must verify first
    jwt.verify(token, qcoinConfig.jwtSecret, function (err, result) {
      if (err) {
        if (err.name === "TokenExpiredError") {//verified but expired, need refreshing
          let oldPayload = jwt.decode(token);
          delete  oldPayload['exp'];
          delete  oldPayload['iat'];
          let newToken = jwt.sign(oldPayload, jwtSecret, {expiresIn: '7d'});
          res.set("refresh-token", newToken);
          res.setHeader('Access-Control-Expose-Headers', 'refresh-token');
        }//verified error
        res.status(261).send('Invalid token');
      }
      else {//token is correct
        res.locals = result;
        next();
      }
    })
  }

});


/**
 * @api {post} /api/user/login User Login
 * @apiDescription User Login by username and password on gerrit
 * @apiName Login
 * @apiGroup User
 * @apiParam {string} username Mandatory User's username on gerrit
 * @apiParam {string} password Mandatory User's password on gerrit
 * @apiVersion 1.0.0
 * @apiSuccessExample {json} Login Success(Account is not created on Blockchain):
 *     HTTP/1.1 200 OK
 *     {
 *          "Cookie": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJSb2xlIjpbIlVzZXIiXSwiQ29va2llIjoiR2Vycml0QWNjb3VudD1hVE9lZnA1QUNpV3J3OUd3RHc5YXREUS1aR09kM3NHZiIsImlhdCI6MTUzNTYxMTg0NX0.h097HJuZ1JNp5ktXGUIWdEzSmo6aC07sqgmsu2k1ZCk",
 *          "userInfo": {
 *              "_account_id": 602,
 *              "name": "Luo, Ning",
 *              "email": "ning.luo@intel.com",
 *              "username": "nluo",
 *              "qcoin": {
 *                  "qcoinBalance": 0
 *              }
 *           },
 *          "isFirst": true
 *      }
 *
 * @apiSuccessExample {json} Login Success(Account is already created on Blockchain):
 *      HTTP/1.1 200 OK
 *      {
 *           "Cookie":  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJSb2xlIjpbIlVzZXIiXSwiQ29va2llIjoiR2Vycml0QWNjb3VudD1hVE9lZnA1QUNpV3J3OUd3RHc5YXREUS1aR09kM3NHZiIsImlhdCI6MTUzNTYxMTg0NX0.h097HJuZ1JNp5ktXGUIWdEzSmo6aC07sqgmsu2k1ZCk",
 *           "userInfo": {
 *               "_account_id": 602,
 *               "name": "Luo, Ning",
 *               "email": "ning.luo@intel.com",
 *               "username": "nluo",
 *               "qcoin": {
 *                   "qcoinBalance": {
 *                       "total": "10000",
 *                       "frozen": "0"
 *                   }
 *               }
 *           }
 *       }
 *  @apiErrorExample  {json} Username not set:
 *  HTTP/1.1 262 OK
 *     'Username is required'
 *  @apiErrorExample  {json} Password not set:
 *  HTTP/1.1 262 OK
 *     'Password is required'
 *  @apiErrorExample  {json} Username&Password not match:
 *  HTTP/1.1 263 OK
 *  connection:close
 *     'Login failed'
 */
router.post("/user/login", function (req, res) {
  let username = req.body.username;
  let password = req.body.password;

  if (!username)
    res.status(262).send('Username is required');
  else if (!password)
    res.status(262).send('Password is required');
  else {//username and password is not blank
    request.post({
      url: "https://gerrit-gfx.intel.com/login",
      form: {username: username, password: password}
    }, function (err, resp, body) {
      if (resp.headers['set-cookie']) {//login succeed
        let cookieLogin = resp.headers['set-cookie'][0].split(';')[0];
        let token = jwt.sign(
          {
            'Role': ['User'],
            'Cookie': cookieLogin
          }, jwtSecret);
        gerrit.getUserInfo(cookieLogin, function (userInfo) {
          if (!userInfo) {
            res.set({Connection: 'close'});
            res.status(263).send('Login failed');
          }
          let userId = userInfo['_account_id'];
          qcoin.getUserAddress(userId).then(address => {
            res.set({Connection: 'keep-alive'});
            if (address === qcoin.zeroAddress) {
              userInfo['qcoin'] = {qcoinBalance: 0};
              res.send({
                accessToken: token,
                userInfo: userInfo,
                isFirst: true
              });
            }
            else {
              qcoin.getQcoinBalance(userId).then(qcoinBalance => {
                userInfo['qcoin'] = {qcoinBalance: qcoinBalance};
                res.set({Connection: 'keep-alive'});
                res.send({
                  accessToken: token,
                  userInfo: userInfo
                });
              })

            }
          })

        });
      } else {
        res.set({Connection: 'close'});
        res.status(263).send('Login failed');
      }


    });
  }


});
/**
 * @api {post} /api/user/create User Create
 * @apiDescription Create User by id on gerrit
 * @apiName Create
 * @apiGroup User
 * @apiParam {number} id User's id on gerrit
 * @apiVersion 1.0.0
 * @apiSuccessExample {json} Create Success:
 *     HTTP/1.1 200 OK
 *     {
 *          "userId": "123",
 *          "userAddr": "0xcE065D26ACFb20060e41B3E94381b3b40E536d22",
 *          "qcoinBalance": {
 *              "total": "10000",
 *              "frozen": "0"
 *          }
 *     }
 */
router.post("/user/create", function (req, res) {
  let userId = req.body.id;
  qcoin.createAccount(userId).then(receipt => {
    res.send(receipt)
  });
});
/**
 * @api {get} /api/user/history User Code-Review History
 * @apiDescription Get User Code-Review History
 * @apiName History
 * @apiGroup User
 * @apiParam {number} id User's id on gerrit
 * @apiVersion 1.0.0
 *
 */
router.get("/user/history", function (req, res) {
  let userId = req.query.userId;
  let dayStart = req.query.dayStart;
  let dayEnd = req.query.dayEnd;

  let cookieLogin = res.locals['Cookie'];
  gerrit.getHistory(cookieLogin, dayStart, dayEnd, function (histories) {
    if (histories.length === 0) {
      res.set({Connection: 'keep-alive'});
      res.send({
        histories: []
      });
    }
    else {
      let count = 0;
      histories.forEach(async (history) => {
        history.betInfo = await qcoin.getBetInfo(history._number, userId);
        count++;
        if (count === histories.length) {
          res.set({Connection: 'keep-alive'});
          res.send({
            histories: histories
          });
        }
      });
    }
  })

});
router.post("/user/info", function (req, res) {
  let cookieLogin = res.locals['Cookie'];
  gerrit.getUserInfo(cookieLogin, function (userInfo) {
    if (userInfo !== '' && userInfo !== null) {
      let userId = userInfo['_account_id'];
      qcoin.isUserCreated(userId).then(isCreated => {
        if (!isCreated)
          qcoin.createAccount(userId).then(o => {
            qcoin.getQcoinBalance(userId).then(qcoinBalance => {
              userInfo['qcoin'] = {qcoinBalance: qcoinBalance};
              res.set({Connection: 'keep-alive'});
              res.send({
                Cookie: cookieLogin,
                userInfo: userInfo
              });
            });
          })
        else
          qcoin.getQcoinBalance(userId).then(qcoinBalance => {
            userInfo['qcoin'] = {qcoinBalance: qcoinBalance};
            res.set({Connection: 'keep-alive'});
            res.send({
              Cookie: cookieLogin,
              userInfo: userInfo
            });
          });
      })

    } else {
      res.statusCode = 240;
      res.send();
    }
  });
});
router.get("/user/balance", function (req, res) {
  let userId = res.locals.userId ? res.locals.userId : req.query.userId;
  qcoin.getQcoinBalance(userId).then(r => {
    res.set({Connection: 'keep-alive'});
    res.send(r);
  })

})
router.get("/gerrit", function (req, res) {
  let cookieLogin = res.locals['Cookie'];
  let dayStart = req.query.dayStart;
  let dayEnd = req.query.dayEnd;
  //let cookieLogin = 'GerritAccount=' + req.body.gerritAccount;
  gerrit.getAllMergedList(cookieLogin, dayStart, dayEnd, function (list) {
    if (list !== '') {
      res.set({Connection: 'keep-alive'});
      let len = list.length;
      let c = 0;
      list.forEach(async change => {
        change.blockInfo = await qcoin.getChangeInfo(change._number);
        c++;
        if (c === len)
          res.send({
            reviewList: list
          });
      })

    } else {
      res.statusCode = 240;
      res.send();
    }

  })
});
/**
 * @api {post} /api/change/create Create changes
 * @apiDescription Create changes and add bets on blockchain by changes id from gerrit
 * @apiName Create Changes
 * @apiGroup Change
 * @apiParam {String[]} changes Changes id array
 * @apiVersion 1.0.0
 * @apiSuccessExample {json} Changes Create Success:
 * HTTP/1.1 200 OK
 * {
 *    "changes": [
 *        {
 *            "changeId": 501916,
 *            "changeAddress": "0xbc038bC05de68F8eB70859573748Ddb35ac6B660"
 *        },
 *        {
 *            "changeId": 500290,
 *            "changeAddress": "0x97223Bf4390082e13b6918522FB1fddF2B3C9BC5"
 *        }
 *    ]
 *}
 *
 */
router.post("/change/create", function (req, res) {
  let changeIds = JSON.parse(req.body.changes);
  let isRandomOutcome = req.body.isRandomOutcome === 'true';
  gerrit.getChanges(changeIds, function (changes) {
    qcoin.createChanges(changes, isRandomOutcome).then(changesAddresses => {
      res.set({Connection: 'keep-alive'});
      res.send({
        changes: changesAddresses
      });
    });
  });
});
/**
 * @api {get} /api/change/set Set Outcome
 * @apiDescription Get set the outcome of the change by changeId and outcome
 * @apiName Set Outcome
 * @apiGroup Change
 * @apiParam {Number} changeId  change id on gerrit
 * @apiParam {Boolean} outcome outcome of the specific change
 * @apiVersion 1.0.0
 * @apiSuccessExample {json} Changes Outcome Set Success:
 HTTP/1.1 200 OK
 {
    "transactions": [
        {
            "action": 3,
            "time": 1534908218000,
            "userId": "588",
            "changeId": "500290",
            "decision": 2,
            "cost": 200,
            "value": -200,
            "balance": 9600,
            "type": 3
        },
        {
            "action": 3,
            "time": 1534908218000,
            "userId": "590",
            "changeId": "500290",
            "decision": 2,
            "cost": 200,
            "value": -200,
            "balance": 9860,
            "type": 3
        },
        {
            "action": 2,
            "time": 1534908218000,
            "userId": "10",
            "changeId": "500290",
            "decision": -1,
            "cost": 200,
            "value": 400,
            "balance": 10400,
            "type": 3
        }
    ]
}
 */
router.post("/change/set", function (req, res) {

  let changeId = req.body.changeId;
  let outcome = req.body.outcome === 'true';
  //console.log(changeId, outcome)
  qcoin.setOutcome(changeId, outcome).then(result => {
    if (result.error)
      res.status(280).send("Transaction Failed\n" + result.error);
    else
      qcoin.getAllTransactionEventsAtBlock(result.recepit.blockNumber).then(transactions => {
        res.send({transactions: transactions});
      })
  })


});
router.get("/fetch", function (req, res) {

  gerrit.fetchRecent(432000, function (changes) {
    if (changes.length > 0) {
      qcoin.createChanges(changes, false).then(changesAddresses => {
        res.set({Connection: 'keep-alive'});
        res.send({
          changes: changesAddresses
        });
      });

    }
    else {
      res.set({Connection: 'keep-alive'});
      res.send({
        changes: changes
      });
    }
  });

})
router.get("/change/detail", function (req, res) {
  let cookieLogin = res.locals['Cookie'];
  let changeId = req.query.id;
  //let cookieLogin = 'GerritAccount=' + req.body.gerritAccount;
  gerrit.getChangeDetail(cookieLogin, changeId, function (detail) {
//  gerrit.getChangeDetail("aOusfmo39iG.SvSziXhqelKlrzY4e-9L", changeId, function (detail) {
    if (detail !== '') {
      res.set({Connection: 'keep-alive'});
      res.send({
        detail: detail
      });
    } else {
      res.statusCode = 240;
      res.send();
    }

  })
})
/**
 * @api {get} /api/user/result User Result
 * @apiDescription Get User Code-Review Result based on changes of which outcome is set
 * @apiName Result
 * @apiGroup User
 * @apiParam {number} id User's id on gerrit
 * @apiVersion 1.0.0
 * @apiSuccessExample {json} Result:
 * HTTP/1.1 200 OK
 * {
 *    "results": [
 *        {
 *            "action": 0,
 *            "time": 1534741038000,
 *            "userId": "174",
 *            "changeId": "0",
 *            "decision": 0,
 *            "cost": 0,
 *            "value": 10000,
 *            "balance": 10000,
 *            "type": 0
 *        },
 *        {
 *            "action": 1,
 *            "time": 1534741043000,
 *            "userId": "174",
 *            "changeId": "502442",
 *            "decision": 2,
 *            "cost": 200,
 *            "value": 0,
 *            "balance": 10000,
 *            "type": 0
 *        },
 *        {
 *            "action": 1,
 *            "time": 1534741043000,
 *            "userId": "174",
 *            "changeId": "502453",
 *            "decision": 2,
 *            "cost": 200,
 *            "value": 0,
 *            "balance": 10000,
 *            "type": 0
 *        },
 *        {
 *            "action": 2,
 *            "time": 1534741045000,
 *            "userId": "174",
 *            "changeId": "502453",
 *            "decision": 2,
 *            "cost": 200,
 *            "value": 100,
 *            "balance": 10100,
 *            "type": 1
 *        },
 *        {
 *            "action": 2,
 *            "time": 1534741045000,
 *            "userId": "174",
 *            "changeId": "502442",
 *            "decision": 2,
 *            "cost": 200,
 *            "value": 100,
 *            "balance": 10200,
 *            "type": 1
 *        }
 *    ],
 *    "sum": {
 *        "win": {
 *            "1": {
 *                "1": 0,
 *                "2": 0,
 *                "3": 0,
 *                "4": 0,
 *                "sum": 0
 *            },
 *            "2": {
 *                "1": 200,
 *                "2": 0,
 *                "3": 0,
 *                "4": 0,
 *                "sum": 200
 *            },
 *            "-1": {
 *                "1": 0,
 *                "2": 0,
 *                "3": 0,
 *                "4": 0,
 *                "sum": 0
 *            }
 *        },
 *        "lose": {
 *            "1": {
 *                "1": 0,
 *                "2": 0,
 *                "3": 0,
 *                "4": 0,
 *                "sum": 0
 *            },
 *            "2": {
 *                "1": 0,
 *                "2": 0,
 *                "3": 0,
 *                "4": 0,
 *                "sum": 0
 *            },
 *            "-1": {
 *                "1": 0,
 *                "2": 0,
 *                "3": 0,
 *                "4": 0,
 *                "sum": 0
 *            }
 *        },
 *        "total": {
 *            "1": {
 *                "1": 0,
 *                "2": 0,
 *                "3": 0,
 *                "4": 0,
 *                "sum": 0
 *            },
 *            "2": {
 *                "1": 200,
 *                "2": 0,
 *                "3": 0,
 *                "4": 0,
 *                "sum": 200
 *            },
 *            "-1": {
 *                "1": 0,
 *                "2": 0,
 *                "3": 0,
 *                "4": 0,
 *                "sum": 0
 *            }
 *        }
 *    }
 *}
 */
router.get("/user/result", function (req, res) {

  let userId = req.query.userId;
  qcoin.getTransferHistory(userId).then(result => {
    res.set({Connection: 'keep-alive'});
    res.send({
      result: result
    });
  });

});


router.get("/change/simulate", function (req, res) {
  let to = req.query.to;
  let dayEnd = req.query.dayEnd;
  gerrit.getHistory("GerritAccount=aQ4bfeivdnTJq5uHEzDRRig7tupYJ-YG", dayStart, dayEnd, function (histories) {
    let a = histories.map(o => o._number);
    gerrit.getChanges(a, function (changes) {
      qcoin.createChanges(changes, true);
    });
  })
});
router.get("/user/create", function (req, res) {
  let userId = req.query.userId;
  qcoin.createAccount(userId).then(r => {
    res.set({Connection: 'keep-alive'});
    res.send(r);
  })
});

/**
 * @api {get} /api/block/:id Block Information
 * @apiDescription get Block's Information according to block number
 * @apiName Information
 * @apiGroup Block
 * @apiParam {number} id Block's number on blockchain
 * @apiVersion 1.0.0
 * @apiSuccessExample {json} Result:
 * HTTP/1.1 200 OK
 * {
    "difficulty": "1754505",
    "extraData": {
        "hex": "0xd88301080c846765746888676f312e31302e33856c696e7578",
        "decoded": "Ø\u0001\b\fgethgo1.10.3linux"
    },
    "gasLimit": 58216339092,
    "gasUsed": 304558,
    "hash": "0x78796c3fe162f4934594ea5207607538883fbd35db7d154175b3492e382df28b",
    "miner": "0x2366A790dB8F1E65F34EC0E5f3443Bc5D826FD0e",
    "mixHash": "0xfd98fd9b03085a791ba4fc053d1089cd8d479cf743c08afafb75e74422e54a93",
    "nonce": "0x0889756194a7fec5",
    "number": 8683,
    "parentHash": "0xce6c94473a66ef4a182ad69fd93177f241261fab7fa3339e983f3de0627b3673",
    "receiptsRoot": "0x53ff7d35a05c86ae8e6befa33153d1461d278e431a0b1076f8860d4cddc44926",
    "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
    "size": 750,
    "stateRoot": "0x589f38d8db529253bf390bd9fb9add147f3e0df000a78da5fabb67b87fac8385",
    "timestamp": 1535704704,
    "totalDifficulty": "11618604600",
    "transactions": [
        {
            "blockHash": "0x78796c3fe162f4934594ea5207607538883fbd35db7d154175b3492e382df28b",
            "blockNumber": 8683,
            "from": "0x2366A790dB8F1E65F34EC0E5f3443Bc5D826FD0e",
            "gas": 304901,
            "gasPrice": "18000000000",
            "hash": "0xc81690a06e3b5d29732e72e0036f6fc8fb41c3a14fbb9d651095859df5811c6d",
            "input": {
                "hex": "0x7cdab53600000000000000000000000000000000000000000000000000000000000000e900000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002",
                "decoded": {
                    "name": "addBet",
                    "params": [
                        {
                            "name": "_changeId",
                            "value": "233",
                            "type": "uint32"
                        },
                        {
                            "name": "_userId",
                            "value": "1",
                            "type": "uint32"
                        },
                        {
                            "name": "_decision",
                            "value": "2",
                            "type": "int8"
                        }
                    ]
                }
            },
            "nonce": 444,
            "to": "0x96350Af85969f324DcE59A6502Cb4f97f86ef281",
            "transactionIndex": 0,
            "value": "0",
            "v": "0x38",
            "r": "0x2ba26994ff7d346229d5c7f7a396eb7828b0e8d9446932408b101460cd9383e4",
            "s": "0x8d4a52ecfeb68f7b5d5f0250f332fa149a0dbaa26dfa406c3a59363e4bdf1e0",
            "receipt": {
                "blockHash": "0x78796c3fe162f4934594ea5207607538883fbd35db7d154175b3492e382df28b",
                "blockNumber": 8683,
                "contractAddress": null,
                "cumulativeGasUsed": 304558,
                "from": "0x2366a790db8f1e65f34ec0e5f3443bc5d826fd0e",
                "gasUsed": 304558,
                "logs": [
                    {
                        "address": "0x3D8A20c3945F899649265c5265291BbBCC90A9A2",
                        "topics": [
                            "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
                            "0x0000000000000000000000002366a790db8f1e65f34ec0e5f3443bc5d826fd0e",
                            "0x000000000000000000000000394b8cabf8425e482f28664f82da4dee7d1f9878"
                        ],
                        "data": "0x00000000000000000000000000000000000000000000000000000000000000c8",
                        "blockNumber": 8683,
                        "transactionHash": "0xc81690a06e3b5d29732e72e0036f6fc8fb41c3a14fbb9d651095859df5811c6d",
                        "transactionIndex": 0,
                        "blockHash": "0x78796c3fe162f4934594ea5207607538883fbd35db7d154175b3492e382df28b",
                        "logIndex": 0,
                        "removed": false,
                        "id": "log_81e24f65"
                    },
                    {
                        "address": "0x3D8A20c3945F899649265c5265291BbBCC90A9A2",
                        "topics": [
                            "0xfe7b9016bd341956c3e89f5eaa47ef8a36425f86c7e296a1b2c3011ba9ef432d",
                            "0x0000000000000000000000000000000000000000000000000000000000000001",
                            "0x0000000000000000000000000000000000000000000000000000000000000001",
                            "0x00000000000000000000000000000000000000000000000000000000000000e9"
                        ],
                        "data": "0x000000000000000000000000000000000000000000000000000000005b88fe80000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000028000000000000000000000000000000000000000000000000000000000000000000",
                        "blockNumber": 8683,
                        "transactionHash": "0xc81690a06e3b5d29732e72e0036f6fc8fb41c3a14fbb9d651095859df5811c6d",
                        "transactionIndex": 0,
                        "blockHash": "0x78796c3fe162f4934594ea5207607538883fbd35db7d154175b3492e382df28b",
                        "logIndex": 1,
                        "removed": false,
                        "id": "log_dbcb09ae"
                    }
                ],
                "logsBloom": "0x00000000000000000000000000000000040000000000000000000000000000000000000000000000001200000000000000000000000000000000000000240000000000000000002000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000020000000008000000008000000000000000000000000020000000080000002000000000000080000001000000000000000000000000000000000000000000000000000000010000000000000000000000000000240000010000000800000000000000000000000000000000000000000000000000000",
                "status": true,
                "to": "0x96350af85969f324dce59a6502cb4f97f86ef281",
                "transactionHash": "0xc81690a06e3b5d29732e72e0036f6fc8fb41c3a14fbb9d651095859df5811c6d",
                "transactionIndex": 0
            }
        }
    ],
    "transactionsRoot": "0x667090af0e0d8c470dc2c34b6e39dcbb1e48367321097f59ea01db8a0e774949",
    "uncles": []
}
 */
router.get("/block/:id", function (req, res) {
  qcoin.getBlockDetailAt(req.params.id).then(detail => {
    res.send(detail)
  })
});
router.get("/jira", function (req, res) {
  let dayStart = req.query.dayStart;
  let dayEnd = req.query.dayEnd;
  let type = req.query.type;
  jira.getRecent(dayStart, dayEnd, type === 'csv', function (results) {
    if (type === 'csv')
      res.set({'Content-Type': 'text/csv'});
    res.send(results)
  })
});
router.get("/quickbuild", function (req, res) {
  QuickBuildUtil.getBuilds({count: 10}, function (results) {
    res.send(results)
  })

});
router.get("/github", function (req, res) {
  GithubUtil.getPullRequests({state: 'all', per_page: 10}, function (results) {
    res.send(results)
  });

});
router.get("/hsdes", function (req, res) {
  let dayStart = req.query.dayStart;
  let dayEnd = req.query.dayEnd;
  let type = req.query.type;
  HsdesUtil.query(dayStart, dayEnd, type === 'csv', function (results) {
    if (type === 'csv')
      res.set({'Content-Type': 'text/csv'});
    else {
      results.forEach(async result => {
        let commitHash = result['regression_commit_id'];
        if (commitHash)
          gerrit.getChangeByCommitHash(commitHash).then(e => {
            //console.log(e)
          })
      })
    }
    res.send(results)
  })
});
router.get("/worker", function (req, res) {
  let Idsid = req.query.Idsid;
  WorkerUtil.getWorkerInfo({Idsid: Idsid}).then(o => {
    res.send(o)
  })
});

router.get("/git/commit", function (req, res) {
  let dayStart = req.query.dayStart;
  let dayEnd = req.query.dayEnd;
  let category = req.query.category;
  let type = req.query.type;
  let period = req.query.period;
  let path = req.query.path;
  let compare = category === 'customized' ? 'group' : undefined;
  gitAnalysisUtil.queryCommit(category, type, period, dayStart, dayEnd, path, compare, function (results) {
    res.send(results)
  })
});
router.get("/git/codechurn", function (req, res) {
  let dayStart = req.query.dayStart;
  let dayEnd = req.query.dayEnd;
  let category = req.query.category;
  let type = req.query.type;
  let period = req.query.period;
  let path = req.query.path;
  let compare = category === 'customized' ? 'group' : undefined;
  gitAnalysisUtil.queryCodeChurn(category, type, period, dayStart, dayEnd, path, compare, function (results) {
    res.send(results)
  })
});
router.get("/git/loc", function (req, res) {
  let week = req.query.week;
  let category = req.query.category;
  gitAnalysisUtil.loc(category, week, function (results) {
    res.send(results)
  })
});
router.get("/git/complexity", function (req, res) {
  let week = req.query.week;
  let category = req.query.category;
  gitAnalysisUtil.complexity(category, week, function (results) {
    res.send(results)
  })
});
router.get("/git/folder", function (req, res) {
  let path = req.query.path;
  gitAnalysisUtil.folder(path, function (results) {
    res.send(results)
  })
});
router.get("/git/comploc", function (req, res) {
  let path = req.query.path;
  let date = req.query.date;
  gitAnalysisUtil.queryCompLoc(path, date).then(results => {
    res.send(results)
  })

});
/*
gerrit.getHistory("GerritAccount=aQ4bfeivdnTJq5uHEzDRRig7tupYJ-YG", function (histories) {
    let a = histories.slice(5, 15).map(o => o._number);
    gerrit.getChanges(a, function (changes) {
        qcoin.createChanges(changes, true);
    });
})*/


setInterval(function () {
  Qcoin.unlockAccount(qcoin.coinbase, 'password', 1500000).then(o => {
    //console.log(o)
  })

}, 60 * 60 * 1000);

let fetchIntervalSec = 3600;
gerrit.fetchRecent(fetchIntervalSec, function (changes) {
  if (changes.length > 0) {
    qcoin.createChanges(changes, false);

  }
});

mongoUtil.connect('mongodb://10.239.141.130:53337').then(() => {
    let p = path.join(__dirname, '..', 'gitlog.log');
    mongoUtil.updateFromLog(p).then(() => {
        console.log(new Date(), 'finished');
        HsdesUtil.getAllRegressions().then(results => {
          results.forEach(result => {
            mongoUtil.updateRegression(result['regression_commit_id'], result).then(r => {
              if (r)
                //console.log(result['regression_commit_id'])
                ;
            })
          })
        })

      }
    )
  }
);
setInterval(function () {
  gerrit.fetchRecent(fetchIntervalSec, function (changes) {
    if (changes.length > 0) {
      qcoin.createChanges(changes, false);

    }
  });
  mongoUtil.connect('mongodb://10.239.141.130:53337').then(() => {
      let p = path.join(__dirname, '..', 'gitlog.log');
      mongoUtil.updateFromLog(p).then(() => {
          console.log(new Date(), 'finished')
          HsdesUtil.getAllRegressions().then(results => {
            results.forEach(result => {
              mongoUtil.updateRegression(result['regression_commit_id'], result).then(r => {
                if (r)
                  console.log(result['regression_commit_id'])
              })
            })
          })

        }
      )
    }
  )

}, fetchIntervalSec * 1000);
/*
gerrit.getChangeByCommitHash("8696bf96d68609bd90f200d86893e97de18414ac",r=>{
    console.log(r)
    qcoin.create
})
*/
module.exports = router;
