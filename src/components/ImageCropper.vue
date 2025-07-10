<script setup lang="ts">
import { computed, onUnmounted, ref, watchEffect } from 'vue'
import { uploadPicture } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { VueCropper } from 'vue-cropper'
import 'vue-cropper/dist/index.css'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import PictureEditWebSocket from '@/utils/pictureEditWebSocket.ts'
import { PICTURE_EDIT_ACTION_ENUM, PICTURE_EDIT_MESSAGE_TYPE_ENUM } from '@/constant/picture.ts'
import { SPACE_TYPE_ENUM } from '@/constant/space.ts'

interface Props {
  imageUrl?: string
  picture?: API.PictureVO
  spaceId?: number
  space?: API.SpaceVO
  onSuccess?: (newPicture: API.PictureVO) => void
}

const props = defineProps<Props>()

// 是否为团队空间
const isTeamSpace = computed(() => {
  return props.space?.spaceType === SPACE_TYPE_ENUM.TEAM
})

// 编辑器组件的引用
const cropperRef = ref()

// 向左旋转
const rotateLeft = () => {
  cropperRef.value.rotateLeft()
  editAction(PICTURE_EDIT_ACTION_ENUM.ROTATE_LEFT)
}

// 向右旋转
const rotateRight = () => {
  cropperRef.value.rotateRight()
  editAction(PICTURE_EDIT_ACTION_ENUM.ROTATE_RIGHT)
}

// 缩放
const changeScale = (num: number) => {
  cropperRef.value.changeScale(num)
  if (num > 0) {
    editAction(PICTURE_EDIT_ACTION_ENUM.ZOOM_IN)
  } else {
    editAction(PICTURE_EDIT_ACTION_ENUM.ZOOM_OUT)
  }
}

// 确认裁剪
const handleConfirm = () => {
  cropperRef.value.getCropBlob((blob: Blob) => {
    // blob 为已经裁剪好的文件
    const fileName = (props.picture?.name || 'image') + '.png'
    const file = new File([blob], fileName, { type: blob.type })
    // 上传图片
    handleUpload({ file })
  })
}

// 是否可见
const visible = ref(false)

// 打开弹窗
const openModal = () => {
  visible.value = true
}

// 关闭弹窗
const closeModal = () => {
  visible.value = false
  // 断开 WebSocket 连接
  if (websocket) {
    websocket.disconnect()
  }
  editingUser.value = undefined
}

// 暴露函数给父组件调用
defineExpose({
  openModal,
})

const loading = ref(false)

/**
 * 上传图片
 * @param file
 */
const handleUpload = async ({ file }: any) => {
  loading.value = true
  try {
    const params: API.PictureUploadRequest = props.picture ? { id: props.picture.id } : {}
    params.spaceId = props.spaceId
    const res = await uploadPicture(params, {}, file)
    if (res.data.code === 0 && res.data.data) {
      // 将上传成功的图片信息传递给父组件
      message.success('图片上传成功')
      props.onSuccess?.(res.data.data)
      // 关闭弹窗
      closeModal()
    } else {
      message.error('图片上传失败，' + res.data.message)
    }
  } catch (error) {
    console.log('图片上传失败', error)
    message.error('图片上传失败，' + error.message)
  }
  loading.value = false
}

// --------- 实时编辑 ---------
const loginUerStore = useLoginUserStore()
const loginUser = loginUerStore.loginUser

// 正在编辑的用户
const editingUser = ref<API.UserVO>()
// 当前用户是否可进入编辑
const canEnterEdit = computed(() => {
  return !editingUser.value
})
// 当前用户是否可退出编辑，正在编辑的用户是当前登录用户才能退出编辑
const canExitEdit = computed(() => {
  return editingUser.value?.id === loginUser.id
})
// 可以点击编辑图片的操作按钮
const canEdit = computed(() => {
  // 不是团队空间，默认就可以编辑
  if (!isTeamSpace.value) {
    return true
  }
  // 团队空间，只有编辑者才能协同编辑
  return editingUser.value?.id === loginUser.id
})

// 编写 WebSocket 逻辑
let websocket: PictureEditWebSocket | null

// 初始化 WebSocket 连接，绑定监听事件
 const initWebSocket = () => {
  const pictureId = props.picture?.id
   if (!pictureId || !visible.value) {
     return
   }
   // 防止之前的连接未释放
   if (websocket) {
     websocket.disconnect()
   }
   // 创建 WebSocket 实例
   websocket = new PictureEditWebSocket(pictureId)
   // 建立连接
   websocket.connect();
   // 监听一系列的事件
   websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.INFO, (msg) => {
     console.log('收到通知消息：', msg);
     message.info(msg.message);
   })

   websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.ERROR, (msg) => {
     console.log('收到错误消息：', msg);
     msg.info(msg.message);
   })

   websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.ENTER_EDIT, (msg) => {
     console.log('收到进入编辑状态的消息：', msg);
     message.info(msg.message);
      editingUser.value = msg.user;
   })

   websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_ACTION, (msg) => {
     console.log('收到编辑操作的消息:', msg);
     message.info(msg.message);
     // 根据收到的编辑操作类型执行相应的操作
     switch (msg.editAction) {
       case PICTURE_EDIT_ACTION_ENUM.ROTATE_LEFT:
         rotateLeft();
         break
      case PICTURE_EDIT_ACTION_ENUM.ROTATE_RIGHT:
        rotateRight();
        break
      case PICTURE_EDIT_ACTION_ENUM.ZOOM_IN:
        changeScale(1);
        break
      case PICTURE_EDIT_ACTION_ENUM.ZOOM_OUT:
        changeScale(-1);
        break
      default:
        console.warn('未知的编辑操作:', msg.editAction);
        message.error('未知的编辑操作: ' + msg.editAction);
        break
     }
   })

   websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.EXIT_EDIT, (msg) => {
     console.log('收到退出编辑状态的消息：', msg);
     message.info(msg.message);
     editingUser.value = undefined;
   })
}

// 监听属性和 visible 变化，初始化 WebSocket 连接
watchEffect(() => {
  // 只有团队空间才初始化 WebSocket 连接
  if (isTeamSpace.value) {
    initWebSocket()
  }
})

// 组件销毁时，断开 WebSocket 连接
onUnmounted(() => {
  // 断开 WebSocket 连接
  if (websocket) {
    websocket.disconnect()
  }
  editingUser.value = undefined
})

// 进入编辑状态
const enterEdit = () => {
  if (websocket) {
    // 发送进入编辑状态的请求
    websocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.ENTER_EDIT,
    })
  }
}

// 退出编辑状态
const exitEdit = () => {
  if (websocket) {
    // 发送退出编辑状态的请求
    websocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.EXIT_EDIT,
    })
  }
}

// 编辑图片操作
const editAction = (action: string) => {
  if (websocket) {
    // 发送编辑操作的请求
    websocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_ACTION,
      editAction: action,
    })
  }
}
</script>

<template>
  <a-modal
    class="image-cropper"
    v-model:visible="visible"
    title="编辑图片"
    :footer="false"
    @cancel="closeModal"
  >
    <!-- 图片裁剪组件 -->
    <vue-cropper
      ref="cropperRef"
      :img="imageUrl"
      :autoCrop="true"
      :fixedBox="false"
      :centerBox="true"
      :canMoveBox="true"
      :info="true"
      outputType="png"
    />
    <div style="margin-bottom: 16px" />
    <!-- 协同编辑操作 -->
    <div class="image-edit-actions" v-if="isTeamSpace">
      <a-space>
        <a-button v-if="editingUser" disabled>{{ editingUser.userName }} 正在编辑</a-button>
        <a-button v-if="canEnterEdit" type="primary" ghost @click="enterEdit">进入编辑</a-button>
        <a-button v-if="canExitEdit" danger ghost @click="exitEdit">退出编辑</a-button>
      </a-space>
    </div>
    <div style="margin-bottom: 16px" />
    <!-- 图片操作 -->
    <div class="image-cropper-actions">
      <a-space>
        <a-button @click="rotateLeft" :disabled="!canEdit">向左旋转</a-button>
        <a-button @click="rotateRight" :disabled="!canEdit">向右旋转</a-button>
        <a-button @click="changeScale(1)" :disabled="!canEdit">放大</a-button>
        <a-button @click="changeScale(-1)" :disabled="!canEdit">缩小</a-button>
        <a-button type="primary" :loading="loading" @click="handleConfirm" :disabled="!canEdit">确认</a-button>
      </a-space>
    </div>
  </a-modal>
</template>

<style>
.image-cropper {
  text-align: center;
}

.image-cropper .vue-cropper {
  height: 400px !important;
}
</style>
