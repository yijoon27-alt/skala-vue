<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const userForm = ref({
  email: '',
  agree: false,
})

const handleRegister = () => {
  if (!userForm.value.email.includes('@')) {
    ElMessage.error('❌ 올바른 이메일 형식이 아닙니다.')
    return
  }
  if (!userForm.value.agree) {
    ElMessage.warning('⚠️ 이용약관에 동의하셔야 합니다.')
    return
  }
  ElMessage.success('🎉 가입 신청이 정상적으로 완료되었습니다!')
}
</script>

<template>
  <el-card shadow="hover" style="max-width: 420px">
    <template #header>
      <strong>회원가입</strong>
    </template>

    <el-input v-model="userForm.email" placeholder="이메일 주소" clearable />

    <div class="agree-row">
      <span>이용약관 동의</span>
      <el-switch v-model="userForm.agree" />
    </div>

    <template #footer>
      <el-button type="primary" @click="handleRegister">회원가입</el-button>
    </template>
  </el-card>
</template>

<style scoped>
.agree-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
}
</style>
