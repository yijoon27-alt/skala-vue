<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { findPracticeGroup, practiceGroups } from '@/data/practices'

const route = useRoute()

const group = computed(() => findPracticeGroup(String(route.params.topic)))

const loadedItems = computed(
  () =>
    group.value?.items.map((item) => ({
      ...item,
      view: defineAsyncComponent(item.component),
    })) ?? [],
)
</script>

<template>
  <section v-if="group" class="practice-topic">
    <header class="topic-header">
      <div>
        <p class="eyebrow">PRACTICE</p>
        <h1>{{ group.title }}</h1>
        <p class="lead">{{ group.summary }}</p>
      </div>
      <RouterLink :to="{ name: 'PracticeIndex' }">← 실습 목록</RouterLink>
    </header>

    <nav class="topic-tabs" aria-label="실습 주제 선택">
      <RouterLink
        v-for="item in practiceGroups"
        :key="item.id"
        :to="{ name: 'PracticeTopic', params: { topic: item.id } }"
      >
        {{ item.title }}
      </RouterLink>
    </nav>

    <article v-for="item in loadedItems" :key="item.name" class="practice-item">
      <h2>{{ item.label }}</h2>
      <component :is="item.view" />
    </article>
  </section>

  <section v-else class="unknown-topic">
    <p class="eyebrow">UNKNOWN TOPIC</p>
    <h1>해당 실습 주제를 찾을 수 없습니다.</h1>
    <RouterLink :to="{ name: 'PracticeIndex' }">실습 목록으로 이동</RouterLink>
  </section>
</template>

<style scoped>
.practice-topic,
.unknown-topic {
  padding: 28px;
  border: 1px solid #dfe6e9;
  border-radius: 12px;
  background: #fff;
}

.topic-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
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
  margin: 8px 0 0;
  color: #636e72;
}

.topic-header a,
.unknown-topic a {
  flex-shrink: 0;
  padding: 9px 12px;
  border-radius: 6px;
  background: #6c5ce7;
  color: #fff;
  text-decoration: none;
  white-space: nowrap;
}

.topic-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 20px 0 8px;
}

.topic-tabs a {
  padding: 7px 11px;
  border: 1px solid #dfe6e9;
  border-radius: 6px;
  color: #636e72;
  font-size: 14px;
  text-decoration: none;
}

.topic-tabs a.router-link-exact-active {
  border-color: #6c5ce7;
  background: #f1efff;
  color: #5f4bc6;
  font-weight: 700;
}

.practice-item {
  margin-top: 20px;
  padding: 18px;
  border: 1px solid #dfe6e9;
  border-radius: 10px;
}

.practice-item h2 {
  margin: 0 0 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid #dfe6e9;
  font-size: 16px;
  color: #5f4bc6;
}

.unknown-topic h1 {
  margin-bottom: 20px;
}

@media (max-width: 640px) {
  .topic-header {
    flex-direction: column;
  }
}
</style>
