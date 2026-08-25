<script setup>
/*
 * 자식 컴포넌트 — 부모(VueStyleSample)의 scoped 스타일이
 * 정말 이 안까지는 못 들어오는지 확인하기 위한 실습용 컴포넌트.
 *
 * 부모와 **일부러 같은 클래스명**(.title, .card-body)을 쓴다.
 */
</script>

<template>
  <div class="child-card">
    <p class="title">자식 컴포넌트의 .title (부모와 같은 클래스명)</p>
    <p class="card-body">자식 컴포넌트의 .card-body</p>
  </div>
</template>

<style scoped>
.child-card {
  padding: 12px;
  border: 2px dashed #7f8c8d;
  border-radius: 6px;
  background-color: #fff;
}
.title {
  margin: 0 0 6px;
  font-size: 15px;
  color: #34495e; /* 자식이 스스로 정한 색 */
}
.card-body {
  margin: 0;
  font-size: 13px;
  color: #7f8c8d;
}
</style>
