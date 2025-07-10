<script setup lang="ts">
import { reactive } from 'vue'
import { userLogin, userRegister } from '@/api/userController.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'

// 用于接收表单输入的值
const formState = reactive<API.UserRegisterRequest>({
  userAccount: '',
  userPassword: '',
  checkPassword: '',
})

const loginUserStore = useLoginUserStore();
const router = useRouter();  // 获取路由实例
const route = useRoute();  // 获取当前路由信息
/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: API.UserRegisterRequest) => {
  // 检查密码和确认密码是否一致
  if (values.userPassword!== values.checkPassword) {
    message.error('两次输入的密码不一致，请重新输入');
    return;
  }
  const res = await userRegister(values);
  if (res.data.code === 0 && res.data.data) {
    // 注册成功，跳转到登录页
    await loginUserStore.fetchLoginUser();
    message.success('注册成功');
      router.push({
      path: '/user/login',
      replace: true,
    })
  } else {
    message.error("注册失败， " + res.data.message);
  }
}

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo)
}
</script>

<template>
  <div id="userRegisterPage">
    <h2 class="title">妍夏光隙 - 用户注册</h2>
    <div class="desc">企业级智能协同云图库</div>
    <a-form :model="formState" name="basic" autocomplete="off" @finish="handleSubmit">
      <a-form-item
        name="userAccount"
        :rules="[
          { required: true, message: '请输入账号' },
          { min: 4, message: '账号长度不能小于4位' },
        ]"
      >
        <a-input v-model:value="formState.userAccount" placeholder="请输入账号" />
      </a-form-item>

      <a-form-item
        name="userPassword"
        :rules="[
          { required: true, message: '请输入密码' },
          { min: 6, message: '密码长度不能小于6位' },
        ]"
      >
        <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" />
      </a-form-item>

      <a-form-item
        name="checkPassword"
        :rules="[
          { required: true, message: '请输入确认密码' },
          { min: 4, message: '确认密码长度不能小于6位' },
        ]"
      >
        <a-input v-model:value="formState.checkPassword" placeholder="请输入确认密码" />
      </a-form-item>

      <div class="tips">
        已有账号？
        <RouterLink to="/user/login">去登录</RouterLink>
      </div>

      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">注册</a-button>
      </a-form-item>
    </a-form>
  </div>
  <!-- 这里可以添加注册表单 -->
</template>

<style scoped>
#userRegisterPage {
  max-width: 360px;   /* 注册页面最大宽度 */
  margin: 0 auto;  /* 居中对齐 */
}

.title {
  text-align: center;
  margin-bottom: 16px;
}

.desc {
  text-align: center;
  margin-bottom: 16px;
  color: #aaa; /* 描述文字颜色 */
}

.tips {
  text-align: right;
  font-size: 13px;
  color: #bbb; /* 提示文字颜色 */
  margin-bottom: 16px;
}
</style>
