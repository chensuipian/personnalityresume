import Link from 'next/link'
import { User, FileText, BookOpen, GitBranch, MessageSquare, Mail } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="bg-white/80 backdrop-blur sticky top-0 z-10 border-b border-primary-light">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">陈碎篇</Link>
          <nav className="flex items-center gap-6 text-sm text-primary">
            <Link href="/" className="font-medium">首页</Link>
            <Link href="/chat" className="opacity-70 hover:opacity-100">AI 聊天</Link>
            <Link href="/admin" className="opacity-70 hover:opacity-100">管理</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <section className="flex flex-col items-center text-center mb-14">
          <div className="w-28 h-28 rounded-full bg-primary-light flex items-center justify-center mb-5">
            <User size={48} className="text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-primary mb-2">陈碎篇</h1>
          <p className="text-primary/70 mb-4">全栈开发工程师 | AI 应用探索者</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['React', 'Node.js', 'Next.js', 'AI/RAG'].map(tag => (
              <span key={tag} className="px-3 py-1 bg-primary-light/60 text-primary rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-xl font-bold text-primary mb-4">关于我</h3>
          <p className="text-primary/80 leading-relaxed mb-4">
            热爱技术，专注于前端开发和 AI 应用。拥有丰富的全栈开发经验，
            熟悉 React、Vue、Node.js 等技术栈。目前正在探索 RAG 技术，
            希望将 AI 能力落地到实际应用中。
          </p>
          <a href="/resume" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
            <FileText size={16} /> 查看简历
          </a>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-bold text-primary mb-4">开源项目</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h4 className="font-bold text-primary mb-1">RAG 个人知识库</h4>
              <p className="text-primary/60 text-sm mb-3">基于 Ollama + Next.js 的 RAG 应用</p>
              <a href="https://github.com/chensuipian" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                查看源码 →
              </a>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h4 className="font-bold text-primary mb-1">其他项目</h4>
              <p className="text-primary/60 text-sm mb-3">更多作品正在路上...</p>
              <a href="https://github.com/chensuipian" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                查看全部 →
              </a>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-bold text-primary mb-4">链接</h3>
          <div className="flex gap-3 flex-wrap">
            <a href="https://juejin.cn/user/chensuipian" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
              <BookOpen size={16} /> 稀土掘金
            </a>
            <a href="https://github.com/chensuipian" className="inline-flex items-center gap-2 px-4 py-2 bg-[#24292f] text-white rounded-lg hover:opacity-90">
              <GitBranch size={16} /> GitHub
            </a>
            <Link href="/chat" className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light text-primary rounded-lg hover:bg-primary-light/80">
              <MessageSquare size={16} /> AI 知识库
            </Link>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-xl font-bold text-primary mb-4">联系方式</h3>
          <p className="flex items-center gap-2 text-primary/80">
            <Mail size={16} /> chensuipian@email.com
          </p>
        </section>

        <footer className="text-center text-primary/50 text-sm py-6">
          <p>© 2026 陈碎篇. 基于知识库的智能个人主页.</p>
        </footer>
      </main>
    </div>
  )
}
