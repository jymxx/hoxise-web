<template>
  <el-dialog
    title="手动修正匹配信息"
    :visible.sync="dialogVisible"
    :modal="true"
    width="50%"
    :before-close="handleClose"
    custom-class="movie-search-dialog"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <div class="search-container">
      <!-- 搜索框 -->
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="输入要匹配的名称"
          @keyup.enter.native="handleSearch"
          size="large"
          clearable
        >
          <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
        </el-input>
      </div>

      <!-- 结果 -->
      <div v-loading="searchLoading" element-loading-background="rgba(50, 50, 50, 0.8)">
        <div class="search-results" >
          <div class="result-item" :class="{ 'selected': selectedBangumiDB.id === item.id }"
            v-for="(item, index) in searchResults" 
            :key="index"
            @click="selectMovie(item)">
            <div class="result-poster">
              <el-image 
                :src="item.image || defaultImage"
                fit="cover"
                class="image-slot"
              >
                <div slot="placeholder" class="image-slot">
                  <i class="el-icon-loading"></i>
                </div>
                <div slot="error" class="image-slot">
                  <i class="el-icon-picture-outline"></i>
                </div>
              </el-image>
            </div>
            <div class="result-info">
              <h3 class="result-title">{{ item.name_cn || item.name }}</h3>
              <p class="result-original-name" > {{ item.name }} </p>
              <div class="result-meta">
                <span v-if="item.type">{{ getTypeText(item.type) }}</span>
                <span v-if="item.platform">{{ item.platform }}</span>
                <span v-if="item.eps"> {{ item.eps || item.total_episodes }} 话</span>
                <span v-if="item.date">时间: {{ item.date }}</span>
              </div>
              <p class="result-summary" v-if="item.summary" :title="item.summary">{{ item.summary.substring(0, 150) }} {{ item.summary.length >150?'...':'' }}</p>
            </div>
          </div>
        </div>
      </div>
    <!-- 底部按钮区域 -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button 
        type="primary" 
        @click="handleSubmit"
        :disabled="!selectedBangumiDB || updateLoading"
      >
        确定
      </el-button>
    </div>
    </div>
  </el-dialog>
</template>

<script>
import { queryBangumi,updateDbBangumi } from '@/api/movie/movieManage';

export default {
  name: 'MovieSearchDialog',
  props: {
    movieInfo: Object
  },
  data() {
    return {
      dialogVisible: true,
      searchKeyword: '',
      searchResults: [],
      searchLoading: false,
      defaultImage: require('@/assets/images/default-poster.png'),
      selectedBangumiDB: '',//选择的Bangumi数据id
      updateLoading: false,//更新中
    }
  },

  methods: {
    //匹配查询
    async handleSearch() {
      if (!this.searchKeyword.trim()) {
        this.$message.warning('请输入搜索关键词');
        return;
      }
      this.searchLoading = true;
      try {
        // 调用查询API
        const res = await queryBangumi(this.searchKeyword);

        if (res.code === 200) {
          if (res.data.length === 0) {
            this.$message.warning('未找到匹配项');
          }
          this.searchResults = res.data;
        } else {
          this.$message.error(res.msg || '搜索失败');
          this.searchResults = [];
        }

      } catch (error) {
        this.$message.error('搜索失败，请稍后重试');
        this.searchResults = [];
      } finally {
        this.searchLoading = false;
      }
    },
    //关闭
    handleClose() {
      this.dialogVisible = false;
      this.$emit('close');
    },
    
    //选择匹配项
    selectMovie(movie) {
      this.selectedBangumiDB = movie;
    },
    //bangumi里的类型
    getTypeText(type) {
      const typeMap = {
        1: '漫画',
        2: '动画',
        3: '音乐',
        4: '游戏',
        6: '三次元'
      };
      return typeMap[type] || '影视';
    },
    //提交保存
    async handleSubmit() { 
      if (!this.selectedBangumiDB) {
        this.$message.warning('请先选择一个匹配项');
        return;
      }

      if (this.updateLoading) {
        return; // 如果正在加载中，直接返回，防止重复提交
      }
      this.updateLoading = true; // 设置加载状态为true

      this.$confirm(
        `确定要匹配【"${this.selectedBangumiDB.name_cn || this.selectedBangumiDB.name}"】吗？\n 数据库名称:【${this.movieInfo.name}】`,
        '确认保存',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      .then(() => {
        //提交
        updateDbBangumi(this.movieInfo.id,this.selectedBangumiDB.id).then(res=>{ 
          if(res.code==200){ 
            this.$message.success('保存成功');
            this.$emit('submitSuccess');
          }else{
            this.$message.error(res.msg || '保存失败');
          }
        }).finally(() => {
          this.updateLoading = false; // 请求完成后重置加载状态
        })
      })
      .catch(() => {
        this.updateLoading = false; // 如果用户取消或发生错误，重置加载状态
      });

    },

  }
}
</script>

<style scoped lang="scss">
.movie-search-dialog {
  background-color: #1a1a1a;
  

}
// 匹配框
.search-container {

  .search-box {
    margin-bottom: 20px;
    
    ::v-deep .el-input-group__append {
      background-color: #1abc9c;
      border-color: #1abc9c;
      color: white;
    }
    
    ::v-deep .el-input__inner {
      background-color: #2d2d2d;
      border: 1px solid #444;
      color: white;
      height: 48px;
      font-size: 16px;
      
      &::placeholder {
        color: #aaa;
      }
    }
  }
  // 查询结果
  .search-results {
    min-height: 20vh;
    max-height: 50vh;
    overflow-y: auto;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    
    .result-item {
      display: flex;
      gap: 15px;
      padding: 15px;
      border: 1px solid #333;
      border-radius: 8px;
      margin-bottom: 0;
      cursor: pointer;
      transition: background-color 0.3s;
      background-color: #222;
      text-align: center;
      
      &:hover {
        background-color: #2d2d2d;
      }
      
      .result-poster {
        flex: 0 0 80px;
        
        .el-image {
          width: 160px;
          height: 220px;
          border-radius: 4px;

        }
      }
      
      .result-info {
        flex: 1;
        .result-title {
          margin: 0 0 5px 0;
          font-size: 16px;
          color: white;
          word-break: break-all;
        }
        
        .result-original-name {
          margin: 0 0 8px 0;
          color: #bbb;
          font-size: 14px;
          word-break: break-all;
        }
        
        .result-meta {
          display: flex;
          gap: 10px;
          margin-bottom: 8px;
          flex-wrap: wrap;
          
          span {
            font-size: 12px;
            color: #999;
            background-color: #333;
            padding: 3px 6px;
            border-radius: 4px;
          }
        }
        
        .result-summary {
          margin: 0;
          color: #ccc;
          font-size: 13px;
          line-height: 1.4;
          text-align: left;
          overflow: hidden;
        }
      }
    }

    .result-item.selected {
      background-color: #81bcf7; /* 选中项的背景颜色 */
      color: white; /* 选中项的文字颜色 */
    }

    .result-item.selected .result-title,
    .result-item.selected .result-original-name,
    .result-item.selected .result-meta,
    .result-item.selected .result-summary {
      color: white; /* 选中项的子元素文字颜色 */
    }

  }

}

::v-deep .el-dialog__title {
  color: #1abc9c;
}

::v-deep .el-dialog__header {
  background-color: #1a1a1a;
}

::v-deep .el-dialog__body {
  background-color: #1a1a1a;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 10px;
  margin: 20px 10px 0 0;
  width: 100%;
}
</style>