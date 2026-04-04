import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { allowAccess } from '@/api/movie/movieData'
import { useMovieStore } from '@/store/modules/movie'

// 常量路由
const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
  },
  //查看别人的数据
  {
    path: '/:userid/visitor',
    name: 'Visitor',
    component: () => import('@/views/Home.vue'),
    props: true,
  },
  //个人中心
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/system/Profile.vue'),
  },
  //错误页面
  {
    path: '/error',
    name: 'Error',
    component: () => import('@/views/common/ErrorPage.vue'),
  },
  // 所有未定义的路由
  {
    path: '/:pathMatch(.*)*',
    redirect: '/error',
  },
]

/**
 * 创建路由实例
 */
const createInstance = () =>
  createRouter({
    history: createWebHistory(), // history 模式（URL 不带 #）
    scrollBehavior: () => ({ top: 0 }), // 路由切换时滚动到顶部
    routes: constantRoutes,
  })

const router = createInstance()

/**
 * 全局前置守卫
 * 在路由跳转前进行拦截处理
 */
router.beforeEach(async (to, _from) => {
  // 在访问 /:userid/visitor 路由时校验用户是否存在
  if (to.name === 'Visitor') {
    const userid = to.params.userid
    const valid = await validateUser(userid)
    if (!valid) {
      return '/error'
    }
  } else {
    // 重置访问用户信息
    useMovieStore().resetAccessUserInfo()
  }

  return true
})

/**
 * 校验路由地址携带的用户id是否正确
 */
async function validateUser(useridParam: any): Promise<boolean> {
  try {
    // 处理 params 可能为数组的情况，并转换为数字
    const userid = Array.isArray(useridParam) ? Number(useridParam[0]) : Number(useridParam)
    if (userid === null || isNaN(userid)) {
      return false
    }
    // 验证数据
    const result = await allowAccess(userid)
    if (!result) {
      return false
    }
    // 保存访问者用户信息到 store
    useMovieStore().setAccessUserInfo(String(result.userId), result.nickName)
    return true
  } catch (error) {
    return false
  }
}

export default router
