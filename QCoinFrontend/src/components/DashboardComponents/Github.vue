<template>
  <el-table :data="githubList" stripe style="width: 100%" @cell-click="cellClick" empty-text="Loading...">

    <el-table-column prop="title" label="Subject"></el-table-column>
    <el-table-column prop="state" label="Status"></el-table-column>
    <el-table-column label="Update">
      <template slot-scope="scope">
        {{getTimeDiff(scope.row.updated)}}
      </template>
    </el-table-column>

  </el-table>


</template>

<script>
  import {timeSince} from "@/common/js/dateUtil";

  export default {
    name: "Github",
    data() {
      return {
        githubList: []

      }
    },
    methods: {
      githubClicked() {
        this.$axios.get('/api/github')
          .then(response => {
            this.githubList = response.data
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
