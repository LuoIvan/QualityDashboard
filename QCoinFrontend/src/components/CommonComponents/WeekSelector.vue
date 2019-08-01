<template>
  <div>
      <span style="display: flex;align-items: center">
       <el-date-picker
         v-model="datePicked"
         type="week"
         format="Week WW, yyyy"
         placeholder="Please pick week"
         >
    </el-date-picker>
        <slot name="extra"></slot>
        <i class="el-icon-arrow-right" @click="dateConfirm"></i>

      </span>

  </div>
</template>

<script>

  export default {
    name: "WeekSelector",
    props:{
      defaultDate:{
        default:new Date()
      }
    },
    data() {
      return {

        datePicked: '',
      }
    },
    mounted() {
      this.datePicked=this.defaultDate
    },
    methods: {
      dateConfirm() {
        this.$emit('dateConfirm', this.datePicked)
      },
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
</style>
<style>
  .el-checkbox-group, .el-picker-panel__body-wrapper {
    font-family: Arial, sans-serif;
  }
</style>
