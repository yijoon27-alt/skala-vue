<script setup>
import { onMounted, useTemplateRef } from 'vue'

defineProps({
  city: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close'])
const modalRef = useTemplateRef('modalRef')

onMounted(() => {
  modalRef.value?.focus()
})
</script>

<template>
  <div
    ref="modalRef"
    class="modal-backdrop"
    tabindex="-1"
    role="dialog"
    aria-modal="true"
    aria-labelledby="weather-detail-title"
    @click.self="emit('close')"
    @keydown.esc.stop="emit('close')"
  >
    <section class="modal-panel">
      <header>
        <h2 id="weather-detail-title">{{ city.name }} 상세 날씨</h2>
        <button type="button" aria-label="상세 날씨 닫기" @click="emit('close')">✕</button>
      </header>
      <p class="temperature">{{ city.temp }}°C</p>
      <dl>
        <div>
          <dt>날씨</dt>
          <dd>{{ city.status }}</dd>
        </div>
        <div>
          <dt>습도</dt>
          <dd>{{ city.humidity }}%</dd>
        </div>
      </dl>
      <small>회색 배경을 클릭하거나 Esc를 눌러 닫을 수 있습니다.</small>
    </section>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.55);
}

.modal-backdrop:focus {
  outline: none;
}

.modal-panel {
  width: min(420px, 100%);
  padding: 24px;
  border-radius: 12px;
  background: #fff;
}

header,
dl div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

h2,
dl,
dd {
  margin: 0;
}

header button {
  border: 0;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
}

.temperature {
  margin: 20px 0;
  font-size: 42px;
  font-weight: 700;
}

dl {
  margin-bottom: 20px;
}

dl div {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}
</style>
