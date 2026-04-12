<template>
  <div class="sidebar" v-if="infobox?.length">
    <div class="infobox-section">
      <div v-for="info in infobox" :key="info.id" class="infobox-item">
        <div class="info-key">{{ info.infoboxKey }}:</div>
        <div class="info-value">{{ formatInfoValue(info.infoboxKey, info.infoboxValue) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props
defineProps<{
  infobox?: any[]
}>()

// 格式化信息值
const formatInfoValue = (key: string, value: string) => {
  if (key === '别名' || key === '别称' || key === 'alias') {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => item.v).join(', ')
      }
    } catch (e) {}
  }
  return value
}
</script>

<style scoped lang="scss">
.sidebar {
  border-radius: 16px;
  padding: 24px;
  height: fit-content;
  align-self: flex-start;
  background: linear-gradient(145deg, rgba(30, 35, 50, 0.9), rgba(20, 25, 35, 0.95));
  border: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 50px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);

  // ========== 信息列表 ==========
  .infobox-section {
    .infobox-item {
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);

      &:last-child {
        border-bottom: none;
      }

      // 信息键名
      .info-key {
        font-weight: 600;
        color: #1abc9c;
        margin-bottom: 6px;
        font-size: 16px;
      }

      // 信息值
      .info-value {
        word-break: break-word;
        font-size: 13px;
        line-height: 1.5;
      }
    }
  }
}
</style>
