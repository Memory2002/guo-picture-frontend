<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import BasicLayout from '@/layouts/BasicLayout.vue'
import { health } from '@/api/mainController.ts'
// import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'

// 已经改为在权限校验文件中获取
// const loginUserStore = useLoginUserStore();
// loginUserStore.fetchLoginUser()

// health().then((res) => {
//   console.log(res)
// })
</script>

<template>
  <div id="app">
    <BasicLayout/>
  </div>
</template>

<style scoped>

</style>
