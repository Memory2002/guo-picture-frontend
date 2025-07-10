<script setup lang="ts">
import PictureUpload from '@/components/PictureUpload.vue'
import { onMounted, reactive, ref } from 'vue'
import { userLogin } from '@/api/userController.ts'
import { message } from 'ant-design-vue'
import { editPicture, getPictureVoById, listPictureTagCategory, uploadPictureByBatch } from '@/api/pictureController.ts'
import { useRoute, useRouter } from 'vue-router'
import UrlPictureUpload from '@/components/UrlPictureUpload.vue'

const formData = reactive<API.PictureUploadByBatchRequest>({
  count: 10,
})

// 提交任务状态
const loading = ref(false)
const router = useRouter()
/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  loading.value = true
  const res = await uploadPictureByBatch({
    ...formData,
  })
  // 操作成功
  if (res.data.code === 0 && res.data) {
    message.success(`图片创建成功，共 ${res.data.data} 条`)
    // 跳转到主页
    router.push({
      path: '/',
    })
  } else {
    message.error('创建失败， ' + res.data.message)
  }
  loading.value = false
}
</script>

<template>
  <div id="addPictureBatchPage">
    <!-- 图片信息表单 -->
    <a-form layout="vertical" :model="formData" @finish="handleSubmit">
      <a-form-item label="关键词" name="searchText">
        <a-input v-model:value="formData.searchText" placeholder="请输入关键词" allow-clear />
      </a-form-item>
      <a-form-item label="抓取数量" name="count">
        <a-input-number
          v-model:value="formData.count"
          placeholder="请输入数量"
          style="width: 180px"
          :min="1"
          :max="30"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="名称前缀" name="namePrefix">
        <a-input v-model:value="formData.namePrefix" placeholder="请输入名称前缀，会自动补充序号" allow-clear />
      </a-form-item>

      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%" :loading="loading">执行任务</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<style scoped>
#addPicturePage {
  max-width: 720px; /*一个平板的宽度*/
  margin: 0 auto; /*居中显示*/
}
</style>
