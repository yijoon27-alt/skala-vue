<script setup>
import { storeToRefs } from 'pinia'
import UnitToggler from '@/components/UnitToggler.vue'
import { useConfigStore } from '@/stores/configStore'
import { useFavoriteStore } from '@/stores/favoriteStore'
import { useTemperature } from '@/composables/useTemperature'

const configStore = useConfigStore()
const favoriteStore = useFavoriteStore()
const { format } = useTemperature()

// 데이터 속성은 storeToRefs 로 감싸야 반응형이 유지된다
const { unitLabel, actionLog } = storeToRefs(configStore)
// 함수(actions)는 일반 구조 분해로도 무방하다
const { toggleFavoritesOnly, resetConfig, clearActionLog } = configStore

const ACTION_LABELS = {
  toggleUnit: '단위 전환',
  setUnit: '단위 지정',
  toggleFavoritesOnly: '즐겨찾기 필터',
  resetConfig: '설정 초기화',
}

const VALUE_LABELS = {
  celsius: '섭씨 ℃',
  fahrenheit: '화씨 ℉',
  true: '켜짐',
  false: '꺼짐',
}

const KEY_LABELS = { unit: '온도 단위', favoritesOnly: '즐겨찾기만 보기' }

const readable = (value) => VALUE_LABELS[String(value)] ?? String(value)

const undo = (entry) => {
  // $patch — 여러 state 를 한 번의 변경으로 되돌린다 (액션이 아니라 이력에 다시 쌓이지 않는다)
  configStore.$patch(entry.before)
}
</script>

<template>
  <section class="settings">
    <header class="page-heading">
      <p class="eyebrow">SETTINGS</p>
      <h1>환경설정</h1>
    </header>

    <article class="panel">
      <h2>온도 단위</h2>
      <div class="row">
        <UnitToggler />
        <p>
          현재 <strong>{{ unitLabel }}</strong> 로 표시 중입니다. 대시보드 · 상세 · 비교 · 브리핑
          화면에 함께 적용되며, 브라우저를 닫았다 열어도 유지됩니다.
        </p>
      </div>
    </article>

    <article class="panel">
      <h2>대시보드</h2>
      <label class="row">
        <input type="checkbox" :checked="configStore.favoritesOnly" @change="toggleFavoritesOnly" />
        <span>즐겨찾기한 도시만 보기</span>
      </label>
    </article>

    <article class="panel">
      <h2>
        즐겨찾기 도시 <span class="count">{{ favoriteStore.count }}</span>
      </h2>
      <ul v-if="favoriteStore.count > 0" class="favorite-list">
        <li v-for="city in favoriteStore.favoriteCities" :key="city.id">
          <RouterLink :to="{ name: 'WeatherDetail', params: { cityId: city.id } }">
            {{ city.name }}
          </RouterLink>
          <span>{{ city.status }} · {{ format(city.temp) }}</span>
          <button type="button" @click="favoriteStore.remove(city.id)">해제</button>
        </li>
      </ul>
      <p v-else class="empty">아직 즐겨찾기한 도시가 없습니다.</p>
      <button
        v-if="favoriteStore.count > 0"
        type="button"
        class="ghost"
        @click="favoriteStore.clear"
      >
        전체 비우기
      </button>
    </article>

    <article class="panel">
      <h2>설정 변경 이력</h2>
      <ol v-if="actionLog.length > 0" class="log">
        <li v-for="entry in actionLog" :key="entry.id">
          <div>
            <strong>{{ ACTION_LABELS[entry.name] ?? entry.name }}</strong>
            <span class="time">{{ entry.at }}</span>
          </div>
          <p v-for="key in entry.changed" :key="key" class="diff">
            {{ KEY_LABELS[key] ?? key }} :
            <span class="before">{{ readable(entry.before[key]) }}</span>
            →
            <span class="after">{{ readable(entry.after[key]) }}</span>
          </p>
          <button type="button" @click="undo(entry)">이 시점으로 되돌리기</button>
        </li>
      </ol>
      <p v-else class="empty">기록된 변경이 없습니다. 단위를 바꿔 보세요.</p>

      <div class="panel-actions">
        <button v-if="actionLog.length > 0" type="button" class="ghost" @click="clearActionLog">
          이력 비우기
        </button>
        <button type="button" class="ghost" @click="resetConfig">설정 초기화</button>
      </div>
    </article>
  </section>
</template>

<style scoped>
.settings {
  display: grid;
  gap: 16px;
}

.page-heading h1 {
  margin: 0;
}

.eyebrow {
  margin: 0 0 4px;
  color: #6c5ce7;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.panel {
  padding: 20px;
  border: 1px solid #dfe6e9;
  border-radius: 12px;
  background: #fff;
}

.panel h2 {
  margin: 0 0 12px;
  font-size: 17px;
}

.count {
  padding: 2px 8px;
  border-radius: 999px;
  background: #f1eeff;
  color: #6c5ce7;
  font-size: 13px;
}

.row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.row p {
  margin: 0;
  color: #636e72;
  font-size: 14px;
}

.favorite-list,
.log {
  margin: 0 0 12px;
  padding: 0;
  list-style: none;
}

.favorite-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f1f2f6;
}

.favorite-list a {
  min-width: 60px;
  color: #2d3436;
  font-weight: 700;
}

.favorite-list span {
  flex: 1;
  color: #636e72;
  font-size: 14px;
}

.log li {
  padding: 12px;
  border: 1px solid #f1f2f6;
  border-radius: 8px;
  margin-bottom: 8px;
}

.time {
  margin-left: 8px;
  color: #b2bec3;
  font-size: 12px;
}

.diff {
  margin: 6px 0;
  font-size: 14px;
}

.before {
  color: #b2bec3;
  text-decoration: line-through;
}

.after {
  color: #6c5ce7;
  font-weight: 700;
}

.empty {
  margin: 0 0 12px;
  color: #b2bec3;
}

.panel-actions {
  display: flex;
  gap: 8px;
}

button {
  padding: 7px 12px;
  border: 0;
  border-radius: 6px;
  background: #2d3436;
  color: #fff;
  cursor: pointer;
}

button.ghost {
  border: 1px solid #dfe6e9;
  background: #fff;
  color: #636e72;
}
</style>
