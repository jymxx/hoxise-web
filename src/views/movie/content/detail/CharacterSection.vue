<template>
  <div class="character-section" v-if="characters?.length">
    <h2 class="section-title">角色介绍</h2>
    <div class="horizontal-scroll-container">
      <div v-for="char in characters" :key="char.id" class="character-item">
        <div class="character-poster-small">
          <el-image :src="char.imgUrl || defaultImage" :alt="char.name" fit="cover" class="image-slot">
            <template #placeholder>
              <div class="image-slot"><i class="el-icon-loading"></i></div>
            </template>
            <template #error>
              <div class="image-slot"><i class="el-icon-picture-outline"></i></div>
            </template>
          </el-image>
        </div>
        <div class="character-info-small">
          <h3 class="character-name">{{ char.name }}</h3>
          <p class="character-relation">{{ char.relation }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props
defineProps<{
  characters: any[]
  defaultImage?: string
}>()

// 默认图片
const defaultImage = '/images/default-avatar.png'
</script>

<style scoped lang="scss">
.character-section {
  margin-top: 30px;
  max-width: 1100px;

  .section-title {
    font-size: 24px;
    margin: 30px 0 20px 0;
    padding-bottom: 10px;
    border-bottom: 2px solid #1abc9c;
  }

  .horizontal-scroll-container {
    display: flex;
    overflow-x: auto;
    gap: 20px;
    padding: 10px 5px 20px 5px;
    scrollbar-width: thin;
    scrollbar-color: #1abc9c transparent;
  }

  .character-item {
    flex: 0 0 auto;
    width: 120px;
    cursor: pointer;
    transition: transform 0.3s ease;
    background-color: rgba(30, 30, 30, 0.7);
    border-radius: 8px;
    padding: 10px;
    text-align: center;

    &:hover {
      transform: scale(1.05);
    }

    .character-poster-small {
      width: 80px;
      height: 100px;
      margin: 0 auto 10px;
      border-radius: 5px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;

      :deep(.el-image__inner) {
        object-position: top;
        width: 100%;
        height: 100%;
      }
    }

    .character-info-small {
      .character-name {
        font-size: 12px;
        margin: 0;
        color: white;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .character-relation {
        font-size: 11px;
        color: #aaa;
        margin: 3px 0 0 0;
      }
    }
  }
}
</style>
