<script setup>
import TheHeader from '@/components/TheHeader.vue'
</script>

<template>
  <div class="app-shell">
    <TheHeader />

    <main class="route-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: #f4f7fb;
}

.route-content {
  width: min(920px, 100%);
  margin: 0 auto;
  padding: 24px 20px 48px;
}
</style>
