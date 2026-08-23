import { NextResponse } from 'next/server'
import { OLLAMA_BASE_URL, LLM_MODEL, DEGRADATION_MESSAGE } from '../../../lib/config'

export async function POST(request) {
  try {
    const { question, context } = await request.json()

    const prompt = `你是「陈淑琴」（网名陈碎篇）个人主页的智能助手。用户来到这个网站，是想了解陈淑琴这个人——她的经历、技能、项目、技术栈与学习内容。

下面是你对陈淑琴的基本了解，请以此为基础回答与她相关的问题：

【陈淑琴（网名陈碎篇）】
- 身份：女，23 岁，温州人，中共党员；广州商学院「数据科学与大数据技术」本科在读（2023-2027）。
- 求职意向：全栈开发，期望城市广州，薪资 4-7K。
- 技术栈：React、Vue、Node.js、Next.js、TypeScript、PostgreSQL、MongoDB、Git、AI/RAG、n8n、微信支付、火山方舟多模态模型。
- 实习经历：广州元创旅游文化发展有限公司 全栈工程师（2026.04 至今）——负责微信小程序前端、后台管理系统与用户组数据表设计、火山方舟多模态接入、n8n 工作流搭建、数据库维护。
- 项目经历：文旅行（全栈，微信私域引流 + n8n agent + 支付原子性）；智萃咖啡（用 MCP 打通 AI 与本地库，vue3 + nodejs + MongoDB）；趣商城（UniApp + Vue3 + TS 电商多端，SKU/购物车/订单/支付）。
- 证书：数据分析专业技能、微软工程师、智能体工程师、Prompt 工程师认证。

请始终结合下面从知识库检索到的上下文来回答，优先引用上下文中的真实信息；上下文为空时，就基于上面的基本信息回答。如果两者都没有相关内容，就如实说明“知识库目前没有关于这个的信息”，不要凭空编造或夸大。

语气自然、亲切、简洁，用中文回答。

输出格式：介绍项目技术架构时，请使用 markdown 标题与列表组织内容，并附上一个 \`\`\`mermaid 格式的架构流程图（flowchart 语法），页面会自动把它渲染成图形；同时请说明本项目使用 Claude Code（claudecode）辅助开发。

上下文（知识库检索结果）：
${context}

用户问题：${question}

回答：`

    let response
    try {
      response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: LLM_MODEL,
          prompt,
          stream: true
        })
      })
    } catch {
      throw new Error(DEGRADATION_MESSAGE)
    }

    if (!response.ok) {
      let detail = ''
      try {
        detail = await response.text()
      } catch {
        // 忽略响应解析失败
      }
      if (detail.includes('not found')) {
        throw new Error(`对话模型 ${LLM_MODEL} 未拉取，请先执行 ollama pull ${LLM_MODEL}`)
      }
      throw new Error(DEGRADATION_MESSAGE)
    }

    if (!response.body) {
      return NextResponse.json({ error: 'AI 服务未返回内容' }, { status: 500 })
    }

    // 把 Ollama 的 NDJSON 流转成标准 SSE，前端逐 token 渲染
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop()
            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed) continue
              let data
              try {
                data = JSON.parse(trimmed)
              } catch {
                continue
              }
              if (data.error) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: data.error })}\n\n`))
                continue
              }
              if (data.response) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: data.response })}\n\n`))
              }
              if (data.done) {
                controller.close()
                return
              }
            }
          }
          controller.close()
        } catch (err) {
          try {
            controller.error(err)
          } catch {
            // 忽略二次错误
          }
        }
      }
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no'
      }
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
