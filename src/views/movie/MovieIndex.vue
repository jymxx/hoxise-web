<template>
  <div class="movie-home">
    <div class="container">
      <!-- 侧边栏 -->
      <div class="sidebar-wrapper">
        <MovieTabs
        @menu-selected="selectMenu" 
        />         
      </div>
      
      <!-- 主内容区 -->
      <div class="main-content">
        <MovieHome
          v-show="activeMenu=='home'"
          @show-login="showLoginDialog"
          @go-allMovie="selectMenu"
          @go-detail="openDetail"
          ref="movieHomeRef"/>
        <!-- 影视库 -->
        <MovieLibrary
           v-show="activeMenu=='library'"
           @go-detail="openDetail"
           :directory="searchDirectory"
         />
      </div>

      <!-- 详情 -->
      <div 
        v-if="showDetail" 
        class="detail-overlay"
        @click="detailGoBack()"
      >
        <div class="detail-content" @click.stop>
          <MovieDetail 
            :movie-id="movieId"
            @show-login="showLoginDialog"
            @go-back="detailGoBack()"
          />
        </div>
      </div>
    </div>

    <!-- 短信登录弹窗 -->
    <SmsLoginDialog
      ref="smsLoginDialog"
      @login="onLoginSuccess"
    />
  </div>
</template>

<script>
import MovieTabs from '@/views/movie/sidebar/MovieTabs.vue'
import MovieHome from './content/MovieHome.vue';
import MovieLibrary from './content/MovieLibrary.vue';
import MovieDetail from './content/MovieDetail.vue';
import SmsLoginDialog from '@/views/system/components/SmsLoginDialog.vue';
export default {
  name: 'MovieIndex',
  components: {
    MovieTabs,
    MovieHome,
    MovieLibrary,
    MovieDetail,
    SmsLoginDialog
  },

  data() {
    return {
      activeMenu: 'home',
      searchDirectory: '',//查询目录 动漫、动漫电影、日剧
      movieId: '',//影视id,
      showDetail: false
    }
  },

  methods: {
    selectMenu(key) {
      switch (key) {
        case 'home':
          this.$refs.movieHomeRef.getRandomMovies();
          this.searchDirectory = '';
          break;
        case 'library':
          this.searchDirectory = '';
          break;
        case 'history':
          this.searchDirectory = '';
          break;
        default:
          this.searchDirectory = key;
          break;
      }
      //处理key
      if (key == 'home') {
        this.activeMenu = key;
      }else{
        this.activeMenu = 'library';
      }
    },
    //打开详情页面
    openDetail(id){
      if (id == null) {
        return
      }
      this.movieId=id;
      this.showDetail = true;
    },
    //关闭详情页面
    detailGoBack(){
      this.movieId = '';
      this.showDetail = false;
    },
    //显示登录弹窗组件
    showLoginDialog() {
      this.$refs.smsLoginDialog.show();
    },
     // 处理登录成功事件
    onLoginSuccess() {
    }
  }
}
</script>

<style scoped lang="scss">
.movie-home {
  padding: 0;
  background-color: #000000;
  min-height: calc(100vh - 100px);
  
  .container {
    display: flex;
    height: 100%;
  }

  .main-content {
    flex: 1;
    margin-left: 220px;
    padding: 20px;
  }
    // 详情覆盖层样式
  .detail-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: auto;
    
    .detail-content {
      width: 100%;
      height: 100%;
    }
  }
}
</style>