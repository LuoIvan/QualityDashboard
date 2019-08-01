<template>
  <div>
    <span style="display: flex;align-items: center">
      <slot name="before"></slot>

       <el-date-picker
         v-model="from"
         :type="dateType"
         :format="dateFormat"
         placeholder="Please pick week"
       >
       </el-date-picker>
        <span style="padding: 0 5px ">To</span>
        <el-date-picker
          v-model="to"
          :type="dateType"
          :format="dateFormat"
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
    name: "DateRangeSelector",
    props: {
      dateType: {
        default: "date"
      }
    },
    computed: {
      dateFormat() {
        if (this.dateType === "month")
          return "MM, yyyy";
        if (this.dateType === "week")
          return "Week WW, yyyy"
        if (this.dateType === "date")
          return "MM/dd, yyyy"
      }
    },
    data() {
      return {

        from: '',
        to: '',
      }
    },
    mounted() {
      const end = new Date();
      const start = new Date();
      start.setTime(end.getTime() - 3600 * 1000 * 24 * 30);
      this.from = start;
      this.to = end;
    },
    methods: {
      dateConfirm() {
        this.$emit('dateConfirm', [this.from, this.to])
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
