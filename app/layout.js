import './globals.css'

export const metadata = {
  title: '陈碎篇 - 个人主页',
  description: '全栈开发工程师 | AI 应用探索者',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  )
}
