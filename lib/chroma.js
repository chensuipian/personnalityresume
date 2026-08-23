import { ChromaClient } from 'chromadb'
import { OLLAMA_BASE_URL, EMBEDDING_MODEL, CHROMA_ENDPOINT, DEGRADATION_MESSAGE } from './config'
import { ARCHITECTURE_CONTENT, ARCHITECTURE_TITLE, ARCHITECTURE_URL } from './architecture'

export const COLLECTION_NAME = 'juejin_docs'

// 首次使用集合时幂等种入架构文档；失败不阻塞主流程，下次请求重试
let seedPromise = null

async function seedArchitecture(collection) {
  const existing = await collection.get({ where: { url: ARCHITECTURE_URL } })
  if ((existing.ids || []).length > 0) return
  const embedding = await embedText(ARCHITECTURE_CONTENT)
  await collection.add({
    ids: [ARCHITECTURE_URL],
    embeddings: [embedding],
    metadatas: [{ url: ARCHITECTURE_URL, title: ARCHITECTURE_TITLE, created_at: new Date().toISOString(), kind: 'content' }],
    documents: [ARCHITECTURE_CONTENT]
  })
  console.log('[chroma] 架构文档已种入知识库')
}

export async function getCollection() {
  const client = new ChromaClient({ path: CHROMA_ENDPOINT })
  const collection = await client.getOrCreateCollection({
    name: COLLECTION_NAME,
    metadata: { 'hnsw:space': 'cosine' }
  })
  seedPromise ||= seedArchitecture(collection).catch(err => {
    console.warn('[chroma] 架构文档种入失败:', err.message)
  })
  await seedPromise
  return collection
}

// 调用本地 Ollama 计算 embedding；不可达或模型缺失时抛友好提示
export async function embedText(text) {
  let res
  try {
    res = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: EMBEDDING_MODEL, prompt: text })
    })
  } catch {
    throw new Error(DEGRADATION_MESSAGE)
  }
  if (!res.ok) {
    let detail = ''
    try {
      detail = await res.text()
    } catch {
      // 忽略响应解析失败
    }
    if (detail.includes('not found')) {
      throw new Error(`嵌入模型 ${EMBEDDING_MODEL} 未拉取，请先执行 ollama pull ${EMBEDDING_MODEL}`)
    }
    throw new Error(DEGRADATION_MESSAGE)
  }
  const { embedding } = await res.json()
  return embedding
}
