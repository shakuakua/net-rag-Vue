// stores/chatStore.ts
import { defineStore } from 'pinia';

// 定义消息类型接口（规范数据格式）
export interface Message {
  id: string; // 消息唯一标识
  content: string; // 消息内容
  isUser: boolean; // 是否是用户发送的消息（true=用户，false=AI）
  timestamp: number;
  type:'text'|'file';
}

// 创建 Pinia 仓库（参数1：仓库唯一标识，参数2：仓库配置）
export const useChatStore = defineStore('chat', {
  // state：存储共享状态（类似组件的 data）
  state: () => ({
    inputValue: '', // 输入框内容（共享状态，InputBox 组件和 App 组件都用到）
    messageList: [] as Message[], // 聊天消息列表（共享状态，消息列表组件和 App 组件用到）
    isGenerating: false, // AI 回复生成中状态（控制输入框禁用、按钮状态）
    showSidebar: false,
    isUploading:false
  }),

  // actions：定义修改状态的方法（类似组件的 methods，支持异步）
  actions: {     // 发送消息（核心方法：用户发送消息 + AI 模拟回复）
    async sendMessage() {
      // 1. 过滤空消息
      const content = this.inputValue.trim();
      if (!content) return;

      // 2. 添加用户消息到列表
      this.messageList.push({
        id: Date.now().toString(), // 用时间戳作为唯一 ID
        content,
        isUser: true,
        timestamp: Date.now(),
        type: 'text'
      });

      // 3. 清空输入框
      this.inputValue = '';

      // 4. 标记为「生成中」状态（禁用输入框和发送按钮）
      this.isGenerating = true;

      try {
        // 5. 模拟 AI 回复（实际项目中替换为接口请求，如调用 ChatGPT API）
        await new Promise(resolve => setTimeout(resolve, 1500)); // 模拟 1.5 秒接口延迟

        // 6. 添加 AI 回复到列表
        this.messageList.push({
          id: (Date.now() + 1).toString(),
          content: `已收到你的消息："${content}"（这是 AI 模拟回复）`,
          isUser: false,
          timestamp: Date.now(),
          type: 'text'
        });
      } catch (error) {
        // 错误处理（实际项目中可添加错误提示）
        console.error('AI 回复失败：', error);
        this.messageList.push({
          id: (Date.now() + 2).toString(),
          content: '抱歉，回复失败，请重试～',
          isUser: false,
          timestamp: Date.now(),
          type: 'text'
        });
      } finally {
        // 7. 无论成功失败，都取消「生成中」状态（启用输入框和发送按钮）
        this.isGenerating = false;
      }
    },

    async uploadFile(){

    },

    // （可选）清空聊天记录（如需扩展功能可启用）
    clearMessageList() {
      this.messageList = [];
    }
  }
});
