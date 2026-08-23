'use client'
import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Mermaid from './mermaid'

const Markdown = memo(function Markdown({ content, streaming = false }) {
  return (
    <div className="text-[15px] leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-xl font-bold text-primary mt-3 mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-bold text-primary mt-3 mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-bold text-primary mt-2 mb-1">{children}</h3>,
          p: ({ children }) => <p className="my-1.5">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-5 my-1.5 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 my-1.5 space-y-1">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noreferrer" className="text-primary underline">{children}</a>
          ),
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          hr: () => <hr className="my-3 border-primary-light" />,
          table: ({ children }) => (
            <table className="w-full text-sm border-collapse my-2">{children}</table>
          ),
          th: ({ children }) => <th className="border border-primary-light px-2 py-1 text-left">{children}</th>,
          td: ({ children }) => <td className="border border-primary-light px-2 py-1">{children}</td>,
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const lang = match?.[1] || ''
            if (lang === 'mermaid') {
              // 流式过程中代码不完整，先按纯文本显示，结束再渲染流程图
              if (streaming) {
                return <code className={className} {...props}>{children}</code>
              }
              return <Mermaid code={String(children)} />
            }
            if (lang) {
              return <code className={`${className || ''} block bg-cream/60 rounded-lg p-3 overflow-x-auto text-sm my-2 whitespace-pre`} {...props}>{children}</code>
            }
            return <code className="bg-cream/50 px-1.5 py-0.5 rounded text-sm" {...props}>{children}</code>
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
})

export default Markdown
