let Web3 = require('web3');
var RLP = require('rlp')
let web3 = new Web3();
let provider = new Web3.providers.HttpProvider("http://10.239.141.32:8200");
const abiDecoder = require('abi-decoder'); // NodeJS
web3.setProvider(provider);

class HashVerify {
  static async verify(blocknumber) {
    const {
      hash, parentHash, sha3Uncles, miner, stateRoot,
      transactionsRoot, receiptsRoot, logsBloom, difficulty,
      number, gasLimit, gasUsed, timestamp, extraData, mixHash, nonce
    } = await web3.eth.getBlock(blocknumber);
    const arr = [
      parentHash,
      sha3Uncles,
      miner,
      stateRoot,
      transactionsRoot,
      receiptsRoot,
      logsBloom,
      HashVerify.toHex(difficulty),
      HashVerify.toHex(number),
      HashVerify.toHex(gasLimit),
      HashVerify.toHex(gasUsed),
      HashVerify.toHex(timestamp),
      extraData,
      mixHash,
      nonce
    ]
    const calculated = web3.utils.sha3(RLP.encode(arr), {encoding: 'hex'})
    return {
      hash: hash,
      calculated: calculated,
      result: hash === calculated
    }
  }

  static toHex(num) {
    const r = web3.utils.toHex(num)
    return r === '0x0' ? '0x' : r
  }
}

for (let i = 1; i < 2101; i++) {
  HashVerify.verify(i).then(r => {
    if (!r.result)
      console.log(r)
  })
}
