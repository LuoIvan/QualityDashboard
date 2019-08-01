<template>
  <div class="jira">
    <DateSelector @dateConfirm="updateTable">
      <i class="el-icon-loading" style="margin-left:20px" @click="downloadJira" slot="extra"
         v-if="isJiraDownloading"> </i>
      <i class="el-icon-download" style="margin-left:20px" @click="downloadJira" slot="extra" v-else> </i>
    </DateSelector>


    <el-table :data="jiraList" stripe style="width: 100%" @cell-click="jiraClick" empty-text="Loading...">

      <el-table-column prop="id" label="ID"></el-table-column>
      <el-table-column prop="title" label="Subject"></el-table-column>
      <!--
      <el-table-column prop="priority" label="Priority" width="180"></el-table-column>
      <el-table-column prop="reporter" label="Reporter" width="180"></el-table-column>
      <el-table-column prop="type" label="type" width="180"
                       :filters="[{ text: 'Task', value: 0 },
                                    { text: 'SubTask', value: 1 },
                                    { text: 'Bug', value:2 }]"
                       :filter-method="filterType"></el-table-column>
      <el-table-column label="Updated" width="180">
        <template slot-scope="scope">
          {{getTimeDiff(scope.row.updated)}}
        </template>
      </el-table-column>
      -->
      <el-table-column prop="project" label="Project"></el-table-column>
      <el-table-column prop="component" label="Component"></el-table-column>
      <el-table-column prop="status" label="Status" width="180"
                       :filters="[{ text: 'Open', value: 0 },
                                { text: 'Implemented', value: 1 },
                                { text: 'Verified', value:2 },
                                { text: 'Complete', value: 3 },
                                { text: 'Rejected', value:4 },
                                ]"
                       :filter-method="filterStatus"></el-table-column>

      <el-table-column prop="valid" label="Valid" width="120"
                       :filters="[{ text: 'VALID', value: 0 },
                                    { text: 'INVALID', value: 1 },

                                ]"
                       :filter-method="filterValidity">
        <template slot-scope="scope">
          <div v-if="scope.row.valid">
            <i class="el-icon-success" style="color: green"> </i>
            <span style="color: green"> Valid</span>
          </div>
          <div v-else>
            <i class="el-icon-error" style="color: red"> </i> <span
            style="color: red"> Invalid</span>
          </div>

        </template>

      </el-table-column>
      <el-table-column prop="invalid_reason" label="InValid Reason"
                       :filters="[{ text: 'VALID', value: 0 },
                                { text: 'INVALID_REGRESSION', value: 1 },
                                { text: 'INVALID_REGRESSION_COMMIT_ID', value:2 },
                                { text: 'INVALID_ROOT_CAUSE', value: 4 },
                                { text: 'INVALID_FIX_COMMIT_ID', value:8 },
                                { text: 'INVALID_REJECTED_REASON', value: 16 },
                                ]"
                       :filter-method="filterInvalidReason" width="280">
        <template slot-scope="scope">
          <div v-for="reason in scope.row.invalid_reason">
            {{reason}}
          </div>


        </template>
      </el-table-column>      
    </el-table>
  </div>

</template>

<script>
  import {timeSince} from "@/common/js/dateUtil";
  import {getTimeDifferInDay} from "@/common/js/dateUtil";
  import DateSelector from "../CommonComponents/DateSelector";

  export default {
    name: "Jira",
    components: {DateSelector},
    data() {
      return {
        jiraList: [],
        dayStart: 7,
        dayEnd: 0,
        isJiraDownloading: false,

      }
    },
    mounted: function () {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      this.dateRange = [start, end];
    },
    methods: {
      clearList() {
        this.jiraList = []

      },
      updateTable(dateRange) {

        this.clearList();
        this.dayStart = getTimeDifferInDay(dateRange[0]);
        this.dayEnd = getTimeDifferInDay(dateRange[1]);
        this.jiraClicked(this.dayStart, this.dayEnd);


      },
      downloadJira() {
        this.isJiraDownloading = true;
        this.$axios.get(`/api/jira?type=csv&dayStart=${this.dayStart}&dayEnd=${this.dayEnd}`, {responseType: 'blob'})
          .then(response => {
            let url = URL.createObjectURL(response.data);
            let link = document.createElement('a');
            link.style.display = 'none';
            link.href = url;
            link.setAttribute('download', 'jira.csv');
            document.body.appendChild(link);
            link.click();
            this.isJiraDownloading = false;
          });
      },

      jiraClicked() {
        this.$axios.get(`/api/jira?dayStart=${this.dayStart}&dayEnd=${this.dayEnd}`)
          .then(response => {
            this.jiraList = response.data;
            console.log(this.jiraList);
          });
      },
      jiraClick: function (row, column, cell, event) {
        if (column.label === "Submitter")
          console.log(row.submitted_by);
        else if (column.label === "Subject")
          window.open("https://jira.devtools.intel.com/browse/" + row.id)
      },
      getTimeDiff: function (timeStr, flag) {
        return timeSince(Date.parse(timeStr + (flag ? " GMT" : "")))
      },
      filterType(value, row) {
        switch (value) {
          case 0:
            return row.type === "Task";
          case 1:
            return row.type === "Sub-task";
          case 2:
            return row.type === "Bug";

        }
      }
    }
  }
</script>

<style scoped>
  .el-icon-arrow-right, .el-icon-download {
    cursor: pointer;
    padding: 5px;
    margin-left: 10px
  }

  .el-icon-arrow-right:hover, .el-icon-download:hover {
    color: deepskyblue;
  }

  .jira {
    margin: 10px 0 0 0
  }
</style>
