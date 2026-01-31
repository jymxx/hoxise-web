<template>
  <div class="movie-library">
    <div class="container">
      <div class="header-container">
        <!-- 标题 -->
        <div class="section-header">
          <h2>全部影视</h2>
        </div>
        
        <!-- 搜索框 -->
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="关键字搜索..."
            @keyup.enter.native="searchMovies"
            style="width: 300px; margin-right: 10px;"
            clearable
          />
          <button @click="searchMovies">搜索</button>
        </div>
      </div>

      <!-- 所有影视展示区域 -->
      <div class="all-movies-grid" v-loading="isSearching">
        <div 
          class="movie-card" 
          v-for="movie in movies" 
          :key="movie.id"
          @click="viewMovieDetail(movie.id)"
        >
          <div class="movie-poster">
            <div class="movie-poster">
              <el-image 
                :src="movie.posterUrl" 
                :alt="movie.name"
                fit="cover"
                lazy
                class="image-slot"
              >
                <div slot="placeholder" class="image-slot">
                  <i class="el-icon-loading"></i> 加载中...
                </div>
                <div slot="error" class="image-slot">
                  <i class="el-icon-picture-outline"></i> 图片加载失败
                </div>
              </el-image>
              <div 
                class="movie-overlay" 
                @mouseenter="currentHoveredMovie = movie.id" 
                @mouseleave="currentHoveredMovie = null" 
                v-if="roles && roles.includes('manager')"
              >
                <el-dropdown trigger="click" @command="(command) => handleDropdownCommand(command, movie)">
                  <button 
                    class="detail-button" 
                    @click.stop
                    :style="{ opacity: currentHoveredMovie === movie.id ? 1 : 0 }"
                  >
                    <i class="el-icon-more"></i>
                  </button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="re-match">重新匹配</el-dropdown-item>
                    <el-dropdown-item command="remove">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </div>
            <div class="movie-details">
              <span class="movie-rating">{{ movie.rating }}</span>
              <span class="movie-directory">{{ movie.platform }}</span>
            </div>
          </div>
          <div class="movie-info">
            <h3>{{ movie.name }}</h3>
            <span class="movie-year">{{ movie.releaseYear }}</span>
          </div>
        </div>
      </div>
    
    </div>

    <!-- 加载更多提示 -->
    <!-- <div v-if="!searchKeyword && hasMore && !loadingMore && movies.length > 0" class="load-more-tips">
      <p>滚动加载更多...</p>
    </div>
    <div v-if="hasMore && !searchKeyword" class="no-more-tips">
      <p>没有更多数据了</p>
    </div> -->
  </div>
</template>

<script>
import { getLibrary,pageSimple } from '@/api/movie/movieCatalog';
import { deleteCatalog } from '@/api/movie/movieManage';
import { mapState } from 'vuex'
import '@/assets/css/responsive-movielibrary.css';
export default {
  name: 'MovieLibrary',
  props: {
    directory: String,
  },
  data() {
    return {
      movies: [],
      pageParams:{
        pageNum:1,
        pageSize:50,
        directory:this.directory
      },
      totalCount: 0,
      searchKeyword: '', // 搜索关键词
      isSearching: false, // 是否正在搜索
      currentHoveredMovie: null, // 跟踪当前悬停的电影
      loadingMore: false, // 是否正在加载更多
      hasMore: true // 没有更多数据了
    }
  },
  computed: {
    ...mapState({
      userId: state => state.user.userId,
      name: state => state.user.name,
      roles: state => state.user.roles,
    }),
  },
  watch: {
    directory: function(newVal, oldVal) {
      this.initSearch();
    }
  },
  mounted() {
    this.loadMovies();
    // 添加滚动监听事件
    window.addEventListener('scroll', this.handleScroll);
  },
    beforeDestroy() {
    // 移除滚动监听事件
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    // 分页加载数据
    loadMovies(isLoadMore = false) {
      getLibrary(this.pageParams).then(res => { 
        if(res.code==200) { 
          let data = res.data.list;
          this.totalCount = res.data.total;
          data.forEach(movie => {
          movie.posterUrl = movie.posterUrl || "",
          movie.rating = movie.rating?movie.rating.toFixed(1):0;
          movie.imageLoadError = false; // 添加图片加载状态
          });
          
          if (isLoadMore) {
            // 分页加载时追加数据
            this.movies = this.movies.concat(data);
          } else {
            // 首次加载或搜索时替换数据
            this.movies = data;
          }
          
          // 检查是否还有更多数据
          if (data.length < this.pageParams.pageSize || this.movies.length >= this.totalCount) {
            this.hasMore = false;
          }
        }
      }).finally(() => {
        this.loadingMore = false;
      });
    },
    // 滑轮时加载更多电影
    loadMoreMovies() {
      if (this.searchKeyword) {
        // 如果是搜索状态，不进行滚动加载
        return;
      }
      this.pageParams.pageNum++;
      this.loadingMore = true;
      this.loadMovies(true);
    },
    
    // 搜索电影
    async searchMovies() {
      if (!this.searchKeyword.trim()) {
        this.initSearch();
        return;
      }

      //查询
      this.isSearching = true;
      let searchParams = {
        pageNum:1,
        pageSize:50,
        directory:this.directory,
        keyword:this.searchKeyword,
      }
      try{
        const res = await pageSimple(searchParams);
        if(res.code === 200) {
          let data = res.data.list;
          data.forEach(movie => {
            movie.posterUrl = movie.posterUrl || "";
            movie.rating = movie.rating ? movie.rating.toFixed(1) : 0;
            movie.imageLoadError = false; // 添加图片加载状态
          });
          this.movies = data;
        }
      }catch(error) { 
      }finally { 
        this.isSearching = false;
      }
    },
    //初始化查询
    initSearch(){
        this.pageParams={
          pageNum:1,
          pageSize:50,
          directory:this.directory
        }
        this.searchKeyword = '';
        this.movies = [];
        this.hasMore = true;
        // 滚动到页面顶部
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        this.loadMovies();
    },
    // 详情页面
    viewMovieDetail(id) {
      this.$emit('go-detail', id);
    },
    //菜单逻辑
    handleDropdownCommand(command, movie) {
        switch(command) {
          case 're-match': //重新匹配
            this.$emit('show-matching', {id:movie.id, name:movie.name});
            break;
          case 'remove': //删除
            this.handleDelete(movie);
            break;
        }
    },

    //删除数据
    handleDelete(movie) {
      this.$confirm(`确定要删除"${movie.name}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteCatalog(movie.id).then(res => { 
          if(res.code === 200) {
            this.movies = this.movies.filter(m => m.id !== movie.id);
            this.$message.success('删除成功');
          }else{
            this.$message.error(res.msg || '删除失败');
          }
        });
      }).catch(() => {
        // 用户取消删除 
      })
    },

    // 添加滚动处理方法
    handleScroll() {
      // 判断是否滚动到底部
      if (this.isScrollBottom() && !this.loadingMore && this.hasMore) {
        this.loadMoreMovies();
      }
    },
    
    // 判断是否滚动到底部
    isScrollBottom() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );
      
      // 当距离底部小于300px时触发加载
      return scrollTop + windowHeight >= documentHeight - 100;
    },

  }
}
</script>

<style scoped lang="scss">
.movie-library {
  background-color: #0a0a0a;
  min-height: calc(100vh - 100px);
  padding: 20px;
  color: white;
  
  .container {
    margin: 0 auto;
  }
  
  .header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .search-box {
    display: flex;
    justify-content: center;
    flex: 1;
    margin-left: 20px;
    
    input {
      padding: 10px 15px;
      border: 1px solid #333;
      border-radius: 25px;
      background-color: #1a1a1a;
      color: white;
      width: 300px;
      margin-right: 10px;
      
      &:focus {
        outline: none;
        border-color: #1abc9c;
      }
    }
    
    button {
      padding: 10px 20px;
      border: none;
      border-radius: 25px;
      background-color: #1abc9c;
      color: white;
      cursor: pointer;
      margin: 0 5px;
      
      &:hover {
        background-color: #16a085;
      }
    }
  }
  
  .section-header {
    margin: 0;
    
    h2 {
      font-size: 24px;
      font-weight: bold;
      color: white;
      text-align: left;
      margin: 0;
    }
  }
  
  .all-movies-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }
  
  .movie-card {
    border-radius: 10px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative;
    background-color: #1a1a1a;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }
    
    .movie-poster {
        width: 100%;
        height: 300px;
        position: relative;
        
        .el-image {
          width: 100%;
          height: 100%;
          display: block;
          
          .el-image__inner {
            cursor: pointer;
          }
          

        }
        
        .movie-overlay {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 1;
          
          .detail-button {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background-color: rgba(26, 188, 156, 0.9);
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            transition: all 0.3s ease;
            
            &:hover {
              background-color: rgba(22, 160, 133, 1);
              transform: scale(1.1);
            }
          }
        }
        
        //阴影效果
        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 30%;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
          pointer-events: none;
        }
        
        .movie-details {
          position: absolute;
          bottom: 5px;
          left: 5px;
          right: 5px;
          display: flex;
          justify-content: space-between;
          z-index: 1; /* 确保在遮罩层上方 */
          
          .movie-rating {
            color: #ff9e02;
            font-weight: bold;
            font-size: 12px;
            background-color: rgba(0, 0, 0, 0.7);
            padding: 5px 10px;
            border-radius: 4px;
          }
          
          .movie-directory {
            color: rgb(238, 238, 238);
            font-weight: bold;
            font-size: 12px;
            padding: 5px 10px;
            border-radius: 4px;
          }
        }
      }
    
    .movie-info {
      padding: 15px;
      h3 {
        font-size: 16px;
        margin: 0;
        color: white;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .movie-year {
        font-size: 12px;
        padding: 3px 8px;
        color: rgb(174, 174, 174);
      }
    }
  }
  
  .image-slot {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #909399;
    font-size: 14px;
  }
  
  .load-more-tips,
  .no-more-tips {
    text-align: center;
    padding: 20px;
    color: #aaa;
    font-size: 14px;
  }
}
</style>