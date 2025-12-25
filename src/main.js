
import Vue from 'vue'
import App from './App.vue'
import store from './store/index'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'
import router from './router/index' //路由
import 'video.js/dist/video-js.css'//视频播放器

Vue.use(ElementUI)
//配置请求的根路径
axios.defaults.baseURL = window.rootpath
Vue.prototype.$axios = axios
Vue.prototype.$store = store
Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: (h) => h(App),
})
