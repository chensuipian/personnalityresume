export const ARCHITECTURE_URL = 'internal://architecture'
export const ARCHITECTURE_TITLE = '项目技术架构（Next.js + Chroma + Ollama RAG）'

export const ARCHITECTURE_CONTENT = `# 陈碎篇个人网站 - 项目技术架构

## 项目概述
陈碎篇个人网站是一个基于 Next.js 14 的全栈 RAG 智能应用，展示个人简历、开源项目与 AI 知识库问答，核心目标是通过对话让用户了解陈淑琴（网名陈碎篇）。

## 技术栈
- 框架：Next.js 14.2（App Router）+ React 18 + Tailwind CSS
- 向量数据库：Chroma（chromadb/chroma:0.5.23），集合 juejin_docs
- 对话模型：Ollama + Qwen2.5:7b
- 嵌入模型：Ollama + bge-m3
- 部署：Docker Compose（standalone 输出，端口 3000）
- 开发辅助：全程使用 Claude Code（claudecode）辅助编码，负责功能开发与代码审查

## 系统架构
### 前端页面
- 首页 /：个人介绍、开源项目、链接
- 聊天页 /chat：知识库问答，支持 SSE 流式输出、markdown 富文本与 mermaid 流程图渲染
- 简历页 /resume：静态简历，支持打印 / 存为 PDF
- 管理页 /admin：知识库文档管理

### 后端 API
- /api/search：问题 → bge-m3 生成 query embedding → Chroma 相似度检索 top-5 → 取命中文档正文作上下文
- /api/chat：question + context → 组装 persona prompt → Qwen2.5:7b 流式生成 → 转 SSE 逐字返回
- /api/admin/add：向 Chroma 添加文档（支持 URL 抓取或直接粘贴内容）

## RAG 流程
\`\`\`mermaid
flowchart LR
  U[用户提问] --> A[/api/search/]
  A --> B[bge-m3 生成向量]
  B --> C[(Chroma 检索 top-5)]
  C --> D[取用文档正文作上下文]
  D --> E[/api/chat/]
  E --> F[qwen2.5:7b 流式生成]
  F --> G[SSE 逐字返回]
  G --> H[前端 markdown + mermaid 渲染]
  H --> U
\`\`\`

## 部署方式
- Docker Compose 构建 standalone 镜像，web 暴露 3000 端口
- Chroma 位于内网容器，Ollama 通过 host.docker.internal:11434 或 localhost:11434 访问
`
