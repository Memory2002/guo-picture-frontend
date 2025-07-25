<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { deleteUser, listUserVoByPage } from '@/api/userController.ts'
import { message, type TablePaginationConfig } from 'ant-design-vue'
import dayjs from 'dayjs'

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
  },
  {
    title: '账号',
    dataIndex: 'userAccount',
  },
  {
    title: '用户名',
    dataIndex: 'userName',
  },
  {
    title: '头像',
    dataIndex: 'userAvatar',
  },
  {
    title: '简介',
    dataIndex: 'userProfile',
  },
  {
    title: '用户角色',
    dataIndex: 'userRole',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]

// 定义数据
const dataList = ref<API.UserVO[]>([])
const total = ref(0)

// 搜索条件
const searchParams = reactive<API.UserQueryRequest>({
  current: 1,
  pageSize: 10,
})

// 获取数据
const fetchData = async () => {
  const res = await listUserVoByPage({
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
    showTotal: (t: number) => `总共 ${t} 条`,
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

// 删除用户
const doDelete = async (id: number) => {
  if (!id) {
    message.error('用户ID不能为空')
    return
  }
  const res = await deleteUser({ id })
  if (res.data.code === 0) {
    message.success('删除用户成功')
    // 重新获取数据
    fetchData()
  } else {
    message.error('删除用户失败， ' + res.data.message)
  }
}
</script>

<template>
  <div id="userManagePage">
    <a-card :bordered="false" style="border-radius: 16px; margin-bottom: 24px">
      <!-- 搜索表单 -->
      <a-form layout="inline" :model="searchParams" @finish="doSearch">
        <a-form-item label="账号">
          <a-input v-model:value="searchParams.userAccount" placeholder="输入账号" allow-clear />
        </a-form-item>
        <a-form-item label="用户名">
          <a-input v-model:value="searchParams.userName" placeholder="输入用户名" allow-clear />
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
        row-key="id"
        @change="doTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'userAvatar'">
            <a-avatar :src="record.userAvatar" :size="48" />
          </template>
          <template v-else-if="column.dataIndex === 'userRole'">
            <a-tag :color="record.userRole === 'admin' ? 'green' : 'blue'">
              {{ record.userRole === 'admin' ? '管理员' : '普通用户' }}
            </a-tag>
          </template>
          <template v-else-if="column.dataIndex === 'createTime'">
            {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
          <template v-else-if="column.dataIndex === 'updateTime'">
            {{ dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-popconfirm
              title="确定要删除该用户吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="doDelete(record.id)"
            >
              <a-button type="primary" danger>删除</a-button>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<style scoped>
#userManagePage {
  padding: 24px;
  background-color: var(--ant-background);
}

:deep(.ant-card-body) {
  padding: 24px !important;
}

/* 响应式调整 */
@media (max-width: 768px) {
  #userManagePage {
    padding: 16px;
  }
  :deep(.ant-form-item) {
    width: 100%;
    margin-right: 0;
    margin-bottom: 16px !important;
  }
}
</style>
