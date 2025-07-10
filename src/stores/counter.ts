import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// 一个状态就存储一类要贡献的数据（存一类常量）
export const useCounterStore = defineStore('counter', () => {
  // 定义状态的初始值
  const count = ref(0)
  // 定义变量的计算逻辑
  const doubleCount = computed(() => count.value * 2)
  // 定义怎么更改状态的方法
  function increment() {
    count.value++
  }
  // 返回 
  return { count, doubleCount, increment }
})
