<template>
  <div class="app-container">
  <header class="app-header">
    <div class="logo">
      <img src="/assets/Image_1730023624360.png" alt="logo"></img>
      <h1 >计网智能问答助手</h1>
    </div>

    <div class="header-actions">
    <!-- 添加模型配置按钮 -->
     <el-button type="primary" @click="showModelConfigDialog = true">
      模型配置
     </el-button>

     <!-- 重置数据库按钮 -->
     <el-button type="danger" @click="handleResetVectorStore" :loading="isResetting">
      重置数据库
     </el-button>
    </div>
  </header>

  <main class="app-main">
    <!-- 侧边栏 -->
      <aside class="app-sidebar">
        <div class="app-sidebar"
        :class="{ 'show': chatStore.showSidebar}"
      />
        <div class="sidebar-header">
          <h2>历史对话</h2>
        </div>

      </aside>

      <!-- 对话页面 -->
      <section class="chat-content">
        <MessageList :message-list="chatStore.messageList" :is-generating="chatStore.isGenerating"/>

        <!-- 输入框 -->
        <InputBox />
        <!-- 模型配置对话框 -->
        <ModelConfigDialog
      v-model:visible="showModelConfigDialog"
    />
      </section>
  </main>
</div>

</template>

<script setup lang="ts">
import MessageList from './components/MessageList.vue';
import InputBox from './components/InputBox.vue';
import { useChatStore } from '@/store/chatStore';
import { ref } from 'vue'
import ModelConfigDialog from './components/ModelConfigDialog.vue';
import { ElMessage } from 'element-plus';
const isResetting = ref(false)

const chatStore = useChatStore()
const showModelConfigDialog = ref(false)
// 处理重置向量存储
const handleResetVectorStore = async () => {
  try {
    isResetting.value = true;
    await chatStore.resetVectorStore();
    ElMessage.success('数据库重置成功');
  } catch (error) {
    ElMessage.error('重置数据库失败: ' + (error as Error).message);
  } finally {
    isResetting.value = false;
  }
}
</script>

<style scoped>
.app-container {
  width: 80%;
  /* max-width: 2400px; */
  margin: 0 auto;
  height: 100vh;
  display: flex;
  flex-direction: column;
  border: 1px solid #eee;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}


/* 顶部导航 */
/* 添加按钮容器样式 */
.header-actions {
  display: flex;
  gap: 12px;
}
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 60px;
  border-bottom: 1px solid var(--el-border-color);
  background-color: var(--el-bg-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

/* 消息列表占满剩余高度 */
.message-list-wrapper {
  flex: 1;
  position: relative;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo img {
  width: 32px;
  height: 32px;
  border-radius: 8px;
}

.logo h1 {
  font-size: 20px;
  font-weight: 600;
}

.menu-btn {
  display: none;
}

/* 主内容区 */
.app-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 侧边栏 */
.app-sidebar {
  width: 260px;
  border-right: 1px solid var(--el-border-color);
  background-color: var(--el-bg-color);
  transition: transform 0.3s ease;
  z-index: 20;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color);
}

.sidebar-header h2 {
  font-size: 16px;
  font-weight: 600;
}

.history-list {
  padding: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 4px;
  transition: background-color 0.2s;
}

.history-item.active {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.history-item:hover:not(.active) {
  background-color: var(--el-bg-color-container);
}

.history-icon {
  font-size: 16px;
}

/* 对话内容区 */
.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}



</style>
