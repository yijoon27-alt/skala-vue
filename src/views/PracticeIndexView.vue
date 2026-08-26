<script setup>
import { practiceGroups } from '@/data/practices'
</script>

<template>
  <section class="practice-index">
    <p class="eyebrow">PRACTICE ARCHIVE</p>
    <h1>실습 모음</h1>
    <p class="lead">
      날씨 앱을 만들기까지 다룬 Vue 문법 실습을 주제별로 모아 두었습니다. 카드를 선택하면 해당
      주제의 실습 화면이 열립니다.
    </p>

    <div class="group-grid">
      <RouterLink
        v-for="group in practiceGroups"
        :key="group.id"
        class="group-card"
        :to="{ name: 'PracticeTopic', params: { topic: group.id } }"
      >
        <h2>{{ group.title }}</h2>
        <p>{{ group.summary }}</p>
        <small>{{ group.items.length }}개 실습</small>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.practice-index {
  padding: 28px;
  border: 1px solid #dfe6e9;
  border-radius: 12px;
  background: #fff;
}

.eyebrow {
  margin: 0;
  color: #6c5ce7;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
}

h1 {
  margin: 4px 0 0;
}

.lead {
  margin: 10px 0 0;
  color: #636e72;
  line-height: 1.6;
}

.group-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
  margin-top: 24px;
}

.group-card {
  display: block;
  padding: 18px;
  border: 1px solid #dfe6e9;
  border-radius: 10px;
  background: #f4f7fb;
  color: inherit;
  text-decoration: none;
}

.group-card:hover {
  border-color: #6c5ce7;
  background: #f1efff;
}

.group-card h2 {
  margin: 0;
  font-size: 18px;
}

.group-card p {
  margin: 8px 0 12px;
  color: #636e72;
  font-size: 14px;
  line-height: 1.5;
}

.group-card small {
  color: #6c5ce7;
  font-weight: 700;
}
</style>
