import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)
const constantRoutes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/rimworld',
    name: 'rimworld',
    component: () => import('@/views/rimworld/TranslateMod.vue')
  },
]

/**
 * 创建路由 
 * */
const createRouter = () =>
  new Router({
    mode: 'history',
    scrollBehavior: () => ({
      y: 0,
    }),
    routes: constantRoutes,
  })
const router = createRouter()

/**
 * 全局导航守卫 
 */
router.beforeEach((to, from, next) => {

    next();//直接访问
});


export default router