<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted, watch } from 'vue'
import { deletePicture } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { EditOutlined, DeleteOutlined, ShareAltOutlined } from '@ant-design/icons-vue'
import ShareModal from '@/components/ShareModal.vue'

interface Props {
  dataList?: API.PictureVO[]
  loading?: boolean
  showOps?: boolean // 是否显示操作按钮
  canEdit?: boolean
  canDelete?: boolean
  onReload?: () => void // 刷新回调函数
}

const props = withDefaults(defineProps<Props>(), {
  dataList: () => [],
  loading: false,
  showOps: false,
  canEdit: false,
  canDelete: false,
})

const router = useRouter()
const waterfallContainer = ref<HTMLElement>()
const waterfallKey = ref(0)
const resizeObserver = ref<ResizeObserver>()

// 瀑布流布局函数
const layoutWaterfall = () => {
  if (!waterfallContainer.value) return

  const container = waterfallContainer.value
  const items = container.querySelectorAll('.waterfall-item') as NodeListOf<HTMLElement>

  if (items.length === 0) return

  const containerWidth = container.offsetWidth
  const gap = 16
  const minColumnWidth = 280
  const columnCount = Math.max(1, Math.floor((containerWidth + gap) / (minColumnWidth + gap)))
  const columnWidth = (containerWidth - gap * (columnCount - 1)) / columnCount

  // 初始化列高度数组
  const columnHeights = new Array(columnCount).fill(0)

  items.forEach((item) => {
    // 设置每个项目的宽度
    item.style.width = `${columnWidth}px`

    // 找到最短的列
    const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights))

    // 设置位置
    item.style.position = 'absolute'
    item.style.left = `${shortestColumnIndex * (columnWidth + gap)}px`
    item.style.top = `${columnHeights[shortestColumnIndex]}px`
    item.style.transition = 'all 0.3s ease'

    // 更新该列的高度
    columnHeights[shortestColumnIndex] += item.offsetHeight + gap
  })

  // 设置容器高度
  container.style.height = `${Math.max(...columnHeights)}px`
}

// 监听窗口大小变化
const handleResize = () => {
  layoutWaterfall()
}

// 监听数据变化重新布局
const updateLayout = () => {
  nextTick(() => {
    setTimeout(() => {
      layoutWaterfall()
    }, 100) // 等待图片加载
  })
}

onMounted(() => {
  updateLayout()
  window.addEventListener('resize', handleResize)

  // 使用ResizeObserver监听容器大小变化
  if (waterfallContainer.value) {
    resizeObserver.value = new ResizeObserver(() => {
      layoutWaterfall()
    })
    resizeObserver.value.observe(waterfallContainer.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (resizeObserver.value) {
    resizeObserver.value.disconnect()
  }
})

// 监听数据变化
watch(
  () => props.dataList.length,
  () => {
    refreshLayout()
  },
)

// 当数据变化时重新布局
const refreshLayout = () => {
  waterfallKey.value++
  updateLayout()
}

// 图片加载完成后重新布局
const onImageLoad = () => {
  updateLayout()
}

// 跳转至图片详情页
const doClickPicture = (picture: API.PictureVO) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}

// 编辑
const doEdit = (picture: API.PictureVO, e: Event) => {
  // 阻止事件冒泡，避免触发点击图片事件进入到图片详情页
  e.stopPropagation()
  // 跳转时一定要携带 spaceId
  router.push({
    path: '/add_picture',
    query: {
      id: picture.id,
      spaceId: picture.spaceId, // 传递空间 ID
    },
  })
}

// 删除
const doDelete = async (picture: API.PictureVO, e: Event) => {
  // 阻止事件冒泡
  e.stopPropagation()
  const id = picture.id
  if (!id) {
    return
  }
  const res = await deletePicture({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    props.onReload?.()
  } else {
    message.error('删除失败')
  }
}

// 分享操作
const shareModalRef = ref()
// 分享链接
const shareLink = ref('')
// 分享
const doShare = (picture: API.PictureVO, e: Event) => {
  // 阻止事件冒泡
  e.stopPropagation()
  shareLink.value = `${window.location.protocol}//${window.location.host}/picture/${picture.id}`
  if (shareModalRef.value) {
    shareModalRef.value.openModal()
  }
}

// 暴露刷新布局方法
defineExpose({
  refreshLayout,
})
</script>

<template>
  <div class="picture-list">
    <!-- JavaScript 瀑布流布局 -->
    <div ref="waterfallContainer" class="waterfall-container" :key="waterfallKey">
      <div
        v-for="picture in dataList"
        :key="picture.id"
        class="waterfall-item"
        @click="doClickPicture(picture)"
      >
        <div class="picture-card">
          <!-- 图片容器 -->
          <div class="image-container">
            <img
              :alt="picture.name"
              :src="picture.thumbnailUrl ?? picture.url"
              class="picture-image"
              loading="lazy"
              @load="onImageLoad"
            />
            <!-- 悬浮操作按钮 -->
            <div v-if="showOps" class="overlay-actions">
              <a-button
                type="text"
                class="action-btn share-btn"
                @click.stop="doShare(picture, $event)"
              >
                <ShareAltOutlined />
              </a-button>
              <a-button
                v-if="canEdit"
                type="text"
                class="action-btn edit-btn"
                @click.stop="doEdit(picture, $event)"
              >
                <EditOutlined />
              </a-button>
              <a-button
                v-if="canDelete"
                type="text"
                class="action-btn delete-btn"
                @click.stop="doDelete(picture, $event)"
              >
                <DeleteOutlined />
              </a-button>
            </div>
          </div>

          <!-- 图片信息 -->
          <div class="picture-info">
            <h3 class="picture-title">{{ picture.name }}</h3>
            <div class="picture-tags">
              <span class="category-tag">
                {{ picture.category ?? '默认' }}
              </span>
              <span v-for="tag in picture.tags" :key="tag" class="tag-item">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <a-spin size="large" />
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && dataList.length === 0" class="empty-container">
      <a-empty description="暂无图片" />
    </div>

    <ShareModal ref="shareModalRef" :link="shareLink" title="分享图片" />
  </div>
</template>

<style scoped>
.picture-list {
  width: 100%;
  background: transparent;
}

/* JavaScript 瀑布流容器 */
.waterfall-container {
  position: relative;
  padding: 16px;
  min-height: 200px;
  width: 100%;
}

/* 瀑布流项目 */
.waterfall-item {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  top: 0;
  left: 0;
}

.waterfall-item:hover {
  transform: translateY(-4px);
  z-index: 10;
}

/* 图片卡片 */
.picture-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.04);
  height: fit-content;
}

.picture-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: rgba(82, 196, 26, 0.2);
}

/* 图片容器 */
.image-container {
  position: relative;
  overflow: hidden;
}

.picture-image {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.3s ease;
}

.image-container:hover .picture-image {
  transform: scale(1.05);
}

/* 悬浮操作按钮 */
.overlay-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
}

.image-container:hover .overlay-actions {
  opacity: 1;
  transform: translateY(0);
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.share-btn {
  background: rgba(24, 144, 255, 0.9);
  color: white;
}

.share-btn:hover {
  background: rgba(24, 144, 255, 1);
  transform: scale(1.1);
}

.edit-btn {
  background: rgba(82, 196, 26, 0.9);
  color: white;
}

.edit-btn:hover {
  background: rgba(82, 196, 26, 1);
  transform: scale(1.1);
}

.delete-btn {
  background: rgba(255, 77, 79, 0.9);
  color: white;
}

.delete-btn:hover {
  background: rgba(255, 77, 79, 1);
  transform: scale(1.1);
}

/* 图片信息 */
.picture-info {
  padding: 10px;
}

.picture-title {
  font-size: 16px;
  font-weight: 600;
  color: #2f3349;
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.picture-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.category-tag {
  background: linear-gradient(135deg, #52c41a, #73d13d);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tag-item {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid rgba(82, 196, 26, 0.2);
  transition: all 0.3s ease;
}

.tag-item:hover {
  background: rgba(82, 196, 26, 0.2);
  transform: scale(1.05);
}

/* 加载状态 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  margin: 20px;
  backdrop-filter: blur(10px);
}

/* 空状态 */
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  margin: 20px;
  backdrop-filter: blur(10px);
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.waterfall-item {
  animation: fadeInUp 0.6s ease-out;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .waterfall-container {
    padding: 12px;
  }

  .picture-card {
    border-radius: 12px;
  }

  .picture-info {
    padding: 12px;
  }

  .picture-title {
    font-size: 14px;
  }

  .overlay-actions {
    top: 6px;
    right: 6px;
  }

  .action-btn {
    width: 28px;
    height: 28px;
  }
}

@media (max-width: 576px) {
  .waterfall-container {
    padding: 8px;
  }

  .picture-info {
    padding: 10px;
  }

  .picture-title {
    font-size: 13px;
  }

  .category-tag,
  .tag-item {
    font-size: 11px;
    padding: 3px 6px;
  }
}

/* 暗色模式适配 */
@media (prefers-color-scheme: dark) {
  .picture-card {
    background: rgba(35, 41, 55, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .picture-title {
    color: #f0f2f5;
  }

  .loading-container,
  .empty-container {
    background: rgba(35, 41, 55, 0.8);
  }

  .tag-item {
    background: rgba(82, 196, 26, 0.15);
    border-color: rgba(82, 196, 26, 0.3);
  }
}
</style>
