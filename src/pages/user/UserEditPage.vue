<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { editUser, userLogin } from '@/api/userController.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'

// 用于接收表单输入的值
const formState = reactive<API.UserEditRequest>({
  userPassword: '',
  userAvatar: '',
  userProfile: '',
  userName: '',
})

const loginUserStore = useLoginUserStore();
const router = useRouter();  // 获取路由实例
const route = useRoute();  // 获取当前路由信息
/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: API.UserEditRequest) => {
  const res = await editUser(values);
  if (res.data.code === 0 && res.data) {
    // 登录成功，把登录态保存到全局状态中
    loginUserStore.setLoginUser(res.data.data);
    message.success('信息更新成功');
    router.push({
      path: '/',  // 跳转到首页
    })
  } else {
    message.error("信息更新失败， " + res.data.message);
  }
}

onMounted(async () => {
  // 获取登录用户信息
  await loginUserStore.fetchLoginUser();
  formState.userName = loginUserStore.loginUser.userName || '';
  formState.userAvatar = loginUserStore.loginUser.userAvatar || '';
  formState.userProfile = loginUserStore.loginUser.userProfile || '';
  formState.userPassword = ''; // 密码不需要预填充
})

</script>

<template>
  <div id="UserEditPage">
    <h2 class="title">编辑信息</h2>
    <div class="desc">企业级智能协同云图库</div>
    <a-form :model="formState" name="basic" autocomplete="off" @finish="handleSubmit">

      <a-form-item name="userName">
        <a-input v-model:value="formState.userName" placeholder="请输入用户名" />
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
      <a-form-item name="userAvatar">
        <a-input v-model:value="formState.userAvatar" placeholder="请输入图片的 URL" />
      </a-form-item>
      <a-form-item name="userProfile">
        <a-input v-model:value="formState.userProfile" placeholder="请输入个人简介" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">保存</a-button>
      </a-form-item>
    </a-form>
  </div>
  <!-- 这里可以添加登录表单 -->
</template>

<style scoped>
#UserEditPage {
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
