import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getLoginUser } from '@/api/userController.ts'

/**
 * 存储登录用户信息的 Pinia store
 */
export const useLoginUserStore = defineStore('loginUser', () => {
  // 定义状态的初始值
  const loginUser = ref<API.LoginUserVO>({
    userName: '未登录',
  })

  /**
   * 远程获取登录用户信息
   */
  async function fetchLoginUser() {
    const res = await getLoginUser();
    if (res.data.code === 0 && res.data.data) {
      setLoginUser(res.data.data);
    }
    // 测试用户登录，3s后自动登录
    // setTimeout(() => {
    //   loginUser.value = { userName: "测试用户", id: 1}
    // }, 3000)
  }

  /**
   * 设置登录用户
   * @param newLoginUser
   */
  function setLoginUser(newLoginUser: any) {
    loginUser.value = newLoginUser
  }


  // 返回
  return { loginUser, fetchLoginUser, setLoginUser }
})
