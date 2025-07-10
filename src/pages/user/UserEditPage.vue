<template>
  <div id="UserEditPage">
    <div class="form-container">
      <div class="header">
        <h2 class="title">编辑信息</h2>
        <div class="desc">企业级智能协同云图库</div>
      </div>

      <a-form
        :model="formState"
        name="basic"
        autocomplete="off"
        @finish="handleSubmit"
        layout="vertical"
        class="edit-form"
      >
        <a-form-item name="userName" label="用户昵称" class="form-item">
          <a-input
            v-model:value="formState.userName"
            placeholder="请输入用户名"
            allow-clear
            size="large"
            prefix-icon="user"
          />
        </a-form-item>

        <a-form-item
          name="userPassword"
          :rules="[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码长度不能小于6位' },
          ]"
          label="密码"
          class="form-item"
        >
          <a-input-password
            v-model:value="formState.userPassword"
            placeholder="请输入密码"
            size="large"
            allow-clear
          />
        </a-form-item>

        <a-form-item name="userAvatar" label="头像 URL" class="form-item">
          <a-input
            v-model:value="formState.userAvatar"
            placeholder="请输入图片的 URL"
            allow-clear
            size="large"
          />
          <div v-if="formState.userAvatar" class="avatar-preview">
            <img :src="formState.userAvatar" alt="头像预览" />
          </div>
        </a-form-item>

        <a-form-item name="userProfile" label="个人简介" class="form-item">
          <a-textarea
            v-model:value="formState.userProfile"
            placeholder="请输入个人简介"
            :autosize="{ minRows: 4, maxRows: 8 }"
            allow-clear
            show-count
            :maxlength="200"
          />
        </a-form-item>

        <a-form-item class="submit-item">
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            class="submit-btn"
            :loading="false"
          >
            <template #icon>
              <SaveOutlined />
            </template>
            保存修改
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { editUser } from '@/api/userController.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { SaveOutlined } from '@ant-design/icons-vue'

// 用于接收表单输入的值
const formState = reactive<API.UserEditRequest>({
  userPassword: '',
  userAvatar: '',
  userProfile: '',
  userName: '',
})

const loginUserStore = useLoginUserStore()
const router = useRouter() // 获取路由实例
/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: API.UserEditRequest) => {
  const res = await editUser(values)
  if (res.data.code === 0 && res.data) {
    // 登录成功，把登录态保存到全局状态中
    loginUserStore.setLoginUser(res.data.data)
    message.success('信息更新成功')
    router.push({
      path: '/', // 跳转到首页
    })
  } else {
    message.error('信息更新失败， ' + res.data.message)
  }
}

onMounted(async () => {
  // 获取登录用户信息
  await loginUserStore.fetchLoginUser()
  // 检查用户是否已登录
  if (!loginUserStore.loginUser || !loginUserStore.loginUser.id) {
    message.error('请先登录')
    router.push('/user/login')
    return
  }
  formState.userName = loginUserStore.loginUser.userName || ''
  formState.userAvatar = loginUserStore.loginUser.userAvatar || ''
  formState.userProfile = loginUserStore.loginUser.userProfile || ''
  formState.userPassword = '' // 密码不需要预填充
})
</script>

<style scoped>
#UserEditPage {
  min-height: 50vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.form-container {
  background: #374151;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
  max-width: 480px;
  backdrop-filter: blur(10px);
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 30px;
  text-align: center;
  position: relative;
}

.header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="1" fill="white" opacity="0.1"/><circle cx="10" cy="50" r="1" fill="white" opacity="0.1"/><circle cx="90" cy="30" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.title {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px 0;
  position: relative;
  z-index: 1;
}

.desc {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
  position: relative;
  z-index: 1;
}

.edit-form {
  padding: 16px 30px;
}

.form-item {
  margin-bottom: 10px;
}

.form-item :deep(.ant-form-item-label) {
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.form-item :deep(.ant-form-item-label > label) {
  font-size: 14px;
  color: #555;
}

.form-item :deep(.ant-input),
.form-item :deep(.ant-input-password),
.form-item :deep(.ant-input-affix-wrapper) {
  border-radius: 8px;
  border: 2px solid #e8e8e8;
  transition: all 0.3s ease;
  padding: 10px 12px;
  font-size: 15px;
  background-color: #f8f9fa;
  color: #495057;
}

/* 修复密码输入框的样式 */
.form-item :deep(.ant-input-password input) {
  background-color: #f8f9fa;
  color: #495057;
}

.form-item :deep(.ant-input:focus),
.form-item :deep(.ant-input-password:focus),
.form-item :deep(.ant-input-affix-wrapper:focus),
.form-item :deep(.ant-input-affix-wrapper-focused) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-item :deep(.ant-input:hover),
.form-item :deep(.ant-input-password:hover),
.form-item :deep(.ant-input-affix-wrapper:hover) {
  border-color: #667eea;
}

/* 调整 placeholder 文字颜色 */
.form-item :deep(.ant-input::placeholder) {
  color: #999 !important;
  opacity: 1;
}

.form-item :deep(.ant-input-password input::placeholder) {
  color: #999 !important;
  opacity: 1;
}

.form-item :deep(.ant-input-affix-wrapper input::placeholder) {
  color: #999 !important;
  opacity: 1;
}

/* textarea 的 placeholder */
.form-item :deep(.ant-input::placeholder),
.form-item :deep(textarea::placeholder) {
  color: #999 !important;
  opacity: 1;
}

/* 调整清除按钮和密码可见按钮的颜色 */
.form-item :deep(.ant-input-clear-icon),
.form-item :deep(.ant-input-password-icon) {
  color: #6c757d !important;
}

.form-item :deep(.ant-input-clear-icon:hover),
.form-item :deep(.ant-input-password-icon:hover) {
  color: #495057 !important;
}

/* 调整输入框后缀图标的颜色 */
.form-item :deep(.ant-input-suffix) {
  color: #6c757d;
}

.form-item :deep(.ant-input-suffix:hover) {
  color: #495057;
}

.avatar-preview {
  margin-top: 12px;
  text-align: center;
}

.avatar-preview img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f0f0f0;
  box-shadow: 0 4px 12px rgba(221, 219, 219, 0.929);
}

.submit-item {
  margin-top: 16px;
  margin-bottom: 0;
}

.submit-btn {
  width: 100%;
  height: 48px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
}

.submit-btn:active {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 768px) {
  #UserEditPage {
    padding: 10px;
  }

  .form-container {
    max-width: 100%;
    border-radius: 12px;
  }

  .header {
    padding: 30px 20px;
  }

  .title {
    font-size: 24px;
  }

  .desc {
    font-size: 14px;
  }

  .edit-form {
    padding: 30px 20px;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .form-container {
    background: #1f1f1f;
    color: #fff;
  }

  .form-item :deep(.ant-form-item-label > label) {
    color: #ccc;
  }

  .form-item :deep(.ant-input),
  .form-item :deep(.ant-input-password),
  .form-item :deep(.ant-input-affix-wrapper) {
    background: #2d2d2d;
    border-color: #404040;
    color: #fff;
  }
}
</style>
