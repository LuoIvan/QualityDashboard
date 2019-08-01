<template>
  <el-tabs type="border-card" @tab-click="handleClick" v-model="activeTabName">
    <el-tab-pane name="gitAnalysis">
      <span slot="label" style="display: flex;align-items: center">
        <img src="../../src/assets/git-logo.png" height="15" style="margin-right: 3px">Code Churn</span>
      <GitAnalysis ref="gitAnalysis"></GitAnalysis>
    </el-tab-pane>
    <el-tab-pane name="loc">
      <span slot="label" style="display: flex;align-items: center">
        <img src="../../src/assets/git-logo.png" height="15" style="margin-right: 3px">LOC</span>
      <LOC ref="loc"></LOC>
    </el-tab-pane>
    <el-tab-pane name="complexity">
      <span slot="label" style="display: flex;align-items: center">
        <img src="../../src/assets/git-logo.png" height="15" style="margin-right: 3px">Complexity</span>
      <Complexity ref="complexity"></Complexity>
    </el-tab-pane>

    <el-tab-pane name="HSDES">
      <span slot="label" style="display: flex;align-items: center">
      <img src="../../src/assets/hsdes-logo.png" height="14" style="margin-right: 2px">HSD-ES
      </span>
      <Hsdes ref="hsdes"></Hsdes>
    </el-tab-pane>
    <el-tab-pane name="Jira">
      <span slot="label" style="display: flex;align-items: center">
      <img src="../../src/assets/jira-logo.png" height="14" style="margin-right: 2px">Jira</span>
      <Jira ref="jira"></Jira>
    </el-tab-pane>

    <!--
        <el-tab-pane name="Gerrit">
      <span slot="label" style="display: flex;align-items: center">
        <img src="../../src/assets/gerrit-logo.png" height="15" style="margin-right: 3px"> Gerrit</span>
      <Gerrit ref="gerrit"></Gerrit>
    </el-tab-pane>


    </el-tab-pane>
    <el-tab-pane name="QuickBuild">
      <span slot="label" style="display: flex;align-items: center">
      <img src="../../src/assets/quickbuild-logo.svg" height="14" style="margin-right: 3px"> QuickBuild</span>
      <QuickBuild ref="quickBuild"></QuickBuild>
    </el-tab-pane>
    <el-tab-pane name="Github">
      <span slot="label" style="display: flex;align-items: center">
        <svg height="16" style="margin-right: 5px" viewBox="0 0 16 16"
             version="1.1" width="15" aria-hidden="true" ma><path fill-rule="evenodd"
                                                                  d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path></svg>Github</span>
      <Github ref="github"></Github>
    </el-tab-pane>
    -->
  </el-tabs>

</template>

<script>
  import {timeSince} from "@/common/js/dateUtil";
  import Github from "./DashboardComponents/Github";
  import Jira from "./DashboardComponents/Jira";
  import QuickBuild from "./DashboardComponents/QuickBuild";
  import Gerrit from "./DashboardComponents/Gerrit";
  import Hsdes from "./DashboardComponents/Hsdes";
  import GitAnalysis from "./DashboardComponents/GitAnalysis";
  import LOC from "./DashboardComponents/LOC";
  import Complexity from "./DashboardComponents/Complexity";

  export default {
    name: "Dashboard",
    components: {Complexity, Hsdes, Gerrit, QuickBuild, Jira, Github,GitAnalysis,LOC},
    comments: {
      Github
    },
    data() {
      return {
        isClicked: {
          "Gerrit": false,
          "Jira": false,
          "QuickBuild": false,
          "Github": false,
          "HSDES": false,
          "loc":false,
          "complexity":false,
          "gitAnalysis":true

        },
        activeTabName: 'gitAnalysis',
        hsdesDay: 7,

        isHsdesDownloading: false

      }
    },
    mounted: function () {
      //this.refreshHsdes();
     // this.$refs.gerrit.gerritClicked();
      this.$refs.gitAnalysis.gitAnalysisClicked();

      this.$store.dispatch('updateCurrentTabIndex', '1');


    },
    methods: {
      getTimeDiff: function (timeStr, flag) {
        return timeSince(Date.parse(timeStr + (flag ? " GMT" : "")))
      },

      handleClick(tab) {
        if (!this.isClicked[tab.name]) {
          this.isClicked[tab.name] = true;
          switch (tab.name) {
            case 'Gerrit':
              this.$refs.gerrit.gerritClicked();
              break;
            case 'Jira':
              this.$refs.jira.jiraClicked();
              break;
            case 'QuickBuild':
              this.$refs.quickBuild.quickBuildClicked();

              break;
            case "Github":
              this.$refs.github.githubClicked();

              break;
            case "HSDES":
              this.$refs.hsdes.hsdesClicked();
              break;
            case "gitAnalysis":
              this.$refs.gitAnalysis.gitAnalysisClicked();
              break;
            case "loc":
              this.$refs.loc.locClicked();
              break;
            case "complexity":
              this.$refs.complexity.complexityClicked();
          }

        }
      },

      refreshHsdes() {
        this.$refs.hsdes.clearList();
        this.$refs.hsdes.hsdesClicked();
      },


    },
    beforeRouteLeave(to, from, next) {
      from.meta.keepAlive = false;
      next();
    },
  }


</script>
<style scoped>

</style>
<style>

  .el-tabs--border-card > .el-tabs__header {
    border: none;
  }

  .el-tabs .el-tabs__content {
    padding-top: 0;
  }

  .el-table .cell {
    text-align: left !important;
    word-break: break-word;
  }

  .el-tabs__item {
    font-size: 15px;
  }
</style>
