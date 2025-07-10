<script setup lang="ts">
import { reactive } from 'vue'
import { exchangeVip } from '@/api/userController.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'

// 用于接收表单输入的值
const formState = reactive<API.VipExchangeRequest>({
  vipCode: '',
})

const loginUserStore = useLoginUserStore()
const router = useRouter()

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: API.VipExchangeRequest) => {
  const res = await exchangeVip(values)
  if (res.data.code === 0) {
    message.success('VIP 兑换成功！')
    // 重新获取用户信息以更新 VIP 状态
    await loginUserStore.fetchLoginUser()
    router.push({
      path: '/', // 跳转到首页
    })
  } else {
    message.error('VIP 兑换失败，' + res.data.message)
  }
}
</script>

<template>
  <div id="UserExchangeVipPage">
    <div class="container">
      <div class="header">
        <h2 class="title">
          <svg class="title-icon" viewBox="0 0 24 24" width="32" height="32">
            <path
              fill="currentColor"
              d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"
            />
          </svg>
          兑换 VIP
        </h2>
        <div class="desc">输入兑换码即可升级为 VIP 用户</div>
      </div>

      <div class="form-card">
        <a-form
          :model="formState"
          name="basic"
          autocomplete="off"
          @finish="handleSubmit"
          layout="vertical"
        >
          <a-form-item
            name="vipCode"
            :rules="[
              { required: true, message: '请输入 VIP 兑换码' },
              { min: 1, message: '兑换码不能为空' },
            ]"
            label="VIP 兑换码"
            class="form-item"
          >
            <a-input
              v-model:value="formState.vipCode"
              placeholder="请输入 VIP 兑换码"
              allow-clear
              size="large"
              class="vip-input"
            />
          </a-form-item>
          <a-form-item class="submit-item">
            <a-button type="primary" html-type="submit" class="submit-btn" size="large">
              <svg class="btn-icon" viewBox="0 0 24 24" width="16" height="16">
                <path
                  fill="currentColor"
                  d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"
                />
              </svg>
              立即兑换
            </a-button>
          </a-form-item>
        </a-form>
      </div>

      <div class="tips-card">
        <h3 class="tips-title">VIP 特权</h3>
        <div class="tips-list">
          <div class="tip-item">
            <div class="tip-icon">✨</div>
            <span>享受更多特权服务</span>
          </div>
          <div class="tip-item">
            <div class="tip-icon">🔒</div>
            <span>兑换码区分大小写</span>
          </div>
          <div class="tip-item">
            <div class="tip-icon">💬</div>
            <span>如有问题请联系客服</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#UserExchangeVipPage {
  min-height: 85vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.container {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 20px;
  color: white;
}

.title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.title-icon {
  color: #ffd700;
  filter: drop-shadow(0 2px 8px rgba(255, 215, 0, 0.3));
}

.desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  line-height: 1.5;
}

.form-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  margin-bottom: 16px;
}

.form-item {
  margin-bottom: 16px;
}

.form-item :deep(.ant-form-item-label) {
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.form-item :deep(.ant-form-item-label > label) {
  font-size: 15px;
  color: #4b5563;
}

.vip-input :deep(.ant-input) {
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  padding: 12px 18px;
  font-size: 16px;
  background: #f9fafb;
  color: #374151;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.vip-input :deep(.ant-input:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  background: white;
}

.vip-input :deep(.ant-input:hover) {
  border-color: #9ca3af;
  background: white;
}

.vip-input :deep(.ant-input::placeholder) {
  color: #9ca3af;
}

.vip-input :deep(.ant-input-clear-icon) {
  color: #9ca3af;
  right: 16px;
}

.vip-input :deep(.ant-input-clear-icon:hover) {
  color: #6b7280;
}

.submit-item {
  margin-bottom: 0;
}

.submit-btn {
  width: 100%;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  font-size: 16px;
  font-weight: 600;
  color: white;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
}

.submit-btn:active {
  transform: translateY(0);
}

.btn-icon {
  color: currentColor;
}

.tips-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 20px;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.tips-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
  text-align: center;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 12px;
  color: #4b5563;
  font-size: 16px;
  line-height: 1.4;
  transition: all 0.2s ease;
}

.tip-item:hover {
  background: #f1f5f9;
  transform: translateX(4px);
}

.tip-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  #UserExchangeVipPage {
    padding: 12px;
  }

  .container {
    max-width: 100%;
  }

  .form-card {
    padding: 20px;
    border-radius: 16px;
  }

  .tips-card {
    padding: 16px;
    border-radius: 16px;
  }

  .title {
    font-size: 24px;
  }

  .desc {
    font-size: 13px;
  }
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.container {
  animation: fadeInUp 0.6s ease-out;
}

.form-card {
  animation: fadeInUp 0.8s ease-out;
}

.tips-card {
  animation: fadeInUp 1s ease-out;
}
</style>
