// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'element-ui/lib/theme-chalk/index.css'
import 'element-ui/lib/theme-chalk/display.css';
//import Vue from 'vue'
import Vuex from 'vuex'
import App from './App'
import router from './router'
import axios from 'axios'
import storage from '@/common/js/storage'
import {library} from '@fortawesome/fontawesome-svg-core'
import {faLock,faCloudUploadAlt,faListUl,faFile,faFolderOpen,faCheckCircle} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import locale from 'element-ui/lib/locale/lang/en'

library.add(faLock,faCloudUploadAlt,faListUl,faFile,faFolderOpen,faCheckCircle)
Vue.component('font-awesome-icon', FontAwesomeIcon)

//Vue.use(ElementUI, {locale})
Vue.use(Vuex);
//Vue.config.devtools = true;

let store = new Vuex.Store({
  state: {
    userInfo: '',
    windowParam: {width: document.body.clientWidth, height: document.body.clientHeight},
    tabIndex: "0",
  },
  getters: {
    getUserInfo(state) {
      return state.userInfo
    },
    getWindowParam(state) {
      return state.windowParam
    },
    getCurrentTabIndex(state) {
      return state.tabIndex
    }
  },
  mutations: {
    resize(state, windowParam) {
      state.windowParam = windowParam;
    },
    update(state, userInfo) {
      state.userInfo = userInfo;
    },
    addAttributes(state, value) {
      state.userInfo['qcoin'] = value;
    },
    updateIndex(state, value) {
      state.tabIndex = value;
    }
  },
  actions: {
    updateUserInfo(context, userInfo) {
      context.commit('update', userInfo)
    },
    updateQcoin(context, qcoin) {
      context.commit('addAttributes', qcoin)
    },
    updateWindowParam(context, windowParam) {
      context.commit('resize', windowParam)
    },
    updateCurrentTabIndex(context, index) {
      context.commit('updateIndex', index)
    }
  }
});
Vue.config.productionTip = false;
Vue.prototype.$axios = axios;
Vue.prototype.$storage = storage;

/* eslint-disable no-new */
router.beforeEach((to, from, next) => {
  /* 路由发生变化修改页面title */
  if (to.meta.title) {
    document.title = to.meta.title;
  }
  next();
})

new Vue({
  el: '#app',
  router,
  store,
  components: {App},
  template: '<App/>',


});

