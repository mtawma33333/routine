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

## 📁 目录结构（整洁架构分层）

```
backend/
  src/
    index.ts                 # 入口（创建 Hono 应用、注册中间件/路由）
    middlewares/             # 日志 / 错误 / 鉴权等
    routes/                  # 现有路由（迁移为 interfaces/http 下的 controllers）
    utils/                   # 通用工具（Id/Time 等端口实现）
    domain/                  # 领域层：实体/值对象/领域服务
    application/             # 应用层：用例与端口
      ports/                 # Repository/系统服务抽象
      usecases/              # 业务用例实现
    interfaces/
      graphql/                  # 适配层：graphql
    infrastructure/
      d1/                    # 仓储适配器（D1 SQL + Row Mapper）
  migrations/          # D1 SQL 迁移
  wrangler.toml        # Workers + 资源绑定配置
  worker-configuration.d.ts # 环境类型补充
```

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

## 🚀 部署流程（建议 CI）

1. `npm ci`
2. （可选）运行测试
3. `npm run deploy`

GitHub Actions 需配置：

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## 🔌 实施建议

1. 保持现有 `routes/health.ts` 工作不变，新增 `interfaces/http` 与 `application` 骨架；新功能优先走新分层。
2. 在 `application/ports` 定义 `TaskRepository`、`TransactionManager` 等接口；`infrastructure/d1` 提供实现并对接 D1。
3. 第一批用例：`CreateTask`、`ListTasks`、`ChangeTaskStatus`、`ListToday`。
4. 将路由迁移为 Controller：解析 -> 调用 UseCase -> Presenter 映射 -> 统一响应。
5. 逐步将 `services/` 和 `storage/` 中逻辑迁移/拆分到新分层（如存在）。

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
