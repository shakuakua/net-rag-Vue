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
        :action="''"
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

// 获取仓库实例
const chatStore = useChatStore();

// const props = defineProps({
//   inputValue:{
//     type:String,
//   },
// })

// const emit = defineEmits(['update:inputValue']);
// const handleInput =(value:string)=>{
//    emit('update:inputValue',value);
// }
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
.el-textarea__inner {
  border-radius: 12px !important;
  resize: none;
  padding: 12px 16px !important;
}

.send-btn {
  border-radius: 50% !important;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-group {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  height: fit-content;
}

.upload-btn {
  height: 48px;
  display: flex;
  align-items: center;
}

.upload-icon-btn {
  border-radius: 10px !important;
  height: 50px;
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
