<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { deleteSpace, listSpaceByPage } from '@/api/spaceController.ts'
import { message, type TablePaginationConfig } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  SPACE_LEVEL_MAP,
  SPACE_LEVEL_OPTIONS,
  SPACE_TYPE_MAP,
  SPACE_TYPE_OPTIONS,
} from '@/constant/space.ts'
import { formatSize } from '@/utils'

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 100,
  },
  {
    title: '空间名称',
    dataIndex: 'spaceName',
    width: 150,
    ellipsis: true,
  },
  {
    title: '空间级别',
    dataIndex: 'spaceLevel',
    width: 100,
  },
  {
    title: '空间类别',
    dataIndex: 'spaceType',
    width: 100,
  },
  {
    title: '使用情况',
    dataIndex: 'spaceUseInfo',
    width: 160,
  },
  {
    title: '用户ID',
    dataIndex: 'userId',
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 120,
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    width: 120,
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right',
  },
]

// 定义数据
const dataList = ref<API.Space[]>([])
const total = ref(0)

// 搜索条件
const searchParams = reactive<API.SpaceQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 获取数据
const fetchData = async () => {
  const res = await listSpaceByPage({
    ...searchParams,
  })
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败， ' + res.data.message)
  }
}

// 页面加载时获取数据，请求一次
onMounted(() => {
  fetchData()
})

// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current,
    pageSize: searchParams.pageSize,
    total: total.value,
    showTotal: (total: number) => `总共 ${total} 条`,
    showSizeChanger: true,
  }
})

// 表格变化之后重新获取数据
const doTableChange = (page: TablePaginationConfig) => {
  // 更新搜索条件
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  // 重新获取数据
  fetchData()
}

// 搜索数据
const doSearch = () => {
  // 重置当前页为1，因为搜索会从第一页开始
  searchParams.current = 1
  // 重新获取数据
  fetchData()
}

// 删除图片
const doDelete = async (id: number) => {
  if (!id) {
    message.error('图片ID不能为空')
    return
  }
  const res = await deleteSpace({ id })
  if (res.data.code === 0) {
    message.success('删除图片成功')
    // 重新获取数据
    fetchData()
  } else {
    message.error('删除图片失败， ' + res.data.message)
  }
}
</script>

<template>
  <div id="spaceManagePage">
    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <a-typography-title :level="3" style="margin: 0">空间管理</a-typography-title>
      <a-space wrap>
        <a-button type="primary" href="/add_space" target="_blank">+ 创建空间</a-button>
        <a-button href="/space_analyze?queryPublic=1" target="_blank">分析公共图库</a-button>
        <a-button href="/space_analyze?queryAll=1" target="_blank">分析全部空间</a-button>
      </a-space>
    </div>

    <a-card :bordered="false" style="border-radius: 16px; margin-bottom: 24px">
      <!-- 搜索表单 -->
      <a-form layout="inline" :model="searchParams" @finish="doSearch">
        <a-form-item label="空间名称">
          <a-input
            v-model:value="searchParams.spaceName"
            placeholder="请输入空间名称"
            allow-clear
          />
        </a-form-item>
        <a-form-item name="spaceLevel" label="空间级别">
          <a-select
            v-model:value="searchParams.spaceLevel"
            style="min-width: 180px"
            placeholder="请选择空间级别"
            :options="SPACE_LEVEL_OPTIONS"
            allow-clear
          />
        </a-form-item>
        <a-form-item name="spaceType" label="空间类别">
          <a-select
            v-model:value="searchParams.spaceType"
            style="min-width: 180px"
            placeholder="请选择空间类别"
            :options="SPACE_TYPE_OPTIONS"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="用户ID">
          <a-input v-model:value="searchParams.userId" placeholder="请输入用户ID" allow-clear />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit">搜索</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card :bordered="false" style="border-radius: 16px">
      <!-- 表格 -->
      <a-table
        :columns="columns"
        :data-source="dataList"
        :pagination="pagination"
        :scroll="{ x: 1200 }"
        row-key="id"
        @change="doTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'id'">
            <a-typography-text copyable>{{ record.id }}</a-typography-text>
          </template>
          <template v-else-if="column.dataIndex === 'spaceLevel'">
            <a-tag color="blue" style="font-size: 14px">{{
              SPACE_LEVEL_MAP[record.spaceLevel]
            }}</a-tag>
          </template>
          <template v-else-if="column.dataIndex === 'spaceType'">
            <a-tag color="green">{{ SPACE_TYPE_MAP[record.spaceType] }}</a-tag>
          </template>
          <template v-else-if="column.dataIndex === 'spaceUseInfo'">
            <div style="line-height: 1.4">
              <div style="font-size: 14px">
                {{ formatSize(record.totalSize) }} / {{ formatSize(record.maxSize) }}
              </div>
              <div style="font-size: 14px; color: #666">
                {{ record.totalCount }} / {{ record.maxCount }} 张
              </div>
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'userId'">
            <a-typography-text copyable>{{ record.userId }}</a-typography-text>
          </template>
          <template v-else-if="column.dataIndex === 'createTime'">
            <div style="font-size: 14px">
              {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm') }}
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'updateTime'">
            <div style="font-size: 14px">
              {{ dayjs(record.updateTime).format('YYYY-MM-DD HH:mm') }}
            </div>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space wrap>
              <a-button
                type="primary"
                ghost
                size="small"
                :href="`/space_analyze?spaceId=${record.id}`"
                target="_blank"
              >
                分析
              </a-button>
              <a-button
                type="primary"
                ghost
                size="small"
                :href="`/add_space?id=${record.id}`"
                target="_blank"
              >
                编辑
              </a-button>
              <a-popconfirm
                title="确定要删除该空间吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="doDelete(record.id)"
              >
                <a-button type="primary" danger size="small">删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<style scoped>
#spaceManagePage {
  padding: 24px;
  background-color: var(--ant-background);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 0;
}

:deep(.ant-card-body) {
  padding: 24px !important;
}

:deep(.ant-form-item) {
  margin-bottom: 16px !important;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 12px 8px !important;
  vertical-align: top;
}

:deep(.ant-table-thead > tr > th) {
  padding: 12px 8px !important;
  background-color: #fafafa;
  font-weight: 600;
}

:deep(.ant-typography-copy) {
  margin-left: 8px;
}

/* 响应式调整 */
@media (max-width: 992px) {
  :deep(.ant-form-item) {
    width: calc(50% - 8px);
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  #spaceManagePage {
    padding: 16px;
  }

  :deep(.ant-form-item) {
    width: 100%;
    margin-right: 0;
  }

  .page-header {
    padding: 16px 0;
  }
}
</style>
