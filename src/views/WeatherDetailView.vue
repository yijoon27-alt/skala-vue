<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFavoriteStore } from '@/stores/favoriteStore'
import { useWeatherStore } from '@/stores/weatherStore'
import { useTemperature } from '@/composables/useTemperature'

const route = useRoute()
const router = useRouter()
const favoriteStore = useFavoriteStore()
const weatherStore = useWeatherStore()
const { format } = useTemperature()

const cityData = computed(() => weatherStore.findCity(String(route.params.cityId)))
// 대기질은 좌표가 같아도 엔드포인트가 달라 따로 받아온다 (상세 화면에서만 필요)
const airData = computed(() => weatherStore.findAir(String(route.params.cityId)))

watch(
  () => route.params.cityId,
  (cityId) => weatherStore.loadAir(String(cityId)),
  {
    immediate: true,
  },
)

// 대기질 등급(1~5)을 Element Plus 태그 색으로 옮긴다
const AQI_TAG = ['success', 'success', 'warning', 'danger', 'danger']
const aqiTagType = computed(() => AQI_TAG[(airData.value?.aqi ?? 1) - 1] ?? 'info')

const goDashboard = () => {
  router.push({ name: 'WeatherHome' })
}
</script>

<template>
  <el-card v-if="cityData" shadow="never" class="detail-card">
    <template #header>
      <el-page-header @back="router.back()">
        <template #content>
          <div class="header-content">
            <span class="title">{{ cityData.fullName }}</span>
            <el-tag :type="cityData.source === 'live' ? 'success' : 'warning'" size="small" round>
              {{ cityData.source === 'live' ? `실시간 · ${cityData.observedAt}` : '샘플 값' }}
            </el-tag>
          </div>
        </template>
      </el-page-header>
    </template>

    <div class="headline">
      <el-statistic :value="cityData.temp" :formatter="format" />
      <el-text size="large">{{ cityData.status }}</el-text>
      <el-tag v-if="airData" :type="aqiTagType" effect="light">
        대기질 {{ airData.aqiLabel }}
      </el-tag>
    </div>

    <el-descriptions :column="4" border class="observation">
      <el-descriptions-item label="체감 온도">{{
        format(cityData.feelsLike)
      }}</el-descriptions-item>
      <el-descriptions-item label="습도">{{ cityData.humidity }}%</el-descriptions-item>
      <el-descriptions-item label="풍속">{{ cityData.wind }}m/s</el-descriptions-item>
      <el-descriptions-item label="강수 확률"> {{ cityData.precipitation }}% </el-descriptions-item>
      <template v-if="airData">
        <el-descriptions-item label="미세먼지">{{ airData.pm10 }}㎍/㎥</el-descriptions-item>
        <el-descriptions-item label="초미세먼지">{{ airData.pm25 }}㎍/㎥</el-descriptions-item>
        <el-descriptions-item label="대기질 지수">{{ airData.aqi }} / 5</el-descriptions-item>
        <el-descriptions-item label="측정 시각">{{ airData.measuredAt }}</el-descriptions-item>
      </template>
    </el-descriptions>

    <template v-if="cityData.slots?.length">
      <h2 class="section-title">앞으로 24시간</h2>
      <el-timeline class="forecast">
        <el-timeline-item
          v-for="slot in cityData.slots"
          :key="slot.time"
          :timestamp="slot.time"
          placement="top"
          :type="slot.pop >= 40 ? 'primary' : 'info'"
          :hollow="slot.pop < 40"
        >
          <el-text>{{ format(slot.temp) }} · {{ slot.status }}</el-text>
          <el-tag v-if="slot.pop >= 40" type="primary" size="small" effect="plain">
            강수확률 {{ slot.pop }}%
          </el-tag>
        </el-timeline-item>
      </el-timeline>
    </template>

    <template #footer>
      <el-space wrap>
        <el-button
          :type="favoriteStore.isFavorite(cityData.id) ? 'warning' : 'default'"
          :aria-pressed="favoriteStore.isFavorite(cityData.id)"
          @click="favoriteStore.toggle(cityData.id)"
        >
          {{ favoriteStore.isFavorite(cityData.id) ? '★ 즐겨찾기 해제' : '☆ 즐겨찾기' }}
        </el-button>
        <el-button @click="goDashboard">메인 대시보드</el-button>
        <el-button
          @click="
            router.push({
              name: 'WeatherBriefing',
              params: { cityId: cityData.id },
              query: { activity: 'commute' },
            })
          "
        >
          생활 날씨 브리핑
        </el-button>
        <el-button @click="router.push({ name: 'WeatherLive' })">실시간 관측</el-button>
        <el-button
          @click="
            router.push({
              name: 'WeatherCompare',
              query: {
                left: cityData.id,
                right: cityData.id === 'city_01' ? 'city_02' : 'city_01',
              },
            })
          "
        >
          이 도시 비교하기
        </el-button>
      </el-space>
    </template>
  </el-card>

  <el-result
    v-else
    icon="warning"
    title="해당 도시의 기상 데이터가 없습니다."
    sub-title="주소의 도시 코드를 확인해 주세요."
  >
    <template #extra>
      <el-button type="primary" @click="goDashboard">메인 대시보드로 이동</el-button>
    </template>
  </el-result>
</template>

<style scoped>
.detail-card {
  background: #fff;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title {
  font-size: 18px;
  font-weight: 700;
}

.headline {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.observation {
  margin-bottom: 24px;
}

.section-title {
  margin: 0 0 16px;
  font-size: 15px;
}

.forecast .el-tag {
  margin-left: 8px;
}

@media (max-width: 640px) {
  .observation :deep(.el-descriptions__body) {
    overflow-x: auto;
  }
}
</style>
