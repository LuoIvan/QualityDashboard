<template>
  <div class="hsdes">
    <DateSelector @dateConfirm="updateTable">
      <i class="el-icon-loading" style="margin-left:20px" @click="downloadHsdes"
         v-if="isHsdesDownloading" slot="extra"> </i>
      <i class="el-icon-download" style="margin-left:20px" @click="downloadHsdes" slot="extra" v-else> </i>

    </DateSelector>
    <el-table :data="hsdesList" stripe style="width: 100%" @cell-click="hsdesClick"
              :empty-text="noResult ?  'No Result': 'Loading...'">
      <el-table-column prop="title" label="ID" style="cursor: pointer;" width="130">
        <template slot-scope="scope">
          <span style="cursor: pointer"> {{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="Subject" style="cursor: pointer;">
        <template slot-scope="scope">
          <span style="cursor: pointer"> {{scope.row.title}}</span>
        </template>
      </el-table-column>
      <el-table-column label="Updated" width="150">
        <template slot-scope="scope">
          {{getTimeDiff(scope.row.updated_date)}}
        </template>
      </el-table-column>
      <el-table-column prop="submitted_by" label="Submitter" width="130">
        <template slot-scope="scope">
          <el-popover
            placement="top-start"
            :title="标题"
            width="300"
            trigger="click"
            @show="showPopup(scope.row.submitted_by)">
            <div v-loading="isWorkerLoading" class="submitter">
              <div class="submitter-department">Department: {{worker.department}}</div>
              <div class="submitter-worker">Submitter: {{worker.name}}({{worker.WWID}})<a
                :href="`mailto:${worker.email}`"><i class="el-icon-message"></i></a></div>
              <div class="submitter-manager">Manager: {{worker.managerName}}({{worker.managerWWID}})<a
                :href="`mailto:${worker.managerEmail}`"><i class="el-icon-message"></i></a>
              </div>
            </div>
            <span slot="reference" style="cursor: pointer">{{scope.row.submitted_by}}</span>
          </el-popover>

        </template>
      </el-table-column>
      <el-table-column prop="component" label="Component" width="150">
        <template slot-scope="scope" v-if="scope.row.component">
          {{scope.row.component.split('.')[2]}}
        </template>
      </el-table-column>

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
                                { text: 'SUB_COMPONENT_MISSING', value: 32 }
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
    name: "Hsdes",
    components: {DateSelector},
    data() {
      return {
        worker: {},
        isWorkerLoading: true,
        isHsdesDownloading: false,
        dayStart: 7,
        dayEnd: 0,
        hsdesList: [],
        noResult: false,

      }
    },
    methods: {
      showPopup(worker) {
        this.isWorkerLoading = true;
        this.$axios.get(`/api/worker?Idsid=${worker}`)
          .then(response => {
            this.worker = response.data;
            this.isWorkerLoading = false;
          });
      },
      updateTable(dateRange) {
        this.clearList();
        this.dayStart = getTimeDifferInDay(dateRange[0]);
        this.dayEnd = getTimeDifferInDay(dateRange[1]);
        this.hsdesClicked(this.dayStart, this.dayEnd);

      },
      clearList() {
        this.hsdesList = [];
      },
      hsdesClicked() {
        this.noResult = false;
        this.$axios.get(`/api/hsdes?dayStart=${this.dayStart}&dayEnd=${this.dayEnd}`)
          .then(response => {
            this.hsdesList = response.data;
            console.log(this.hsdesList);
            this.noResult = this.hsdesList.length === 0;
          });
      },
      getTimeDiff: function (timeStr, flag) {
        return timeSince(Date.parse(timeStr + (flag ? " GMT" : "")))
      },
      hsdesClick: function (row, column, cell, event) {
        if (column.label === "Submitter")
          console.log(row.submitted_by);
        else if (column.label === "Subject")
          window.open("https://hsdes.intel.com/appstore/article/#/" + row.id)
      },
      filterInvalidReason(value, row) {
        return (row.validity & value) === value

      },
      filterStatus(value, row) {
        switch (value) {
          case 0:
            return row.status.includes('open');
          case 1:
            return row.status.includes('implemented');
          case 2:
            return row.status.includes('verified');
          case 3:
            return row.status.includes('complete');
          case 4:
            return row.status.includes('rejected');
        }
      },
      filterValidity(value, row) {
        switch (value) {
          case 0:
            return row.validity === 0;
          case 1:
            return row.validity > 0;
        }
      },
      downloadHsdes() {
        this.isHsdesDownloading = true;
        this.$axios.get(`/api/hsdes?type=csv&dayStart=${this.dayStart}&dayEnd=${this.dayEnd}`, {responseType: 'blob'})
          .then(response => {
            let url = URL.createObjectURL(response.data);
            let link = document.createElement('a');
            link.style.display = 'none';
            link.href = url;
            link.setAttribute('download', 'hsdes.csv');
            document.body.appendChild(link);
            link.click();
            this.isHsdesDownloading = false;
          });
      }
    },
    mounted: function () {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      this.dateRange = [start, end];
    }
  }
</script>

<style scoped>
   .el-icon-download {
    cursor: pointer;
    padding: 5px;
    margin-left: 10px
  }

  .el-icon-download:hover {
    color: deepskyblue;
  }

  .submitter-department {
    font-size: 16px;
    margin: 0 0 10px 0;
  }

  .submitter {
    font-family: "Intel Clear", sans-serif;

  }

  .hsdes {
    margin: 10px 0 0 0
  }

</style>
<style>

</style>
