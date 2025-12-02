// stores/chatStore.ts
import { defineStore } from 'pinia';
import axios from 'axios';
import { Aim } from '@element-plus/icons-vue';

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


// 定义模型配置接口
export interface ModelConfig{
  llm:{
    baseURL: string,
    apiKey: string,
    model: string
  };
  embedding:{
    baseURL: string,
    apiKey: string,
    model: string
  };
  reranker:{
    apiKey:string
  }
}

// 创建 Pinia 仓库（参数1：仓库唯一标识，参数2：仓库配置）
export const useChatStore = defineStore('chat', {
  // state：存储共享状态（类似组件的 data）
  state: () => ({
    inputValue: '', // 输入框内容（共享状态，InputBox 组件和 App 组件都用到）
    messageList: [] as Message[], // 聊天消息列表（共享状态，消息列表组件和 App 组件用到）
    isGenerating: false, // AI 回复生成中状态（控制输入框禁用、按钮状态）
    showSidebar: false,
    isUploading:false,
    modelConfig:{} as ModelConfig,
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

        // 4. 调用后端接口
        const response = await axios.post(uploadUrl, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            // 处理上传进度
            const percent = (progressEvent.loaded / (progressEvent.total || 1)) * 100;
            console.log(`上传进度: ${percent.toFixed(2)}%`);
          }
        });
        // 查看response
        console.log('上传的文件:', fileData);
        console.log('上传成功:', response);
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

        // 6. 模拟AI对文件的回复
        this.isGenerating = true;
        await new Promise(resolve => setTimeout(resolve, 2000));
        this.messageList.push({
          id: (Date.now() + 1).toString(),
          content: `已收到文件《${fileData.name}》，正在处理中...`,
          isUser: false,
          timestamp: Date.now(),
          type: 'text'
        });

      } catch (error) {
        console.error('文件上传失败:', error);
        let errorMsg = '文件上传失败';
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
    },


    // 保存模型配置(调用后端接口)
   async saveModelConfig(configType: keyof ModelConfig, config: any) {
      try {
        const apiUrl = `rag/settings/${configType}`;
        console.log(`Saving ${configType} config:`, config,'url:',apiUrl);
        const response = await axios.post(apiUrl, config);

        if (response.data.code === 200) {
          // 保存成功后更新 store 中的配置
          (this.modelConfig[configType] as any) = { ...config };
        }

        return response.data;
      } catch (error) {
        console.error('保存模型配置失败:', error);
        throw error;
      }
    },

    // 解析选择的文件
    async ingestFile(filePath: string) {
      try{
        this.isGenerating = true;
        console.log('开始解析文件:', filePath);
        console.log("消息列表",this.messageList)
        const response = await axios.post('/ingest/ingest',{ filePath },{
          headers:{
            'Content-Type': 'application/json'
          }
        });
        console.log(response)
      // 添加系统消息到聊天列表
      this.messageList.push({
       id: Date.now().toString(),
        content: `文件 "${filePath}" 解析完成`,
        isUser: false,
        timestamp: Date.now(),
        type: 'text'
    });
      }catch(error){
        console.error('文件解析失败:', error);
         if (axios.isAxiosError(error)) {
      console.error('详细错误信息:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        requestURL: error.config?.url
      });
    }

        let errorMsg = '文件解析失败';
        if (axios.isAxiosError(error)) {
        if (error.response?.data?.message) {
        errorMsg += `: ${error.response.data.message}`;
      } else {
        errorMsg += `: ${error.message} (状态码: ${error.response?.status})`;
      }
    }
    // aih回复错误信息
      this.messageList.push({
        id: (Date.now() + 1).toString(),
        content: errorMsg,
        isUser: false,
        timestamp: Date.now(),
        type: 'text'
    });

      throw error;
  } finally {
    this.isGenerating = false;
  }
    },
     // 重置向量存储数据库
    async resetVectorStore() {
      try {
        const response = await axios.get('rag/resetVectorStore');
        return response.data;
      } catch (error) {
        console.error('重置数据库失败:', error);
        throw error;
      }
    }
  }

});
