<script setup lang="ts">
import GlobalHeader from '@/components/GlobalHeader.vue'
import GlobalSider from '@/components/GlobalSider.vue'
import { GithubOutlined } from '@ant-design/icons-vue'
</script>

<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <a-layout>
        <!--侧边栏和内容区是同级，可以在外面再套一层layout-->
        <GlobalSider class="sider" />
        <a-layout-content class="content">
          <router-view />
        </a-layout-content>
      </a-layout>

      <a-layout-footer class="footer">
        <!-- 妍夏光隙 by
        <a href="https://github.com/Memory2002" target="_blank" style="margin-left: 6px">
          <GithubOutlined style="font-size: 18px; vertical-align: middle"> Memory </GithubOutlined>
        </a> -->
        <div class="footer-content">
          <a-space size="small">
            <HeartOutlined style="color: #ff6b6b; animation: heartbeat 2s ease-in-out infinite" />
            <span>妍夏光隙</span>
            <span style="color: #999">by</span>
            <a href="https://github.com/Memory2002" target="_blank" class="footer-link">
              <GithubOutlined style="margin-right: 4px" />
              Memory
            </a>
          </a-space>
        </div>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<style scoped>
#basicLayout .header {
  padding-inline: 20px;
  background: white;
  color: unset;
  margin-bottom: 1px;
}

#basicLayout .sider {
  background: #fff;
  border-right: 0.5px solid #eee;
  padding-top: 20px;
}

#basicLayout :deep(.ant-menu-root) {
  border-bottom: none !important;
  border-inline-end: none !important;
}

#basicLayout .content {
  padding: 28px;
  background: linear-gradient(to right, #fefefe, #fff);
  margin-bottom: 28px;
}

#basicLayout .footer {
  background: #efefef;
  padding: 16px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  z-index: 6;
}

.footer-content {
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--footer-text-color);
  font-size: 14px;
}
</style>
