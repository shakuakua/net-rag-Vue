<template>
  <div class="message-list-container" ref="listRef">
    <!-- 系统欢迎信息 -->
     <div class="system-message" v-if="messageList.length === 0">
      欢迎使用计算机网络智能助手，请输入问题进行对话。
     </div>

    <!-- 消息列表 -->
    <div class="message-list">
        <MessageItem
        v-for="msg in messageList"
        :message="msg"
        :key="msg.id"
        :msg="msg"
        ></MessageItem>
    </div>
  </div>
</template>

<script setup lang="ts">
import MessageItem from './MessageItem.vue';
import  { type Message } from '@/store/chatStore.ts';
import { ref,onMounted,watch } from 'vue';
const props = defineProps<{
  messageList: Message[];
  isGenerating:Boolean
}>();

// 消息列表 DOM 引用（用于自动滚动到底部）
const listRef = ref<HTMLDivElement | null>(null);

/**
 * 自动滚动到底部（新消息发送/AI 开始生成时触发）
 * 原理：通过修改 scrollTop 为 scrollHeight（内容总高度），实现滚动到底部
 */
const scrollToBottom = () => {
  if (listRef.value) {
    const container = listRef.value;
    // 强制 DOM 更新后再滚动（避免内容未渲染导致滚动失效）
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }
};

// 监听消息列表长度变化（新消息添加时），自动滚动到底部
watch(
  () => props.messageList.length,
  () => scrollToBottom()
);

// 监听 AI 生成状态变化（开始生成时），自动滚动到底部（显示加载动画）
watch(
  () => props.isGenerating,
  (isGenerating) => {
    if (isGenerating) scrollToBottom();
  }
);

// 组件挂载完成后，初始化滚动到底部（防止初始状态下内容被遮挡）
onMounted(() => scrollToBottom());

</script>

<style scoped>
/* 消息列表容器（占满父容器高度，带滚动条） */
.message-list-container {
  width: 100%;
  height: 100%;
  padding: 0px;
  overflow-y: auto;
  background-color: #f9f9f9;
  background-image: linear-gradient(0deg, #f5f5f5 0%, #f9f9f9 100%);
}

/* 系统提示消息 */
.system-message {
  text-align: center;
  padding: 12px 20px;
  margin: 10px auto 0;
  max-width: 60%;
  background-color: #e8f4f8;
  color: #4299e1;
  border-radius: 20px;
  font-size: 14px;
}

/* 消息列表包裹层 */
.message-list {
  margin-bottom: 16px;
}

/* AI 加载中动画 */
.ai-loading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-right: auto;
}

.loading-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.loading-bubble {
  padding: 12px 16px;
  border-radius: 18px;
  border-top-left-radius: 4px;
  background-color: white;
  border: 1px solid #eee;
}

/* 加载动画：三个圆点跳动 */
.loading-dot {
  display: inline-block;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dot:nth-child(1) { animation-delay: -0.32s; }
.loading-dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* 滚动条样式优化（桌面端） */
.message-list-container::-webkit-scrollbar { width: 6px; }
.message-list-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}
.message-list-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}
.message-list-container::-webkit-scrollbar-thumb:hover { background: #999; }
</style>
