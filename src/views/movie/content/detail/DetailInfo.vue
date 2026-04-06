<template>
  <div class="detail-info">
    <!-- 图片区域 -->
    <div class="content-header">
      <div class="poster-section">
        <el-image :src="movieDetail.posterUrl" fit="cover" class="movie-poster image-slot" lazy>
          <template #placeholder>
            <div class="image-slot"><i class="el-icon-loading"></i></div>
          </template>
          <template #error>
            <div class="image-slot"><i class="el-icon-picture-outline"></i></div>
          </template>
        </el-image>
      </div>

      <!-- 右侧信息 -->
      <div class="info-section">
        <h1 class="movie-title">{{ movieDetail.nameCn || movieDetail.originalName }}</h1>
        <p class="original-title">{{ movieDetail.originalName }}</p>

        <div class="movie-meta">
          <div class="meta-item">
            <span class="meta-label">类型:</span>
            <span class="meta-value">{{ getSubjectTypeText(movieDetail.subjectType) }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">平台:</span>
            <span class="meta-value">{{ movieDetail.platform || '未知' }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">总集数:</span>
            <span class="meta-value">{{ movieDetail.totalEpisodes || movieDetail.eps || '未知' }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">评分:</span>
            <span class="meta-value rating">{{ movieDetail.rating || '0.0' }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">上映日期:</span>
            <span class="meta-value">{{ movieDetail.releaseDate || '' }}</span>
          </div>
        </div>

        <div class="tags-section">
          <el-tag
            v-for="(tag, index) in movieDetail.metaTags"
            :key="index"
            class="tag-item"
            type="info"
            size="small">
            {{ tag }}
          </el-tag>
        </div>

        <div class="movie-description">
          <h3>简介</h3>
          <p>{{ movieDetail.summary || '暂无简介' }}</p>
        </div>
      </div>
    </div>

    <!-- 完整标签 -->
    <div class="tags-section-full" v-if="movieDetail.tags?.length">
      <div class="tags-list">
        <el-tag
          v-for="(tag, index) in movieDetail.tags"
          :key="index"
          class="tag-item-full"
          type="info"
          size="small">
          {{ tag }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props
defineProps<{
  movieDetail: any
}>()

// 类型文本
const getSubjectTypeText = (type: string) => {
  const map: Record<string, string> = {
    ANIME: '动漫',
    MOVIE: '电影',
    TV: '电视剧',
  }
  return map[type] || '其它'
}
</script>

<style scoped lang="scss">
.detail-info {
  .content-header {
    display: flex;
    gap: 30px;
    margin-bottom: 30px;

    .poster-section {
      flex: 0 0 400px;

      .movie-poster {
        width: 100%;
        border-radius: 10px;
      }
    }

    .info-section {
      flex: 1;

      .movie-title {
        font-size: 32px;
        margin-bottom: 10px;
        color: white;
      }

      .original-title {
        font-size: 18px;
        color: #aaa;
        margin-bottom: 10px;
        font-style: italic;
      }

      .movie-meta {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-top: 20px;
        margin-bottom: 20px;

        .meta-item {
          display: flex;
          flex-direction: column;

          .meta-label {
            font-size: 14px;
            color: #aaa;
            margin-bottom: 5px;
          }

          .meta-value {
            font-size: 16px;
            font-weight: bold;

            &.rating {
              color: #ff9e02;
            }
          }
        }
      }

      .tags-section {
        margin-bottom: 20px;

        .tag-item {
          margin-right: 8px;
          margin-bottom: 8px;
          background-color: rgba(26, 188, 156, 0.2);
          border-color: rgba(26, 188, 156, 0.3);
        }
      }

      .movie-description {
        h3 {
          font-size: 18px;
          margin-bottom: 10px;
        }

        p {
          line-height: 1.6;
          color: #ccc;
        }
      }
    }
  }

  .tags-section-full {
    margin-bottom: 20px;

    .tags-list {
      .tag-item-full {
        margin-right: 8px;
        margin-bottom: 8px;
        background-color: rgba(26, 188, 156, 0.2);
        border-color: rgba(26, 188, 156, 0.3);
      }
    }
  }
}
</style>
