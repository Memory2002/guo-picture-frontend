<script setup lang="ts">
import PictureUpload from '@/components/PictureUpload.vue'
import { computed, onMounted, reactive, ref, h, watchEffect } from 'vue'
import { message } from 'ant-design-vue'
import { editPicture, getPictureVoById, listPictureTagCategory } from '@/api/pictureController.ts'
import { useRoute, useRouter } from 'vue-router'
import UrlPictureUpload from '@/components/UrlPictureUpload.vue'
import ImageCropper from '@/components/ImageCropper.vue'
import { EditOutlined } from '@ant-design/icons-vue'
import { getSpaceVoById } from '@/api/spaceController.ts'

const router = useRouter()
const route = useRoute()

const picture = ref<API.PictureVO>()
const pictureForm = reactive<API.PictureEditRequest>({})
const uploadType = ref<'file' | 'url'>('file')
// 空间 id
const spaceId = computed(() => {
  const id = route.query?.spaceId
  return id ? Number(id) : undefined
})
/**
 * 图片上传成功
 * @param newPicture
 */
const onSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
  pictureForm.name = newPicture.name
}

/**
 * 提交表单
 */
const handleSubmit = async (values: API.PictureEditRequest) => {
  if (!picture.value?.id) {
    message.error('请先上传图片')
    return
  }
  const pictureId = picture.value.id
  const res = await editPicture({
    id: pictureId,
    spaceId: spaceId.value,
    ...values,
  })
  // 操作成功
  if (res.data.code === 0 && res.data) {
    message.success('图片创建成功')
    // 跳转到图片详情页
    router.push({
      path: `/picture/${pictureId}`,
    })
  } else {
    message.error('创建失败， ' + res.data.message)
  }
}

const categoryOptions = ref<{ value: string; label: string }[]>([])
const tagOptions = ref<{ value: string; label: string }[]>([])

/**
 * 获取标签和分类选项
 * @param
 */
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategory()
  if (res.data.code === 0 && res.data.data) {
    tagOptions.value = (res.data.data.tagList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
    categoryOptions.value = (res.data.data.categoryList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
  } else {
    message.error('获取标签分类列表失败， ' + res.data.message)
  }
}

onMounted(() => {
  // 获取标签和分类选项
  getTagCategoryOptions()
})

const getOldPicture = async () => {
  // 获取到id
  const id = route.query?.id
  if (id) {
    const res = await getPictureVoById({ id })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      picture.value = data
      pictureForm.name = data.name
      pictureForm.introduction = data.introduction
      pictureForm.category = data.category
      pictureForm.tags = data.tags
    } else {
      message.error('获取图片信息失败， ' + res.data.message)
    }
  }
}

onMounted(() => {
  getOldPicture()
})

// 图片编辑器引用
const imageCropperRef = ref()

// 编辑图片
const doEditPicture = async () => {
  console.log(imageCropperRef.value == null)
  imageCropperRef.value?.openModal()
}

// 图片裁剪成功回调
const onCropSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
}

// 获取空间信息
const space = ref<API.SpaceVO>()

// 获取空间信息
const fetchSpace = async () => {
  // 获取数据
  if (spaceId.value) {
    const res = await getSpaceVoById({
      id: spaceId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data
    }
  }
}

watchEffect(() => {
  fetchSpace()
})
</script>

<template>
  <div id="addPicturePage">
    <!-- 页面标题 -->
    <div class="page-header">
      <a-typography-title :level="3" style="margin: 0">
        {{ route.query?.id ? '修改图片' : '创建图片' }}
      </a-typography-title>
      <a-typography-paragraph v-if="spaceId" type="secondary" style="margin-bottom: 0">
        保存至空间：<a :href="`/space/${spaceId}`" target="_blank">{{ spaceId }}</a>
      </a-typography-paragraph>
    </div>

    <!-- 上传方式选择 -->
    <a-card :bordered="false" style="border-radius: 16px; margin-bottom: 24px">
      <a-tabs v-model:activeKey="uploadType" size="large">
        <a-tab-pane key="file" tab="本地文件上传">
          <PictureUpload :picture="picture" :spaceId="spaceId" :onSuccess="onSuccess" />
        </a-tab-pane>
        <a-tab-pane key="url" tab="URL 上传" force-render>
          <UrlPictureUpload :picture="picture" :spaceId="spaceId" :onSuccess="onSuccess" />
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- 图片编辑区域 -->
    <a-card v-if="picture" :bordered="false" style="border-radius: 16px; margin-bottom: 24px">
      <div class="edit-bar">
        <a-button type="primary" ghost size="large" :icon="h(EditOutlined)" @click="doEditPicture">
          编辑图片
        </a-button>
      </div>
    </a-card>

    <ImageCropper
      ref="imageCropperRef"
      :imageUrl="picture?.url"
      :picture="picture"
      :spaceId="spaceId"
      :space="space"
      :onSuccess="onCropSuccess"
    />

    <!-- 图片信息表单 -->
    <a-card v-if="picture" :bordered="false" style="border-radius: 16px">
      <template #title>
        <span style="color: #1890ff">图片信息</span>
      </template>
      <a-form layout="vertical" :model="pictureForm" @finish="handleSubmit">
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="图片名称" name="name">
              <a-input
                v-model:value="pictureForm.name"
                placeholder="请输入名称"
                size="large"
                allow-clear
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="图片简介" name="introduction">
              <a-textarea
                v-model:value="pictureForm.introduction"
                placeholder="请输入描述"
                :auto-size="{ minRows: 3, maxRows: 6 }"
                size="large"
                allow-clear
              />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="12">
            <a-form-item label="图片分类" name="category">
              <a-auto-complete
                v-model:value="pictureForm.category"
                :options="categoryOptions"
                placeholder="请输入分类"
                size="large"
                allow-clear
              />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="12">
            <a-form-item label="图片标签" name="tags">
              <a-select
                v-model:value="pictureForm.tags"
                mode="tags"
                :options="tagOptions"
                placeholder="请输入标签"
                size="large"
                allow-clear
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item style="margin-top: 24px">
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            style="width: 100%; height: 48px; font-size: 16px"
          >
            {{ route.query?.id ? '保存修改' : '创建图片' }}
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<style scoped>
#addPicturePage {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  background-color: var(--ant-background);
}

.page-header {
  margin-bottom: 24px;
  text-align: center;
}

.edit-bar {
  text-align: center;
  padding: 24px 0;
}

:deep(.ant-card-body) {
  padding: 24px !important;
}

:deep(.ant-tabs-content-holder) {
  padding-top: 16px;
}

:deep(.ant-form-item-label > label) {
  color: #262626;
  font-weight: 600;
}

/* 响应式调整 */
@media (max-width: 768px) {
  #addPicturePage {
    padding: 16px;
    max-width: 100%;
  }
}
</style>
