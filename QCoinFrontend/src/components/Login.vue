<template>
  <el-card class="login-card" shadow="hover">
    <h2 style="font-weight: normal">Login</h2>

    <el-form :model="loginForm" status-icon ref="loginForm">
      <el-form-item label="Idsid" prop="username" class="form-input">
        <el-input v-model="loginForm.username" autofocus></el-input>
      </el-form-item>
      <el-form-item label="Password" prop="pass" class="form-input">
        <el-input type="password" v-model="loginForm.pass" auto-complete="off"
                  @keyup.enter.native="submitForm"></el-input>
      </el-form-item>

      <el-button type="primary" @click="submitForm">Login</el-button>
    </el-form>
  </el-card>
</template>

<script>

  export default {

    name: "Login",
    data() {
      return {
        loginForm: {
          username: '',
          password: ''
        }
      }
    },
    created: function () {
      this.$store.dispatch('updateCurrentTabIndex', '3');


    },
    methods: {
      submitForm() {
        let that = this;
        let username = this.loginForm.username;
        let password = this.loginForm.pass;
        const loading = this.$loading({
          lock: true,
          text: 'Login...',
          background: 'rgba(0, 0, 0, 0.7)'
        });
        this.$axios.post('/api/user/login', {username: username, password: password})
          .then(response => {
            loading.close();
            if (response.status !== 200)
              that.$message.error('Login failed, please check username and password');
            else {
              that.$message({
                message: 'Login succeed',
                type: 'success'
              });
              this.$storage.set('accessToken', response.data['accessToken']);
              this.$store.dispatch('updateUserInfo', response.data['userInfo']);
              this.$router.push({path: '/dashboard'});

              if (response.data['isFirst']) {
                this.$axios.post('/api/user/create', {
                  password: password,
                  id: response.data['userInfo']['_account_id']
                }).then(receipt => {
                  this.$store.dispatch('updateQcoin', receipt.data);
                })
              }

            }
          }).catch(function (error) {
          console.log(error);
        });
      },
    },


  }
</script>

<style scoped>
  .form-input {
    width: 400px;
    margin: 30px auto
  }

  .login-card {

    width: 600px;
    margin: 30px auto

  }

</style>
