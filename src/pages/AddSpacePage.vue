<script setup lang="ts">
import { computed, onMounted, reactive, ref, h } from 'vue'
import { message } from 'ant-design-vue'
import { addSpace, getSpaceVoById, listSpaceLevel, updateSpace } from '@/api/spaceController.ts'
import { useRoute, useRouter } from 'vue-router'
import { SPACE_LEVEL_OPTIONS, SPACE_TYPE_ENUM, SPACE_TYPE_MAP } from '@/constant/space.ts'
import { formatSize } from '@/utils'
import {
  StarOutlined,
  CrownOutlined,
  FireOutlined,
  ThunderboltOutlined,
  GiftOutlined,
} from '@ant-design/icons-vue'

const space = ref<API.SpaceVO>()
const spaceForm = reactive<API.SpaceAddRequest>({
  spaceLevel: undefined,
  spaceName: undefined,
})
const loading = ref(false)

const route = useRoute()
// 空间类别，默认为私有空间
const spaceType = computed(() => {
  if (route.query?.type) {
    return Number(route.query.type)
  } else {
    return SPACE_TYPE_ENUM.PRIVATE
  }
})

const spaceLevelList = ref<API.SpaceLevel[]>([])

// 获取空间级别列表
const fetchSpaceLevelList = async () => {
  const res = await listSpaceLevel()
  if (res.data.code === 0 && res.data.data) {
    spaceLevelList.value = res.data.data
  } else {
    message.error('获取空间级别列表失败， ' + res.data.message)
  }
}

onMounted(() => {
  fetchSpaceLevelList()
})
const router = useRouter()
/**
 * 提交表单
 */
const handleSubmit = async () => {
  const spaceId = space.value?.id
  loading.value = true
  let res
  // spaceId 存在，说明是更新空间
  if (spaceId) {
    res = await updateSpace({
      id: spaceId,
      ...spaceForm,
    })
  } else {
    // spaceId 不存在，说明是创建空间
    res = await addSpace({
      ...spaceForm,
      spaceType: spaceType.value,
    })
  }

  // 操作成功
  if (res.data.code === 0 && res.data) {
    message.success('操作成功')
    // 跳转到空间详情页
    router.push({
      path: `/space/${res.data.data}`,
    })
  } else {
    message.error('操作失败， ' + res.data.message)
  }
  loading.value = false
}

const getOldSpace = async () => {
  // 获取到id
  const id = route.query?.id
  if (id) {
    const res = await getSpaceVoById({ id: Number(id) })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      space.value = data
      // 填充表单数据
      spaceForm.spaceName = data.spaceName
      spaceForm.spaceLevel = data.spaceLevel
    } else {
      message.error('获取空间信息失败， ' + res.data.message)
    }
  }
}

onMounted(() => {
  getOldSpace()
})

// 根据空间级别获取对应图标
const getSpaceLevelIcon = (spaceLevel: number) => {
  switch (spaceLevel) {
    // case 0:
    //   return h(StarOutlined, { style: { color: '#52c41a' } })
    // case 1:
    //   return h(FireOutlined, { style: { color: '#fa541c' } })
    // case 2:
    //   return h(ThunderboltOutlined, { style: { color: '#1890ff' } })
    // case 3:
    //   return h(CrownOutlined, { style: { color: '#722ed1' } })
    // case 4:
    //   return h(GiftOutlined, { style: { color: '#eb2f96' } })
    // default:
    //   return h(StarOutlined, { style: { color: '#52c41a' } })

    case 0:
      return h(StarOutlined, { style: { color: '#52c41a' } })
    case 1:
      return h(ThunderboltOutlined, { style: { color: '#1890ff' } })
    case 2:
      return h(CrownOutlined, { style: { color: '#722ed1' } })
  }
}

// 根据空间级别获取标签颜色
const getSpaceLevelColor = (spaceLevel: number) => {
  switch (spaceLevel) {
    // case 0:
    //   return 'green'
    // case 1:
    //   return 'orange'
    // case 2:
    //   return 'blue'
    // case 3:
    //   return 'purple'
    // case 4:
    //   return 'magenta'
    // default:
    //   return 'green'
    case 0:
      return 'green'
    case 1:
      return 'blue'
    case 2:
      return 'purple'
    default:
      return 'green'
  }
}
</script>

<template>
  <div id="addSpacePage">
    <!-- 页面标题 -->
    <div class="page-header">
      <a-typography-title :level="3" style="margin: 0">
        {{ route.query?.id ? '修改' : '创建' }} {{ SPACE_TYPE_MAP[spaceType] }}
      </a-typography-title>
    </div>

    <!-- 空间信息表单 -->
    <a-card :bordered="false" style="border-radius: 16px; margin-bottom: 24px">
      <template #title>
        <span style="color: #1890ff">空间信息</span>
      </template>
      <a-form name="spaceForm" layout="vertical" :model="spaceForm" @finish="handleSubmit">
        <a-form-item label="空间名称" name="spaceName">
          <a-input
            v-model:value="spaceForm.spaceName"
            placeholder="请输入空间名称"
            size="large"
            allow-clear
          />
        </a-form-item>
        <a-form-item name="spaceLevel" label="空间级别">
          <a-select
            v-model:value="spaceForm.spaceLevel"
            size="large"
            style="width: 100%"
            placeholder="请选择空间级别"
            :options="SPACE_LEVEL_OPTIONS"
            allow-clear
          />
        </a-form-item>
        <a-form-item style="margin-top: 24px">
          <a-button
            type="primary"
            html-type="submit"
            :loading="loading"
            size="large"
            style="width: 100%; height: 48px; font-size: 16px"
          >
            {{ route.query?.id ? '保存修改' : '创建空间' }}
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 空间级别介绍 -->
    <a-card :bordered="false" style="border-radius: 16px">
      <template #title>
        <span style="color: #1890ff">空间级别介绍</span>
      </template>
      <a-typography-paragraph style="margin-bottom: 16px">
        <a-alert
          type="info"
          message="目前仅支持开通普通版，如需升级空间，请联系 Memory"
          show-icon
          style="margin-bottom: 16px"
        />
        <a href="https://codefather.cn" target="_blank" style="color: #1890ff">
          联系方式：guo_cheng@mail.ustc.edu.cn
        </a>
      </a-typography-paragraph>
      <a-space direction="vertical" style="width: 100%">
        <a-card
          v-for="spaceLevel in spaceLevelList"
          :key="spaceLevel.value"
          size="small"
          :bordered="false"
          style="background: #f9f9f9; border-radius: 8px"
        >
          <a-row align="middle">
            <a-col :span="6">
              <a-space>
                <component :is="getSpaceLevelIcon(spaceLevel.value ?? 0)" />
                <a-tag :color="getSpaceLevelColor(spaceLevel.value ?? 0)" style="margin: 0">
                  {{ spaceLevel.text }}
                </a-tag>
              </a-space>
            </a-col>
            <a-col :span="9">
              <span style="color: #666"> 存储空间：{{ formatSize(spaceLevel.maxSize) }} </span>
            </a-col>
            <a-col :span="9">
              <span style="color: #666"> 图片数量：{{ spaceLevel.maxCount }} 张 </span>
            </a-col>
          </a-row>
        </a-card>
      </a-space>
    </a-card>
  </div>
</template>

<style scoped>
#addSpacePage {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  background-color: var(--ant-background);
}

.page-header {
  margin-bottom: 24px;
  text-align: center;
}

:deep(.ant-card-body) {
  padding: 24px !important;
}

:deep(.ant-form-item-label > label) {
  color: #262626;
  font-weight: 600;
}

/* 响应式调整 */
@media (max-width: 768px) {
  #addSpacePage {
    padding: 16px;
    max-width: 100%;
  }
}
</style>
