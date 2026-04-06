<template>
  <div class="ai-summary-section" v-if="show">
    <div class="ai-summary-content">
      <div class="summary-text">{{ text }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props
defineProps<{
  show: boolean
  text: string
}>()
</script>

<style scoped lang="scss">
.ai-summary-section {
  min-height: 120px;
  margin-top: 20px;
  padding: 20px;
  background-color: rgba(30, 30, 30, 0.7);
  border-radius: 8px;
  border-left: 4px solid #1abc9c;

  .ai-summary-content {
    position: relative;
    background: linear-gradient(
      45deg,
      #6cb3ff,
      #8a2be2,
      #1abc9c,
      #ff6b6b,
      #ffa500,
      #e8469c,
      #00ff7f,
      #9370db,
      #6cb3ff
    );
    background-size: 400% 400%;
    animation: gradientShift 8s ease infinite;
    border-radius: 8px;
    padding: 15px;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    color: transparent;

    .summary-text {
      text-align: left;
      line-height: 1.6;
      background: linear-gradient(
        45deg,
        #6cb3ff,
        #8a2be2,
        #1abc9c,
        #ff6b6b,
        #ffa500,
        #e8469c,
        #00ff7f,
        #9370db,
        #6cb3ff
      );
      background-size: 600% 600%;
      animation: gradientShift 20s ease infinite;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      white-space: pre-wrap;
      word-break: break-word;
    }
  }

  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
}
</style>
