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
  background-color: rgba(30, 30, 30, 0.7);
  border-radius: 10px;
  padding: 20px;
  height: fit-content;
  align-self: flex-start;

  .infobox-section {
    .infobox-item {
      padding: 8px 0;
      border-bottom: 1px solid #333;

      &:last-child {
        border-bottom: none;
      }

      .info-key {
        font-weight: bold;
        color: #1abc9c;
        margin-bottom: 3px;
      }

      .info-value {
        color: #ccc;
        word-break: break-word;
      }
    }
  }
}
</style>
