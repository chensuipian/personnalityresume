'use client'
import { useEffect, useMemo, useState } from 'react'

let mermaidInitialized = false

export default function Mermaid({ code }) {
  const id = useMemo(() => `mmd-${Math.random().toString(36).slice(2)}`, [code])
  const [svg, setSvg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const mod = await import('mermaid')
        const mmd = mod.default
        if (!mermaidInitialized) {
          mmd.initialize({ startOnLoad: false, securityLevel: 'loose', theme: 'neutral' })
          mermaidInitialized = true
        }
        const { svg: out } = await mmd.render(id, code)
        if (!cancelled) setSvg(out)
      } catch (err) {
        if (!cancelled) setError(err?.message || '流程图渲染失败')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, code])

  if (error) {
    return <pre className="bg-cream/60 rounded-lg p-3 overflow-x-auto text-sm my-2"><code>{code}</code></pre>
  }
  if (!svg) {
    return <div className="text-primary/50 text-sm py-2">流程图渲染中...</div>
  }
  return <div className="overflow-x-auto my-2" dangerouslySetInnerHTML={{ __html: svg }} />
}
