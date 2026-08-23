import { NextResponse } from 'next/server'
import { getCollection, embedText } from '../../../lib/chroma'
import { DEGRADATION_MESSAGE } from '../../../lib/config'
import { ARCHITECTURE_TITLE, ARCHITECTURE_CONTENT } from '../../../lib/architecture'
import axios from 'axios'
import * as cheerio from 'cheerio'

const TOP_K = 5
// 余弦相似度阈值：低于此值视为「相关性不足」，进入兜底推荐而非 AI 生成（可自行调整）
const SIMILARITY_THRESHOLD = 0.45

// 架构类问题：确定性返回本站架构文档，避免 RAG 随机检索到其他项目文档
const ARCHITECTURE_PATTERNS = [/技术架构/, /项目架构/, /系统架构/, /网站架构/, /architecture/i]
const OTHER_PROJECTS = ['文旅行', '智萃', '趣商城', '元创']

function isArchitectureQuery(query) {
  if (!ARCHITECTURE_PATTERNS.some((p) => p.test(query))) return false
  // 问的是其他项目（如文旅行）的架构时，交还给 RAG 检索对应文档
  if (OTHER_PROJECTS.some((name) => query.includes(name))) return false
  return true
}

async function fetchPageContent(url) {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    const $ = cheerio.load(response.data)
    return $('article, .article-content, main, .content, .markdown-body')
      .text()
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 5000)
  } catch {
    return ''
  }
}

export async function POST(request) {
  try {
    const { query } = await request.json()
    if (!query || !query.trim()) {
      return NextResponse.json({ error: '请输入问题' })
    }

    // 架构类问题：确定性返回本站架构文档，不走 RAG（随机检索曾命中文旅文档导致答错）
    if (isArchitectureQuery(query)) {
      return NextResponse.json({
        results: [{
          id: 'architecture',
          title: ARCHITECTURE_TITLE,
          url: 'internal://architecture',
          kind: 'content',
          similarity: 1
        }],
        contexts: [`【${ARCHITECTURE_TITLE}】\n${ARCHITECTURE_CONTENT}`]
      })
    }

    // 1. 问题 → Ollama embedding
    const queryEmbedding = await embedText(query)

    // 2. Chroma 相似度检索 top-K（URL + Title）
    const collection = await getCollection()
    const count = await collection.count()
    if (count === 0) {
      // 空库不阻断 AI：返回空结果，让前端照常走 /api/chat，由 prompt 中转层如实说明
      return NextResponse.json({ results: [], contexts: [], empty: true })
    }

    const result = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: TOP_K,
      include: ['metadatas', 'distances', 'documents']
    })

    const metadatas = result.metadatas?.[0] || []
    const distances = result.distances?.[0] || []
    const documents = result.documents?.[0] || []
    const results = metadatas.map((m, i) => ({
      id: m.id || '',
      title: m.title || '',
      url: m.url || '',
      kind: m.kind || '',
      similarity: Math.max(0, Math.min(1, 1 - (distances[i] || 0)))
    }))

    // 兜底：最高相似度低于阈值 → 不经过 AI，返回相近文档供用户选择
    const topSimilarity = results[0]?.similarity ?? 0
    if (topSimilarity < SIMILARITY_THRESHOLD) {
      return NextResponse.json({
        fallback: true,
        message: '这个问题在知识库里暂时没有找到足够相关的内容。以下是最接近的文档，你可以点开查看，或换个问法重试。',
        results
      })
    }

    // 3. 构建上下文：内容型文档直接用存入的正文；URL 型文档动态抓取正文
    const contexts = await Promise.all(
      results.map(async (r, i) => {
        if (r.kind === 'content') {
          return `【${r.title}】\n${documents[i] || '无法获取内容'}`
        }
        const content = await fetchPageContent(r.url)
        return `【${r.title}】\n${content || '无法获取内容'}`
      })
    )

    return NextResponse.json({ results, contexts })
  } catch (error) {
    console.error('Search error:', error)
    const message =
      error.message === DEGRADATION_MESSAGE ? DEGRADATION_MESSAGE : '检索服务不可用，请稍后重试'
    return NextResponse.json({ error: message })
  }
}
