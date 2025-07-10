<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { deleteSpace, listSpaceByPage } from '@/api/spaceController.ts'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { SPACE_LEVEL_MAP, SPACE_LEVEL_OPTIONS } from '@/constant/space.ts'
import { formatSize } from '@/utils'

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: '空间名称',
    dataIndex: 'spaceName',
  },
  {
    title: '空间级别',
    dataIndex: 'spaceLevel',
  },
  {
    title: '使用情况',
    dataIndex: 'spaceUseInfo',
  },
  {
    title: '用户 id',
    dataIndex: 'userId',
    width: 80,
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
    <a-flex justify="space-between">
      <h2>空间管理</h2>
      <a-space>
        <a-button type="primary" href="/add_space" target="_blank">+ 创建空间</a-button>
        <a-button type="primary" ghost href="/space_analyze?queryPublic=1" target="_blank">分析公共图库</a-button>
        <a-button type="primary" ghost href="/space_analyze?queryAll=1" target="_blank">分析全部空间</a-button>
      </a-space>
    </a-flex>
    <div style="margin-bottom: 16px" />

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
      <a-form-item label="用户 id">
        <a-input v-model:value="searchParams.userId" placeholder="请输入用户 id" allow-clear />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">搜索</a-button>
      </a-form-item>
    </a-form>

    <div style="margin-bottom: 16px" />
    <!-- 表格 -->
    <a-table
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      @change="doTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'spaceLevel'">
          <div>{{ SPACE_LEVEL_MAP[record.spaceLevel] }}</div>
        </template>
        <template v-else-if="column.dataIndex === 'spaceUseInfo'">
          <div>大小：{{ formatSize(record.totalSize) }} / {{ formatSize(record.maxSize) }}</div>
          <div>数量：{{ record.totalCount }} / {{ record.maxCount }}</div>
        </template>

        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.dataIndex === 'updateTime'">
          {{ dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space wrap>
            <a-button type="primary" ghost :href="`/space_analyze?spaceId=${record.id}`" target="_blank">
              分析
            </a-button>
            <!--            下面把编辑按钮的type从link改成了primary-->
            <a-button type="primary" ghost :href="`/add_space?id=${record.id}`" target="_blank">
              编辑
            </a-button>
            <a-button danger @click="doDelete(record.id)">删除</a-button>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>

<style scoped></style>
