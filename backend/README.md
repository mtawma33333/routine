# Backend (Cloudflare Workers + Hono)

基于 Cloudflare Workers 与 Hono 构建的后端服务层，目标：轻量、可扩展、低运维成本，为前端 SvelteKit 提供 API（后续计划 GraphQL / REST 统一抽象）。

---

## ✨ 功能定位（当前阶段）

- 健康检查与基础路由（/health 计划中）
- 任务 / 标签等核心实体的最小 CRUD（规划中）
- 输入/输出 Schema 校验（Zod）
- 统一错误处理（待添加中间件）
- 数据存储：D1（结构化）+ KV（缓存 / Session 规划）+ R2（附件规划）

---

## 🧩 技术栈

| 领域         | 选型               | 说明                       |
| ------------ | ------------------ | -------------------------- |
| 运行时       | Cloudflare Workers | 边缘计算 & 全球加速        |
| Web 框架     | Hono ^4            | 轻量、快速、良好中间件生态 |
| 校验         | Zod ^3             | 请求/响应 Schema 管理      |
| 文档（可选） | chanfana           | OpenAPI 生成（后续可接入） |
| 构建 / 本地  | Wrangler ^4        | Dev / 部署 / 资源绑定      |
| 语言         | TypeScript         | 强类型与约束               |

---

## 📁 目录结构

```
backend/
  src/
    index.ts           # 入口（创建 Hono 应用、注册路由/中间件）
    routes/            # 路由模块（按资源拆分）
    middlewares/       # 日志 / 错误 / 鉴权等（待实现）
    services/          # 业务逻辑聚合层（调用 storage + 组合返回）
    storage/           # 数据访问封装（D1/KV/R2 等）
    utils/             # 通用工具
  migrations/          # D1 SQL 迁移 (e.g. 0001_init.sql)
  wrangler.toml        # Workers + 资源绑定配置
  worker-configuration.d.ts # 环境类型补充
```

---

## 🔧 NPM 脚本

| 脚本                 | 作用                                        |
| -------------------- | ------------------------------------------- |
| `npm run dev`        | 本地开发（wrangler dev）                    |
| `npm start`          | 等同 dev                                    |
| `npm run deploy`     | 部署到生产 / 指定环境                       |
| `npm run cf-typegen` | 基于 wrangler 生成环境类型（bindings d.ts） |

PowerShell 快速启动：

```pwsh
cd backend
npm install
npm run dev
```

---

## ⚙️ Wrangler / 资源绑定示例

`wrangler.toml`（示意，按实际补充）：

```toml
name = "routine-backend"
main = "src/index.ts"
compatibility_date = "2025-09-01"

[d1_databases]
[[d1_databases]]
binding = "DB"
database_name = "routine-db"
database_id = "<your-d1-id>"

[kv_namespaces]
# [[kv_namespaces]]
# binding = "KV"
# id = "<kv-id>"
```

开发首次创建本地 D1:

```pwsh
wrangler d1 migrations apply routine-db --local
```

运行迁移（远端）：

```pwsh
wrangler d1 migrations apply routine-db
```

---

## 🗄️ 数据迁移

- 新增表结构：在 `migrations/` 下新增 `0002_xxx.sql`
- 命名规范：按递增序号 + 下划线说明
- 禁止直接在生产手动改表，必须通过迁移

---

## 🧪 测试（规划）

| 类型     | 说明               | 状态   |
| -------- | ------------------ | ------ |
| 单元测试 | storage / services | 待添加 |
| 路由测试 | Hono fetch 测试    | 待添加 |
| 集成测试 | 结合 D1 (local)    | 规划   |

建议使用 Vitest + Miniflare（或 Wrangler 本地模拟）

---

## 🛡️ 错误与中间件（规划）

计划中间件：

1. 日志：请求耗时、状态码
2. 统一错误响应结构 `{ code, message, details? }`
3. CORS（生产限制域名）
4. 鉴权（后续添加 Token / Session）

---

## 🚀 部署流程（建议 CI）

1. `npm ci`
2. （可选）运行测试
3. `npm run deploy`

GitHub Actions 需配置：

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

---

## 🔐 环境变量 / Bindings

通过 Wrangler 资源绑定而非 `.env`。如需逻辑条件：

```ts
export type Env = {
	DB: D1Database;
	// KV: KVNamespace; // 规划
};
```

---

## 📑 API 约定（草案）

- JSON 响应统一：

```jsonc
{ "data": <T> , "error": null }
{ "data": null , "error": { "code": "BadRequest", "message": "..." } }
```

- 入参全部 Zod 校验；失败返回 400 + 错误枚举

---

## 🧱 代码风格

- ESM + TS
- 函数纯度优先，副作用集中在 service / storage
- 路由文件只做：解析输入 -> 调 service -> 返回

---

## 🧩 后续路线

- [ ] 健康检查 `/health`
- [ ] 错误处理中间件
- [ ] 任务 CRUD 基础 Schema + 路由
- [ ] 鉴权占位（匿名 / guest 支持）
- [ ] OpenAPI 生成 & 文档托管
