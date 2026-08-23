import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { getCollection, embedText } from '../../../../lib/chroma'
import axios from 'axios'
import * as cheerio from 'cheerio'

async function fetchPageTitle(url) {
  try {
    const res = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    const $ = cheerio.load(res.data)
    return $('title').first().text().trim() || null
  } catch {
    return null
  }
}

export async function POST(request) {
  try {
    const { url, title, content } = await request.json()
    const cleanUrl = (url || '').trim()
    const cleanTitle = (title || '').trim()
    const cleanContent = (content || '').trim()

    const collection = await getCollection()

    // 内容直贴模式：无 URL 的纯内容文档（如项目架构），正文存 Chroma，检索时直接用
    if (cleanContent) {
      if (!cleanTitle) {
        return NextResponse.json({ success: false, error: '请填写标题' })
      }
      const internalUrl = cleanUrl || `internal://${Date.now()}`
      const existing = await collection.get({ where: { url: internalUrl } })
      if ((existing.ids || []).length > 0) {
        return NextResponse.json({ success: false, error: '文档已存在' })
      }
      const embedding = await embedText(cleanContent)
      await collection.add({
        ids: [randomUUID()],
        embeddings: [embedding],
        metadatas: [{ url: internalUrl, title: cleanTitle, created_at: new Date().toISOString(), kind: 'content' }],
        documents: [cleanContent]
      })
      const count = await collection.count()
      return NextResponse.json({ success: true, count })
    }

    if (!cleanUrl) {
      return NextResponse.json({ success: false, error: '请填写文章链接或粘贴内容' })
    }

    // 未填标题时自动抓取页面标题（PRD 7.3）
    const docTitle = cleanTitle || (await fetchPageTitle(cleanUrl))
    if (!docTitle) {
      return NextResponse.json({ success: false, error: '无法自动获取标题，请手动填写' })
    }

    // 按 url 去重
    const existing = await collection.get({ where: { url: cleanUrl } })
    if ((existing.ids || []).length > 0) {
      return NextResponse.json({ success: false, error: '文档已存在' })
    }

    // 用标题算 embedding，存入 Chroma（documents 字段存标题，PRD 7.2）
    const embedding = await embedText(docTitle)
    await collection.add({
      ids: [randomUUID()],
      embeddings: [embedding],
      metadatas: [{ url: cleanUrl, title: docTitle, created_at: new Date().toISOString() }],
      documents: [docTitle]
    })

    const count = await collection.count()
    return NextResponse.json({ success: true, count })
  } catch (error) {
    console.error('Add doc error:', error)
    return NextResponse.json({ success: false, error: error.message })
  }
}

export async function GET() {
  try {
    const collection = await getCollection()
    const all = await collection.get({ include: ['metadatas'] })
    const docs = (all.ids || [])
      .map((id, i) => {
        const m = all.metadatas?.[i] || {}
        return {
          id,
          title: m.title || '',
          url: m.url || '',
          createdAt: m.created_at || ''
        }
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return NextResponse.json({ docs, count: docs.length })
  } catch (error) {
    console.error('List docs error:', error)
    return NextResponse.json({ docs: [], count: 0 })
  }
}
