import { NextResponse } from 'next/server'
import { embedText } from '../../../lib/chroma'

export async function POST(request) {
  try {
    const { text } = await request.json()
    if (!text || !text.trim()) {
      return NextResponse.json({ error: '请输入文本' })
    }
    const embedding = await embedText(text)
    return NextResponse.json({ embedding })
  } catch (error) {
    console.error('Embed error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
