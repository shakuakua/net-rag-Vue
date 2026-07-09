 # 🌐 Net-RAG Vue — 计算机网络智能问答助手

 > **基于 RAG（检索增强生成）架构的计算机网络知识问答系统**。前端 Vue 3 + Element Plus，后端 NestJS + LangChain + Qdrant 向量数据库。

 ## 项目概述

 一个专注于计算机网络领域的 RAG 智能问答系统。用户上传计算机网络相关文档（教材、PPT、笔记），系统解析后存入 Qdrant 向量数据库，基于用户问题检索相关片段，经 Reranker 排序后用 LLM 生成精准回答。支持多个模型独立配置。

 ## 技术栈

 | 层级 | 技术 |
 |------|------|
 | **前端** | Vue 3 + TypeScript + Element Plus + Pinia + Axios |
 | **后端框架** | NestJS (TypeScript) |
 | **LLM 框架** | LangChain (ChatOpenAI / OpenAIEmbeddings) |
 | **向量数据库** | Qdrant |
 | **文档解析** | pdf-parse, mammoth (DOCX), MultiPart (MD/TXT) |
 | **Reranker** | 阿里云 DashScope qwen3-rerank |
 | **构建** | Vite (前端) / Nest CLI (后端) |

 ## 功能特性

 ### 智能问答
 - **RAG 检索增强**：检索知识库相关文档后结合 LLM 生成回答
 - **普通对话**：纯 LLM 对话（不检索文档）
 - **对话历史**：自动维护最近 10 轮对话上下文

 ### 模型配置（前端动态配置）
 - **LLM 配置**：Base URL + API Key + 模型名（兼容 OpenAI API 格式）
 - **Embedding 配置**：Base URL + API Key + 模型名（维度自动校验）
 - **Reranker 配置**：阿里云 DashScope API Key

 ### 文档管理
 - **支持格式**：PDF、DOCX、Markdown、TXT（单文件 20MB 以内）
 - **解析流程**：上传 → 自动解析 → 文本分块 → 向量化 → 入库
 - **文本分块**：标题感知的分块策略（按章节分段，RecursiveCharacter 细分，600 字符/块，150 重叠）
 - **知识库重置**：一键清空 Qdrant 向量库

 ### 向量检索
 - **相似度搜索**：余弦相似度检索 top-K 文档
 - **Rerank 重排序**：阿里云 qwen3-rerank 对检索结果进行语义重排序
 - **维度校验**：切换 Embedding 模型时自动校验向量维度兼容性

 ## 快速开始

 ### 后端（[LayyarVzz/net-rag](https://github.com/LayyarVzz/net-rag)）
 ```bash
 git clone https://github.com/LayyarVzz/net-rag
 cd net-rag
 npm install

 # 配置环境变量（LLM / Embedding / Qdrant / DashScope）
 cp .env.example .env
 # 编辑 .env 填入各项配置

 npm run start:dev   # 开发模式，默认 http://localhost:3001
 ```

 ### 前端
 ```bash
 # 本仓库
 npm install
 cp .env.example .env  # 配置后端 API 地址
 npm run dev           # 默认 http://localhost:5173
 ```

 ## 项目结构

 ```
 net-rag-Vue/               # ← 本仓库（前端）
 ├── src/
 │   ├── App.vue                    # 主布局
 │   ├── components/
 │   │   ├── MessageList.vue        # 消息列表
 │   │   ├── MessageItem.vue        # 单条消息
 │   │   ├── InputBox.vue           # 输入框 + 文件上传
 │   │   └── ModelConfigDialog.vue  # LLM/Embedding/Reranker 配置
 │   ├── store/chatStore.ts         # 对话 + 上传 + 配置状态管理
 │   ├── types/index.ts
 │   └── main.ts
 └── package.json

 net-rag/                   # ← 后端仓库 (LayyarVzz/net-rag)
 ├── src/
 │   ├── main.ts                   # NestJS 入口（端口 3001）
 │   ├── app.module.ts             # 根模块
 │   ├── rag/
 │   │   ├── rag.controller.ts     # REST API：/rag/retrieve, /rag/chat, /rag/settings/*
 │   │   ├── rag.service.ts        # RAG 核心编排（检索→Rerank→LLM）
 │   │   ├── llm/llm.service.ts    # LLM 调用（ChatOpenAI + 对话历史管理）
 │   │   ├── embedding/embedding.service.ts  # Embedding 服务
 │   │   └── qdrant/qdrant.service.ts        # Qdrant 向量检索 + Rerank 排序
 │   └── docs/
 │       ├── upload/               # 文件上传接口（PDF/DOCX/MD/TXT）
 │       └── ingest/               # 文档解析 + 分块 + 入库
 └── .env.example                  # 环境变量模板
 ```

 ## API 参考

 ### RAG 检索与对话
 | 端点 | 方法 | 说明 |
 |------|------|------|
 | `POST /rag/retrieve` | HTTP | RAG 检索 + LLM 生成回答 |
 | `POST /rag/chat` | HTTP | 纯 LLM 对话（无检索） |
 | `GET /rag/resetVectorStore` | HTTP | 清空 Qdrant 向量库 |
 | `GET /rag/queryTest` | HTTP | 测试 Embedding 接口 |

 ### 模型配置
 | 端点 | 方法 | 说明 |
 |------|------|------|
 | `POST /rag/settings/llm` | HTTP | 更新 LLM 模型参数 |
 | `POST /rag/settings/embedding` | HTTP | 更新 Embedding 模型（含维度校验） |
 | `POST /rag/settings/reranker` | HTTP | 更新 Reranker API Key |

 ### 文档上传与处理
 | 端点 | 方法 | 说明 |
 |------|------|------|
 | `POST /upload/pdf` | HTTP | 上传 PDF 文件 (20MB) |
 | `POST /upload/docx` | HTTP | 上传 DOCX 文件 (20MB) |
 | `POST /upload/md` | HTTP | 上传 Markdown 文件 (20MB) |
 | `POST /upload/txt` | HTTP | 上传 TXT 文件 (20MB) |
 | `POST /ingest/ingest` | HTTP | 解析已上传文件并注入向量库 |
 | `DELETE /upload/del/:type/:name` | HTTP | 删除已上传的文件 |

 ## 环境变量

 ```env
 # LLM 配置（兼容 OpenAI API）
 BASE_URL=https://api.openai.com/v1
 LLM_MODEL=gpt-4o-mini
 API_KEY=your-api-key

 # Embedding 配置
 EMBEDDING_BASE_URL=https://api.openai.com/v1
 EMBEDDING_API_KEY=your-api-key
 EMBEDDING_MODEL=text-embedding-3-small

 # Qdrant 向量数据库
 QDRANT_URL=http://localhost:6333
 QDRANT_COLLECTION_NAME=net_rag_docs

 # Reranker（阿里云 DashScope）
 DASHSCOPE_API_KEY=your-dashscope-api-key
 ```
