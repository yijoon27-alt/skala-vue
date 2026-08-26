<template>
  <div class="base-card">
    <header>
      <slot name="header"></slot>
    </header>
    <main>
      <slot></slot>
    </main>
  </div>
</template>

<style scoped>
.base-card {
  margin-bottom: 10px;
  padding: 15px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: #fff;
}
</style>
