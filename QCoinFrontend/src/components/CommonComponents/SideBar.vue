<template>
  <div :class="isCollapse?'left-folder-menu-collapse':'left-folder-menu'">
    <div style="display: flex;height: 470px">
      <div v-show="!isCollapse" style="padding-left:15px;width: 100%;overflow-y: auto;overflow-x: hidden; border-bottom: 1px solid #ebeef5">
        <el-collapse v-model="activeNames" style="width: 100%">
          <el-collapse-item :name="index" v-for="(chosenGroup,index) in chosenGroups" :key="index" >
            <template slot="title">

              <div style="margin-left: 20px">
                <span style="float: left;width:33.33333%;text-align:left;">&nbsp;
                    <el-button type="danger" icon="el-icon-close" circle @click.stop="removeGroup(index)"
                               v-if="index===chosenGroups.length-1 && index>0"></el-button>
                </span>
                <span style="float: left;width:33.33333%;text-align:center;">Group {{index+1}}</span>
              </div>
            </template>
            <FolderSelector :folder-data="folderData" :chosen-folders="chosenGroup" :index="index"></FolderSelector>
          </el-collapse-item>
        </el-collapse>


        <el-button type="primary" icon="el-icon-plus" style="margin-top: 20px" @click="addGroup"> Add group
        </el-button>

      </div>
      <div style="cursor:pointer;display: flex;justify-content:center;align-items:center;width: 30px; border: 1px solid #ebeef5;border-left: 0;
" @click="isCollapse=!isCollapse">
        <i class="el-icon-arrow-right" v-if="isCollapse"></i>
        <i class="el-icon-arrow-left" v-else></i>

      </div>
    </div>


  </div>

</template>

<script>
  import FolderSelector from "./FolderSelector";

  export default {
    name: "SideBar",
    components: {FolderSelector},
    props: ['folderData', 'chosenGroups'],
    data() {
      return {
        isCollapse: true,
        activeNames: [0]
      }
    },
    methods: {
      setCollapse(bool) {
        this.isCollapse = bool
      },
      addGroup() {
        this.chosenGroups.push([])
        this.activeNames.push(this.chosenGroups.length-1)
        console.log(this.activeNames)
      },
      removeGroup(index) {
        this.chosenGroups.splice(index, 1);
      }
    }
  }
</script>

<style scoped>

  .left-folder-menu {
    height: 470px;
    min-width: 400px;
    position: absolute;
    left: 0;
    z-index: 999;
    background: white;

  }

  .left-folder-menu-collapse {
    height: 470px;
    width: 30px;
    position: absolute;
    left: 0;
    z-index: 999;


  }


</style>
<style>

  .left-folder-menu .el-collapse-item__content {
    padding: 0;
  }

  .left-folder-menu .el-menu--collapse {
    width: 300px
  }

  .left-folder-menu .el-tabs__item {
    text-align: left;
  }

  .left-folder-menu .el-button.is-circle {
    padding: 2px
  }

</style>
