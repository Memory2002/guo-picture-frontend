<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { deletePicture, listPictureByPage, doPictureReview } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  PIC_REVIEW_STATUS_ENUM,
  PIC_REVIEW_STATUS_MAP,
  PIC_REVIEW_STATUS_OPTIONS,
} from '@/constant/picture.ts'

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 100,
  },
  {
    title: '图片',
    dataIndex: 'url',
    width: 100,
  },
  {
    title: '名称',
    dataIndex: 'name',
    width: 120,
    ellipsis: true,
  },
  {
    title: '简介',
    dataIndex: 'introduction',
    width: 150,
    ellipsis: true,
  },
  {
    title: '类型',
    dataIndex: 'category',
    width: 80,
  },
  {
    title: '标签',
    dataIndex: 'tags',
    width: 120,
  },
  {
    title: '图片信息',
    dataIndex: 'picInfo',
    width: 140,
  },
  {
    title: '用户ID',
    dataIndex: 'userId',
    width: 100,
  },
  {
    title: '审核信息',
    dataIndex: 'reviewMessage',
    width: 160,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 120,
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime',
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
const dataList = ref<API.Picture[]>([])
const total = ref(0)

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 获取数据
const fetchData = async () => {
  const res = await listPictureByPage({
    ...searchParams,
    nullSpaceId: true, // 不加的话就能看到其他用户私人空间的图片了 :)
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
const doTableChange = (page: any) => {
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
  const res = await deletePicture({ id })
  if (res.data.code === 0) {
    message.success('删除图片成功')
    // 重新获取数据
    fetchData()
  } else {
    message.error('删除图片失败， ' + res.data.message)
  }
}

// 审核图片
const handleReview = async (record: API.Picture, reviewStatus: number) => {
  const reviewMessage =
    reviewStatus === PIC_REVIEW_STATUS_ENUM.PASS ? '管理员审核通过' : '管理员审核拒绝'
  const res = await doPictureReview({
    id: record.id,
    reviewStatus,
    reviewMessage,
  })
  if (res.data.code === 0) {
    message.success('审核操作成功')
    // 重新获取列表数据
    fetchData()
  } else {
    message.error('审核操作失败， ' + res.data.message)
  }
}
</script>

<template>
  <div id="pictureManagePage">
    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <a-typography-title :level="3" style="margin: 0">图片管理</a-typography-title>
      <a-space wrap>
        <a-button type="primary" href="/add_picture" target="_blank">+ 创建图片</a-button>
        <a-button href="/add_picture/batch" target="_blank">+ 批量创建图片</a-button>
      </a-space>
    </div>

    <a-card :bordered="false" style="border-radius: 16px; margin-bottom: 24px">
      <!-- 搜索表单 -->
      <a-form layout="inline" :model="searchParams" @finish="doSearch">
        <a-form-item label="关键词">
          <a-input
            v-model:value="searchParams.searchText"
            placeholder="从名称和简介搜索"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="类型">
          <a-input v-model:value="searchParams.category" placeholder="请输入类型" allow-clear />
        </a-form-item>
        <a-form-item label="标签">
          <a-select
            v-model:value="searchParams.tags"
            mode="tags"
            placeholder="请输入标签"
            style="width: 180px"
            allow-clear
          />
        </a-form-item>
        <a-form-item name="reviewStatus" label="审核状态">
          <a-select
            v-model:value="searchParams.reviewStatus"
            style="min-width: 180px"
            placeholder="请选择审核状态"
            :options="PIC_REVIEW_STATUS_OPTIONS"
            allow-clear
          />
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
        :scroll="{ x: 1400 }"
        row-key="id"
        @change="doTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'id'">
            <a-typography-text copyable>{{ record.id }}</a-typography-text>
          </template>
          <template v-else-if="column.dataIndex === 'url'">
            <a-avatar :src="record.url" :size="64" shape="square" />
          </template>
          <template v-else-if="column.dataIndex === 'tags'">
            <a-space wrap>
              <a-tag
                v-for="tag in JSON.parse(record.tags || '[]')"
                :key="tag"
                color="blue"
                style="margin-bottom: 2px; margin-right: 2px"
              >
                {{ tag }}
              </a-tag>
            </a-space>
          </template>
          <template v-else-if="column.dataIndex === 'picInfo'">
            <div style="line-height: 1.4">
              <div>{{ record.picFormat }}</div>
              <div>{{ record.picWidth }}×{{ record.picHeight }}</div>
              <div>{{ (record.picSize / 1024).toFixed(1) }}KB</div>
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'userId'">
            <a-typography-text copyable>{{ record.userId }}</a-typography-text>
          </template>
          <template v-else-if="column.dataIndex === 'reviewMessage'">
            <div style="line-height: 1.4">
              <a-tag
                :color="
                  record.reviewStatus === PIC_REVIEW_STATUS_ENUM.PASS
                    ? 'green'
                    : record.reviewStatus === PIC_REVIEW_STATUS_ENUM.REJECT
                      ? 'red'
                      : 'orange'
                "
                style="margin-bottom: 4px"
              >
                {{
                  PIC_REVIEW_STATUS_MAP[record.reviewStatus as keyof typeof PIC_REVIEW_STATUS_MAP]
                }}
              </a-tag>
              <div
                v-if="record.reviewMessage"
                style="font-size: 12px; color: #666; margin-top: 4px"
              >
                {{ record.reviewMessage }}
              </div>
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'createTime'">
            <div style="font-size: 12px">
              {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm') }}
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'editTime'">
            <div style="font-size: 12px">
              {{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm') }}
            </div>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space wrap>
              <a-button
                v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.PASS"
                type="primary"
                size="small"
                @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.PASS)"
              >
                通过
              </a-button>
              <a-button
                v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.REJECT"
                danger
                size="small"
                @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.REJECT)"
              >
                拒绝
              </a-button>
              <a-button
                type="primary"
                ghost
                size="small"
                :href="`/add_picture?id=${record.id}`"
                target="_blank"
              >
                编辑
              </a-button>
              <a-popconfirm
                title="确定要删除该图片吗？"
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
#pictureManagePage {
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
  #pictureManagePage {
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
