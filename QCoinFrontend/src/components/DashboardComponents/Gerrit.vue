<template>
  <div class="gerrit">
    <DateSelector @dateConfirm="updateTable">

    </DateSelector>

    <el-table :data="gerritList" stripe style="width: 100%" @cell-click="gerritClick" empty-text="Loading...">
      <el-table-column prop="_number" label="Id" width="80"></el-table-column>

      <el-table-column prop="subject" label="Subject"></el-table-column>
      <el-table-column prop="project" label="Project" width="180"></el-table-column>
      <el-table-column prop="branch" label="Branch" width="180"></el-table-column>
      <el-table-column label="Update" width="180">
        <template slot-scope="scope">
          {{getTimeDiff(scope.row.updated,true)}}
        </template>
      </el-table-column>
      <el-table-column prop="blockInfo" label="Blockchain Status"
                       :filters="[{ text: 'Waiting to be created', value: 0 },
                                    { text: 'Pending', value: 1 },
                                    { text: 'Passed', value:2 },
                                    { text: 'Failed', value:3 }]"
                       :filter-method="filterBlockchain" width="180">
        <template slot-scope="scope">
          <span v-if="!scope.row.blockInfo.isExisted">Waiting to be created</span>
          <span v-else-if="scope.row.blockInfo.outcome===null">Pending</span>
          <span v-else-if="scope.row.blockInfo.outcome">
          Passed
          <i class="el-icon-success" style="color: green"> </i>

        </span>
          <span v-else>
          Failed
          <i class="el-icon-error" style="color: red"> </i>
        </span>

        </template>
      </el-table-column>
    </el-table>
  </div>


</template>

<script>
  import {timeSince} from "@/common/js/dateUtil";
  import {formatDate} from "@/common/js/dateUtil";
  import DateSelector from "../CommonComponents/DateSelector";

  export default {
    name: "Gerrit",
    components: {DateSelector},
    data() {
      return {
        gerritList: [],
        dayStart: 10,
        dayEnd: 0,

      }
    },
    mounted() {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      this.dayStart = formatDate(start, 'yyyy-MM-dd') + " 00:00:00";
      this.dayEnd = formatDate(end, 'yyyy-MM-dd') + " 23:59:59";
    },
    methods: {
      clearList() {
        this.gerritList = []
      },
      updateTable(dateRange) {
        this.dayStart = formatDate(dateRange[0], 'yyyy-MM-dd') + " 00:00:00";
        this.dayEnd = formatDate(dateRange[1], 'yyyy-MM-dd') + " 23:59:59";
        this.clearList();
        this.gerritClicked();
      },
      gerritClicked() {
        console.log(this.dayStart, this.dayEnd);
        this.$axios.get(`/api/gerrit?dayStart=${this.dayStart}&dayEnd=${this.dayEnd}`)
          .then(response => {
            this.$store.dispatch('updateCurrentTabIndex', '1');
            this.gerritList = response.data['reviewList']
          })
      },
      gerritClick: function (row) {
        this.$router.push({
          path: `/change/detail/${row._number}`
        });
      },
      getTimeDiff: function (timeStr, flag) {
        return timeSince(Date.parse(timeStr + (flag ? " GMT" : "")))
      },
      filterBlockchain(value, row) {
        switch (value) {
          case 0:
            return !row.blockInfo.isExisted;
          case 1:
            return row.blockInfo.isExisted && row.blockInfo.outcome === null;
          case 2:
            return row.blockInfo.outcome;
          case 3:
            return row.blockInfo.outcome === false;

        }
      }
    }
  }
</script>

<style scoped>


  .gerrit {
    margin: 10px 0 0 0
  }
</style>
