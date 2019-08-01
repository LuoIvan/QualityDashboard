<template>
  <div class="git-analysis">
    <div class="target-selector-div">
      <el-popover
        width="400"
        placement="bottom-start"
        trigger="click">
        <TargetSelector :folder-data="folderData" :chosen-folders="chosenFolders"
                        :all-folders="allFolders" :initial-checked="chosenFolders"></TargetSelector>
        <el-button slot="reference">
          <font-awesome-icon icon="folder-open" :style="{'font-size': '16px','padding-right':'4px','padding-top':'2px'}"
                             fixed-width/>
          Target:
          <span v-for="(chosenFolder,index) in chosenFolders" :key="index">{{chosenFolder}}
          <span v-if="index!==chosenFolders.length-1">&nbsp&nbsp</span></span></el-button>
      </el-popover>
    </div>
    <DateRangeSelector @dateConfirm="updateData" :dateType="dateType">
      <div slot="before">
        <el-select v-model="chartType" style="margin-right:15px">
          <el-option
            v-for="item in chartTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
        <el-select v-model="cateOption" style="margin-right:15px">
          <el-option
            v-for="item in categoryOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>

      </div>


    </DateRangeSelector>

    <div style="display:flex;margin-top: 10px">
      <SideBar :folder-data="folderData" :chosen-groups="chosenGroups" ref="sidebar"
               v-show="cateOption==='Customized'" v-if="folderData.length===allFolders.length"></SideBar>
      <el-tabs tab-position='right' style="width: 100%">
        <el-tab-pane>
          <span slot="label">
            <font-awesome-icon icon="cloud-upload-alt" :style="{'font-size': '18px','padding-right':'4px'}"
                               fixed-width/>
           Commit
          </span>

          <div ref="commitChart" style="margin:10px auto;height:420px;width:750px"></div>
        </el-tab-pane>
        <el-tab-pane>
          <span slot="label">
            <font-awesome-icon icon="check-circle" :style="{'font-size': '18px','padding-right':'4px'}"
                               fixed-width/>
           Effective Commit
          </span>

          <div ref="effectiveCommitChart" style="margin:10px auto;height:420px;width:750px"></div>
        </el-tab-pane>
        <el-tab-pane>
          <span slot="label">
            <font-awesome-icon icon="list-ul" :style="{'font-size': '18px','padding-right':'4px'}"
                               fixed-width/>
           Lines of Change
          </span>
          <div ref="locChart" style="margin:10px auto;height:450px;width:750px"></div>
        </el-tab-pane>
        <el-tab-pane>
          <span slot="label">
            <font-awesome-icon icon="file" :style="{'font-size': '18px','padding-right':'4px'}"
                               fixed-width/>
           Files
          </span>
          <div ref="filesChart" style="margin:10px auto;height:450px;width:750px"></div>
        </el-tab-pane>

      </el-tabs>

    </div>
  </div>


</template>

<script>
  import {formatDate, getWeek, getWeekYear} from "@/common/js/dateUtil";

  import DateSelector from "../CommonComponents/DateSelector";
  import {timeSince} from "@/common/js/dateUtil";
  import DateRangeSelector from "../CommonComponents/DateRangeSelector";
  import FolderSelector from "../CommonComponents/FolderSelector";
  import SideBar from "../CommonComponents/SideBar";
  import TargetSelector from "../CommonComponents/TargetSelector";
  import {checkFolderOverlap} from "../../common/js/folderUtil";

  export default {
    name: "GitAnalysis",
    components: {TargetSelector, SideBar, FolderSelector, DateRangeSelector, DateSelector},

    data() {
      return {
        isCollapse: true,
        currentTarget: [],
        chosenGroups: [[]],
        chosenFolders: ['media_driver', 'media_embargo'],
        allFolders: ['media_driver', 'media_embargo'],
        folderData: [],
        defaultProps: {
          children: 'children',
          label: 'label'
        },
        cateOption: 'Component',
        chartType: 'Snapshot',
        chartTypes: [{
          value: 'Snapshot',
          label: 'Snapshot'
        }, {
          value: 'Trend (Daily)',
          label: 'Trend (Daily)'
        }, {
          value: 'Trend (Weekly)',
          label: 'Trend (Weekly)'
        }, {
          value: 'Trend (Monthly)',
          label: 'Trend (Monthly)'
        }],
        isTabShow: false,
        totalData: {
          "Component": [],
          "Os": [],
          "Platform": []
        },
        codeChurnData: {"add": [], "delete": [], "files": []},
        componentData: [],
        codeChurnCharts: {},
        dayStart: 7,
        dayEnd: 0,
        chart: undefined,
        category: "",
        categories: {
          "Component": ['MDF', 'CODEC', 'MHW', 'MOS', 'VP', 'DDI', 'CP'],
          "Os": ['Windows', 'Linux', 'Osx', 'Android', 'Agnostic'],
          "Platform": ['Gen8', 'Gen9', 'Gen10', 'Gen11', 'Gen12', 'Common']
        },
        classifications: ["Component", "Os", "Platform"],
        previousChartType: "",
        metrics: ['commit', 'loc', 'files', 'effective']
      }
    },
    watch: {
      componentData: function (newData) {
        //console.log(newData)
      },
      cateOption: function (newCateOption) {
        if (newCateOption === 'Customized')
          this.$refs.sidebar.setCollapse(false);
        else
          this.$refs.sidebar.setCollapse(true);

      },
    },
    computed: {
      dateType() {
        if (this.chartType === "Trend (Daily)")
          return "date"
        if (this.chartType === "Trend (Weekly)")
          return "week"
        if (this.chartType === "Trend (Monthly)")
          return "month"
      },
      categoryOptions() {
        if (this.chartType === "Snapshot")
          return [{
            value: 'Component',
            label: 'Component'
          }, {
            value: 'Os',
            label: 'Os'
          }, {
            value: 'Platform',
            label: 'Platform'
          }, {
            value: 'Customized',
            label: 'Customized'
          }];
        else return [{
          value: 'Component',
          label: 'Component'
        }, {
          value: 'Os',
          label: 'Os'
        }, {
          value: 'Platform',
          label: 'Platform'
        }, {
          value: 'All',
          label: 'All'
        }, {
          value: 'Customized',
          label: 'Customized'
        }]
      }
    },

    mounted() {
      const end = new Date();
      const start = new Date();
      start.setTime(end.getTime() - 3600 * 1000 * 24 * 30);
      this.dayStart = formatDate(start, 'yyyy-MM-dd');
      this.dayEnd = formatDate(end, 'yyyy-MM-dd');
      this.codeChurnCharts['commit'] = echarts.init(this.$refs.commitChart, null, {renderer: 'svg'});
      this.codeChurnCharts['loc'] = echarts.init(this.$refs.locChart, null, {renderer: 'svg'});
      this.codeChurnCharts['files'] = echarts.init(this.$refs.filesChart, null, {renderer: 'svg'});
      this.codeChurnCharts['effective'] = echarts.init(this.$refs.effectiveCommitChart, null, {renderer: 'svg'});

      this.allFolders.forEach((folder, index) => {
        this.$axios.get(`/api/git/folder?path=${folder}`).then(response => {
          this.folderData.splice(index, 0, {
            label: folder,
            absolute: folder,
            children: response.data,
            id: index + 1
          });
        })
      });


    },
    methods:
      {
        getEffectivePercentage(total,regression){
          return (100*(1-regression/total)).toFixed(2)
        },
        folderChecked(data) {
          let absolute = data.absolute;
          let index = this.chosenFolders.indexOf(absolute);
          if (index < 0)
            this.chosenFolders.push(absolute);
          else
            this.chosenFolders.splice(index, 1);

        }
        ,
        getType() {
          if (this.chartType === "Trend (Daily)")
            return "daily";
          if (this.chartType === "Trend (Weekly)")
            return "weekly";
          if (this.chartType === "Trend (Monthly)")
            return "monthly"
        }
        ,
        updateData(dateRange) {
          this.dayStart = formatDate(dateRange[0], 'yyyy-MM-dd');
          this.dayEnd = formatDate(dateRange[1], 'yyyy-MM-dd');
          this.gitAnalysisClicked();
        }
        ,
        isFoldersValid(folders, title) {
          let isValid = false;
          if (folders.length === 0) {
            this.$alert('Please choose at least one folder', `${title} - No folders are chosen`, {
              confirmButtonText: 'OK',
            })
          }
          else {
            let [isOverlap, folder1, folder2] = checkFolderOverlap(folders)
            if (isOverlap) {
              this.$alert(`${folder1}<br>${folder2}<br>are overlapped`, `${title} - Folders overlapped`, {
                confirmButtonText: 'OK',
                dangerouslyUseHTMLString: true,
              })
            } else
              isValid = true
          }
          return isValid
        },
        gitAnalysisClicked() {
          let isValid = false;
          if (this.cateOption === 'Customized') {
            isValid = true;
            for (let [index, group] of this.chosenGroups.entries()) {
              if (!this.isFoldersValid(group, `Group${index + 1}`)) {
                isValid = false;
                break
              }
            }
          }
          else if (this.isFoldersValid(this.chosenFolders, `Target`))
            isValid = true;
          if (isValid) {
            this.metrics.forEach(metric => {
              this.codeChurnData[metric] = [];
              this.codeChurnCharts[metric].showLoading({
                text: '',
                color: 'rgb(0, 113, 197, 0.8)',
                effect: 'whirling'
              });

            });
            let folders = this.cateOption === 'Customized' ? JSON.stringify(this.chosenGroups) : JSON.stringify(this.chosenFolders);
            if (this.chartType === "Snapshot")
              this.$axios.get(`/api/git/codechurn?type=snapshot&path=${folders}&category=${this.cateOption.toLowerCase()}&dayStart=${this.dayStart}&dayEnd=${this.dayEnd}`)
                .then(response => {
                  if (this.cateOption === 'Customized') {
                    this.metrics.forEach(metric => {
                      this.codeChurnCharts[metric].clear();
                      this.codeChurnCharts[metric].hideLoading();

                      let dateAxis = Object.keys(response.data).sort()
                      if (metric === 'effective') {
                        dateAxis.forEach(group => {
                          this.codeChurnData[metric].push(
                            this.getEffectivePercentage(response.data[group]['commit'],response.data[group]['regression'])
                          )
                        });
                      }
                      else
                        dateAxis.forEach(group => {
                          this.codeChurnData[metric].push(response.data[group][metric])
                        });

                      this.codeChurnCharts[metric].setOption({
                        color: ['#3398DB'],
                        title: {
                          text: `Code churn(${metric}) -  ${this.cateOption}`,
                          subtext: `${this.dayStart} ~ ${this.dayEnd}`,
                          x: 'center'
                        },
                        tooltip: {
                          trigger: 'axis',
                          axisPointer: {
                            type: 'shadow'
                          }
                        },
                        grid: {
                          left: '20%',
                          bottom: '15%',
                          containLabel: true
                        },
                        xAxis: [
                          {
                            type: 'category',
                            data: dateAxis,
                            axisTick: {
                              alignWithLabel: true
                            }
                          }
                        ],
                        yAxis: [
                          {
                            type: 'value'
                          }
                        ],

                        series: [{
                          type: 'bar',
                          barWidth: '20%',
                          itemStyle: {
                            normal: {
                              label: {
                                show: true,
                                position: 'top',
                              }
                            }
                          },
                          data: this.codeChurnData[metric]
                        }]
                      })

                    })
                  }
                  else {
                    Object.keys(response.data).sort().forEach(key => {
                      this.metrics.forEach(metric => {
                        if (metric === 'effective')
                          this.codeChurnData[metric].push({
                            value: response.data[key]['commit'] - response.data[key]['regression'],
                            name: key
                          });
                        else
                          this.codeChurnData[metric].push({value: response.data[key][metric], name: key})

                      })
                    });
                    console.log(this.codeChurnData)
                    this.metrics.forEach(metric => {
                      this.codeChurnCharts[metric].clear();
                      this.codeChurnCharts[metric].hideLoading();
                      this.codeChurnCharts[metric].setOption({
                        title: {
                          text: `Code churn(${metric}) -  ${this.cateOption}`,
                          subtext: `${this.dayStart} ~ ${this.dayEnd}`,
                          x: 'center'
                        },
                        tooltip: {
                          trigger: 'item',
                          formatter: "{b} : {c} ({d}%)"
                        },
                        legend: {
                          type: 'scroll',
                          orient: 'vertical',
                          right: 10,
                          top: 50,
                          bottom: 20,
                          data: Object.keys(response.data).sort()
                        },
                        series: [
                          {
                            name: this.category,
                            type: 'pie',
                            radius: '55%',
                            center: ['50%', '45%'],
                            data: this.codeChurnData[metric],
                            itemStyle: {
                              normal: {
                                label: {
                                  show: true,
                                  textStyle: {
                                    fontWeight: 400,
                                    fontSize: 14
                                  },
                                  formatter: function (p) {
                                    return `${p.name}  ${p.percent}%`;
                                  }
                                },
                                labelLine: {
                                  show: true,
                                  smooth: 0.2,
                                  length: 10,
                                  length2: 20
                                }
                              },
                              emphasis: {
                                shadowBlur: 10,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                              }
                            }
                          }
                        ]
                      })
                    })
                  }
                });

            else {
              let period = this.getType();
              let start, end;
              if (period === 'weekly') {
                start = getWeekYear(this.dayStart) + '-' + getWeek(this.dayStart);
                end = getWeekYear(this.dayEnd) + '-' + getWeek(this.dayEnd)

              }
              else if (period === 'monthly') {
                start = this.dayStart.slice(0, -3);
                end = this.dayEnd.slice(0, -3);
              }
              else if (period === 'daily') {
                start = this.dayStart;
                end = this.dayEnd;
              }

              this.$axios.get(`/api/git/codechurn?type=trend&period=${this.getType()}&path=${folders}&category=${this.cateOption.toLowerCase()}&dayStart=${start}&dayEnd=${end}`)
                .then(response => {
                  let chartOptionsData = {};
                  this.metrics.forEach(metric => {
                    this.codeChurnCharts[metric].clear();
                    this.codeChurnCharts[metric].hideLoading();

                    chartOptionsData[metric] = {
                      legend: {},
                      series: [],
                      data: [],
                    };
                    if (this.cateOption === "All") {
                      let d = [];
                      chartOptionsData[metric].legend = {"All": true};
                      if (metric === 'effective')
                        Object.keys(response.data["All"]).sort().forEach(key => {
                          d.push({
                            value: this.getEffectivePercentage(response.data["All"][key]['commit'],response.data["All"][key]['regression']),
                            name: key
                          })
                        });
                      else
                        Object.keys(response.data["All"]).sort().forEach(key => {
                          d.push({value: response.data["All"][key][metric], name: key})
                        });
                      this.codeChurnData[metric].push({
                        name: 'All',
                        type: 'line',
                        data: d
                      })
                    }

                    else {
                      let count = 0;
                      Object.keys(response.data).sort().forEach(c => {
                        let d = [];
                        chartOptionsData[metric].legend[c] = (count === 0 || this.cateOption === 'Customized');
                        if (metric === 'effective') {
                          Object.keys(response.data[c]).sort().forEach(date => {
                            d.push({
                              value:this.getEffectivePercentage(response.data[c][date]['commit'],response.data[c][date]['regression']),
                              name: date
                            })
                          });
                        }
                        else
                          Object.keys(response.data[c]).sort().forEach(date => {
                            d.push({value: response.data[c][date][metric], name: date})
                          });

                        count++;
                        this.codeChurnData[metric].push({
                          name: c,
                          type: 'line',
                          data: d
                        })
                      });
                    }
                    this.codeChurnCharts[metric].setOption({
                      title: {
                        text: `Code churn(${metric}) - ${this.cateOption}`,
                        subtext: `${start} ~ ${end}`,
                        x: 'center'
                      },
                      tooltip: {
                        trigger: 'axis'
                      },
                      legend: {
                        selected: chartOptionsData[metric].legend,
                        type: 'scroll',
                        orient: 'vertical',
                        right: 0,
                        top: 0,
                      },
                      grid: {
                        left: '20%',
                        bottom: '15%',
                        containLabel: true
                      },
                      xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: Object.keys(Object.values(response.data)[0]).sort()
                      },
                      yAxis: {
                        type: 'value',
                        splitLine: {
                          show: false
                        }
                      },
                      series: this.codeChurnData[metric]
                    })

                  })
                })

            }

          }

        }
        ,
        getTimeDiff: function (timeStr, flag) {
          return timeSince(Date.parse(timeStr + (flag ? " GMT" : "")))
        }
        ,
      }
  }
</script>

<style scoped>
  .git-analysis {
    margin: 10px 0 0 0;

  }

  .git-analysis::-webkit-scrollbar {
    display: none;
  }


</style>
<style>
  .target-selector-div {
    text-align: left;
  }

  .git-analysis .el-tabs--right {
    text-align: left;
  }

  .target-selector-div .el-button {
    padding: 5px 10px 10px 10px;
    border: none;
    background: transparent;
    font-family: 'Intel Clear', "Helvetica Neue", sans-serif;

  }

  .git-analysis input {
    font-family: 'Intel Clear', "Helvetica Neue", sans-serif;

  }

  .git-analysis span {
    font-family: 'Intel Clear', "Helvetica Neue", sans-serif;

  }
</style>
