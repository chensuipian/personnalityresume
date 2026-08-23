export const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
export const LLM_MODEL = process.env.LLM_MODEL || 'qwen2.5:7b'
export const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'bge-m3'
export const CHROMA_ENDPOINT = process.env.CHROMA_ENDPOINT || 'http://chroma:8000'

// Ollama 不可达时的统一降级提示（本地电脑关机 / frp 断开）
export const DEGRADATION_MESSAGE = '请启动电脑以使用ollama'
