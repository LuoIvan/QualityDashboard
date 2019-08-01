<template>
  <div>
    <div></div>
    <button @click="addOne">+</button>
    <el-form :model="registerFrom" status-icon :rules="checkRules" ref="registerFrom" label-width="150px"
             class="demo-ruleForm">
      <el-form-item label="Username" prop="username">
        <el-input v-model.number="registerFrom.username"></el-input>
      </el-form-item>
      <el-form-item label="Password" prop="pass">
        <el-input type="password" v-model="registerFrom.pass" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="Confirm Password" prop="checkPass">
        <el-input type="password" v-model="registerFrom.checkPass" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm('registerFrom')">Submit</el-button>
        <el-button @click="resetForm('registerFrom')">Clear</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  export default {
    name: "Register",
    data() {
      let checkUsername = (rule, value, callback) => {
        if (!value) {
          return callback(new Error("Username cannot be none"));
        }
        callback();
      };
      let validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('Please enter password'));
        } else {
          if (this.registerFrom.checkPass !== '') {
            this.$refs.registerFrom.validateField('checkPass');
          }
          callback();
        }
      };
      let validatePass2 = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('Please confirm password'));
        } else if (value !== this.registerFrom.pass) {
          callback(new Error('The password you enter is not the same'));
        } else {
          callback();
        }
      };
      return {
        registerFrom: {
          pass: '',
          username: ''
        },
      };
    },
    computed: {
    },
    methods: {
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            alert('submit!');
          } else {
            return false;
          }
        });
      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
      }
    }
  }
</script>

<style scoped>

</style>
