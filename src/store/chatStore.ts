// stores/chatStore.ts
import { defineStore } from 'pinia';
import axios from 'axios';

// 定义消息类型接口（规范数据格式）
export interface Message {
  id: string; // 消息唯一标识
  content: string; // 消息内容
  isUser: boolean; // 是否是用户发送的消息（true=用户，false=AI）
  timestamp: number;
  type:'text'|'file';
  fileInfo?: {  // 新增文件信息字段
    name: string;
    url: string;
    size: number;
  };
}

// 创建 Pinia 仓库（参数1：仓库唯一标识，参数2：仓库配置）
export const useChatStore = defineStore('chat', {
  // state：存储共享状态（类似组件的 data）
  state: () => ({
    inputValue: '', // 输入框内容（共享状态，InputBox 组件和 App 组件都用到）
    messageList: [] as Message[], // 聊天消息列表（共享状态，消息列表组件和 App 组件用到）
    isGenerating: false, // AI 回复生成中状态（控制输入框禁用、按钮状态）
    showSidebar: false,
    isUploading: false,
    // 新增：模型配置相关状态
    llmSettings: {
      baseURL: '',
      apiKey: '',
      model: ''
    },
    embeddingSettings: {
      baseURL: '',
      apiKey: '',
      model: ''
    },
    rerankerSettings: {
      apiKey: ''
    }
  }),

  // actions：定义修改状态的方法（类似组件的 methods，支持异步）
  actions: {
    // 发送消息（核心方法：用户发送消息 + AI 回复）
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
        // 5. 调用后端 RAG 接口获取 AI 回复
        const response = await axios.post('/rag/retrieve', {
          text: content 
        });

        // 6. 添加 AI 回复到列表
        this.messageList.push({
          id: (Date.now() + 1).toString(),
          content: response.data.response,
          isUser: false,
          timestamp: Date.now(),
          type: 'text'
        });
      } catch (error) {
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

    // 上传文件并处理
    async uploadFile(file: any) {
      // 1. 验证文件存在性
      if (!file || !file.file) return;

      const fileData = file.file;
      this.isUploading = true;

      try {
        // 2. 创建 FormData 并添加文件
        const formData = new FormData();
        formData.append('file', fileData);

        // 3. 发送文件到后端（根据文件类型选择接口）
        let uploadUrl = '/upload/pdf'; // PDF接口
        if (fileData.type.includes('word')) {
          uploadUrl = '/upload/docx';
        } else if (fileData.type.includes('markdown') || fileData.name.endsWith('.md')) {
          uploadUrl = '/upload/md';
        }

        // 4. 调用后端接口上传文件
        const response = await axios.post(uploadUrl, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            // 处理上传进度
            const percent = (progressEvent.loaded / (progressEvent.total || 1)) * 100;
            console.log(`上传进度: ${percent.toFixed(2)}%`);
          }
        });

        // 5. 上传成功后添加文件消息到列表
        this.messageList.push({
          id: Date.now().toString(),
          content: `已上传文件: ${fileData.name}`,
          isUser: true,
          timestamp: Date.now(),
          type: 'file',
          fileInfo: {
            name: fileData.name,
            url: response.data.url || '', // 后端返回的文件URL
            size: fileData.size
          }
        });

        // 6. 上传成功后调用文件处理接口
        this.isGenerating = true;
        await axios.post('/ingest/process', {
          fileUrl: response.data.url,
          fileName: fileData.name
        });

        // 7. 处理完成后调用 RAG 接口生成解析结果
        const ragResponse = await axios.post('/rag/retrieve', {
          text: `请解析文件《${fileData.name}》并总结内容`
        });

        this.messageList.push({
          id: (Date.now() + 1).toString(),
          content: ragResponse.data.response, 
          isUser: false,
          timestamp: Date.now(),
          type: 'text'
        });

      } catch (error) {
        console.error('文件处理失败:', error);
        let errorMsg = '文件处理失败';
        if (axios.isAxiosError(error)) {
          // 显示后端返回的错误信息
          if (error.response?.data?.message) {
            errorMsg += `: ${error.response.data.message}`;
          } else {
            errorMsg += `: ${error.message} (状态码: ${error.response?.status})`;
          }
        }
        this.messageList.push({
          id: (Date.now() + 2).toString(),
          content: errorMsg,
          isUser: false,
          timestamp: Date.now(),
          type: 'text'
        });
      } finally {
        this.isUploading = false;
        this.isGenerating = false;
      }
    },

    // （可选）清空聊天记录（如需扩展功能可启用）
    clearMessageList() {
      this.messageList = [];
    }
  }
});