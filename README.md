 # 🌐 Net-RAG Vue — 计算机网络智能问答助手

 > **基于 RAG（检索增强生成）架构的计算机网络知识问答系统前端**。支持 PDF / DOCX / Markdown 文档上传解析、向量检索、多模型配置，配合后端实现智能化知识问答。

 ## 项目概述

 一个专注于计算机网络领域的 RAG 智能问答系统前端界面。用户上传计算机网络相关文档（教材、PPT、笔记），系统解析后存入向量数据库，基于用户问题检索相关片段，结合 LLM 生成精准回答。支持独立的 LLM、Embedding、Reranker 模型配置。

 ## 技术栈

 | 层级 | 技术 |
 |------|------|
 | **前端框架** | Vue 3 + TypeScript |
 | **构建工具** | Vite |
 | **UI 组件库** | Element Plus |
 | **状态管理** | Pinia |
 | **HTTP 请求** | Axios |
 | **后端配合** | RAG 服务（向量检索 + LLM 推理） |

 ## 功能特性

 ### 智能问答
 - 基于 RAG（检索增强生成）的问答，回答建立在检索到的专业知识文档基础上
 - 支持连续对话，保留上下文
 - 流式/非流式两种回复模式

 ### 模型配置
 - **LLM 配置**：Base URL、API Key、模型名称（兼容 OpenAI API 格式）
 - **Embedding 配置**：Base URL、API Key、模型名称
 - **Reranker 配置**：DashScope API Key（重排序优化检索结果）

 ### 文档上传与解析
 - 支持 PDF 文件上传解析
 - 支持 DOCX（Word）文件上传解析
 - 支持 Markdown 文件上传解析
 - 文件解析完成后自动存入向量数据库

 ### 知识库管理
 - 一键重置向量数据库
 - 知识库状态可视化

 ## 快速开始

 ```bash
 npm install
 npm run dev
 ```

 默认运行在 `http://localhost:5173`

 > 需要同时运行配套的 RAG 后端服务。

 ### 配置模型

 点击界面右上角「模型配置」按钮，分别配置：

 1. **LLM 配置**：填写兼容 OpenAI 格式的 API 地址、密钥和模型名（如 `gpt-4o-mini`）
 2. **Embedding 配置**：填写 Embedding 模型的 API 地址、密钥和模型名
 3. **Reranker 配置**：填写阿里云 DashScope API 密钥

 ## 项目结构

 ```
 net-rag-Vue/
 ├── src/
 │   ├── App.vue                     # 主布局（顶部导航 + 侧边栏 + 对话区）
 │   ├── main.ts                     # 入口
 │   ├── components/
 │   │   ├── MessageList.vue         # 消息列表展示
 │   │   ├── MessageItem.vue         # 单条消息组件
 │   │   ├── InputBox.vue            # 输入框 + 文件上传
 │   │   └── ModelConfigDialog.vue   # 模型配置对话框（三标签页）
 │   ├── store/
 │   │   └── chatStore.ts            # 对话 + 文件上传 + 模型配置管理
 │   ├── types/
 │   │   └── index.ts                # TypeScript 类型定义
 │   └── assets/
 └── package.json
 ```

 ## API 参考

 | 端点 | 方法 | 说明 |
 |------|------|------|
 | `POST /rag/retrieve` | HTTP | 检索 + 生成回答 |
 | `POST /upload/pdf` | HTTP | 上传 PDF 文件 |
 | `POST /upload/docx` | HTTP | 上传 Word 文件 |
 | `POST /upload/md` | HTTP | 上传 Markdown 文件 |
 | `POST /ingest/ingest` | HTTP | 解析文件并存入向量库 |
 | `POST /api/model-config` | HTTP | 保存模型配置 |
 | `GET /rag/resetVectorStore` | HTTP | 重置向量数据库 |

 ## 页面截图

 页面主要区域：
 - 顶部导航栏：Logo + 「模型配置」按钮 + 「重置数据库」按钮
 - 左侧：历史对话列表
 - 中间：消息对话区 + 底部输入框（支持文本输入和文件上传）
