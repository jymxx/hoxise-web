import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './store'

import '@/assets/css/main.css' // CSS样式文件入口
import ElementPlus from 'element-plus' // element-plus
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn' // 中文语言包

import 'video.js/dist/video-js.css' // 视频播放器样式

import Particles from '@tsparticles/vue3' // 粒子效果
import { loadFull } from 'tsparticles'

import { setupDirectives } from './directives' // 自定义指令

const app = createApp(App) // 创建 Vue 应用实例

// 注册插件
app.use(pinia) // 注册状态管理
app.use(router) // 注册路由
app.use(ElementPlus, { locale: zhCn }) // 注册 UI 组件库（设置中文）
app.use(Particles, {
  // 注册粒子效果组件
  init: async (engine) => {
    await loadFull(engine)
  },
})

setupDirectives(app) // 注册自定义指令

app.mount('#app') // 挂载应用到 DOM
