'use client'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Lock, Loader2, CheckCircle2, XCircle } from 'lucide-react'

function UnlockForm() {
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || '/admin'
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => { window.location.href = from }, 500)
      } else {
        setError(data.error || '密码错误')
      }
    } catch {
      setError('解锁服务不可用')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 text-center">
        <Lock size={36} className="mx-auto mb-4 text-primary" />
        <h1 className="text-xl font-bold text-primary mb-2">暂不对普通用户进行开放</h1>
        <p className="text-sm text-primary/60 mb-6">管理后台仅对站点所有者开放</p>

        {success ? (
          <p className="flex items-center justify-center gap-2 text-green-600 font-medium">
            <CheckCircle2 size={16} /> 验证通过，正在进入...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入访问密码"
              autoFocus
              className="w-full p-3 border border-primary-light rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-light"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : '进入管理后台'}
            </button>
            {error && (
              <p className="flex items-center justify-center gap-2 text-red-600 text-sm">
                <XCircle size={14} /> {error}
              </p>
            )}
          </form>
        )}

        <Link href="/" className="block mt-6 text-sm text-primary/60 hover:underline">返回首页</Link>
      </div>
    </div>
  )
}

export default function AdminUnavailablePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <UnlockForm />
    </Suspense>
  )
}
