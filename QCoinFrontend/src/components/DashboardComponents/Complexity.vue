<template>

  <div class="complexity">
    <div class="target-selector-div">
      <el-popover
        width="400"
        placement="bottom-start"
        trigger="click">
        <TargetSelector :folder-data="folderData" :chosen-folders="chosenFolders"
                        :all-folders="allFolders" :initial-checked="['media_driver']"></TargetSelector>
        <el-button slot="reference">
          <font-awesome-icon icon="folder-open" :style="{'font-size': '16px','padding-right':'4px','padding-top':'2px'}"
                             fixed-width/>
          Target:
          <span v-for="(chosenFolder,index) in chosenFolders" :key="index">{{chosenFolder}}
          <span v-if="index!==chosenFolders.length-1">&nbsp&nbsp</span></span></el-button>
      </el-popover>
    </div>
    <WeekSelector @dateConfirm="updateData" :defaultDate="defaultDate">
        <span slot="extra">
          <el-select v-model="compOption" style="margin:0 10px" :disabled="!isShowOptions">
            <el-option
              v-for="item in compOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
          <el-select v-model="cateOption" :disabled="!isShowOptions">
            <el-option
              v-for="item in cateOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </span>

    </WeekSelector>


    <div ref="chart" style="padding-top:20px;margin:0 auto;height:500px;width:750px"
         v-loading="isLoading"></div>

  </div>


</template>

<script>
  import {formatDate} from "@/common/js/dateUtil";

  import WeekSelector from "../CommonComponents/WeekSelector";

  import {timeSince} from "@/common/js/dateUtil";
  import TargetSelector from "../CommonComponents/TargetSelector";

  Date.prototype.getWeek = function () {
    var date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    var week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
      - 3 + (week1.getDay() + 6) % 7) / 7);
  }

  // Returns the four-digit year corresponding to the ISO week of the date.
  Date.prototype.getWeekYear = function () {
    var date = new Date(this.getTime());
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    return date.getFullYear();
  }
  export default {
    name: "Complexity",
    components: {TargetSelector, WeekSelector},

    data() {
      return {
        chosenFolders: ['media_driver'],
        allFolders: ['media_driver'],
        folderData: [],
        defaultDate: new Date("2018-11-28"),
        cateOption: 'Component',
        cateOptions: [{
          value: 'Component',
          label: 'Component'
        }, {
          value: 'Os',
          label: 'Os'
        }, {
          value: 'Platform',
          label: 'Platform'
        }],
        compOption: 'Max',

        compOptions: [{
          value: 'Average',
          label: 'Average'
        }, {
          value: 'Max',
          label: 'Max'
        }],
        isLoading: {
          "Component": true,
          "Os": true,
          "Platform": true
        },
        totalData: {
          "Component": [],
          "Os": [],
          "Platform": []
        },
        partData: [],
        componentData: [],

        week: '',
        date: '',
        chart: undefined,
        category: "",
        categories: {
          "Component": ['MDF', 'CODEC', 'MHW', 'MOS', 'VP', 'DDI', 'CP'],
          "Os": ['Windows', 'Linux', 'Osx', 'Android', 'Agnostic'],
          "Platform": ['Gen8', 'Gen9', 'Gen10', 'Gen11', 'Gen12', 'Common']
        },
        classifications: ["Component", "Os", "Platform"],
        pieCategory:['1~10', '11~20', '21~50', '>50'],
      }
    },
    watch: {
      componentData: function (newData) {
        //console.log(newData)
      },
    },
    mounted() {
      const now = this.defaultDate;
      this.week = now.getWeek();
      this.chart = echarts.init(this.$refs.chart, null, {renderer: 'svg'});
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
    computed: {
      isShowOptions() {
        return this.chosenFolders.length === 1 && this.chosenFolders[0] === 'media_driver';
      }

    },
    methods: {
      updateData(datePicked) {
        this.week = datePicked.getWeek();
        this.date = formatDate(datePicked, 'yyyy-MM-dd');
        console.log(this.date);
        this.complexityClicked();
      },

      complexityClicked() {
        this.totalData = [];
        this.isLoading = true;
        if (this.isShowOptions) {
          let i = this.compOption === "Average" ? 0 : 1;
          this.$axios.get(`/api/git/complexity?category=${this.cateOption.toLowerCase()}&week=${this.week}`)
            .then(response => {
              this.isLoading = false;
              if (Object.keys(response.data).length !== 0) {
                this.categories[this.cateOption].forEach(key => {
                  this.totalData.push(response.data[key][i])
                });
                this.chart.clear()
                this.chart.setOption({
                  color: ['#3398DB'],
                  title: {
                    text: (i === 0 ? 'Average' : 'Max') + ` Complexity by ${this.cateOption}`,
                    subtext: `WW ${this.week}`,
                    x: 'center'
                  },
                  tooltip: {
                    trigger: 'axis',
                    axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                      type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                    }
                  },
                  grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                  },
                  xAxis: [
                    {
                      type: 'category',
                      data: this.categories[this.cateOption],
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
                  series: [
                    {
                      name: (i === 0 ? 'Average' : 'Max') + ` Complexity`,
                      type: 'bar',
                      barWidth: '60%',
                      itemStyle: {
                        normal: {
                          label: {
                            show: true,
                            position: 'top',
                          }
                        }
                      },
                      data: this.totalData,

                    }
                  ]
                })
              }


            })
        }
        else {
          let folders = [];
          this.chosenFolders.forEach(folder => {
            if (folder !== 'media_driver')
              folders.push(folder.split('media_driver/')[1])
          });
          this.$axios.get(`/api/git/comploc?path=${JSON.stringify([folders])}&date=${this.date}`).then(response => {
            this.isLoading = false;
            try {
              let partData=[]
              let data = response.data[0];
              Object.keys(data).forEach(key => {
                if (this.pieCategory.includes(key)) {
                  partData.push({name:key,value:data[key]})
                }

              })
              console.log(partData)
              console.log(Object.keys(this.partData).sort())
              this.chart.clear()
              this.chart.setOption({
                title: {
                  text: `Complexity`,
                  subtext: `${this.date}`,
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
                  data:this.pieCategory
                },
                series: [
                  {
                    name: 'Complexity',
                    type: 'pie',
                    radius: '55%',
                    center: ['50%', '45%'],
                    data: partData,
                    itemStyle: {
                      normal: {
                        label: {
                          show: true,
                          textStyle: {
                            fontWeight: 400,
                            fontSize: 14
                          },
                          formatter: function (p) {
                            console.log(p)
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
            }
            catch (err) {
              console.log(err)
            }
          })

        }

      },
      getTimeDiff: function (timeStr, flag) {
        return timeSince(Date.parse(timeStr + (flag ? " GMT" : "")))
      },
    }
  }
</script>

<style scoped>
  .complexity {
    margin: 10px 0 0 0

  }
</style>
