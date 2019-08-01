<template>

  <div>
    <div class="hidden-sm-and-up">
      <el-menu mode="horizontal" @select="handleSelect" style="display: flex;align-items: center"
               :default-active="activeIndex"
               background-color="#0071c5"
               text-color="#fff"
               active-text-color="#ffd04b" s>
        <el-menu-item index="0" style="flex-grow:1;text-align: left">
          <div>
            <router-link to="/" style="font-size: 20px">Qcoin</router-link>
          </div>
        </el-menu-item>
        <el-menu-item index="3" v-if="userInfo===''">
          Login
        </el-menu-item>
        <el-submenu index="4" v-if="userInfo!==''">
          <template slot="title">{{userInfo.name}}</template>
          <div class="name-email-div">
            <div>{{userInfo.name}}</div>
            <div>{{userInfo.email}}</div>
            <div style="padding-top:5px;display: flex;align-items: center;justify-content: space-between">
              <span style="vertical-align: center" v-if="userInfo.qcoin">{{userInfo.qcoin.qcoinBalance.total}}</span>
            </div>
            <div style="padding-top:5px;display: flex;align-items: center;justify-content: space-between">
              <font-awesome-icon icon="lock" :style="{'font-size': '18px','padding':'0 2px','color':'#ffffff'}"/>
              <span style="vertical-align: center" v-if="userInfo.qcoin">
{{userInfo.qcoin.qcoinBalance.frozen}}</span>
            </div>
          </div>
          <el-menu-item index="4-0" v-if="userInfo!==''">Dashboard</el-menu-item>
          <el-menu-item index="4-3" v-if="userInfo!==''">History</el-menu-item>
          <el-menu-item index="4-1" v-if="userInfo!==''">Personal Account</el-menu-item>
          <el-menu-item index="4-2" @click="logout" v-if="userInfo!==''">Logout</el-menu-item>
        </el-submenu>
      </el-menu>

    </div>
    <div class="hidden-xs-only">
      <el-menu mode="horizontal" @select="handleSelect" style="display: flex;align-items: center;"
               :default-active="activeIndex"
               background-color="#0071c5"
               text-color="#fff"
               active-text-color="#ffd04b">
        <el-menu-item index="0" style="text-align: left">
          <div style="font-size: 20px">
            Qcoin
          </div>
        </el-menu-item>
        <div style="flex-grow:1;">
          <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"
               viewBox="0 0 97.333336 65.333336" class="nav-logo">
            <path
              d="M45.604 57.127C26.631 58.877 6.86 56.12 4.088 41.293c-1.353-7.307 1.98-15.057 6.396-19.874v-2.574C2.53 25.825-1.781 34.653.703 45.085 3.874 58.46 20.839 66.04 46.745 63.523c10.25-.995 23.662-4.292 32.99-9.416v-7.272c-8.47 5.042-22.47 9.209-34.13 10.292zM95.58 18.673C91.079-3.295 48.42-4.69 20.927 12.05v1.848C48.39-.223 87.349-.139 90.896 20.102c1.192 6.691-2.579 13.666-9.317 17.68v5.257c8.104-2.975 16.416-12.59 14-24.366"></path>
            <path
              d="M78.197 15.476h-4.973v22.15c0 2.594 1.255 4.855 4.973 5.214V15.476m-59.224 8.088H13.99l-.006 14.47c0 2.609 1.261 4.863 4.99 5.218V23.564m-4.984-2.703h4.969v-4.713h-4.97zm34.77 22.162c-4.025 0-5.73-2.803-5.73-5.558V18.247h4.934v5.317h3.713v3.98h-3.713v9.62c0 1.119.53 1.75 1.703 1.75h2.01v4.109H48.76m9.073-8.188c0 2.521 1.579 4.375 4.37 4.375 2.188 0 3.266-.603 4.532-1.854l3.046 2.901c-1.953 1.933-4 3.104-7.614 3.104-4.72 0-9.24-2.573-9.24-10.084 0-6.416 3.953-10.046 9.13-10.046 5.266 0 8.292 4.25 8.292 9.822v1.782H57.833m4.01-7.526c-1.687 0-2.983.87-3.536 2.042-.317.708-.438 1.256-.474 2.12h7.599c-.093-2.12-1.057-4.162-3.588-4.162m-29.48.235c1.448 0 2.048.713 2.048 1.875v13.63h4.932V29.392c0-2.77-1.475-5.823-5.808-5.823l-10.187-.005v19.485h4.937V27.544h4.078m51.188-8.109a1.97 1.97 0 0 1-1.973-1.98 1.97 1.97 0 0 1 1.973-1.979c1.088 0 1.984.885 1.984 1.979s-.896 1.98-1.984 1.98zm0-3.63a1.64 1.64 0 0 0-1.63 1.65c0 .906.723 1.64 1.63 1.64.901 0 1.65-.734 1.65-1.64a1.66 1.66 0 0 0-1.65-1.65zm.875 2.832h-.37a.085.085 0 0 1-.073-.046l-.5-.85a.125.125 0 0 0-.072-.041h-.229v.85c0 .04-.027.087-.085.087h-.333c-.046 0-.082-.046-.082-.088v-2.141c0-.125.041-.177.15-.192.12-.01.432-.026.61-.026.614 0 .978.182.978.754v.042c0 .354-.176.547-.448.63l.522.886c.01.015.015.047.015.062 0 .038-.02.073-.083.073zm-.48-1.693c0-.239-.144-.317-.463-.317h-.317v.682c.052 0 .276.01.317.01.319 0 .464-.109.464-.333v-.042"></path>
          </svg>

        </div>
        <el-menu-item index="1" v-show="userInfo!==''">Dashboard</el-menu-item>

        <el-menu-item index="2" v-show="userInfo!==''">History</el-menu-item>
        <el-menu-item index="3" v-if="userInfo===''">
          Login
        </el-menu-item>
        <el-submenu index="4" v-if="userInfo!==''">
          <template slot="title">{{userInfo.name}}</template>

          <div class="name-email-div">
            <div class="white-text">{{userInfo.name}}</div>
            <div class="white-text">{{userInfo.email}}</div>
            <div style="padding-top:5px;display: flex;align-items: center;justify-content: space-between">
              <img src="../assets/icon.png" width="22">
              <span style="vertical-align: center" class="white-text" v-if="userInfo.qcoin">{{userInfo.qcoin.qcoinBalance.total}}</span>
            </div>
            <div style="padding-top:5px;display: flex;align-items: center;justify-content: space-between">
              <font-awesome-icon icon="lock" :style="{'font-size': '18px','padding':'0 2px','color':'#999999'}"/>
              <span style="vertical-align: center" v-if="userInfo.qcoin" class="white-text">
{{userInfo.qcoin.qcoinBalance.frozen}}</span>
            </div>
          </div>
          <el-menu-item index="4-1">Personal Account</el-menu-item>
          <el-menu-item index="4-2" @click="logout">Logout</el-menu-item>
        </el-submenu>
      </el-menu>
    </div>
  </div>

</template>

<script>
  export default {
    name: "TopMenu",
    methods: {
      logout() {
        this.$storage.remove('accessToken');
        this.$store.dispatch('updateUserInfo', '');
        this.$router.push({path: '/'})

      },
      handleSelect(key, keyPath) {
        if (key === '0') {
          this.$router.push({path: '/'});
        }
        else if (key === '1') {
          this.$router.push({path: '/dashboard'});
        }
        else if (key === '2') {
          this.$router.push({
            path: '/history',
          });
        }
        else if (key === '3') {
          this.$router.push({path: '/login'});
        }
        else if (key === '4-1') {
          this.$router.push({path: '/personal'});
        }
      }

    },
    computed: {
      userInfo() {
        return this.$store.getters.getUserInfo ? this.$store.getters.getUserInfo : ''
      },
      activeIndex() {
        return this.$store.getters.getCurrentTabIndex
      }
    },
  }
</script>

<style scoped>
  .name-email-div {
    padding: 0 10px;
    color: #909399;
    font-size: 14px;
    margin-bottom: 5px;
    font-family: "Intel Clear",sans-serif;
  }

  .nav-logo {
    fill: white;
    height: 51px;
    width: 78px;
    position: absolute;
    left: 50%;
    top: 4px;
    margin-left: -39px
  }

</style>
<style>
  .el-submenu__title i {
    color: #ffffff;
  }

  .el-menu-item, .el-submenu__title {
    height: 60px !important;;
    line-height: 60px !important;;
    font-size: 15px;
    font-weight: 300;
    letter-spacing: 1px;

  }
  .el-menu--popup>.el-menu-item{
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 0.05em;


  }

  .el-menu--horizontal .el-menu .el-menu-item {
    border-top: #EEEEEE solid 1px;
    font-family: "Intel Clear",serif;
  }

  a {
    text-decoration: none !important;
    padding: 5px 20px 5px 5px;
  }

  .el-menu-item:first-child.is-active {
    border-bottom-color: transparent !important;
  }

  .white-text {
    color: white;
  }


</style>
