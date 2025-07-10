<script setup lang="ts">
import { listSpaceVoByPage } from '@/api/spaceController.ts'
import { message } from 'ant-design-vue'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { SPACE_TYPE_ENUM } from '@/constant/space.ts'

const router = useRouter()
const loginUserStore = useLoginUserStore()

// 检查用户是否有个人空间
const checkUserSpace = async () => {
  // 用户未登录，则直接跳转到登录页面
  const loginUser = loginUserStore.loginUser
  if (!loginUser?.id) {
    // 一定是替换掉当前的中间页，不然用户登录以后点返回（后退）就又回到中间页了
    router.replace('/user/login')
    return
  }
  // 用户已登录，获取该用户已创建的空间
  const res = await listSpaceVoByPage({
    userId: loginUser.id,
    current: 1,
    pageSize: 1,
    spaceType: SPACE_TYPE_ENUM.PRIVATE
  })
  if (res.data.code === 0) {
    if (res.data.data?.records?.length > 0) {
      // 有空间则跳转到第一个空间
      const space = res.data.data.records[0]
      router.replace(`/space/${space.id}`)
    } else {
      // 没有空间则跳转到创建空间页面
      router.replace('/add_space')
      // 给出提示
      message.warn('请先创建空间')
    }
  } else {
    message.error('加载我的空间失败， ' + res.data.message)
  }
}

// 在页面加载时检查用户空间
onMounted(() => {
  checkUserSpace()
})
</script>

<template>
  <div id="mySpacePage">
    <p>正在跳转，请稍后...</p>
  </div>
</template>

<style scoped></style>
