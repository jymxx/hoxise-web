<template>
  <div class="movie-home">
    <div class="container">
      <!-- 侧边栏 -->
      <div class="sidebar-wrapper">
        <MovieTabs
          @menu-selected="selectMenu" 
          @show-login="showLoginDialog"
        />         
      </div>
      
      <!-- 主内容区 -->
      <div class="main-content">
        <MovieHome
          v-if="activeMenu=='home'"
          @show-login="showLoginDialog"
          @go-allMovie="selectMenu"
          @go-detail="openDetail"
          ref="movieHomeRef"/>
        <!-- 影视库 -->
        <MovieLibrary
           v-if="activeMenu=='library'"
           @go-detail="openDetail"
           :directory="searchDirectory"
            @show-matching="showMatchingDialog"
            ref="movieLibraryRef"
         />
      </div>

      <!-- 详情 -->
      <div 
        v-if="showDetail" 
        class="detail-overlay"
      >
        <div class="detail-content" @click.stop>
          <MovieDetail 
            :catalogid="detailCatalogid"
            @show-login="showLoginDialog"
            @show-matching="showMatchingDialog"
            @go-back="detailGoBack()"
            ref="movieDetailRef"
          />
        </div>
      </div>
    </div>

    <!-- 短信登录弹窗 -->
    <SmsLoginDialog
      ref="smsLoginDialog"
    />

    <!-- 匹配组件 -->
    <MovieMatchingDialog
      v-if="showMatching"
      :movieInfo="matchingMovie"
      @close="showMatching = false"
      @submitSuccess="matchingSuccess"
    />

  </div>
</template>

<script>
import { getUserInfo } from '@/api/system/user';
import { getToken,setUserInfo } from '@/utils/auth'
import MovieTabs from '@/views/movie/sidebar/MovieTabs.vue'
import MovieHome from './content/MovieHome.vue';
import MovieLibrary from './content/MovieLibrary.vue';
import MovieDetail from './content/MovieDetail.vue';
import SmsLoginDialog from '@/views/system/components/SmsLoginDialog.vue';
import MovieMatchingDialog from '@/views/movie/components/MovieMatchingDialog.vue';
export default {
  name: 'MovieIndex',
  components: {
    MovieTabs,
    MovieHome,
    MovieLibrary,
    MovieDetail,
    SmsLoginDialog,
    MovieMatchingDialog,

  },

  data() {
    return {
      activeMenu: 'home',
      searchDirectory: '',//查询目录 动漫、动漫电影、日剧
      detailCatalogid: '',//详情影视id,
      showDetail: false,///详情页显示
      showMatching: false, //匹配组件显示
      matchingMovie: {id:'',name:''},//需要匹配的数据
    }
  },
  mounted() {
    this.loginInit();
  },
  methods: {
    //初始化登录信息
    loginInit(){
      if (!getToken()) {
        return;
      }
      getUserInfo().then(res => {
        if (res.code == 200) {
          let data = res.data;
          setUserInfo(data);
        }
      })
    },
    //sidebar菜单点击事件
    selectMenu(key) {
      switch (key) {
        case 'home':
          if (this.$refs.movieHomeRef) {
            this.$refs.movieHomeRef.getRandomMovies();
          }
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
      this.detailCatalogid=id;
      this.showDetail = true;
    },
    //关闭详情页面
    detailGoBack(){
      this.detailCatalogid = '';
      this.showDetail = false;
    },
    //显示登录弹窗组件
    showLoginDialog() {
      this.$refs.smsLoginDialog.show();
    },
    //展示匹配组件
    showMatchingDialog(movie) {
      this.matchingMovie = movie;
      this.showMatching= true;
    },
    //手动匹配完成
    matchingSuccess() {
      this.showMatching = false;
      //在详情页面
      if (this.showDetail) {
        this.$refs.movieDetailRef.init();
        return;
      }else if (this.activeMenu == 'library') {
        //因为有缓存 所以重新加载没用 
        //考虑是否清理缓存？
        // this.$refs.movieLibraryRef.loadMovies();
      }

    },

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