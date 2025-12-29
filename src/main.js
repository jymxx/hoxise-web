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
axios.defaults.baseURL = window.baseUrl
Vue.prototype.$axios = axios
Vue.prototype.$store = store
Vue.config.productionTip = false

// 设置根字体大小以适配不同分辨率
// function setRootFontSize() {
//   const screenWidth = window.screen.width;
  
//   // 设计稿宽度假设为3840px (4K)
//   const designWidth = 3840;
//   // 基准字体大小
//   const baseFontSize = 16;
  
//   // 计算缩放比例
//   const scale = screenWidth / designWidth;
  
//   // 设置根字体大小
//   const rootFontSize = baseFontSize * scale * 100; // 转换为百分比，更准确的缩放
  
//   // 特定分辨率的优化
//   if (screenWidth === 1920 && window.screen.height === 1080) {
//     // 1080p屏幕下使用75%缩放效果
//     document.documentElement.style.fontSize = '12px'; // 16 * 0.75
//   } else if (screenWidth === 2560 && window.screen.height === 1440) {
//     // 2K屏幕下使用85%缩放效果
//     document.documentElement.style.fontSize = '13.6px'; // 16 * 0.85
//   } else {
//     // 其他分辨率使用计算值
//     document.documentElement.style.fontSize = (baseFontSize * scale) + 'px';
//   }
// }

// // 页面加载和窗口大小改变时设置根字体大小
// window.addEventListener('load', setRootFontSize);
// window.addEventListener('resize', setRootFontSize);

new Vue({
  el: '#app',
  router,
  store,
  render: (h) => h(App),
})