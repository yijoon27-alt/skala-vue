<template>
  <section class="base-dashboard-card">
    <header v-if="$slots.header" class="card-header">
      <slot name="header"></slot>
    </header>
    <div class="card-body">
      <slot></slot>
    </div>
    <footer v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </footer>
  </section>
</template>

<style scoped>
.base-dashboard-card {
  margin-bottom: 15px;
  overflow: hidden;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #f8f9fa;
}

.card-header,
.card-body,
.card-footer {
  padding: 15px;
}

.card-header {
  border-bottom: 1px solid #e9ecef;
}

.card-footer {
  border-top: 1px solid #e9ecef;
}
</style>
