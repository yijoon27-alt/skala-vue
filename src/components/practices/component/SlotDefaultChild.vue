<template>
  <div class="base-card">
    <slot>
      <p>기본 콘텐츠 영역입니다.</p>
    </slot>
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
