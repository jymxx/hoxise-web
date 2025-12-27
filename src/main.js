
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


// 屏幕适配缩放函数
function setScreenScale() {
  // 基于设计稿的基准分辨率 (2160p = 2160x3840)
  const designWidth = 3840;
  const designHeight = 2160;
  
  // 获取当前屏幕分辨率
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  
  // 计算缩放比例（取宽度或高度中较小的比例）
  const scaleX = screenWidth / designWidth;
  const scaleY = screenHeight / designHeight;
  const scale = Math.min(scaleX, scaleY);
  
  // 应用缩放
  const appElement = document.getElementById('app');
  if (appElement) {
    appElement.style.transform = `scale(${scale})`;
    appElement.style.transformOrigin = 'top left';
    appElement.style.width = `${designWidth}px`;
    appElement.style.height = `${designHeight}px`;
  }
  
  // 设置body高度以适应缩放
  document.body.style.height = `${designHeight * scale}px`;
  document.body.style.overflow = 'scroll';
}

// 初始化缩放
setScreenScale();

// 监听窗口大小变化
// window.addEventListener('resize', setScreenScale);


new Vue({
  el: '#app',
  router,
  store,
  render: (h) => h(App),
})
