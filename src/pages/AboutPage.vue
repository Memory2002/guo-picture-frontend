<script setup lang="ts">
import { ref } from 'vue'

// Modal state and functions
const isModalVisible = ref(false)
const showModal = () => {
  isModalVisible.value = true
}
const handleOk = () => {
  isModalVisible.value = false
}

// Todo list state and functions
interface TodoItem {
  text: string
  completed: boolean
}
const todoList = ref<TodoItem[]>([
  { text: '添加智能对话助手小晴', completed: false },
  { text: '添加图片评论功能', completed: false },
])
const toggleTodo = (item: TodoItem) => {
  item.completed = !item.completed
}
</script>

<template>
  <div class="about-container">
    <div class="about-section">
      <h3 class="section-title">项目说明</h3>
      <p>公共图库网站，登录可以创建个人和团队空间。</p>
    </div>

    <div class="about-section">
      <h3 class="section-title clickable" @click="showModal">项目背景</h3>
      <p>点击标题查看项目背后的故事和灵感来源。</p>
    </div>

    <a-modal v-model:open="isModalVisible" title="项目背景" @ok="handleOk" :footer="null">
      <div class="modal-content">
        <p>
          “在这段25年的旅途中，我看到各种各样的人、事、物，也尝过了各种的甘、涩、辛、甜，心里的感动总是一波一波的，好像无止境地扩大，好像整个心的跳动，
          能容纳全宇宙的跳动。我常常幻想，日落是什么样的场景，是否充满焦虑，是否满怀疑惑。到底曾经发生的真不真实地存在，还是说可以带着身边珍贵地这些人
          永远勇敢地保护心底深处的平静。这篇是致谢，感谢你，也感谢自己。” ——《就在日落以后》致谢词
        </p>
        <p>
          我常常在想，那些美好得不真实的夏天是否也曾经真实地存在，是在炎热的夏日里被温暖渐渐消融，又或是在记忆的长廊里被时光淡忘消散，越想记住的越模糊，
          越心爱的越心疼。剩下的是重复的生活，像机械的齿轮规律的转动。我们走着一样的路，看着同样的风景，看着头顶窄窄的小小的天空，过着重复的日子，
          看着夕阳被高楼遮挡，慢慢地落下去，不像繁星坠入山谷的决绝和耀眼，夕阳就这样沉沉坠下去，光影交替，像水漫过巨轮，像一个风筝，一颗心，落下。
        </p>
        <p>
          记忆中不曾停过的蝉鸣，头顶被斑驳树影分开的跃动光点，爬满墙壁的爬山虎，漫天飞舞的纸片是夏日的雪花，还有被大雨打碎的城市和冲散的人群······
          “七岁的那一年，抓住那只蝉，以为能抓住夏天。十七岁的那年，吻过她的脸，就以为和她能永远。”
        </p>
        <p>
          生活总是回到原点，像一个个定期到来的夏天。如果遇见就已经花费掉了所有的运气，那么失去也只是证明遇见太过美好，耀眼如流行划空，绚烂如烟花绽放。
        </p>
        <p>妍丽的夏天是温暖，跳动的光隙是永恒。 ——妍夏光隙</p>
      </div>
    </a-modal>

    <!-- <div class="about-section">
      <h3 class="section-title">Todo List</h3>
      <ul class="todo-list">
        <li
          v-for="(item, index) in todoList"
          :key="index"
          @click="toggleTodo(item)"
          :class="{ completed: item.completed }"
          class="todo-item"
        >
          <span class="checkbox">
            <span v-if="item.completed" class="checkmark">✓</span>
          </span>
          <span class="text">{{ item.text }}</span>
        </li>
      </ul>
    </div> -->
  </div>
</template>

<style scoped>
.about-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans',
    sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  color: #333;
}

.about-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 22px;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 8px;
  margin-bottom: 16px;
}

.section-title.clickable {
  cursor: pointer;
  transition: color 0.3s;
}

.section-title.clickable:hover {
  color: #1890ff;
}

p {
  line-height: 1.8;
  font-size: 15px;
  color: #555;
}

.modal-content p {
  margin-bottom: 1em;
  text-indent: 2em;
}

.todo-list {
  list-style: none;
  padding: 0;
}

.todo-item {
  display: flex;
  align-items: center;
  padding: 12px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 16px;
}

.todo-item:hover {
  background-color: #f7f7f7;
}

.todo-item.completed .text {
  text-decoration: line-through;
  color: #aaa;
}

.checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: 2px solid #1890ff;
  border-radius: 4px;
  margin-right: 12px;
  transition: background-color 0.2s;
}

.todo-item.completed .checkbox {
  background-color: #1890ff;
}

.checkmark {
  color: red;
  font-weight: bold;
  font-size: 16px;
  line-height: 1;
}

.text {
  transition: color 0.2s;
}
</style>
