<template>

  <div class="block-div">
    <el-col :span="18" :offset="3" v-if="blockDetail" v-loading="isLoading" element-loading-text="Loading">
      <el-card class="block-card">
        <div slot="header" style="display: flex;align-items: center;justify-content: space-between">
          <div style="display: flex;align-items: center;justify-content: space-between">
            <div class="block-title" style="width: 150px">Block <span
              style="color:gray"> #{{blockDetail.number}} </span>
              <span v-if="currentIndex===latestIndex">(latest)</span>
              <span v-if="currentIndex===0">(Genesis)</span></div>

            <el-button icon="el-icon-arrow-left" circle size="medium"
                       :disabled="currentIndex===0" @click.native="getBlock(-1)"></el-button>
            <el-button icon="el-icon-arrow-right" circle size="medium"
                       :disabled="currentIndex===latestIndex" @click.native="getBlock(1)"></el-button>
          </div>
          <el-input placeholder="Input Block Number or Hash" v-model="blockQuery" class="input-with-select"
                    style="max-width: 300px" @keyup.enter.native="getBlockAt(blockQuery)" autofocus>
            <el-button slot="append" icon="el-icon-search" style="background-color: #409eff"
                       @click.native="getBlockAt(blockQuery)"></el-button>
          </el-input>
        </div>
        <div style="font-family: 'Courier New',sans-serif;">
          <el-row title="A scalar value equal to the number of ancestor blocks.
The genesis block has a number of zero">
            <el-col :span="5">Height</el-col>
            <el-col :span="18"> {{blockDetail.number}}</el-col>
          </el-row>
          <el-row title="A scalar value equal to the reasonable output of Unix’s time() at this block’s inception">
            <el-col :span="5">Timestamp</el-col>
            <el-col :span="18" :title="blockDetail.timestamp"> {{blockDetail.timestamp|getTimeDiffer}}
              ({{blockDetail.timestamp|getFormattedDate}})
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="5">Hash</el-col>
            <el-col :span="18"> {{blockDetail.hash}}</el-col>
          </el-row>
          <el-row title="The Keccak 256-bit hash of the parent block’s header, in its entirety">
            <el-col :span="5">Parent Hash</el-col>
            <el-col :span="18"> {{blockDetail.parentHash}}
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="5">Sha3 Uncles</el-col>
            <el-col :span="18"> {{blockDetail.sha3Uncles}}</el-col>
          </el-row>
          <el-row
            title="The 160-bit address to which all fees collected from the successful mining of this block be transferred">
            <el-col :span="5">Mined By</el-col>
            <el-col :span="18"> {{blockDetail.miner}}</el-col>
          </el-row>
          <el-row title="A scalar value corresponding to the difficulty level of this block.
This can be calculated from the previous block’s difficulty level and the timestamp">
            <el-col :span="5">Difficulty</el-col>
            <el-col :span="18"> {{blockDetail.difficulty}}</el-col>
          </el-row>
          <el-row>
            <el-col :span="5">Total Difficulty</el-col>
            <el-col :span="18"> {{blockDetail.totalDifficulty}}</el-col>
          </el-row>
          <el-row>
            <el-col :span="5">Size</el-col>
            <el-col :span="18"> {{blockDetail.size}} bytes</el-col>
          </el-row>
          <el-row title="A scalar value equal to the total gas used in transactions in this block">
            <el-col :span="5">Gas Used</el-col>
            <el-col :span="18"> {{blockDetail.gasUsed}}</el-col>
          </el-row>
          <el-row title="A scalar value equal to the current limit of gas expenditure per block">
            <el-col :span="5">Gas Limit</el-col>
            <el-col :span="18"> {{blockDetail.gasLimit}}</el-col>
          </el-row>
          <el-row title="A 64-bit value which, combined with the mixhash,
proves that a sufficient amount of computation has been carried out on this block">
            <el-col :span="5">Nounce</el-col>
            <el-col :span="18"> {{blockDetail.nonce}}</el-col>
          </el-row>
          <el-row>
            <el-col :span="5">Extra Data</el-col>
            <el-col :span="18" v-if="blockDetail.extraData"> {{blockDetail.extraData.decoded}}
              (Hex:{{blockDetail.extraData.hex}})
            </el-col>
          </el-row>

          <el-collapse v-model="activeNames" v-if="blockDetail.transactions&&blockDetail.transactions.length>0">
            <el-collapse-item name="1">
              <template slot="title">
                <el-row class="transactions-el-row">
                  <el-col :span="5">Transaction</el-col>
                  <el-col :span="15" v-if="blockDetail.transactions.length===1">1 smart contract transaction in this
                    block
                  </el-col>
                  <el-col :span="15" v-else>{{blockDetail.transactions.length}} smart contract transactions in this
                    block
                  </el-col>
                </el-row>
              </template>
              <el-col :span="19" :offset="5">
                <el-collapse v-for="(transaction,index) in blockDetail.transactions" :key="index"
                             style="margin-right:50px">
                  <el-collapse-item class="transactions" :name="'tx-'+index">
                    <template slot="title">
                      <span style="font-size: 15px">
                        <span style="color: gray">#{{index+1}} </span>
                        <i class="el-icon-success" style="color: green" v-if="transaction.receipt.status"> </i>
                        <i class="el-icon-error" style="color: red" v-else> </i>

                        <span v-if="transaction.input.decoded">
                          {{transaction.input.decoded.name}} (
                          <span v-for="(param,index) in transaction.input.decoded.params">{{param.value}}
                            <span v-if="index!==transaction.input.decoded.params.length-1">, </span>
                          </span>)
                        </span>
                        <span v-else>Contract Creation</span>
                      </span>
                    </template>
                    <el-col>
                      <el-row>
                        <el-col>
                          <el-row> {{transaction.from}}<i class="el-icon-caret-right" style="color:green"></i>{{transaction.to}}
                          </el-row>
                          <el-row>
                            <el-col :span="5">Input (Hex)</el-col>
                            <el-col :span="18">{{transaction.input.hex}}</el-col>
                          </el-row>
                          <div v-if="transaction.input.decoded">
                            <el-row>
                              <el-col :span="5">Function</el-col>
                              <el-col :span="18">{{transaction.input.decoded.name}}</el-col>
                            </el-row>
                            <el-row>
                              <el-col :span="5">Parameters</el-col>
                              <el-col :span="18">
                                <el-table :data="transaction.input.decoded.params" style="width: 100%">
                                  <el-table-column prop="name" label="Name"></el-table-column>
                                  <el-table-column prop="type" label="Type"></el-table-column>
                                  <el-table-column prop="value" label="Value">
                                    <template slot-scope="scope">
                                      {{scope.row.value}}
                                    </template>
                                  </el-table-column>
                                </el-table>
                              </el-col>
                            </el-row>
                            <el-row>
                              <el-col :span="5">TxHash</el-col>
                              <el-col :span="18">{{transaction.hash}}</el-col>
                            </el-row>
                            <el-row>
                              <el-col :span="5">Status</el-col>
                              <el-col :span="18" v-if="transaction.receipt.status">
                                <i class="el-icon-success" style="color: green"> </i><span
                                style="color: green"> Success</span>
                              </el-col>
                              <el-col :span="18" v-else>
                                <i class="el-icon-error" style="color: red"> </i> <span
                                style="color: red"> Failure</span>

                              </el-col>
                            </el-row>
                          </div>

                        </el-col>
                      </el-row>

                    </el-col>

                  </el-collapse-item>
                </el-collapse>

              </el-col>
            </el-collapse-item>
          </el-collapse>
          <el-row v-if="blockDetail.transactions&&blockDetail.transactions.length===0">
            <el-col :span="5">Transaction</el-col>
            <el-col :span="15">No smart contract transactions in this block</el-col>
          </el-row>
        </div>
      </el-card>
    </el-col>

  </div>
</template>

<script>
  import {timeSince} from "@/common/js/dateUtil";
  import {formatDate} from "@/common/js/dateUtil";

  export default {
    name: 'Block',
    data() {
      return {
        activeNames: [],
        blockDetailMap: {},
        latestIndex: 0,
        currentIndex: 0,
        isLoading: true,
        blockQuery: ''

      }
    },
    created: function () {
      this.$store.dispatch('updateCurrentTabIndex', '0');

      let that = this;
      document.onkeydown = function (e) {
        if (e.code === 'ArrowLeft' && that.currentIndex > 0)
          that.getBlock(-1);
        else if (e.code === "ArrowRight" && that.currentIndex < that.latestIndex)
          that.getBlock(1);
      };
      this.$axios.get("/api/block/latest").then(response => {
          this.latestIndex = response.data.number;
          this.currentIndex = response.data.number;
          this.blockDetailMap[this.currentIndex] = response.data;
          this.isLoading = false;

        }
      )
    },
    filters: {
      getTimeDiffer: function (timeStampSecond) {
        return timeSince(timeStampSecond + '000')
      },
      getFormattedDate: function (timeStampSecond) {
        return formatDate(new Date(timeStampSecond * 1000), 'yyyy-MM-dd hh:mm:ss')
      }
    },
    computed: {
      blockDetail() {
        return this.blockDetailMap[this.currentIndex]
      }
    },
    methods: {
      getBlock(operation) {
        let requestIndex = this.currentIndex + operation;
        if (!this.blockDetailMap[requestIndex])
          this.getBlockAt(requestIndex)
        else
          this.currentIndex = requestIndex;

      },
      getBlockAt(identifier) {
        let regex = /^(0x([0-9a-fA-f]){64}|[1-9][0-9]*|0)/i;
        if (regex.test(identifier)) {
          this.isLoading = true;
          this.$axios.get("/api/block/" + identifier).then(response => {
            this.currentIndex = response.data.number;
            this.blockDetailMap[this.currentIndex] = response.data;
            this.isLoading = false;
          })
        }


      }
    }


  }
</script>
<style scoped>

  .block-card {
    margin: 20px 0
  }

  * {
    text-align: left;
    word-break: break-all;
  }

  .el-row {
    margin-bottom: 15px;

  }

  .el-row:last-child {
    margin-bottom: 12px;

  }

  .transactions-el-row {
    margin-bottom: 0;
  }
</style>
<style>
  .block-div .el-table__header th {
    padding: 0 0 5px 0;
    line-height: normal;

  }

  .block-div .el-table .cell, .el-table th div {
    padding: 0;
  }

  .block-div .el-collapse {
    border: none
  }

  .block-div .el-collapse .el-row {
    margin-bottom: 8px;
  }

  .block-div .el-collapse-item__header {
    font-size: 16px;
    border: none;
    line-height: normal;
    height: auto;
    padding: 0 0 5px 0;
    background: transparent;
  }

  .block-div .el-collapse-item__header:hover {
    color: #03a9f4;
  }

  .block-div .el-collapse-item__arrow {
    line-height: normal;

  }

  .block-div .el-collapse-item__content {
    padding-top: 5px;
    padding-bottom: 0;
  }

  .block-div .transactions .el-collapse-item__content {
    padding: 5px 0 0 1.5em;
    font-size: 14px
  }

  .block-div .el-collapse-item__wrap {
    border: none;
  }

  .block-div .el-card__header {
    background-color: #d9edf7;
    color: #31708f;
    padding: 10px 20px

  }

  .block-div .el-card {
    border: none
  }

  .block-div .el-button {
    background-color: #409eff;

  }

  .block-div .el-button--medium.is-circle {
    padding: 4px
  }

  .block-div .el-button:hover, .el-button:focus {
    background-color: #3498db
  }

  .block-div .el-button.is-disabled {
    background-color: darkgray;
  }

  .block-div .el-button.is-disabled:hover {
    background-color: gray;
  }

  .block-div .el-card__header [class^=el-icon] {
    color: white;
    font-size: 15px;
    font-weight: 900;
  }

  .block-div .el-input-group__append > .el-button {
    border-radius: 0 15px 15px 0;
    border: none;
  }

  .block-div .el-input__inner {
    border: none;
    border-radius: 15px 0 0 15px;
  }

  .block-div .el-input-group__append {
    border-radius: 15px;
  }
</style>
