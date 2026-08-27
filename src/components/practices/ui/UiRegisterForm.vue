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
  <el-card class="register-card" shadow="hover">
    <template #header>
      <strong>📝 실습 1. 회원가입 Form &amp; 인풋 제어</strong>
    </template>

    <div class="field">
      <label for="register-email">이메일 주소:</label>
      <el-input id="register-email" v-model="userForm.email" placeholder="example@email.com" />
    </div>

    <div class="field">
      <el-switch v-model="userForm.agree" />
      <span>개인정보 수집 및 필수 이용약관에 동의합니다.</span>
    </div>

    <el-button type="success" class="submit" @click="handleRegister">🎁 회원가입하기</el-button>
  </el-card>
</template>

<style scoped>
.register-card {
  max-width: 460px;
}

.field {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}

.field label {
  flex-shrink: 0;
  color: #606266;
}

.submit {
  width: 100%;
}
</style>
