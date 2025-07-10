<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import logoIcon from '@/assets/logo.png';
import { editPictureByBatch, listPictureTagCategory } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue' // 导入图片

interface Props {
  pictureList: API.PictureVO[],
  spaceId: number,
  onSuccess: () => void
}

const props = withDefaults(defineProps<Props>(), {});
// 是否可见
const visible = ref(false)

// 打开弹窗
const openModal = () => {
  visible.value = true;
};

// 关闭弹窗
const closeModal = () => {
  visible.value = false;
};

// 暴露函数给父组件调用
defineExpose({
  openModal,
})

const formData = reactive<API.PictureEditByBatchRequest>({
  category: '',
  tags: [],
  nameRule: '',
})

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  if (!props.pictureList) {
    message.error('没有选择图片')
    return;
  }
  const res = await editPictureByBatch({
    pictureIdList: props.pictureList.map((picture) => picture.id),
    spaceId: props.spaceId,
    ...values,
  })
  // 操作成功
  if (res.data.code === 0 && res.data) {
    message.success('操作成功')
    closeModal();
    props.onSuccess?.()
  } else {
    message.error('操作失败， ' + res.data.message)
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
</script>

<template>
  <div class="batch-edit-picture-modal">
    <a-modal v-model:visible="visible" title="批量编辑图片" :footer="false" @cancel="closeModal">
      <a-typography-paragraph type="secondary">* 只对当前页面的图片生效</a-typography-paragraph>
      <!-- 图片信息表单 -->
      <a-form layout="vertical" :model="formData" @finish="handleSubmit">
        <a-form-item label="图片分类" name="category">
          <a-auto-complete
            v-model:value="formData.category"
            :options="categoryOptions"
            placeholder="请输入分类"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="图片标签" name="tags">
          <a-select
            v-model:value="formData.tags"
            mode="tags"
            :options="tagOptions"
            placeholder="请输入标签"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="命名规则" name="nameRule">
          <a-input v-model:value="formData.nameRule" placeholder="请输入命名规则，输入 {序号} 可动态生成" allow-clear />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" style="width: 100%">提交</a-button>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>

</style>

