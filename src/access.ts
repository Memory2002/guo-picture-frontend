import router from '@/router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { message } from 'ant-design-vue'

// 是否为首次获取登录用户信息
let firstFetchLoginUser = true

/**
 * 全局权限校验，每次切换页面都会执行
 */
router.beforeEach(async (to, from, next) => {
  const loginUserStore = useLoginUserStore()
  let loginUser = loginUserStore.loginUser
  // 确保页面刷新时，首次加载时，能等待后端返回用户信息后再校验权限
  if (firstFetchLoginUser) {
    await loginUserStore.fetchLoginUser()
    loginUser = loginUserStore.loginUser
    firstFetchLoginUser = false
  }
  const toUrl = to.fullPath
  // 可以自己定义权限校验规则，比如只有管理员才能访问 /admin 开头的页面
  if (toUrl.startsWith('/admin')) {
    if (!loginUser || loginUser.userRole !== 'admin') {
      message.error('没有权限访问')
      // 如果没有登录或不是管理员，重定向到登录页面
      next({ path: '/user/login', query: { redirect: toUrl } })
      // next(`/user/login?redirect=${toUrl}`);
      return
    }
  }
  next()
})
