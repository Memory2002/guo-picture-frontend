<script setup lang="ts">
import { ref } from 'vue';
import logoIcon from '@/assets/logo.png'; // 导入图片
const open = ref<boolean>(false);

interface Props {
  title: string;
  link: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '分享图片',
  link: 'https://www.codefather.cn',
});
// 是否可见
const visible = ref(false)

// 打开弹窗
const openModal = () => {
  visible.value = true;
};

// 关闭弹窗
const closeModal = () => {
  visible.value = false;
};

// 暴露函数给父组件调用
defineExpose({
  openModal,
})
</script>

<template>
  <div>
    <a-modal v-model:visible="visible" :title="title" :footer="false" @cancel="closeModal">
      <h4>复制分享链接</h4>
      <a-typography-link copyable>
        {{ link }}
      </a-typography-link>
      <h4>手机扫码查看</h4>
      <a-qrcode error-level="H" :value="link" :icon="logoIcon"/>
    </a-modal>
  </div>
</template>

<style scoped>

</style>

