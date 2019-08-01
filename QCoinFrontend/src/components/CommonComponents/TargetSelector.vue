<template>
  <div class="target-selector">
    <el-tree check-strictly show-checkbox :data=folderData node-key="absolute"
             :default-checked-keys="initialChecked"
             @check="folderChecked" style="overflow-x:hidden;overflow-y: auto;height:300px;width:100%"
             v-if="allFolders.length===folderData.length" ref="tree">
    </el-tree>
    <div @click="resetTree" class="reset-button">Reset</div>

  </div>


</template>

<script>
  export default {
    name: "TargetSelector",
    props: {folderData: Object, chosenFolders: Object, allFolders: Object, initialChecked: Object},
    data() {
      return {}
    },

    methods: {
      resetTree() {
        this.$refs.tree.setCheckedKeys([]);
        while (this.chosenFolders.length > 0) {
          this.chosenFolders.pop();
        }


      },
      folderChecked(data) {
        let absolute = data.absolute;
        let index = this.chosenFolders.indexOf(absolute);
        if (index < 0)
          this.chosenFolders.push(absolute);
        else
          this.chosenFolders.splice(index, 1);

      },
    }


  }
</script>

<style scoped>
  .reset-button {
    display: inline-block;
    cursor: pointer;
    background: #fff;
    border: 1px solid #dcdfe6;
    color: #606266;
    text-align: center;
    font-weight: 500;
    padding: 10px 20px;
    font-size: 13px;
    border-radius: 4px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }

  .reset-button:hover {
    color: #409eff;
    border-color: #c6e2ff;
    background-color: #ecf5ff;
  }

  .reset-button:active {
    color: #3a8ee6;
    border-color: #3a8ee6;
  }
</style>

