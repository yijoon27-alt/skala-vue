<script setup>
import { ref } from 'vue'

defineProps({
  parentData: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update-request'])
const customMessage = ref('')

const sendNotification = () => {
  const payload = 'Child에서 가공한 새로운 데이터'
  emit('update-request', payload)
}

const sendCustomMessage = () => {
  const payload = customMessage.value.trim()
  if (!payload) return

  emit('update-request', payload)
  customMessage.value = ''
}
</script>

<template>
  <div class="child-container">
    <h2>하위 컴포넌트 (Child)</h2>
    <p>
      수신된 Props 데이터: <strong>{{ parentData }}</strong>
    </p>
    <button @click="sendNotification">상위 컴포넌트로 갱신 요청 (Emit)</button>

    <section class="customization">
      <h3>✨ 추가 기능 — 직접 작성한 Payload</h3>
      <form @submit.prevent="sendCustomMessage">
        <input v-model="customMessage" maxlength="40" placeholder="부모에게 보낼 메시지" />
        <span>{{ customMessage.length }}/40</span>
        <button :disabled="!customMessage.trim()">입력값 전달</button>
      </form>
    </section>
  </div>
</template>

<style scoped>
.child-container {
  padding: 20px;
  border: 2px dashed #3498db;
  border-radius: 6px;
  background-color: #fff;
}

.customization {
  margin-top: 20px;
  padding: 15px;
  border-left: 4px solid #9b59b6;
  background-color: #f8f4fb;
}

.customization form {
  display: flex;
  gap: 8px;
  align-items: center;
}

.customization input {
  flex: 1;
  padding: 6px;
}
</style>
