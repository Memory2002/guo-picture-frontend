<script setup lang="ts">
import { reactive } from 'vue'
import { userLogin } from '@/api/userController.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'

// 用于接收表单输入的值
const formState = reactive<API.UserLoginRequest>({
  userAccount: '',
  userPassword: '',
})

const loginUserStore = useLoginUserStore();
const router = useRouter();  // 获取路由实例
const route = useRoute();  // 获取当前路由信息
/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: API.UserLoginRequest) => {
  const res = await userLogin(values);
  if (res.data.code === 0 && res.data) {
    // 登录成功，把登录态保存到全局状态中
    await loginUserStore.fetchLoginUser();
    message.success('登录成功');
    // todo: 重定向和改成try catch
    // 获取登录成功后要跳转的页面路径
    // 这个 'redirect' 查询参数应该由导航到登录页的逻辑设置
    // const redirectUrl = route.query.redirect as string || '/'; // 如果没有 redirect 参数，则默认跳转到首页

    // 使用 router.replace 进行跳转，这样登录页就不会被添加到历史记录中
    // 用户点击后退时，会回到 redirectUrl 之前访问的页面
    // router.replace(redirectUrl);
      router.push({
      path: '/',
      replace: true,
    })
  } else {
    message.error("登录失败， " + res.data.message);
  }
}

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo)
}
</script>

<template>
  <div id="userLoginPage">
    <h2 class="title">妍夏光隙 - 用户登录</h2>
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

      <div class="tips">
        没有账号？
        <RouterLink to="/user/register">去注册</RouterLink>
      </div>

      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">登录</a-button>
      </a-form-item>
    </a-form>
  </div>
  <!-- 这里可以添加登录表单 -->
</template>

<style scoped>
#userLoginPage {
  max-width: 360px;   /* 登录页面最大宽度 */
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
