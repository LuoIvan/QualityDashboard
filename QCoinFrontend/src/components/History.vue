<template>
  <div class="cards">
    <DateSelector @dateConfirm="updateTable"></DateSelector>
    <el-table :data="histories" style="width:100%" :default-sort="{prop: 'submitted', order: 'descending'}"
              empty-text="Loading..." @cell-click="gerritClick">
      <el-table-column label="Change id" sortable prop="_number" align="left" width="110">
      </el-table-column>

      <el-table-column label="Change">
        <template slot-scope="scope">
          <div class="subject">{{scope.row.subject}}
            <el-tag type="success">{{scope.row.project}}</el-tag>
            <el-tag type="info">{{scope.row.branch}}</el-tag>
          </div>
          <div class="change-id">{{scope.row.change_id}}</div>
          <div class="time">{{scope.row.submitted | formatTime}}</div>

        </template>
      </el-table-column>
      <el-table-column label="Choice" prop="personalDecision" sortable align="left" width="150">
        <template slot-scope="scope">
          <el-tag type="success" v-if="scope.row.personalDecision===2">+{{scope.row.personalDecision}}</el-tag>
          <el-tag type="info" v-if="scope.row.personalDecision===1">+{{scope.row.personalDecision}}</el-tag>
          <el-tag type="warning" v-if="scope.row.personalDecision===-1">{{scope.row.personalDecision}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Status" align="left" width="200" prop="submitted"
                       :filters="[{ text: 'Waiting to be Created', value: 0 }, { text: 'Pending', value: 1 },{ text: 'Win', value:2 },{ text: 'Lose', value: 3 }]"
                       :filter-method="filterResult">
        <template slot-scope="scope">
          <span v-if="scope.row.betInfo.isOutcomeSet">
            <span v-if="scope.row.betInfo.winning===0" class="result result-failed">
              Failed
            </span>
            <span v-else class="result result-won">
              +{{scope.row.betInfo.winning}}
            </span>
            </span>
          <span v-if="!scope.row.betInfo.isExisted">Waiting to be Created</span>
          <span v-else-if="!scope.row.betInfo.isOutcomeSet">Pending</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import {formatDate} from "@/common/js/dateUtil";
  import DateSelector from "./CommonComponents/DateSelector";

  export default {
    name: "History",
    components: {DateSelector},
    data() {
      return {
        histories: null,
        dayStart: "",
        dayEnd: ""
      }
    },
    filters: {
      formatTime(time) {
        return formatDate(new Date(time + ' GMT'), 'yyyy-MM-dd hh:mm:ss')
      }
    },

    mounted: function () {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      this.dayStart = formatDate(start, 'yyyy-MM-dd') + " 00:00:00";
      this.dayEnd = formatDate(end, 'yyyy-MM-dd') + " 23:59:59";

      this.$store.dispatch('updateCurrentTabIndex', '2');
      let that = this;
      let id;
      let s = setInterval(function () {//wait until login passed from gerrit
        id = that.$store.getters.getUserInfo._account_id;
        if (id !== undefined) {
          clearInterval(s);
          that.$axios.get(`/api/user/history?userId=${id}&dayStart=${that.dayStart}&dayEnd=${that.dayEnd}`)
            .then(response => {
              that.histories = response.data.histories;
              that.histories.forEach(history => {
                history.labels['Code-Review'].all.forEach(review => {
                  if (review._account_id === id)
                    history.personalDecision = review.value;
                })
              });
            })
        }
      }, 200)


    },
    methods: {
      clearList() {
        this.histories = []
      },
      gerritClick: function (row, column, cell) {
        if (column.label === 'Change')
          this.$router.push({
            path: `/change/detail/${row._number}`
          });
      },
      goToDetail(key) {
        this.$router.push({
          path: `/change/detail/${key}`
        });
      },
      filterResult(value, row) {
        switch (value) {
          case 0:
            return row.betInfo.isExisted === false;
          case 1:
            return row.betInfo.isExisted === true && row.betInfo.isOutcomeSet === false;
          case 2:
            return row.betInfo.isOutcomeSet === true && row.betInfo.winning > 0;
          case 3:
            return row.betInfo.isOutcomeSet === true && row.betInfo.winning === 0

        }
      },
      updateTable(dateRange) {
        let id = this.$store.getters.getUserInfo._account_id;
        this.dayStart = formatDate(dateRange[0], 'yyyy-MM-dd') + " 00:00:00";
        this.dayEnd = formatDate(dateRange[1], 'yyyy-MM-dd') + " 23:59:59";
        this.clearList();
        this.$axios.get(`/api/user/history?userId=${id}&dayStart=${this.dayStart}&dayEnd=${this.dayEnd}`)
          .then(response => {
            this.histories = response.data.histories;
            this.histories.forEach(history => {
              history.labels['Code-Review'].all.forEach(review => {
                if (review._account_id === id)
                  history.personalDecision = review.value;
              })
            });
          })
      }
    },
    beforeRouteLeave(to, from, next) {
      from.meta.keepAlive = false;
      next();
    }
  }
</script>

<style scoped>
  .cards {
    margin: 10px;
  }

  .flex-line {
    display: flex;
    justify-content: space-between;
    margin: 5px 0;
    align-items: center;
  }

  .subject {
    text-align: left;
    font-size: 15px
  }

  .change-id {
    color: gray;
    font-size: 14px;
    text-align: left;
  }

  .el-tag {
    font-size: 13px;
    padding: 0 8px;
    height: 26px;
    line-height: 22px;
  }

  .el-card {
    cursor: pointer;
  }

  .result {
    font-size: 15px;
  }

  .result-won {
    color: green
  }

  .result-failed {
    color: red
  }

  .time {
    text-align: left;
  }
</style>
