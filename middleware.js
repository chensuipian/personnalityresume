import { NextResponse } from 'next/server'

const ADMIN_COOKIE = 'admin_token'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

export function middleware(request) {
  const { pathname } = request.nextUrl

  // 解锁接口本身免鉴权，否则没密码的人永远进不来
  if (pathname === '/api/admin/unlock') return NextResponse.next()

  if (request.cookies.get(ADMIN_COOKIE)?.value !== ADMIN_PASSWORD) {
    const url = new URL('/admin-unavailable', request.url)
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
