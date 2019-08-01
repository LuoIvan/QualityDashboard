<template>
  <div style="display: flex;height: 100%">
    <div style="font-size: 14px;text-align: left;width: 150px;min-width: 150px;padding-left: 20px">
      <div v-for="folder in chosenFolders" style="width: 150px;word-break:break-all;margin:5px 0">{{folder}}</div>
    </div>
    <el-tree check-strictly show-checkbox :data=folderData  node-key="id" :default-checked-keys="defaultCheckKey"
             :props="defaultProps" @check="folderChecked"
             style="overflow-x:hidden;overflow-y: auto;height:100%;width:100%"></el-tree>

  </div>

</template>

<script>
  export default {
    name: "FolderSelector",
    props: ['folderData', 'chosenFolders', 'index'],
    data() {
      return {
      }
    },
    computed:{
      defaultCheckKey(){

          return []
      }
    },
    methods: {
      folderChecked(data) {
        let absolute = data.absolute;
        let index = this.chosenFolders.indexOf(absolute);
        if (index < 0)
          this.chosenFolders.push(absolute);
        else
          this.chosenFolders.splice(index, 1);

      },

    },

  }
</script>

<style scoped>

</style>
