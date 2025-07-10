<template>
  <div class="url-picture-upload">
    <a-input-group compact>
      <a-input v-model:value="fileUrl" style="width: calc(100% - 100px)" placeholder="请输入图片地址" />
      <a-button type="primary" @click="handleUpload" :loading="loading" style="width: 100px">提交</a-button>
    </a-input-group>
    <div class="img-warpper">
      <img v-if="picture?.url" :src="picture.url" alt="图片预览" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { UploadChangeParam, UploadProps } from 'ant-design-vue'
import { uploadPicture, uploadPictureByUrl } from '@/api/pictureController.ts'

interface Props {
  picture?: API.PictureVO
  onSuccess?: (newPicture: API.PictureVO) => void
}

const props = defineProps<Props>()
const loading = ref<boolean>(false)
const fileUrl = ref<string>()
/**
 * 上传图片
 * @param file
 */
const handleUpload = async () => {
  loading.value = true
  try {
    const params: API.PictureUploadRequest = { fileUrl: fileUrl.value }
    if (props.picture) {
      params.id = props.picture.id
    }
    const res = await uploadPictureByUrl(params);
    if (res.data.code === 0 && res.data.data) {
      // 将上传成功的图片信息传递给父组件
      message.success('图片上传成功')
      props.onSuccess?.(res.data.data)
    } else {
      message.error('图片上传失败，' + res.data.message)
    }
  } catch (error) {
    console.log('图片上传失败', error)
    message.error('图片上传失败，' + error.message)
  }
  loading.value = false
}


</script>
<style scoped>
.url-picture-upload {
  margin-bottom: 16px;
}

.url-picture-upload img {
  max-width: 100%;
  max-height: 480px;
}

.url-picture-upload .img-warpper {
  text-align: center;
  margin-top: 16px;
}

</style>
