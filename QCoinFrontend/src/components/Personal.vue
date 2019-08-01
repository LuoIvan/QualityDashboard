<template>

  <div class="personal">
    <div style="margin: 20px">
      <div class="section name">{{userInfo.name}}</div>
      <div class="section email">{{userInfo.email}}</div>
      <div style="padding-top:5px;display: flex;align-items: center">
        <img src="../assets/icon.png" width="22">
        <span style="vertical-align: center;margin: 0 10px 0 20px" v-if="userInfo.qcoin" title="Total Balance">{{userInfo.qcoin.qcoinBalance.total}}</span>
        <font-awesome-icon icon="lock" :style="{'font-size': '18px','padding':'0 2px','color':'#666666'}"/>
        <span style="vertical-align: center;margin: 0 10px 0 20px" v-if="userInfo.qcoin" title="Frozen Balance">{{userInfo.qcoin.qcoinBalance.frozen}}</span>
      </div>

    </div>
    <el-collapse v-model="activeNames">
      <el-collapse-item ref="distributionSection" title="Distribution" name="1">
        <div :style="{ 'display': windowParam.width>1000 ? 'flex' : 'block'}" style="margin: 10px"
             v-if="isShowCharts.winning||isShowCharts.losing">
          <div ref="winningSummaryChart" :style="{ 'width': windowParam.width>1000 ? '50%' : '100%','height':'420px'}"
               v-if="isShowCharts.winning">
          </div>
          <div ref="losingSummaryChart" :style="{ 'width': windowParam.width>1000 ? '50%' : '100%','height':'420px'}"
               v-if="isShowCharts.losing">
          </div>
        </div>
        <div class="no-data" v-else>No Code-Review Result has been set yet.</div>


      </el-collapse-item>
      <el-collapse-item ref="balanceSection" title="Balance Trend" name="2">
        <div ref="balanceTrendChart" :style={height:chartHeight,minHeight:chartHeight}
             style="margin:0 auto;height:auto!important;">
        </div>
      </el-collapse-item>
      <el-collapse-item title="CodeReview Trend" name="3">
        <div ref="winningTrendChart" :style={minHeight:chartHeight} style="margin:0 auto" v-if="isShowCharts.result">
        </div>
        <div class="no-data" v-else>No Code-Review Result has been set yet.</div>
      </el-collapse-item>
    </el-collapse>


  </div>

</template>

<script>
  import {formatDate} from "@/common/js/dateUtil";
  import {eventBus} from '@/common/js/Eventbus'

  export default {
    name: "Personal",
    watch: {
      windowParam: function () {
        let that = this;
        if (that.canResize) {
          that.canResize = false;
          setTimeout(function () {
            that.isMobile = document.body.clientWidth < 1000;
            that.chartHeight = that.isMobile ? that.$store.getters.getWindowParam.width * 0.8 + 'px' : that.$store.getters.getWindowParam.width * 0.3 + 'px';
            if (that.balanceChart && that.winningChart) {
              that.balanceChart.resize({
                width: that.$store.getters.getWindowParam.width,
                height: that.isMobile ? that.$store.getters.getWindowParam.width * 0.8 : that.$store.getters.getWindowParam.width * 0.3,
              });
              that.winningChart.resize({
                width: that.$store.getters.getWindowParam.width,
                height: that.isMobile ? that.$store.getters.getWindowParam.width * 0.8 : that.$store.getters.getWindowParam.width * 0.3,
              });
            }
            that.canResize = true;
          }, 200);
        }


      },

    },
    data() {
      return {
        chartHeight: document.body.clientWidth < 1000 ? document.body.clientWidth * 0.8 + 'px' : document.body.clientWidth * 0.3 + 'px',
        totalData: [],
        labelMap: ['First Allocate', '+2', '+2, +1', '+2, -1', '+2, +1, -1'],

        sum: {},
        balanceTrendData: [],
        winningTrendData: [],
        activeNames: ['1', '2', '3'],
        balanceChart: null,
        winningChart: null,
        winningSummaryChart: null,
        canResize: true,
        isShowCharts: {winning: true, losing: true, balance: true, result: true},
        isMobile: document.body.clientWidth < 1000
      }
    },
    mounted() {
      this.$store.dispatch('updateCurrentTabIndex', '4-1');
      let that = this;
      let s = setInterval(function () {//wait until login passed from gerrit
        let id = that.$store.getters.getUserInfo._account_id;
        if (id !== undefined) {
          clearInterval(s);
          that.initChart();

        }
      }, 200)
    },
    computed: {
      windowParam() {

        return this.$store.getters.getWindowParam;
      },
      userInfo() {
        return this.$store.getters.getUserInfo ? this.$store.getters.getUserInfo : ''
      }

    },
    methods: {
      getOption(dataInner, dataOuter, result) {
        let that = this;
        return {

          title: {
            text: result === 'win' ? 'My Winning-Distribution' : 'My Losing-Distribution',
            subtext: (result === 'win' ? 'Net Inflow' : 'Net Outflow') + ' - CodeReview Distribution',
            x: 'center'
          },

          tooltip: {
            trigger: 'item',
            formatter: function (params) {
              return params.seriesIndex === 1 ? that.newLine(params.marker + 'My Review :' + params.data.from) +
                that.newLine('All Reviews:' + params.data.name.split(':')[1]) +
                that.newLine((result === 'win' ? 'Total Winning: ' : 'Total Losing: ') + params.data.value) +
                that.newLine('Percentage: ' + params.percent + '%') :
                that.newLine(params.marker + 'My Review :' + params.data.name) +
                that.newLine((result === 'win' ? 'Total Winning: ' : 'Total Losing: ') + params.data.value)
            },
            textStyle: {
              align: 'left',
            }
          },
          legend: {
            orient: 'vertical',
            x: 'left',
            data: ['+2', '+1', '-1',
              '+2: +2', '+2: +2, +1', '+2: +2, -1', '+2: +2, +1, -1',
              '+1: +2', '+1: +2, +1', '+1: +2, -1', '+1: +2, +1, -1',
              '-1: +2', '-1: +2, +1', '-1: +2, -1', '-1: +2, +1, -1'],
            formatter: function (name) {
              return (name.length === 2 ? "My Review: " : "All: ") + name;
            }
          },
          series: [
            {
              name: 'My Review',
              type: 'pie',
              selectedMode: 'single',
              radius: [0, '20%'],
              center: ['50%', '65%'],
              label: {
                normal: {
                  position: 'inner'
                }
              },
              labelLine: {
                normal: {
                  show: false
                }
              },
              data: dataInner[result]

            },
            {
              name: 'All reviews',
              type: 'pie',
              radius: ['30%', '45%'],
              center: ['50%', '65%'],

              label: {
                normal: {
                  position: 'outer',
                  textStyle: {
                    fontSize: 14,
                  },
                  formatter: function (params) {
                    return "My Review: " + params.data.from + '\n' +
                      "All Reviews:" + params.data.name.slice(3) + "\n\n";
                  },
                  rich: {
                    a: {
                      color: '#999',
                      lineHeight: 22,
                      align: 'center'
                    },
                    hr: {
                      borderColor: '#aaa',
                      width: '100%',
                      borderWidth: 0.5,
                      height: 0
                    },
                    b: {
                      fontSize: 12,
                      lineHeight: 33
                    },
                    per: {
                      color: '#eee',
                      backgroundColor: '#334455',
                      padding: [2, 4],
                      borderRadius: 2
                    }
                  }
                }
              },
              labelLine: {
                normal: {
                  smooth: 0.3,
                  length: 12,
                  length2: 15
                }
              },
              data: dataOuter[result]
            }
          ]
        }
      },
      newLine(content) {
        return "<div style='padding: 0 5px'>" + content + "</div>"
      },
      initChart() {
        this.balanceChart = echarts.init(this.$refs.balanceTrendChart, null, {renderer: 'svg'});

        const loading = this.$loading({
          lock: true,
          text: 'Loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
        let that = this;
        let id;
        let s = setInterval(function () {
          id = that.$store.getters.getUserInfo._account_id;
          if (id !== undefined) {
            clearInterval(s);
            eventBus.$emit('refresh-balance')
            that.$axios.get('/api/user/result?userId=' + id)
              .then(response => {
                that.totalData = response.data.result.results;
                that.sum = response.data.result.sum;
                that.totalData.forEach(data => {
                  if (data.action !== 1)
                    that.balanceTrendData.push(data)
                });
                that.balanceChart.setOption({
                  tooltip: {
                    trigger: 'item',
                    formatter: function (params) {
                      let r = that.balanceTrendData[params.dataIndex];
                      let action = r.action;
                      let description;
                      switch (action) {
                        case 0:
                          description = that.newLine(params.marker + "Allocate") +
                            that.newLine("Value: " + r.value);
                          break;
                        case 1:
                          description = that.newLine(params.marker + "Code-Review") +
                            that.newLine("Change Id: " + r.changeId) +
                            that.newLine("Decision: " + (r.decision > 0 ? '+' : '') + r.decision) +
                            that.newLine("Cost: " + r.cost) +
                            that.newLine("Transaction: " + r.value);
                          break;
                        case 2:
                          description = that.newLine(params.marker + "Win") +
                            that.newLine("Change Id: " + r.changeId) +
                            that.newLine("Decision: " + (r.decision > 0 ? '+' : '') + r.decision) +
                            that.newLine("Cost: " + r.cost) +
                            that.newLine("Transaction: " + r.value);
                          break;
                        case 3:
                          description = that.newLine(params.marker + "Lose") +
                            that.newLine("Change Id: " + r.changeId) +
                            that.newLine("Decision: " + (r.decision > 0 ? '+' : '') + r.decision) +
                            that.newLine("Cost: " + r.cost) +
                            that.newLine("Transaction: " + r.value);
                          break;

                      }
                      return description + that.newLine("Balance: " + r.balance);
                    },
                    textStyle: {
                      align: 'left'
                    }
                  },
                  grid: {
                    left: '5%',
                    right: that.isMobile ? '20%' : "10%",
                    bottom: '10%',
                    containLabel: true
                  },

                  dataZoom: [{}, {
                    type: 'inside'
                  }],
                  xAxis: {
                    boundaryGap: true,
                    name: "Date",
                    nameLocation: 'end',
                    nameTextStyle: {
                      fontStyle: 'italic',
                      color: 'gray',
                      fontSize: 15,
                      fontFamily: 'Times New Roman'
                    },
                    data: that.balanceTrendData.map(a => formatDate(new Date(a.time), 'yy-MM-dd')),
                    axisTick: {
                      onGap: false,
                      inside: true,
                      length: 0,
                      alignWithLabel: !that.isMobile

                    },
                    axisLabel: {
                      formatter: function (value, index) {
                        if (index === 0)
                          return value;
                        else if (that.balanceTrendData[index].time - that.balanceTrendData[index - 1].time > 24 * 60 * 60 * 1000)
                          return value;
                        else return ''
                      }
                    },
                    splitLine: {
                      show: false
                    }
                  },
                  yAxis: {
                    name: "Balance",
                    nameLocation: 'end',
                    nameTextStyle: {
                      fontStyle: 'italic',
                      color: 'gray',
                      fontSize: 15,
                      fontFamily: 'Times New Roman'
                    },
                    scale: true,
                    axisTick: {
                      onGap: false,
                      inside: true,
                      length: 0
                    },
                    splitLine: {
                      show: false
                    }
                  },
                  series: [{
                    showAllSymbol: true,
                    type: 'line',
                    symbol: "circle",
                    data: that.balanceTrendData.map(a => a.balance),
                    symbolSize: 10,
                    itemStyle: {

                      normal: {
                        label: {
                          show: false,

                        },
                        lineStyle: {
                          width: 1
                        },
                        color: function (params) {
                          let action = that.balanceTrendData[params.dataIndex].action;
                          switch (action) {
                            case 0:
                              return "#7293EB";
                            case 1:
                              return "#2A53B8";
                            case 2:
                              return "#009A61";
                            case 3:
                              return "#CB0000";

                          }
                        }
                      }
                    },
                    lineStyle: {
                      normal: {
                        color: "#87939A"
                      }
                    }

                  }]
                });
                that.balanceChart.on('click', function (params) {
                  that.$router.push({
                    path: `/change/detail/${that.balanceTrendData[params.dataIndex].changeId}`
                  });
                });

                that.balanceTrendData.forEach(data => {
                  if (data.action > 1)
                    that.winningTrendData.push(data)
                });
                if (that.winningTrendData.length === 0)
                  that.isShowCharts.result = false;
                else {
                  that.winningChart = echarts.init(that.$refs.winningTrendChart, null, {renderer: 'svg'});
                  that.winningChart.setOption({
                    tooltip: {
                      trigger: 'item',
                      formatter: function (params) {
                        let r = that.winningTrendData[params.dataIndex];
                        let action = r.action;
                        let description;
                        switch (action) {
                          case 2:
                            description = that.newLine(params.marker + "Win") +
                              that.newLine("Change Id: " + r.changeId) +
                              that.newLine("Decision: " + (r.decision > 0 ? '+' : '') + r.decision) +
                              that.newLine("Net Inflow: +" + r.value);
                            break;
                          case 3:
                            description = that.newLine(params.marker + "Lose") +
                              that.newLine("Change Id: " + r.changeId) +
                              that.newLine("Decision: " + (r.decision > 0 ? '+' : '') + r.decision) +
                              that.newLine("Net Inflow: " + r.value);
                            break;

                        }
                        return description;
                      },
                      textStyle: {
                        align: 'left'
                      }
                    },
                    grid: {
                      left: '5%',
                      right: that.isMobile ? '20%' : "10%",
                      bottom: '10%',
                      containLabel: true
                    },
                    xAxis: {
                      name: "Change",
                      nameLocation: 'end',
                      nameTextStyle: {
                        fontStyle: 'italic',
                        color: 'gray',
                        fontSize: 15,
                        fontFamily: 'Times New Roman'
                      },
                      boundaryGap: true,
                      data: that.winningTrendData.map(a => a.changeId),
                      axisTick: {
                        onGap: false,
                        inside: true,
                        length: 0
                      },
                      splitLine: {
                        show: false
                      },
                      axisLabel: {
                        show: !that.isMobile,
                        interval: 0,
                        rotate: 30
                      }


                    },
                    yAxis: {
                      name: "Net InFlow",
                      nameLocation: 'end',
                      nameTextStyle: {
                        fontStyle: 'italic',
                        color: 'gray',
                        fontSize: 15,
                        fontFamily: 'Times New Roman'
                      },
                      scale: true,
                      axisTick: {
                        onGap: false,
                        inside: true,
                        length: 0
                      },
                      splitLine: {
                        show: false
                      }

                    },
                    series: [{
                      type: 'bar',
                      symbol: "circle",
                      barMaxWidth: 30,
                      data: that.winningTrendData.map(a => a.value),
                      symbolSize: 10,
                      itemStyle: {
                        normal: {
                          color: function (params) {
                            let action = that.winningTrendData[params.dataIndex].action;
                            switch (action) {
                              case 2:
                                return "#009A61";
                              case 3:
                                return "#CB0000";
                            }
                          }
                        }
                      },
                      lineStyle: {
                        normal: {
                          color: "#87939A"
                        }
                      }

                    }]
                  });
                  that.winningChart.on('click', function (params) {
                    that.$router.push({
                      path: `/change/detail/${that.winningTrendData[params.dataIndex].changeId}`
                    });
                  });
                }
                let dataInner = {win: [], lose: []};
                let dataOuter = {win: [], lose: []};
                ["win", "lose"].forEach(result => {
                  ["+2", "+1", "-1"].forEach(decision => {

                    let s = parseInt(decision);
                    if (that.sum[result][s].sum > 0) {
                      dataInner[result].push({value: that.sum[result][s].sum, name: decision});
                      for (let i = 1; i <= 4; i++) {
                        if (that.sum[result][s][i] > 0) {
                          dataOuter[result].push({
                            from: decision,
                            value: that.sum[result][s][i],
                            name: decision + ': ' + that.labelMap[i]
                          })
                        }
                      }
                    }
                  })

                });
                if (dataInner.win.length === 0)
                  that.isShowCharts.winning = false;
                else {
                  that.winningSummaryChart = echarts.init(that.$refs.winningSummaryChart, null, {renderer: 'svg'});
                  that.winningSummaryChart.setOption(that.getOption(dataInner, dataOuter, 'win'));

                }

                if (dataInner.lose.length === 0)
                  that.isShowCharts.losing = false;
                else {
                  that.losingSummaryChart = echarts.init(that.$refs.losingSummaryChart, null, {renderer: 'svg'});
                  that.losingSummaryChart.setOption(that.getOption(dataInner, dataOuter, 'lose'))
                }
                loading.close();
              })

          }
        }, 200);


      }
    }

  }
</script>
<style>
  .personal .el-collapse-item__header {
    background: #F2F2F2;
    text-align: left;
    padding: 0 20px;
    font-size: 17px;
  }

  .personal .el-collapse-item__wrap {
    border: none;
  }

  .personal .el-collapse-item__content {
    padding: 0;
  }

  .personal .section {
    text-align: left
  }

  .personal .name {
    font-size: 24px;
  }

  .personal .email {
    color: #999;
    margin-top: 5px
  }

  .personal .no-data {
    text-align: left;
    font-size: 16px;
    margin-left: 20px
  }
</style>
