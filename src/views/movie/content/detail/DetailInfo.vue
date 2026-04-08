<template>
  <div class="detail-info">
    <!-- 图片区域 -->
    <div class="content-header">
      <div class="poster-section">
        <div class="poster-wrapper">
          <el-image
            :src="movieDetail.posterUrl"
            :preview-src-list="[movieDetail.posterUrl]"
            preview-teleported
            :scale="0.8"
            fit="cover"
            class="movie-poster image-slot"
            :hide-on-click-modal="true">
            <template #placeholder>
              <div class="image-slot"><i class="el-icon-loading"></i></div>
            </template>
            <template #error>
              <div class="image-slot"><i class="el-icon-picture-outline"></i></div>
            </template>
          </el-image>
          <div class="poster-overlay"></div>
        </div>
      </div>

      <!-- 右侧信息 -->
      <div class="info-section">
        <div class="title-group">
          <div class="title-with-badge">
            <h1 class="movie-title">{{ movieDetail.nameCn || movieDetail.originalName }}</h1>
            <el-tag size="small" class="copy-badge" @click="copyTitle">
              <el-icon><DocumentCopy /></el-icon>
            </el-tag>
          </div>
          <p class="original-title">{{ movieDetail.originalName }}</p>
        </div>

        <div class="movie-meta">
          <div class="meta-item">
            <el-icon class="meta-icon"><Film /></el-icon>
            <span class="meta-label">类型</span>
            <span class="meta-value">{{ getSubjectTypeText(movieDetail.subjectType) }}</span>
          </div>
          <div class="meta-item">
            <el-icon class="meta-icon"><Monitor /></el-icon>
            <span class="meta-label">平台</span>
            <span class="meta-value">{{ movieDetail.platform || '未知' }}</span>
          </div>
          <div class="meta-item">
            <el-icon class="meta-icon"><VideoPlay /></el-icon>
            <span class="meta-label">集数</span>
            <span class="meta-value">{{ movieDetail.totalEpisodes || movieDetail.eps || '未知' }}</span>
          </div>
          <div class="meta-item">
            <el-icon class="meta-icon"><Star /></el-icon>
            <span class="meta-label">评分</span>
            <span class="meta-value rating">{{ movieDetail.rating || '0.0' }}</span>
          </div>
          <div class="meta-item">
            <el-icon class="meta-icon"><Calendar /></el-icon>
            <span class="meta-label">上映日期</span>
            <span class="meta-value">{{ movieDetail.releaseDate || '' }}</span>
          </div>
        </div>

        <div class="tags-section">
          <el-tag v-for="(tag, index) in movieDetail.metaTags" :key="index" class="tag-item" type="info" size="small">
            {{ tag }}
          </el-tag>
        </div>

        <div class="movie-description">
          <div class="section-title">
            <el-icon><Document /></el-icon>
            <span>简介</span>
          </div>
          <p class="desc-text">{{ movieDetail.summary || '暂无简介' }}</p>
        </div>
      </div>
    </div>

    <!-- 完整标签 -->
    <div class="tags-section-full" v-if="movieDetail.tags?.length">
      <div class="section-title">
        <el-icon><PriceTag /></el-icon>
        <span>标签</span>
      </div>
      <div class="tags-list">
        <el-tag v-for="(tag, index) in movieDetail.tags" :key="index" class="tag-item-full" type="info" size="small">
          {{ tag }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props
const props = defineProps<{
  movieDetail: any
}>()

import { Film, Monitor, VideoPlay, Star, Calendar, Document, PriceTag, DocumentCopy } from '@element-plus/icons-vue'
import { ElNotification } from 'element-plus'

// 类型文本
const getSubjectTypeText = (type: string) => {
  const map: Record<string, string> = {
    ANIME: '动漫',
    MOVIE: '电影',
    TV: '电视剧',
  }
  return map[type] || '其它'
}

// 复制标题
const copyTitle = () => {
  const text = props.movieDetail.nameCn || props.movieDetail.originalName
  navigator.clipboard.writeText(text).then(() => {
    ElNotification.success('已复制名称')
  })
}
</script>

<style scoped lang="scss">
.detail-info {
  // ========== 主容器 ==========
  .content-header {
    display: flex;
    gap: 40px;

    // 左侧海报区域
    .poster-section {
      flex: 0 0 400px;

      .poster-wrapper {
        position: relative;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5); // 深色阴影增强立体感
        transition: transform 0.3s ease;

        &:hover {
          transform: scale(1.02); // hover 时轻微放大 - 移到外层容器避免与预览冲突
        }

        .movie-poster {
          width: 100%;
          height: 100%;
          display: block;
          cursor: pointer;
        }

        // 底部渐变遮罩，增加层次感
        .poster-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 60%, rgba(0, 0, 0, 0.3));
          pointer-events: none;
          border-radius: 16px;
        }
      }
    }

    // 右侧信息区域
    .info-section {
      flex: 1;
      display: flex;
      flex-direction: column;

      // 标题组（中文名 + 原名）
      .title-group {
        margin-bottom: 24px;

        .title-with-badge {
          display: flex;
          align-items: center;
          gap: 12px;

          .movie-title {
            font-size: 36px;
            font-weight: 700;
            color: white;
            margin: 0;
            text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
            letter-spacing: 1px;
          }

          .copy-badge {
            cursor: pointer;
            background: rgba(26, 188, 156, 0.2);
            border-color: rgba(26, 188, 156, 0.5);
            color: #1abc9c;
          }
        }

        .original-title {
          font-size: 18px;
          color: #888;
          margin: 8px 0 0 0;
          font-style: italic;
          font-weight: 400;
        }
      }

      // 元信息卡片网格（类型、平台、集数、评分、上映日期）
      .movie-meta {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 16px;
        margin-bottom: 24px;

        .meta-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 16px 12px;
          background: linear-gradient(135deg, rgba(26, 188, 156, 0.1), rgba(155, 89, 182, 0.1)); // 渐变背景
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-2px); // hover 上浮效果
            border-color: rgba(26, 188, 156, 0.3);
            box-shadow: 0 8px 30px rgba(26, 188, 156, 0.15); // 发光阴影
          }

          .meta-icon {
            font-size: 24px;
            color: #1abc9c; // 图标绿色
            margin-bottom: 8px;
          }

          .meta-label {
            font-size: 12px;
            color: #888;
            margin-bottom: 4px;
          }

          .meta-value {
            font-size: 15px;
            font-weight: 600;
            color: white;

            &.rating {
              color: #ffb347; // 评分金色
              text-shadow: 0 0 10px rgba(255, 179, 71, 0.3); // 评分发光
            }
          }
        }
      }

      // 简略标签区域
      .tags-section {
        text-align: center;
        margin-bottom: 24px;
        cursor: default;
        .tag-item {
          margin-right: 10px;
          margin-bottom: 10px;
          padding: 8px 16px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(26, 188, 156, 0.2), rgba(26, 188, 156, 0.1)); // 渐变背景
          border: 1px solid rgba(26, 188, 156, 0.3);
          color: #1abc9c;
          font-weight: 500;
          transition: all 0.3s ease;
          &:hover {
            transform: translateY(-2px);
          }
        }
      }

      // 简介区域
      .movie-description {
        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: white;
          margin-bottom: 12px;

          .el-icon {
            color: #1abc9c;
            font-size: 18px;
          }
        }

        .desc-text {
          line-height: 1.8;
          color: #bbb;
          font-size: 14px;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.02); // 浅色背景
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          margin: 0;
        }
      }
    }
  }

  // ========== 完整标签区域 ==========
  .tags-section-full {
    margin: 30px 0 20px 0;
    padding: 24px;
    background: rgba(255, 255, 255, 0.02); // 独立卡片背景
    border-radius: 16px;
    border: 1px solid rgba(160, 251, 243, 0.05);
    cursor: default;

    // 标签区域标题
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      color: white;
      margin-bottom: 16px;

      .el-icon {
        color: #1abc9c;
        font-size: 18px;
      }
    }

    // 标签列表
    .tags-list {
      .tag-item-full {
        margin-right: 10px;
        margin-bottom: 10px;
        padding: 8px 16px;
        border-radius: 20px;
        background: linear-gradient(135deg, rgba(26, 188, 156, 0.15), rgba(155, 89, 182, 0.15)); // 紫绿渐变
        border: 1px solid rgba(26, 188, 156, 0.25);
        color: #ddd;
        font-weight: 500;
        transition: all 0.3s ease;
        &:hover {
          transform: translateY(-2px);
        }
      }
    }
  }
}
</style>
