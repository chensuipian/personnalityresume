import './resume.css'
import PrintButton from './print-button'

export const metadata = {
  title: '陈淑琴 - 个人简历',
  description: '陈淑琴 求职简历 - 全栈开发',
}

export default function ResumePage() {
  return (
    <div className="resume-page">
      <div className="resume-controls">
        <PrintButton />
      </div>
      <div className="resume">
        <div className="header">
          <div className="header-left">
            <div className="name">陈淑琴</div>
            <div className="info">女 / 年龄:23 / 籍贯: 温州 / 党员 ✓ / 19195378231 / chensuipian@gmail.com</div>
            <div className="intent">
              <span><b>求职意向:</b> 全栈开发</span>
              <span><b>期望薪资:</b> 4-7K</span>
              <span><b>期望城市:</b> 广州</span>
            </div>
          </div>
          <div className="header-right">
            <div className="caption">个人简历</div>
          </div>
        </div>

        <div className="section">
          <div className="sec-title"><span className="bar"></span>个人优势</div>
          <ol className="sec-list">
            <li>熟悉全栈开发流程，熟悉使用 javascript 进行前后端开发，熟悉使用 nodejs 以及 express 框架进行接口设计。</li>
            <li>熟悉 Git 版本控制流程，熟悉使用 sourceTree 进行分支管理，代码合并以及冲突解决，有团队合作使用 git 进行代码仓管理以及分支推送经验，理解 GitFlow 工作流。</li>
            <li>熟悉数据库设计，有基于业务需求进行数据库表结构设计的经验。</li>
            <li>有使用 n8n 进行低代码进行工作流搭建经验，愿意尝试 agent 相关事务。</li>
          </ol>
        </div>

        <div className="section">
          <div className="sec-title"><span className="bar"></span>实习经历</div>
          <div className="proj-head">
            <div className="proj-title">广州元创旅游文化发展有限公司 <span className="proj-type">全栈工程师</span></div>
            <div className="proj-date">2026.04-至今</div>
          </div>
          <div className="proj-body">
            <p><b>1.</b> 负责微信小程序需求功能模块的前端开发；涉及微信小程序支付接入、火山方舟多模态模型接入（图生图、图生文）、n8n 工作流搭建。</p>
            <p><b>2.</b> 维护后台 web 管理系统；维护并完善后台的用户组，设计用户组相关数据表，用于管理员与普通用户的权益和操作划分。</p>
            <p><b>3.</b> github 仓库领航者，使用 clone、push、pullrequest 等 git 命令进行代码合并和更新。</p>
            <p><b>4.</b> 更新并维护开发与生产数据库。</p>
          </div>
        </div>

        <div className="section">
          <div className="sec-title"><span className="bar"></span>项目经历</div>

          <div className="proj-head">
            <div className="proj-title">文旅行 <span className="proj-type">全栈开发</span></div>
            <div className="proj-date">2026.04-至今</div>
          </div>
          <div className="proj-body">
            <p><b>1. 项目介绍:</b> 围绕项目实现完善 h5 后台、小程序前后端功能开发与维护。</p>
            <p><b>2. 项目技术:</b> nodejs、taro、PostgreSQL、react、typescript、n8n、微信支付、阿里云 oss、claudecode、火山方舟多模态模型。</p>
            <p><b>3. 项目亮点:</b></p>
            <ul className="dot">
              <li>参照微信私域发券优惠券链路，实现 h5 引流 url scheme，微信私域聊(生成小程序对应页面动态二维码)引流至小程序。</li>
              <li>小程序接入 n8n 工作流，n8n 工作流中的 agent 节点接入 deepseek 配流程式输出参数以及约束 prompt，实现小程序的用户互动功能。</li>
              <li>实现报名和微信支付的原子性，解决竞态问题保证用户资金安全以及库存扣减；使用换锁，把并发的&quot;读-写&quot;变成了串行的&quot;读-写&quot;，&quot;写-读&quot;和&quot;读-读&quot;，三个锁定在一个锁内完成。</li>
              <li>基于百度 AI 组合识别和 RT 封图整理字符识别服务，通过统一结果规范化层适配不同识别类型返回差异，实现动物(植物)果蔬等场景一次调用、自适应高精度结果返回的场景识别能力。</li>
              <li>后台部分实现自动看板，实现自动刷新导出统计接口，通过分块查询 chunk+500+将支付状态同步+结果二次兜底检测机制解决 Supabase 大数据量查询超时问题。</li>
            </ul>
          </div>

          <div className="proj-head">
            <div className="proj-title">智萃咖啡 <span className="proj-type">全栈开发</span></div>
            <div className="proj-date">2026.02-2026.03</div>
          </div>
          <div className="proj-body">
            <p><b>1. 项目介绍:</b> 使用 MCP 协议打通 AI 与本地库。API 文档的实时感知，使用 skill 规范化开发流程和项目架构。</p>
            <p><b>2. 项目技术:</b> vue3、pinia、Nodejs、MongoDB Atlas、Deepseek API、百度地图 API、googleitsearch。</p>
            <p><b>3. 项目亮点:</b></p>
            <ul className="dot">
              <li>使用 MCP 协议打通 AI 与本地库。API 文档的实时感知，使用 skill 规范化开发流程和项目架构。</li>
              <li>UI 生产: 利用 stitch 生成高保真 figma 设计稿，通过 nanobanana 定制一致的商业品牌。</li>
              <li>云端数据库托管，规范化编写 git 接入接口。</li>
              <li>前端: 使用 vue3、typescript、pinia、vue-router 解出复用组件、减少代码冗余。</li>
              <li>后端/数据库: 使用 MongoDB。</li>
              <li>部署: 工程化，使用 gitcodesk 进行代码上传和分支控制，使用 vercel 部署。</li>
              <li>使用百度 api 和 deepseek api 优化用户的地址的 GUI 选择和人格测试模块的用户交互。</li>
            </ul>
          </div>

          <div className="proj-head">
            <div className="proj-title">趣商城 <span className="proj-type">前端开发</span></div>
            <div className="proj-date">2025.10-2025.12</div>
          </div>
          <div className="proj-body">
            <p><b>1. 项目名称:</b> 轻奢电商多端平台(UniApp+Vue3+TS)</p>
            <p><b>2. 项目技术:</b> UniApp-Vue3+TypeScript+Pinia+Vite+Axios</p>
            <p><b>3. 项目内容:</b></p>
            <ul className="dot">
              <li>完善电商前端开发，覆盖首页、商品列表、SKU选择、购物车、订单结算、支付流程等模块，实现 H5/微信小程序多端适配。</li>
              <li>基于 Vue3 CompositionAPI+TypeScript 进行组件开发，对商品、SKU、订单等核心数据进行使用 TypeScript 类型抽象与约束，减少运行时错误。</li>
              <li>使用 pinia 管理用户状态与购物车数据，结合持久化方案实现页面刷新数据不丢失。</li>
              <li>封装 Axios 请求层，统一处理 Token 注入、响应拦截、异常提示，提升接口调用的可维护性。</li>
              <li>使用 Vite+pnpm 搭建工程化开发环境，优化本地开发与构建效率。</li>
            </ul>
          </div>
        </div>

        <div className="section">
          <div className="sec-title"><span className="bar"></span>教育经历</div>
          <div className="proj-head">
            <div className="proj-title">广州商学院 <span className="proj-type">本科</span><span className="proj-type">数据科学与大数据技术</span></div>
            <div className="proj-date">2023-2027</div>
          </div>
          <div className="proj-body">
            <p><b>1. 所学科目:</b> 操作系统、概率论与数理统计、离散数学、数据库原理及技术、高等数学、线性代数、Python程序设计、Java面向对象程序设计、操作系统、应用统计学与R语音建模、数据采集技术、软件工程、Hive 快速大数据分析、Scala 软件开发、HBase 数据存储、Spark 大数据架构</p>
          </div>
        </div>

        <div className="section">
          <div className="sec-title"><span className="bar"></span>资格证书</div>
          <div className="certs">
            <span>数据分析专业技能证书</span>
            <span>微软工程师认证</span>
            <span>智能体工程师认证</span>
            <span>Prompt 工程师认证证书</span>
          </div>
        </div>
      </div>
    </div>
  )
}
