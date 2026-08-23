/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    // chromadb 含重型依赖（transformers），避免被 webpack 打包，运行时从 node_modules 解析
    serverComponentsExternalPackages: ['chromadb'],
  },
}

module.exports = nextConfig
