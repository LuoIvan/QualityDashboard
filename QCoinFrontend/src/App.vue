<template>
  <div id="app" class="out">
    <div style=" flex: 1;">
      <TopMenu></TopMenu>
      <keep-alive>
        <router-view v-if="$route.meta.keepAlive"></router-view>
      </keep-alive>
      <router-view v-if="!$route.meta.keepAlive"></router-view>
    </div>
    <div class="footer">
      <div style="display: flex; align-items: center;flex-wrap: wrap">
        <svg style="margin-right: 20px" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 97.333336 65.333336" class="nav-logo-footer">
          <path
            d="M45.604 57.127C26.631 58.877 6.86 56.12 4.088 41.293c-1.353-7.307 1.98-15.057 6.396-19.874v-2.574C2.53 25.825-1.781 34.653.703 45.085 3.874 58.46 20.839 66.04 46.745 63.523c10.25-.995 23.662-4.292 32.99-9.416v-7.272c-8.47 5.042-22.47 9.209-34.13 10.292zM95.58 18.673C91.079-3.295 48.42-4.69 20.927 12.05v1.848C48.39-.223 87.349-.139 90.896 20.102c1.192 6.691-2.579 13.666-9.317 17.68v5.257c8.104-2.975 16.416-12.59 14-24.366"></path>
          <path
            d="M78.197 15.476h-4.973v22.15c0 2.594 1.255 4.855 4.973 5.214V15.476m-59.224 8.088H13.99l-.006 14.47c0 2.609 1.261 4.863 4.99 5.218V23.564m-4.984-2.703h4.969v-4.713h-4.97zm34.77 22.162c-4.025 0-5.73-2.803-5.73-5.558V18.247h4.934v5.317h3.713v3.98h-3.713v9.62c0 1.119.53 1.75 1.703 1.75h2.01v4.109H48.76m9.073-8.188c0 2.521 1.579 4.375 4.37 4.375 2.188 0 3.266-.603 4.532-1.854l3.046 2.901c-1.953 1.933-4 3.104-7.614 3.104-4.72 0-9.24-2.573-9.24-10.084 0-6.416 3.953-10.046 9.13-10.046 5.266 0 8.292 4.25 8.292 9.822v1.782H57.833m4.01-7.526c-1.687 0-2.983.87-3.536 2.042-.317.708-.438 1.256-.474 2.12h7.599c-.093-2.12-1.057-4.162-3.588-4.162m-29.48.235c1.448 0 2.048.713 2.048 1.875v13.63h4.932V29.392c0-2.77-1.475-5.823-5.808-5.823l-10.187-.005v19.485h4.937V27.544h4.078m51.188-8.109a1.97 1.97 0 0 1-1.973-1.98 1.97 1.97 0 0 1 1.973-1.979c1.088 0 1.984.885 1.984 1.979s-.896 1.98-1.984 1.98zm0-3.63a1.64 1.64 0 0 0-1.63 1.65c0 .906.723 1.64 1.63 1.64.901 0 1.65-.734 1.65-1.64a1.66 1.66 0 0 0-1.65-1.65zm.875 2.832h-.37a.085.085 0 0 1-.073-.046l-.5-.85a.125.125 0 0 0-.072-.041h-.229v.85c0 .04-.027.087-.085.087h-.333c-.046 0-.082-.046-.082-.088v-2.141c0-.125.041-.177.15-.192.12-.01.432-.026.61-.026.614 0 .978.182.978.754v.042c0 .354-.176.547-.448.63l.522.886c.01.015.015.047.015.062 0 .038-.02.073-.083.073zm-.48-1.693c0-.239-.144-.317-.463-.317h-.317v.682c.052 0 .276.01.317.01.319 0 .464-.109.464-.333v-.042"></path>
        </svg>
        <img src="../src/assets/VTT-logo.png" height="50" style="margin-right: 20px"/>
        <img src="../src/assets/VPG-logo.png" height="50" style="margin-right: 20px"/>
      </div>

      <div class="footer-description">
        <ul class="footer-links">

          <li>
            <a href="/docs/" style="color:black;" target="_blank">Document </a>
          </li>
        </ul>
      </div>

    </div>

  </div>

</template>

<script>
  import TopMenu from "@/components/TopMenu"
  import {eventBus} from '@/common/js/Eventbus'

  export default {
    name: 'App',
    components: {TopMenu},

    computed: {
      windowWidth() {
        return this.$store.getters.getWindowParam.width + 'px';
      }
    },
    mounted() {

      const that = this;
      window.onresize = function temp() {
        that.$store.dispatch('updateWindowParam', {
          width: document.body.clientWidth,
          height: document.body.clientHeight
        });
      };
      eventBus.$on('refresh-balance', () => {
        that.$axios.get("/api/user/balance?userId=" + that.$store.getters.getUserInfo._account_id)
          .then(response => {
            that.$store.dispatch('updateQcoin', {qcoinBalance: response.data});
          })
      })
    },
    created() {
      let that = this;
      this.$router.beforeEach(function (to, from, next) {
        if (["Login", "Block"].includes(to.name) || that.$storage.get('accessToken'))
          next();
      });
      this.$axios.interceptors.request.use((config) => {
        if (this.$storage.get('accessToken'))
          config.headers.Authorization = 'Bearer ' + this.$storage.get('accessToken');
        return config
      });
      this.$axios.interceptors.response.use((response) => {
        if (response.status === 260) {//redirect to login
          if (!["Login", "Block"].includes(this.$router.currentRoute.name))
            this.$router.replace({path: '/login'});

        }
        if (response.status === 261) {//redirect to login
          if (!["Login"].includes(this.$router.currentRoute.name))
            this.$router.replace({path: '/login'});

        }
        if (response.headers['refresh-token'])
          this.$storage.set('accessToken', response.headers['refresh-token'])
        return response
      });

      //document.cookie = "GerritAccount=aQ4bfeivdnTJq5uHEzDRRig7tupYJ-YG";

      //this.$storage.set('accessToken', "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJSb2xlIjpbIlVzZXIiXSwiQ29va2llIjoiR2Vycml0QWNjb3VudD1hUTRiZmVpdmRuVEpxNXVIRXpEUlJpZzd0dXBZSi1ZRyIsImlhdCI6MTUzNTk0MDAxMH0.PDmQCcIlMeLt-lfL8pGixaEnY0vFVfF3Z6QMtZC8_X4");


      this.$axios.post('/api/user/info').then(response => {
        console.log(response)
        this.$store.dispatch('updateUserInfo', response.data['userInfo']);
        console.log("finished")

      })
    },

  }
</script>

<style>
  @font-face {
    font-family: 'Intel Clear';
    src: url('../src/assets/fonts/intel-clear-latin.woff2') format('woff2');
  }

  #app {
    font-family: 'Intel Clear', "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }

  html, body {
    height: 100%;
    margin: 0;
    padding: 0;
    -webkit-font-smoothing: antialiased;
  }

  @media (-webkit-min-device-pixel-ratio: 1.5),
  (min-resolution: 2dppx) {
    /* Retina下仍使用默认字体渲染 */
    body {
      -webkit-font-smoothing: subpixel-antialiased;
    }
  }

  .footer-links li {
    list-style-type: none;
    padding-left: 2em;
    float: left;

  }

  .nav-logo-footer {
    fill: #0071c5;
    height: 51px;
    width: 78px;
    text-align: center;
    margin: 20px;
  }

  .footer {
    display: flex;
    padding: 20px 40px;
    background-color: #f3f3f3;
  }

  .out {
    width: 100%;
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }

  .main {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  .footer-description {
    border-left: 1px solid #d7d7d7;
    padding: 20px;
    margin-left: 20px;
    display: flex;
    align-items: center;
  }

</style>
