//import Vue from 'vue'
import Router from 'vue-router'
import Block from '@/components/Block'
import Register from "@/components/Register"
import Personal from "@/components/Personal"
import ChangeDetail from '@/components/ChangeDetail'
import Login from '@/components/Login'
import History from '@/components/History'
import Dashboard from '@/components/Dashboard'


Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Block',
      component: Block,
      meta: {
        title: 'Qcoin'
      }
    },
    {
      path: '/register',
      name: 'Register',
      component: Register,
      meta: {
        title: 'Register'
      }
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: {
        title: 'Login'
      }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard,
      meta: {
        keepAlive: true,
        title: 'Dashboard'
      }
    },
    {
      path: '/change/detail/:id',
      name: 'ChangeDetail',
      component: ChangeDetail,
    },
    {
      path: '/personal',
      name: 'Personal',
      component: Personal,
      meta: {
        keepAlive: false,
        title: 'Personal'
      }
    },
    {
      path: '/history',
      name: 'History',
      component: History,
      meta: {
        keepAlive: true,
        title: 'History'
      },
    },
    { path: '/a', redirect: 'http://www.baidu.com' },
    {path: '*', redirect: '/'},//配置默认页面路径

  ]
})
