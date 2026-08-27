<script setup>
import { useTemperature } from '@/composables/useTemperature'

// el-statistic 은 값과 단위를 분리해 받는다. 절대 온도만 변환하고 기호는 suffix 로 넘긴다.
// 주의: value prop 타입이 Number | Object 라서 도시 이름 같은 문자열은 넣을 수 없다.
//       문자열 타일은 라이브러리 클래스만 빌려 같은 모양으로 직접 그린다.
const { convert, symbol } = useTemperature()

defineProps({
  summary: {
    type: Object,
    required: true,
  },
  favoriteCount: {
    type: Number,
    default: 0,
  },
})
</script>

<template>
  <el-row :gutter="10" class="summary-row">
    <el-col :xs="12" :sm="6">
      <el-card shadow="never"><el-statistic title="표시 지역" :value="summary.count" /></el-card>
    </el-col>
    <el-col :xs="12" :sm="6">
      <el-card shadow="never">
        <el-statistic title="평균 기온" :value="convert(summary.average)" :suffix="symbol" />
      </el-card>
    </el-col>
    <el-col :xs="12" :sm="6">
      <el-card shadow="never">
        <div class="el-statistic">
          <div class="el-statistic__head">가장 더운 지역</div>
          <div class="el-statistic__content">
            <span class="el-statistic__number">{{ summary.hottest }}</span>
          </div>
        </div>
      </el-card>
    </el-col>
    <el-col :xs="12" :sm="6">
      <el-card shadow="never"><el-statistic title="즐겨찾기" :value="favoriteCount" /></el-card>
    </el-col>
  </el-row>
</template>

<style scoped>
.summary-row {
  margin-bottom: 15px;
}

.summary-row .el-col {
  margin-bottom: 10px;
}
</style>
