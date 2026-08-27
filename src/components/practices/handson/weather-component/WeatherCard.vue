<script setup>
import { computed } from 'vue'
import { useTemperature } from '@/composables/useTemperature'

// 표시 온도만 단위 변환한다. 아래 배지의 임계값(25)은 원본 섭씨 기준으로 둔다 —
// 임계값까지 변환하면 화씨로 바꾸는 순간 더움/선선함 판정이 뒤집힌다.
const { format } = useTemperature()

const props = defineProps({
  cityItem: {
    type: Object,
    required: true,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  isHighlighted: {
    type: Boolean,
    default: false,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
  detailLabel: {
    type: String,
    default: '빠른 알림',
  },
  showPanelAction: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['select-card', 'click-detail', 'open-modal', 'toggle-favorite'])

// 태그 색은 표시 문자열('온흐림'·'실비'…)이 아니라 분류 코드로 고른다.
// 실시간 API 의 한국어 설명은 수십 종이라 문자열로 매칭하면 색이 빠진다.
const CONDITION_TAG = {
  clear: { type: 'warning', icon: '☀️' },
  clouds: { type: 'info', icon: '☁️' },
  rain: { type: 'primary', icon: '🌧️' },
  drizzle: { type: 'primary', icon: '🌦️' },
  thunderstorm: { type: 'danger', icon: '⛈️' },
  snow: { type: 'success', icon: '❄️' },
  atmosphere: { type: 'info', icon: '🌫️' },
}

const conditionTag = computed(
  () => CONDITION_TAG[props.cityItem.condition] ?? { type: 'info', icon: '🌡️' },
)

const selectCard = () => {
  emit('select-card', props.cityItem)
}
</script>

<template>
  <el-card
    :class="['weather-card', { highlighted: isHighlighted, selected: isSelected }]"
    shadow="hover"
    @click="selectCard"
  >
    <div class="card-body">
      <div class="card-info">
        <h3>
          {{ cityItem.name }}
          <el-tag :type="conditionTag.type" effect="light" size="small" round>
            {{ conditionTag.icon }} {{ cityItem.status }}
          </el-tag>
          <el-tag v-if="cityItem.source === 'live'" type="success" effect="plain" size="small">
            실시간
          </el-tag>
        </h3>

        <p class="temp">
          {{ format(cityItem.temp) }}
          <el-tag :type="cityItem.temp >= 25 ? 'danger' : 'primary'" effect="dark" size="small">
            {{ cityItem.temp >= 25 ? '🔥 더움' : '❄️ 선선함' }}
          </el-tag>
        </p>

        <div class="gauge">
          <span>습도</span>
          <el-progress
            :percentage="cityItem.humidity"
            :stroke-width="8"
            :show-text="false"
            color="#409eff"
          />
          <small>{{ cityItem.humidity }}%</small>
        </div>
        <div v-if="cityItem.precipitation !== undefined" class="gauge">
          <span>강수</span>
          <el-progress
            :percentage="cityItem.precipitation"
            :stroke-width="8"
            :show-text="false"
            color="#67c23a"
          />
          <small>{{ cityItem.precipitation }}%</small>
        </div>
      </div>

      <div class="card-actions">
        <el-button
          :type="isFavorite ? 'warning' : 'default'"
          size="small"
          :aria-pressed="isFavorite"
          @click.stop="emit('toggle-favorite', cityItem.id)"
        >
          {{ isFavorite ? '★ 즐겨찾기 해제' : '☆ 즐겨찾기' }}
        </el-button>
        <el-button type="primary" size="small" @click.stop="emit('click-detail', cityItem)">
          {{ detailLabel }}
        </el-button>
        <el-button v-if="showPanelAction" size="small" @click.stop="emit('open-modal', cityItem)">
          상세 패널
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<style scoped>
.weather-card {
  margin-bottom: 10px;
  cursor: pointer;
}

.weather-card.highlighted {
  outline: 3px solid #f1c40f;
  outline-offset: 2px;
}

.weather-card.selected {
  border-color: #6c5ce7;
  background: #f7f5ff;
}

.card-body {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.card-info {
  flex: 1;
  min-width: 0;
}

h3 {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
}

.temp {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
  font-size: 20px;
  font-weight: 700;
}

.gauge {
  display: grid;
  grid-template-columns: 36px 1fr 42px;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  color: #636e72;
  font-size: 12px;
}

.gauge small {
  text-align: right;
}

.card-actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}

.card-actions .el-button + .el-button {
  margin-left: 0;
}
</style>
