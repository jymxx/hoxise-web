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
            <img :src="movie.posterUrl" :alt="movie.name">
            <div class="movie-overlay" v-if="roles && roles.includes('manager')">
              <el-dropdown trigger="click" @command="(command) => handleDropdownCommand(command, movie)">
                <button class="detail-button" @click.stop>
                  <i class="el-icon-more"></i>
                </button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="re-match">重新匹配</el-dropdown-item>
                  <el-dropdown-item command="remove">删除</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
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
  </div>
</template>

<script>
import { getLibrary,pageSimple } from '@/api/movie/movie';
import { deleteCatalog } from '@/api/movie/movieManage';
import { mapState } from 'vuex'
import '@/assets/css/responsive-movielibrary.css';
import { del } from 'vue';
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
      this.pageParams={
        pageNum:1,
        pageSize:50,
        directory:this.directory
      },
      this.movies=[];
      this.loadMovies();
    }
  },
  mounted() {
    this.loadMovies();
  },
  methods: {
    //循环加载数据
    loadMovies() {
      getLibrary(this.pageParams).then(res => { 
        if(res.code==200) { 
          let data = res.data.list;
          this.totalCount = res.data.total;
          data.forEach(movie => {
          movie.posterUrl = movie.posterUrl || "",
          movie.rating = movie.rating?movie.rating.toFixed(1):0;
          });
          this.movies = this.movies.concat(data);
          //循环加载
          if(this.totalCount >= this.pageParams.pageNum * this.pageParams.pageSize && data.length >= this.pageParams.pageSize) {
              this.pageParams.pageNum++;
              this.loadMovies();
          }
        }
      });
    },
    // 搜索电影
    async searchMovies() {
      if (!this.searchKeyword.trim()) {
        this.pageParams={
          pageNum:1,
          pageSize:50,
          directory:this.directory
        }
        this.movies = [];
        this.loadMovies();
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
          });
          this.movies = data;
        }
      }catch(error) { 
      }finally { 
        this.isSearching = false;
      }
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
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
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
  
}
</style>