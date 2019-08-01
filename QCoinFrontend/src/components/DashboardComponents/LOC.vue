<template>
  <div class="loc">
    <WeekSelector @dateConfirm="updateData" :defaultDate="defaultDate"></WeekSelector>
    <div ref="componentChart" style="padding-top:20px;margin:0 auto;height:500px;width:750px" v-loading="isLoading.Component">

    </div>
    <div ref="osChart" style="margin:0 auto;height:500px;width:750px" v-loading="isLoading.Os">

    </div>
    <div ref="platformChart" style="margin:0 auto;height:500px;width:750px" v-loading="isLoading.Platform">

    </div>
  </div>


</template>

<script>
  import {formatDate} from "@/common/js/dateUtil";

  import WeekSelector from "../CommonComponents/WeekSelector";

  import {timeSince} from "@/common/js/dateUtil";
  Date.prototype.getWeek = function() {
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
  Date.prototype.getWeekYear = function() {
    var date = new Date(this.getTime());
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    return date.getFullYear();
  }
  export default {
    name: "LOC",
    components: {WeekSelector},

    data() {
      return {
        defaultDate:new Date("2018-11-28"),
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
        componentData: [],

        week:'',
        chart: undefined,
        category: "",
        categories: {
          "Component": ['MDF', 'CODEC', 'MHW', 'MOS', 'VP', 'DDI', 'CP'],
          "Os": ['Windows', 'Linux', 'Osx', 'Android', 'Agnostic'],
          "Platform": ['Gen8', 'Gen9', 'Gen10', 'Gen11', 'Gen12', 'Common']
        },
        classifications: ["Component", "Os", "Platform"],
        charts: {},
      }
    },
    watch: {
      componentData: function (newData) {
        //console.log(newData)
      }
    },
    mounted() {
      console.log(this.defaultDate)
      const now = this.defaultDate
      this.week=now.getWeek();
      this.componentChart = echarts.init(this.$refs.componentChart, null, {renderer: 'svg'});
      this.osChart = echarts.init(this.$refs.osChart, null, {renderer: 'svg'});
      this.platformChart = echarts.init(this.$refs.platformChart, null, {renderer: 'svg'});
      this.charts = {
        "Component": this.componentChart,
        "Os": this.osChart,
        "Platform": this.platformChart
      }
    },
    methods: {
      updateData(datePicked) {
        this.week=datePicked.getWeek();
        this.locClicked();
      },

      locClicked() {
        this.totalData = {
          "Component": [],
          "Os": [],
          "Platform": []
        };
        this.isLoading = {
          "Component": true,
          "Os": true,
          "Platform": true
        };
        this.classifications.forEach(async c => {
          this.$axios.get(`/api/git/loc?category=${c.toLowerCase()}&week=${this.week}`)
            .then(response => {
              this.isLoading[c] = false;
              this.categories[c].forEach(key => {
                this.totalData[c].push({value: response.data[key], name: key})
              });
              this.charts[c].clear()
              this.charts[c].setOption({
                title: {
                  text: `LOC (Length of Code) by ${c}`,
                  subtext: `WW ${this.week}`,
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
                  data: this.categories[c]
                },
                series: [
                  {
                    name: this.category,
                    type: 'pie',
                    radius: '55%',
                    center: ['40%', '50%'],
                    data: this.totalData[c],
                    itemStyle: {
                      normal: {
                        label: {        //此处为指示线文字
                          show: true,
                          textStyle: {
                            fontWeight: 400,
                            fontSize: 14    //文字的字体大小
                          },
                          formatter: function (p) {
                            return `${p.name}  ${p.percent}%`;
                          }
                        },
                        labelLine: {    //指示线状态
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
              },true)
            });
        })

      },
      getTimeDiff: function (timeStr, flag) {
        return timeSince(Date.parse(timeStr + (flag ? " GMT" : "")))
      },
    }
  }
</script>

<style scoped>
  .loc {
    margin: 10px 0 0 0

  }
</style>
