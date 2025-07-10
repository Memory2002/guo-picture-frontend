<script setup lang="ts">
import { ref, onMounted, h, computed } from 'vue'
import { deletePicture, getPictureVoById } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { downloadImage, formatSize, toHexColor } from '@/utils'
import {
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ShareAltOutlined,
} from '@ant-design/icons-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import ShareModal from '@/components/ShareModal.vue'
import { SPACE_PERMISSION_ENUM } from '@/constant/space.ts'

interface Props {
  id: string
}

const props = defineProps<Props>()
const picture = ref<API.PictureVO>({})
const loading = ref(true)
// const loginUserStore = useLoginUserStore()

// 通用权限检查函数
function createPermissionChecker(permission: string) {
  return computed(() => {
    return (picture.value.permissionList ?? []).includes(permission)
  })
}

// 定义权限检查
const canEdit = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_EDIT)
const canDelete = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_DELETE)

// // 是否具有编辑权限
// const canEdit = computed(() => {
//   const loginUser = loginUserStore.loginUser
//   // 未登录不可编辑
//   if (!loginUser.id) {
//     return false
//   }
//   // 仅本人或管理员可编辑
//   const user = picture.value.user || {}
//   return loginUser.id === user.id || loginUser.userRole === 'admin'
// })

const route = useRoute()
// 获取图片详情
const fetchPictureDetail = async () => {
  loading.value = true
  try {
    const res = await getPictureVoById({
      id: props.id, // 确保ID作为字符串
    })
    if (res.data.code === 0 && res.data.data) {
      picture.value = res.data.data
    } else {
      message.error('获取图片详情失败， ' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取图片详情失败， ' + e.message)
  }
  loading.value = false
}

onMounted(() => {
  fetchPictureDetail()
})

const router = useRouter()
// 编辑
const doEdit = () => {
  router.push({
    path: '/add_picture',
    query: {
      id: picture.value.id, // 确保ID作为字符串
      spaceId: picture.value.spaceId, // 确保空间ID也作为字符串
    },
  })
}
// 删除
const doDelete = async () => {
  const id = picture.value.id
  if (!id) {
    return
  }
  const res = await deletePicture({ id: String(id) }) // 确保ID作为字符串
  if (res.data.code === 0) {
    message.success('删除成功')
  } else {
    message.error('删除失败')
  }
}

// 下载图片
const doDownload = () => {
  downloadImage(picture.value.url)
}

// 分享操作
const shareModalRef = ref()
// 分享链接
const shareLink = ref('')
// 分享
const doShare = () => {
  shareLink.value = `${window.location.protocol}//${window.location.host}/picture/${picture.value.id}`
  // console.log(shareLink.value)
  if (shareModalRef.value) {
    shareModalRef.value.openModal()
  }
}
</script>

<template>
  <div id="PictureDetailPage">
    <a-row :gutter="[32, 16]">
      <!-- 图片预览 -->
      <a-col :sm="24" :md="16">
        <div class="image-container">
          <a-image class="preview-image" :src="picture.url" :alt="picture.name" />
        </div>
      </a-col>
      <!-- 图片信息区域 -->
      <a-col :sm="24" :md="8">
        <a-card :bordered="false" style="border-radius: 16px">
          <!-- 作者信息 -->
          <a-list-item>
            <a-list-item-meta>
              <template #avatar>
                <a-avatar :size="48" :src="picture.user?.userAvatar" />
              </template>
              <template #title>
                <a-typography-title :level="4" style="margin-bottom: 0">
                  {{ picture.name ?? '未命名' }}
                </a-typography-title>
              </template>
              <template #description> 由 {{ picture.user?.userName ?? '匿名用户' }} 上传 </template>
            </a-list-item-meta>
          </a-list-item>

          <a-divider style="margin: 16px 0" />

          <!-- 操作按钮 -->
          <a-space class="action-buttons" align="center">
            <a-button type="primary" shape="round" size="large" @click="doDownload">
              <template #icon><DownloadOutlined /></template>
              免费下载
            </a-button>
            <a-tooltip title="分享">
              <a-button shape="circle" :icon="h(ShareAltOutlined)" @click="doShare" />
            </a-tooltip>
            <a-tooltip v-if="canEdit" title="编辑">
              <a-button shape="circle" :icon="h(EditOutlined)" @click="doEdit" />
            </a-tooltip>
            <a-tooltip v-if="canDelete" title="删除">
              <a-button shape="circle" danger :icon="h(DeleteOutlined)" @click="doDelete" />
            </a-tooltip>
          </a-space>

          <a-divider style="margin: 16px 0" />

          <!-- 详细信息 -->
          <a-descriptions title="详细信息" :column="1" size="small">
            <a-descriptions-item v-if="picture.introduction" label="简介">
              {{ picture.introduction }}
            </a-descriptions-item>
            <a-descriptions-item label="分类">
              {{ picture.category ?? '默认' }}
            </a-descriptions-item>
            <a-descriptions-item label="标签">
              <a-tag v-for="tag in picture.tags" :key="tag" color="blue" style="border-radius: 4px">
                {{ tag }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="格式">
              {{ picture.picFormat ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="尺寸">
              <span v-if="picture.picWidth && picture.picHeight">
                {{ picture.picWidth }} x {{ picture.picHeight }}
              </span>
              <span v-else>-</span>
            </a-descriptions-item>
            <a-descriptions-item label="大小">
              {{ formatSize(picture.picSize) }}
            </a-descriptions-item>
            <a-descriptions-item label="主色调">
              <a-space>
                {{ picture.picColor ?? '-' }}
                <div
                  v-if="picture.picColor"
                  :style="{
                    width: '16px',
                    height: '16px',
                    backgroundColor: toHexColor(picture.picColor),
                    borderRadius: '4px',
                    border: '1px solid var(--color-border)',
                  }"
                />
              </a-space>
            </a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
    </a-row>
    <ShareModal ref="shareModalRef" title="分享链接" :link="shareLink" />
  </div>
</template>

<style scoped>
#PictureDetailPage {
  padding: 24px;
  /* 使用 Ant Design Vue 的主题变量，以便更好地支持暗色模式 */
  background-color: var(--ant-background);
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--ant-background-elevated);
  border-radius: 16px;
  padding: 24px;
  height: 100%;
  min-height: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s;
}

.image-container:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.preview-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 8px;
}

.action-buttons {
  width: 100%;
}

:deep(.ant-descriptions-item-label) {
  width: 80px;
  text-align: right;
  color: var(--ant-text-color-secondary);
}

:deep(.ant-card) {
  background-color: var(--ant-background-elevated);
}

/* 响应式调整 */
@media (max-width: 768px) {
  #PictureDetailPage {
    padding: 16px;
  }
  .image-container {
    padding: 16px;
    min-height: 300px;
  }
  .preview-image {
    max-height: 50vh;
  }
}
</style>
