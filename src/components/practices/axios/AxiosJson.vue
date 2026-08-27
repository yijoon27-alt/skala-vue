<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

// 1. 백엔드 공용 주소
const BASE_URL = 'https://jsonplaceholder.typicode.com/posts'

// 2. 반응형 상태 데이터
const items = ref([]) // 서버에서 받아온 데이터 배열
const textInput = ref('') // 입력창과 연결된 글자 데이터

// [READ] GET : 데이터 가져오기
const handleRead = async () => {
  try {
    const response = await axios.get(BASE_URL, { params: { _limit: 3 } })
    items.value = response.data
    console.log('GET 성공:', response.data)
  } catch (error) {
    console.error('GET 실패:', error)
  }
}

// [CREATE] POST : 데이터 등록하기
const handleCreate = async () => {
  try {
    const response = await axios.post(BASE_URL, {
      title: textInput.value,
      body: '날씨현황',
      userId: 1,
    })
    items.value.unshift(response.data) // 서버가 id: 101 을 붙여서 돌려준다
    console.log('POST 성공:', response.data)
  } catch (error) {
    console.error('POST 실패:', error)
  }
}

// [UPDATE] PUT : 1번 데이터 통째로 교체하기
const handleUpdate = async (id) => {
  try {
    const response = await axios.put(`${BASE_URL}/${id}`, {
      title: textInput.value,
      body: '수정현황',
    })
    items.value = items.value.map((item) => (item.id === id ? response.data : item))
    console.log('PUT 성공:', response.data)
  } catch (error) {
    console.error('PUT 실패:', error)
  }
}

// [DELETE] DELETE : 데이터 삭제하기 (성공 시 빈 객체 반환)
const handleDelete = async (id) => {
  try {
    await axios.delete(`${BASE_URL}/${id}`)
    items.value = items.value.filter((item) => item.id !== id)
    console.log('DELETE 성공:', id)
  } catch (error) {
    console.error('DELETE 실패:', error)
  }
}

onMounted(handleRead)
</script>

<template>
  <div class="practice-section">
    <h2>📮 JSON Placeholder CRUD</h2>

    <div class="tool-row">
      <input v-model="textInput" placeholder="등록·수정할 제목" />
      <button @click="handleRead">GET 조회</button>
      <button @click="handleCreate">POST 등록</button>
    </div>

    <ul>
      <li v-for="item in items" :key="item.id">
        <strong>#{{ item.id }}</strong> {{ item.title }}
        <button @click="handleUpdate(item.id)">PUT</button>
        <button @click="handleDelete(item.id)">DELETE</button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.tool-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

li {
  margin-bottom: 8px;
}
</style>
