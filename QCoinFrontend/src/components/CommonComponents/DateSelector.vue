<template>
  <div>
      <div style="display: flex;align-items: center">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          align="right"
          unlink-panels
          range-separator="To"
          start-placeholder="Start"
          end-placeholder="End"
          :picker-options="pickDate"
          :format="format"
        >
      </el-date-picker>
        <slot name="extra"></slot>

        <i class="el-icon-arrow-right" @click="dateConfirm"></i>
      </div>

  </div>
</template>

<script>
  export default {
    name: "DateSelector",
    props:{
      format:{
        default:"yyyy-MM-dd"
      }
    },
    data() {
      return {
        pickDate: {
          shortcuts: [{
            text: 'In a week',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: 'In two weeks',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 14);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: 'In a month',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }]
        },
        dateRange: [],
      }
    },
    mounted() {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      this.dateRange = [start, end];
    },
    methods: {
      dateConfirm() {
        this.$emit('dateConfirm', this.dateRange)
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
