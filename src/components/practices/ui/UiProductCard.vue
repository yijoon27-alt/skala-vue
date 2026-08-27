<script setup>
import { ref } from 'vue'

const productQuantity = ref(1) // 수량 카운터 기본값
const productRate = ref(4) // 별점 기본값 (별 4개)
</script>

<template>
  <el-card shadow="hover" style="max-width: 420px">
    <template #header>
      <strong>상품 옵션</strong>
    </template>

    <div class="option-row">
      <span>구매 수량</span>
      <el-input-number v-model="productQuantity" :min="1" :max="10" />
    </div>

    <div class="option-row">
      <span>상품 평점</span>
      <el-rate v-model="productRate" />
    </div>

    <template #footer>
      <el-text>수량 {{ productQuantity }}개 · 평점 {{ productRate }}점</el-text>
    </template>
  </el-card>
</template>

<style scoped>
.option-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
</style>
