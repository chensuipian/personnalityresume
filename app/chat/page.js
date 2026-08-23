'use client'
import { useState } from 'react'
import Link from 'next/link'
import { MessageSquare, Lightbulb, Bot, Paperclip, Loader2, Send, Sparkles } from 'lucide-react'
import Markdown from './markdown'

const QUICK_QUESTIONS = ['介绍一下你自己', '介绍一下此项目的技术架构', '你的求职意向是什么']

export default function ChatPage() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSend(question)
  }

  const handleSend = async (text) => {
    if (!text.trim() || loading) return

    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setQuestion('')
    setLoading(true)

    try {
      // 1. 搜索相关文档
      const searchRes = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg.content })
      })

      if (!searchRes.ok) {
        throw new Error('搜索服务不可用')
      }

      const data = await searchRes.json()

      // 兜底：知识库相关性不足，推荐相近文档给用户选择，不再调 AI 生成
      if (data.fallback) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message || '知识库中暂时没有找到相关内容。',
          links: data.results || []
        }])
        setLoading(false)
        return
      }

      const { contexts, results, error: searchError } = data

      if (searchError) {
        throw new Error(searchError)
      }

      // 2. 获取 AI 回答（SSE 流式）
      const chatRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMsg.content,
          context: contexts?.join('\n\n') || ''
        })
      })

      if (!chatRes.ok) {
        const errData = await chatRes.json().catch(() => ({}))
        throw new Error(errData.error || 'AI 服务不可用')
      }

      if (!chatRes.body) {
        throw new Error('AI 服务未返回内容')
      }

      // 先放入占位气泡，流式过程中持续填充
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '',
        streaming: true,
        sources: results?.map(r => r.title) || []
      }])

      const reader = chatRes.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let answer = ''

      const append = (text) => {
        answer += text
        setMessages(prev => {
          const next = [...prev]
          const last = next[next.length - 1]
          next[next.length - 1] = { ...last, content: answer }
          return next
        })
      }

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const parts = buffer.split('\n\n')
          buffer = parts.pop()
          for (const part of parts) {
            for (const line of part.split('\n')) {
              if (!line.startsWith('data:')) continue
              const json = line.slice(5).trim()
              if (!json) continue
              let payload
              try {
                payload = JSON.parse(json)
              } catch {
                continue
              }
              if (payload.error) {
                append(`\n\n抱歉，${payload.error}`)
              } else if (payload.text) {
                append(payload.text)
              }
            }
          }
        }
        setMessages(prev => {
          const next = [...prev]
          const last = next[next.length - 1]
          if (last?.streaming) next[next.length - 1] = { ...last, streaming: false }
          return next
        })
      } catch (err) {
        setMessages(prev => {
          const next = [...prev]
          const last = next[next.length - 1]
          next[next.length - 1] = { ...last, content: (last?.content || '') + '\n\n抱歉，网络中断，回答不完整。' }
          return next
        })
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `抱歉，${error.message || '服务暂时不可用，请稍后重试。'}`
      }])
    }

    setLoading(false)
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="bg-white/80 backdrop-blur sticky top-0 z-10 border-b border-primary-light">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">陈碎篇</Link>
          <nav className="flex items-center gap-6 text-sm text-primary">
            <Link href="/" className="opacity-70 hover:opacity-100">首页</Link>
            <Link href="/chat" className="font-medium">AI 聊天</Link>
            <Link href="/admin" className="opacity-70 hover:opacity-100">管理</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 min-h-0 max-w-4xl mx-auto w-full px-6 py-8 flex flex-col">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-primary mb-6">
          <MessageSquare size={22} /> 知识库问答
        </h1>

        <div className="flex items-center gap-2 bg-primary-light/40 px-4 py-3 rounded-xl mb-6 text-sm text-primary/80">
          <Lightbulb size={16} className="shrink-0" />
          本知识库基于稀土掘金学习文档构建，可以询问技术问题、作者分享的内容等。
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 mb-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center text-primary/50 py-16">
              <Sparkles size={40} className="mb-4" />
              <p>问我任何关于稀土掘金文档的问题吧！</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 shrink-0 rounded-full bg-primary-light flex items-center justify-center">
                  <Bot size={16} className="text-primary" />
                </div>
              )}
              <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-white rounded-br-sm' : 'bg-white shadow-sm rounded-bl-sm'}`}>
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="flex items-start gap-1">
                    <div className="min-w-0 flex-1">
                      <Markdown content={msg.content} streaming={msg.streaming} />
                    </div>
                    {msg.streaming && <span className="inline-block w-[3px] h-4 bg-primary/70 animate-pulse mt-1 shrink-0" />}
                  </div>
                )}
                {msg.links?.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {msg.links.map((l, j) => (
                      <a
                        key={j}
                        href={l.url}
                        target="_blank"
                        className="block text-sm bg-cream/50 rounded-lg px-3 py-2 text-primary hover:underline"
                      >
                        {l.title || l.url}
                      </a>
                    ))}
                  </div>
                )}
                {msg.sources?.length > 0 && (
                  <div className="mt-2 text-sm flex items-start gap-1.5 text-primary/60">
                    <Paperclip size={14} className="mt-0.5 shrink-0" />
                    <span>
                      参考文档：
                      {msg.sources.map((s, j) => <span key={j} className="ml-1">• {s}</span>)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && !messages.some(m => m.streaming) && (
            <div className="flex items-center gap-2 text-primary/60">
              <Loader2 size={16} className="animate-spin" /> AI 思考中...
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_QUESTIONS.map(q => (
            <button
              key={q}
              type="button"
              onClick={() => handleSend(q)}
              disabled={loading}
              className="px-3 py-1.5 text-sm bg-white border border-primary-light rounded-full text-primary hover:bg-primary-light/50 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="输入你的问题..."
            className="flex-1 p-3 border border-primary-light rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-light"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50"
          >
            <Send size={16} /> 发送
          </button>
        </form>
      </main>
    </div>
  )
}
