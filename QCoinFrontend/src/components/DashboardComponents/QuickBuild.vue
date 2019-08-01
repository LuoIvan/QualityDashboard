<template>
  <el-table :data="quickBuildList" stripe style="width: 100%" @cell-click="cellClick" empty-text="Loading...">

    <el-table-column prop="version" label="Subject"></el-table-column>
    <el-table-column prop="status" label="Status"></el-table-column>
    <el-table-column label="Update">
      <template slot-scope="scope">
        {{getTimeDiff(scope.row.beginDate)}}
      </template>
    </el-table-column>

  </el-table>


</template>

<script>
  import {timeSince} from "@/common/js/dateUtil";

  export default {
    name: "QuickBuild",
    data() {
      return {
        quickBuildList: []

      }
    },
    methods: {
      quickBuildClicked() {
        this.$axios.get('/api/quickbuild')
          .then(response => {
            this.quickBuildList = response.data
          });
      },
      getTimeDiff: function (timeStr, flag) {
        return timeSince(Date.parse(timeStr + (flag ? " GMT" : "")))
      },
    }
  }
</script>

<style scoped>

</style>
