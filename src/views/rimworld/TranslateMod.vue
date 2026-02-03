<template>
  <div class="upload-container">
    <h2>文件上传</h2>
    
    <!-- 拖拽区域 -->
    <el-upload
      class="upload-dragger-wrapper"
      drag
      :auto-upload="false"
      :show-file-list="false"
      :on-change="handleFileChange"
      :on-drop="handleDrop"
      :on-dragover="handleDragOver"
      :on-dragleave="handleDragLeave"
      webkitdirectory
      multiple
    >
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">将文件夹拖到此处，或<em>点击选择文件夹</em></div>
      <div class="el-upload__tip" slot="tip">支持拖拽文件夹批量上传，保留目录结构</div>
    </el-upload>
    
    <!-- 预检状态 -->
    <div v-if="preCheckId" class="pre-check-status">
      <el-alert
        title="预检成功"
        type="success"
        :description="`预检ID: ${preCheckId}`"
        show-icon
        :closable="false"
      />
    </div>
    
    <!-- 上传进度显示 -->
    <div v-if="uploadingFiles.length > 0" class="upload-progress">
      <h3>上传进度</h3>
      <el-card
        v-for="(file, index) in uploadingFiles"
        :key="'uploading-' + index"
        shadow="never"
        class="progress-card"
      >
        <div class="progress-item">
          <div class="file-info">
            <div class="file-name">{{ file.name }}</div>
            <div class="file-path">{{ file.relativePath }}</div>
          </div>
          <el-progress 
            :percentage="Math.round(file.progress)" 
            :stroke-width="10"
            :status="file.status === 'error' ? 'exception' : ''"
            class="progress-bar"
          />
          <span class="progress-text">{{ Math.round(file.progress) }}%</span>
        </div>
      </el-card>
    </div>
    
    <!-- 已上传文件列表 -->
    <div v-if="uploadedFiles.length > 0" class="uploaded-files">
      <h3>已上传文件 ({{ uploadedFiles.length }})</h3>
      <el-table 
        :data="uploadedFiles" 
        stripe 
        style="width: 100%"
        class="files-table"
      >
        <el-table-column prop="name" label="文件名" width="200">
          <template slot-scope="scope">
            <div class="table-file-info">
              <i class="el-icon-document file-icon"></i>
              <span>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="relativePath" label="相对路径" min-width="300">
          <template slot-scope="scope">
            <el-tag type="info" size="small">{{ scope.row.relativePath }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="大小" width="120">
          <template slot-scope="scope">
            {{ formatFileSize(scope.row.size) }}
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 开始翻译按钮 -->
      <div class="translate-actions">
        <el-button 
          type="primary" 
          size="medium" 
          @click="startTranslation"
          :loading="isStartingTranslation"
        >
          {{ isStartingTranslation ? '开始翻译中...' : '开始翻译' }}
        </el-button>
      </div>
    </div>
    
    <!-- 翻译进度显示 -->
    <div v-if="translationProgress.length > 0" class="translation-progress">
      <h3>翻译进度</h3>
      <el-card
        v-for="(item, index) in translationProgress"
        :key="'trans-' + index"
        shadow="never"
        class="progress-card"
      >
        <div class="progress-item">
          <div class="file-info">
            <div class="file-name">{{ getFileNameFromPath(item.localPath) }}</div>
            <div class="file-path">{{ item.localPath }}</div>
          </div>
          <el-progress 
            :percentage="getProgressByStatus(item.status)" 
            :stroke-width="10"
            :status="getProgressStatus(item.status)"
            class="progress-bar"
          />
          <span class="progress-text">{{ getProgressByStatus(item.status) }}%</span>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { preCheck, acceptFile, startTrans, getTransList } from '@/api/self/rimworld';

export default {
  name: 'TranslateMod',
  data() {
    return {
      isDragOver: false,
      uploadingFiles: [],
      uploadedFiles: [],
      cachedFiles: [], // 缓存文件
      preCheckId: null, // 预检ID
      translationProgress: [], // 翻译进度
      isStartingTranslation: false, // 是否正在开始翻译
      translationTimer: null // 定时器
    };
  },
  methods: {
    // 处理拖拽事件
    handleDragOver(e) {
      e.preventDefault();
      this.isDragOver = true;
    },

    handleDragLeave(e) {
      e.preventDefault();
      this.isDragOver = false;
    },

    async handleDrop(e) {
      e.preventDefault();
      this.isDragOver = false;
      
      const items = e.dataTransfer.items;
      if (items) {
        try {
          const files = await this.getFilesFromItems(items);
          this.cachedFiles = [...files]; // 缓存文件
          this.processFiles(files);
        } catch (error) {
          console.error('处理拖拽文件失败:', error);
          this.$message.error('处理文件时出现错误');
        }
      }
    },

    // 从拖拽项获取文件列表（保留路径）
    getFilesFromItems(items) {
      const promises = [];
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i].webkitGetAsEntry();
        if (item) {
          promises.push(this.traverseFileTree(item));
        }
      }
      
      return Promise.all(promises).then(results => {
        // 扁平化结果数组
        return this.flattenArray(results);
      });
    },

    // 扁平化数组的辅助函数
    flattenArray(arr) {
      return arr.flat(Infinity); // 使用flat方法替代手动递归
    },

    // 递归遍历文件树，保留相对路径
    traverseFileTree(item, path = '') {
      if (item.isFile) {
        // 是文件，返回Promise解析文件
        return new Promise(resolve => {
          item.file(file => {
            file.relativePath = path + file.name;
            resolve(file);
          });
        });
      } else if (item.isDirectory) {
        // 是目录，递归读取
        const dirReader = item.createReader();
        const entriesPromises = [];
        
        const readEntries = () => {
          return new Promise((resolve, reject) => {
            dirReader.readEntries(entries => {
              if (entries.length === 0) {
                // 读取完所有条目，递归处理子项
                Promise.all(entriesPromises)
                  .then(results => {
                    resolve(this.flattenArray(results));
                  })
                  .catch(reject);
              } else {
                // 为每个条目创建Promise
                for (let i = 0; i < entries.length; i++) {
                  entriesPromises.push(
                    this.traverseFileTree(entries[i], path + item.name + '/')
                  );
                }
                // 继续读取剩余条目
                readEntries().then(resolve).catch(reject);
              }
            });
          });
        };
        
        return readEntries();
      }
    },

    // 处理文件选择
    handleFileChange(file) {
      // 只处理文件，不处理已添加的文件
      if (!file.raw) return;
      
      // 添加文件到上传列表
      const files = [file.raw];
      this.cachedFiles = [...files]; // 缓存文件
      this.processFiles(files);
    },

    // 处理文件上传逻辑
    async processFiles(files) {
      console.log('准备上传文件:', files);
      
      // 首先进行预检
      try {
        const paths = files.map(f => f.relativePath);
        const preCheckResult = await preCheck(paths);
        this.preCheckId = preCheckResult.data;
        
        // 清空之前的上传状态
        this.uploadingFiles = [];
        
        // 添加文件到上传列表
        files.forEach(file => {
          this.uploadingFiles.push({
            ...file,
            progress: 0,
            status: 'ready'
          });
        });
        
        // 开始上传
        this.uploadFiles(files);
      } catch (error) {
        console.error('预检失败:', error);
        this.$message.error('预检失败，请重试');
      }
    },

    // 开始翻译
    async startTranslation() {
      if (!this.preCheckId) {
        this.$message.error('请先上传文件');
        return;
      }

      this.isStartingTranslation = true;
      try {
        await startTrans({ preCheckId: this.preCheckId });
        this.$message.success('翻译任务已启动');

        // 启动定时器获取翻译进度
        this.startTranslationProgressTimer();
      } catch (error) {
        console.error('开始翻译失败:', error);
        this.$message.error('开始翻译失败');
      } finally {
        this.isStartingTranslation = false;
      }
    },

    // 启动翻译进度定时器
    startTranslationProgressTimer() {
      // 先清除可能存在的定时器
      if (this.translationTimer) {
        clearInterval(this.translationTimer);
      }

      // 立即获取一次进度
      this.fetchTranslationProgress();

      // 设置定时器每5秒获取一次进度
      this.translationTimer = setInterval(() => {
        this.fetchTranslationProgress();
      }, 5000);
    },

    // 获取翻译进度
    async fetchTranslationProgress() {
      try {
        const response = await getTransList(this.preCheckId);
        this.translationProgress = response.data || [];

        // 如果所有任务都已完成，则停止定时器
        const allCompleted = this.translationProgress.every(item => 
          item.status === 'COMPLETED' || item.status === 'FAILED'
        );

        if (allCompleted) {
          clearInterval(this.translationTimer);
          this.translationTimer = null;
          this.$message.success('翻译任务全部完成');
        }
      } catch (error) {
        console.error('获取翻译进度失败:', error);
      }
    },

    // 从路径获取文件名
    getFileNameFromPath(path) {
      if (!path) return '';
      return path.split('/').pop();
    },

    // 根据状态获取进度百分比
    getProgressByStatus(status) {
      if (!status) return 0;
      switch (status.toUpperCase()) {
        case 'PENDING':
          return 0;
        case 'PROCESSING':
          return 60;
        case 'COMPLETED':
          return 100;
        case 'FAILED':
          return 100; // 失败也显示为100%，但会用红色标识
        default:
          return 0;
      }
    },

    // 根据状态获取进度条状态
    getProgressStatus(status) {
      if (!status) return '';
      switch (status.toUpperCase()) {
        case 'COMPLETED':
          return 'success';
        case 'FAILED':
          return 'exception';
        case 'PROCESSING':
          return 'warning';
        default:
          return '';
      }
    },

    // 上传文件
    async uploadFiles(files) {
      for (let i = 0; i < files.length; i++) {
        await this.uploadSingleFile(files[i], i);
      }
    },

    // 上传单个文件
    async uploadSingleFile(file, index) {
      try {
        // 创建FormData对象
        const formData = new FormData();
        formData.append('preCheckId', this.preCheckId);
        formData.append('path', file.relativePath);
        formData.append('file', file);

        // 更新进度为上传中
        if (this.uploadingFiles[index]) {
          this.uploadingFiles[index].progress = 50;
          this.uploadingFiles[index].status = 'uploading';
        }

        // 上传文件
        await acceptFile(formData);

        // 更新上传完成的文件列表
        this.uploadedFiles.push(file);

        // 更新上传状态
        if (this.uploadingFiles[index]) {
          this.uploadingFiles[index].progress = 100;
          this.uploadingFiles[index].status = 'success';
        }

        // 从上传列表中移除
        setTimeout(() => {
          if (index < this.uploadingFiles.length) {
            this.uploadingFiles.splice(index, 1);
          }
        }, 500);
      } catch (error) {
        console.error(`上传文件 ${file.name} 失败:`, error);
        
        // 更新失败状态
        if (this.uploadingFiles[index]) {
          this.uploadingFiles[index].progress = 100;
          this.uploadingFiles[index].status = 'error';
        }

        this.$message.error(`上传文件 ${file.name} 失败`);
      }
    },

    // 格式化文件大小
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
  },
  
  beforeDestroy() {
    // 组件销毁前清除定时器
    if (this.translationTimer) {
      clearInterval(this.translationTimer);
    }
  }
};
</script>

<style lang="scss" scoped>
.upload-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;

  h2 {
    margin-bottom: 20px;
    color: #303133;
  }

  .pre-check-status {
    margin-bottom: 20px;
  }

  .upload-dragger-wrapper {
    margin-bottom: 30px;

    ::v-deep .el-upload {
      width: 100%;

      .el-upload-dragger {
        width: 100%;
        height: 200px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        .el-upload__text {
          margin: 20px 0;

          em {
            color: #409eff;
            font-style: normal;
          }
        }
      }
    }
  }

  .upload-progress {
    h3 {
      margin-bottom: 15px;
      color: #303133;
    }

    .progress-card {
      margin-bottom: 10px;

      .progress-item {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .file-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;

          .file-name {
            font-weight: bold;
            color: #303133;
          }

          .file-path {
            font-size: 12px;
            color: #909399;
            margin-top: 4px;
          }
        }

        .progress-bar {
          width: 100%;
        }

        .progress-text {
          text-align: right;
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }

  .uploaded-files {
    margin-top: 30px;

    h3 {
      margin-bottom: 15px;
      color: #303133;
    }

    .files-table {
      ::v-deep .table-file-info {
        display: flex;
        align-items: center;

        .file-icon {
          margin-right: 8px;
          color: #409eff;
        }
      }

      ::v-deep .el-tag {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .translate-actions {
      margin-top: 20px;
      text-align: center;
    }
  }

  .translation-progress {
    margin-top: 30px;

    h3 {
      margin-bottom: 15px;
      color: #303133;
    }

    .progress-card {
      margin-bottom: 10px;

      .progress-item {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .file-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;

          .file-name {
            font-weight: bold;
            color: #303133;
          }

          .file-path {
            font-size: 12px;
            color: #909399;
            margin-top: 4px;
          }
        }

        .progress-bar {
          width: 100%;
        }

        .progress-text {
          text-align: right;
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }
}
</style>