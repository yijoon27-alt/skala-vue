<script setup>
const menuItems = [
  { routeName: 'WeatherHome', label: '날씨 대시보드' },
  { routeName: 'WeatherCompare', label: '도시 비교' },
  { routeName: 'PracticeIndex', label: '실습 모음' },
  { routeName: 'WeatherAbout', label: '서비스 소개' },
]
</script>

<template>
  <header class="app-header">
    <RouterLink class="brand" :to="{ name: 'WeatherHome' }">
      <span aria-hidden="true">⛅</span>
      <span>SKALA Weather</span>
    </RouterLink>

    <nav aria-label="주요 메뉴">
      <RouterLink v-for="item in menuItems" :key="item.routeName" :to="{ name: item.routeName }">
        {{ item.label }}
      </RouterLink>
    </nav>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 16px max(20px, calc((100% - 920px) / 2));
  border-bottom: 1px solid #dfe6e9;
  background: #fff;
}

.brand {
  display: flex;
  gap: 8px;
  color: #2d3436;
  font-size: 18px;
  font-weight: 700;
  text-decoration: none;
}

nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

nav a {
  padding: 8px 12px;
  border-radius: 6px;
  color: #636e72;
  text-decoration: none;
}

nav a.router-link-exact-active {
  background: #6c5ce7;
  color: #fff;
  font-weight: 700;
}

@media (max-width: 640px) {
  .app-header {
    align-items: flex-start;
    flex-direction: column;
  }

  nav a {
    padding-inline: 8px;
  }
}
</style>
