<template>
  <div class="message-item" :class="[msg.isUser ? 'user-message' : 'ai-message']">
    <div class="message-avatar">
        <img :src="msg.isUser ? userAvatar: aiAvatar" alt="发送者头像" class="avatar-img"/>
    </div>

    <!-- 消息内容容器 -->
    <div class="message-content-container">
      <div class="message-header">
        <span class="sender-name">{{ msg.isUser ? '我' : 'AI助手' }}</span>
        <span class="send-time">{{ formatTime(msg.timestamp)}}</span>
      </div>

      <!-- 消息气泡 -->
      <div class="message-bubble">
        <!-- 文本消息 -->
        <template v-if="msg.type === 'text'">
          {{ msg.content }}
        </template>

        <!-- 文件消息 -->
        <template v-if="msg.type === 'file'">
          <div class="file-info">
            <el-icon class="file-icon"><Document /></el-icon>
            <div class="file-details">
              <div class="file-name">{{ msg.content }}</div> <!-- 显示文件名描述 -->
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {type Message} from '@/store/chatStore';
import { Document } from '@element-plus/icons-vue';

const userAvatar = "/assets/Image_1730023624360.png"
const aiAvatar = "/assets/4B0BC159E9D9A9B86B8B20E67D4EFD10.jpg"
defineProps<{
  msg: Message;
}>();

// 格式化时间戳为可读时间
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

</script>

<style scoped>
/* 消息项基础样式 */
.message-item {
  display: flex;
  align-items: flex-start;
  max-width: 80%;
  margin-bottom: 16px;
  transition: box-shadow 0.2s ease;
}

.message-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 用户消息：靠右对齐，头像在右 */
.user-message {
  margin-left: auto;
  flex-direction: row-reverse;
}

/* AI 消息：靠左对齐，头像在左 */
.ai-message {
  margin-right: auto;
  flex-direction: row;
}

/* 头像样式 */
.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0; /* 防止头像被压缩 */
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保持头像比例 */
}

/* 消息内容容器 */
.message-content-container {
  margin: 0 12px;
}

/* 消息头部（发送者 + 时间戳） */
.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  margin-bottom: 4px;
}

.sender-name {
  color: #666;
  font-weight: 500;
}

.send-time {
  color: #999;
  font-size: 11px;
}

/* 消息气泡样式 */
.message-bubble {
  padding: 12px 16px;
  border-radius: 18px;
  line-height: 1.6;
  font-size: 14px;
  word-break: break-word; /* 长文本自动换行 */
  white-space: pre-line; /* 支持换行符 \n 渲染 */
}

/* 用户消息气泡：蓝色背景 */
.user-message .message-bubble {
  background-color: #409eff;
  color: white;
  border-top-right-radius: 4px; /* 贴合头像的圆角优化 */
}

/* AI 消息气泡：白色背景 + 边框 */
.ai-message .message-bubble {
  background-color: white;
  color: #333;
  border: 1px solid #eee;
  border-top-left-radius: 4px; /* 贴合头像的圆角优化 */
}

/* 文件消息样式 */
.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.file-icon {
  color: #409eff;
  font-size: 18px;
}

.file-details {
  flex: 1;
  overflow: hidden;
}

.file-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
}

</style>

