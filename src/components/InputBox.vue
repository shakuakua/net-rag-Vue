<template>
  <div class="input-container">
    <el-input
    :modelValue="chatStore.inputValue"
    @input="handleInput"
    type="textarea"
    class="input-textarea"
     :placeholder="chatStore.isGenerating ? 'AI 正在回复...' : '输入你的问题...'"
      :disabled="chatStore.isGenerating"
     @keydown.enter.prevent="chatStore.sendMessage"
    >
  </el-input>

  <div class="button-group">

    <el-upload
        class="upload-btn"
        :action="'/upload/pdf'"
        :http-request="chatStore.uploadFile"
        :disabled="chatStore.isGenerating || chatStore.isUploading"
        :limit="1"
        accept=".pdf,.docx,.doc,.md"
        >
        <el-button
          icon="Upload"
          type="default"
          :disabled="chatStore.isGenerating || chatStore.isUploading"
          class="upload-icon-btn"
        >选择文件</el-button>
      </el-upload>
           <!-- 解析文件按钮 -->
        <el-button
        icon="Document"
        type="default"
        :disabled="chatStore.isGenerating || !lastUploadedFile"
        class="parse-file-btn"
        @click="handleIngest"
      >
        解析文件
      </el-button>
  <!-- 发送按钮  -->
<!-- 发送按钮：绑定 Pinia 的状态，触发 Pinia 的方法 -->
    <el-button
    class="send-btn"
      type="primary"

      :disabled="!chatStore.inputValue.trim() || chatStore.isGenerating"
      @click="chatStore.sendMessage"
    >发送</el-button>
  </div>
  </div>
</template>

<script setup lang="ts">
// 导入pinia
import { useChatStore } from '@/store/chatStore';
import { computed } from 'vue'
// 获取仓库实例
const chatStore = useChatStore();
// 计算属性：获取最后上传的文件
const lastUploadedFile = computed(() => {
  // 从消息列表中找到最后一个文件类型的消息
  const fileMessages = chatStore.messageList
    .filter(msg => msg.type === 'file' && msg.fileInfo)
    .reverse(); // 倒序排列，最新的在前面

  return fileMessages.length > 0 && fileMessages[0] ? fileMessages[0].fileInfo : null;
});

// 处理解析文件
const handleIngest = async () => {
  if (!lastUploadedFile.value) return;

  try {

    console.log('开始解析文件...',lastUploadedFile);
    console.log('开始解析文件路径...',lastUploadedFile.value.url);
    await chatStore.ingestFile(lastUploadedFile.value.url);
  } catch (error) {
    console.error('解析文件出错:', error);
  }
};
const handleInput = (value: string) => {
  // 直接修改 Pinia 状态（Pinia 会自动触发响应式更新，所有使用该状态的组件都会刷新）
  chatStore.inputValue = value;
};
</script>

<style scoped>
.input-container {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid #eee;
  background-color: white;
}

.input-textarea {
  flex: 1;
  border-radius: 12px !important;
}

/* 覆盖 Element Plus 输入框样式 */
.input-textarea :deep(.el-textarea__inner) {
  border-radius: 12px !important;
  resize: none !important;
  padding: 12px 16px !important;
  height: auto !important;
  min-height: 120px !important;
}

.send-btn {
  border-radius: 50% !important;
  width: 65px;
  height: 65px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-group {
  display: flex;
  gap: 8px;
  align-items: center;
  height: auto;
}

.upload-btn {
  height: 48px;
  display: flex;
  align-items: center;
}

.upload-icon-btn {
  border-radius: 10px !important;
  height: 65px;
  border: 1px solid var(--el-border-color);
  background-color: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
  transition: all 0.3s;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.parse-file-btn{
  border-radius: 10px !important;
  height: 65px;
  border: 1px solid var(--el-border-color);
  background-color: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
  transition: all 0.3s;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
