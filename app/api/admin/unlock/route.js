import { NextResponse } from 'next/server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

export async function POST(request) {
  try {
    if (!ADMIN_PASSWORD) {
      return NextResponse.json({ error: '服务器未配置访问密码' }, { status: 500 })
    }
    const { password } = await request.json()
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: '密码错误' }, { status: 401 })
    }

    const res = NextResponse.json({ ok: true })
    res.cookies.set('admin_token', ADMIN_PASSWORD, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 天免输
    })
    return res
  } catch {
    return NextResponse.json({ error: '解锁失败' }, { status: 400 })
  }
}
