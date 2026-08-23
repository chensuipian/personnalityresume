'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookMarked, Plus, CheckCircle2, XCircle, Loader2, Calendar } from 'lucide-react'

export default function AdminPage() {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mode, setMode] = useState('url') // 'url' | 'content'
  const [message, setMessage] = useState(null)
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(false)

  const loadDocs = async () => {
    try {
      const res = await fetch('/api/admin/add')
      const data = await res.json()
      setDocs(data.docs || [])
    } catch {
      console.error('加载文档列表失败')
    }
  }

  useEffect(() => {
    loadDocs()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: 'info', text: '添加中...' })

    try {
      const payload = mode === 'content' ? { title, content } : { url, title }
      const res = await fetch('/api/admin/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: `添加成功！当前共 ${data.count} 篇文档` })
        setUrl('')
        setTitle('')
        setContent('')
        loadDocs()
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '添加失败' })
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white/80 backdrop-blur sticky top-0 z-10 border-b border-primary-light">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">陈碎篇</Link>
          <nav className="flex items-center gap-6 text-sm text-primary">
            <Link href="/" className="opacity-70 hover:opacity-100">首页</Link>
            <Link href="/chat" className="opacity-70 hover:opacity-100">AI 聊天</Link>
            <Link href="/admin" className="font-medium">管理</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-primary mb-6">
          <BookMarked size={22} /> 文档管理
        </h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4 mb-8">
          <h2 className="text-lg font-bold text-primary">添加文档到知识库</h2>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setMode('url'); setMessage(null) }}
              className={`px-4 py-1.5 text-sm rounded-lg border transition-colors ${
                mode === 'url' ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-primary-light hover:bg-primary-light/50'
              }`}
            >
              文章链接
            </button>
            <button
              type="button"
              onClick={() => { setMode('content'); setMessage(null) }}
              className={`px-4 py-1.5 text-sm rounded-lg border transition-colors ${
                mode === 'content' ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-primary-light hover:bg-primary-light/50'
              }`}
            >
              直贴内容
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">文章标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 border border-primary-light rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-light"
              placeholder="输入文章标题"
              required
            />
          </div>

          {mode === 'url' && (
            <div>
              <label className="block text-sm font-medium mb-1">文章链接</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-2.5 border border-primary-light rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-light"
                placeholder="https://juejin.cn/post/xxx"
                required
              />
            </div>
          )}

          {mode === 'content' && (
            <div>
              <label className="block text-sm font-medium mb-1">内容（markdown 正文）</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-2.5 border border-primary-light rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-light min-h-[160px]"
                placeholder="粘贴 markdown 正文，将直接存入知识库"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {loading ? '添加中...' : '添加到知识库'}
          </button>

          {message && (
            <p className={`flex items-center justify-center gap-2 font-medium ${
              message.type === 'success' ? 'text-green-600'
              : message.type === 'error' ? 'text-red-600'
              : 'text-primary/70'
            }`}>
              {message.type === 'success' && <CheckCircle2 size={16} />}
              {message.type === 'error' && <XCircle size={16} />}
              {message.type === 'info' && <Loader2 size={16} className="animate-spin" />}
              {message.text}
            </p>
          )}
        </form>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-primary mb-4">知识库文档列表 ({docs.length})</h2>
          {docs.length === 0 ? (
            <p className="text-primary/50">暂无文档，请添加第一篇文档</p>
          ) : (
            <ul className="space-y-2">
              {docs.map((doc) => (
                <li key={doc.id} className="p-3 bg-cream/40 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="font-medium text-primary">{doc.title}</p>
                    <a href={doc.url} target="_blank" className="text-sm text-primary/70 hover:underline">
                      {doc.url}
                    </a>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-primary/50 shrink-0 ml-4">
                    <Calendar size={12} />
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}
