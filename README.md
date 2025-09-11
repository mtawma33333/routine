# Routine

一个基于 Cloudflare 全家桶（Workers + D1 + KV + R2）与 SvelteKit 前端构建的可扩展 Todo / 专注效率 Web 应用。目标：快速、低运维成本、支持后续扩展（任务层级、依赖、专注计时、视图定制、统计分析、插件化）

---

## 🔧 核心技术栈

| 领域            | 选型                                            | 说明                                 |
| --------------- | ----------------------------------------------- | ------------------------------------ |
| 前端            | SvelteKit + TailwindCSS                         | 轻量快速的交互层，未来支持多视图模式 |
| SSR/前端部署    | Cloudflare Pages / Workers (adapter-cloudflare) | 统一在 Cloudflare 上运行             |
| 后端            | Cloudflare Workers + Hono                       | API 层（GraphQL）                    |
| 数据库          | Cloudflare D1                                   | 结构化主数据（任务 / 项目 / 标签…）  |
| 临时状态        | KV                                              | 会话 & 轻量缓存                      |
| 对象存储        | R2                                              | 附件、文件资源                       |
| 实时状态 (规划) | Durable Objects                                 | 专注计时 / 协作房间                  |
| 队列 (规划)     | Queues                                          | 异步事件与统计聚合                   |
| 校验            | Zod                                             | 入参/出参 Schema 管理                |
| 基础设施        | Wrangler                                        | 本地开发、部署、绑定资源             |
| CI/CD           | GitHub Actions                                  | Lint + Test + Build + Deploy         |

---

## 📁 目录结构概览

```
backend/            # Workers 后端（Hono）
  src/
    index.ts        # 入口（app 实例）
    routes/         #
    middlewares/    # 日志 / 错误 / 鉴权
    services/       # 业务逻辑聚合
    storage/        # D1 / KV 访问封装
    utils/          # 通用工具
  migrations/       # D1 SQL 迁移
  wrangler.toml     # Workers & 资源绑定配置

frontend/           # Page 前端 (SvelteKit)
  src/routes/       # 页面/布局
  src/lib/api/      # API 客户端封装

docs/               # 架构 / 规范 / 研究文档
```

---

## ✅ 质量与测试

| 类型     | 工具                          |
| -------- | ----------------------------- |
| Lint     | ESLint + Prettier             |
| 类型检查 | TypeScript                    |
| 单元测试 | Vitest (前端) / Hono 路由测试 |
| E2E      | Playwright (前端)             |

后端测试（待添加后端测试框架配置）。

---

## 🔄 CI/CD

GitHub Actions 工作流：

1. `docker-build-all.yml`：PR / push -> Lint + Typecheck + Test + 构建
2. `deploy-backend-cloudflare`：main（或 tag）-> wrangler deploy
3. `deploy-frontend-cloudflare`：main -> SvelteKit 构建 -> wrangler pages deploy
4. `e2e.yml`：合并后或预览环境运行 Playwright

### 环境变量与 Secrets

Github Action Secret
| 名称 | 用途 |
| --------------------- | --------------------------------------- |
| CLOUDFLARE_API_TOKEN | 部署权限 (编辑 Cloudflare Workers + D1) |
| CLOUDFLARE_ACCOUNT_ID | Cloudflare 账户 ID |

前端 Cloudflare Pages 环境变量
VITE_BACKEND_URL | 后端 Worker URL

---

## 🧩 开发规范

本项目采用“单一规范源”策略：根目录统一 ESLint Flat Config + Prettier + Husky 钩子。

### 分支命名

```
feat/<feature-name>
fix/<issue-or-short-desc>
refactor/<scope>
chore/<scope>
docs/<topic>
test/<area>
ci/<pipeline-change>
```

### 提交信息（Conventional Commits）

格式：`<type>(<scope>): <subject>` —— scope 可选，subject 使用动词原形，不以句号结尾。

常用 type：`feat` / `fix` / `refactor` / `chore` / `docs` / `test` / `build` / `ci` / `perf` / `revert`。

示例：

```
feat(task): add create endpoint
fix(auth): correct token expiration logic
refactor(storage): simplify d1 query wrapper
chore(deps): bump eslint-plugin-svelte
```

CommitLint 已通过 Husky `commit-msg` 钩子强制校验，不符合会阻止提交。

### 代码风格 & Lint

- Prettier 负责所有格式化（制表符、100 列、单引号、Tailwind class 排序、Svelte 支持）。
- ESLint：根 `eslint.config.js` 合并 JS/TS/Svelte/Prettier 规则；`no-undef` 在 TS 代码关闭。
- 不手写 import 排序规则，交给 Prettier + 编辑器（如需后续可加入 `eslint-plugin-import`）。

常用命令：

```
bun run format       # 全量格式化
bun run lint         # 全量 lint
bun run typecheck    # 后端类型检查 (tsc --noEmit backend)
```

lint-staged（见 root package.json）：

```
*.{js,ts,svelte,tsx,jsx,cjs,mjs} -> eslint --fix (仅暂存文件)
*.{json,md,css,scss}              -> prettier -w
```

### Husky 钩子流水线

| 钩子       | 动作                             | 说明                                                                    |
| ---------- | -------------------------------- | ----------------------------------------------------------------------- |
| commit-msg | commitlint                       | 规范化提交信息                                                          |
| pre-commit | lint-staged + 变更检测后类型检查 | 仅对暂存文件做快速修复；若有 .ts/.svelte 变更则触发 `bun run typecheck` |
| pre-push   | 全量 eslint + 后端类型检查       | 可按需启用前端 `check` 与测试                                           |

跳过全部钩子：

```
HUSKY_SKIP=1 git commit -m "chore: wip"
HUSKY_SKIP=1 git push
```

### 目录 / 文件约定

- 后端：`routes/` 内按功能分文件，小写中划线或语义名；`services/` 聚合业务，`storage/` 只做数据访问适配；公共工具放 `utils/`。
- 前端：`src/routes` 使用 SvelteKit 约定式；`lib/` 内部模块导出经 `lib/index.ts` 统一再聚合；测试文件使用同名 `*.spec.ts`。
- 资源：只将经过“构建/生成”的产物（`.svelte-kit/`、`dist/`）排除出版本库。

### 测试策略（现状 & 规划）

- 前端：Vitest 单元测试（`*.spec.ts`）+ Playwright E2E（`/frontend/e2e/`）。
- 后端：计划补充 Hono 路由层单元测试（Superflare / Miniflare 或 Wrangler 仿真）。
- 统一后续添加：最小 smoke test 在 CI pre-push / PR。

### Pull Request Checklist（建议）

在 PR 描述中自检：

- [ ] 通过 `bun run lint` & `bun run typecheck`
- [ ] 新增/变更的行为已被测试或说明测试缺失原因
- [ ] 无多余调试输出 / console（除非特意保留并注明）
- [ ] 文档或注释已同步（若涉及外部接口 / 结构）
- [ ] 迁移脚本（若涉及数据变更）已提供并可回滚

### 性能与可维护性建议

- 优先使用边缘缓存（KV）与延迟写策略再考虑结构优化。
- 避免把业务逻辑塞进路由处理函数，保持“输入解析 -> 服务调用 -> 输出序列化”三段式。

### 常见问题

| 问题                            | 处理                                                                             |
| ------------------------------- | -------------------------------------------------------------------------------- |
| ESLint 解析 Svelte 报 parser 错 | 确认依赖已在根安装，重启 VSCode ESLint Server                                    |
| Prettier 未排序 Tailwind class  | 确认 `prettier-plugin-tailwindcss` 与 Svelte 插件已装且根 `.prettierrc` 正在生效 |
| 提交被拦截                      | 查看终端输出：是 commitlint 还是 lint-staged 失败                                |
| 想快速跳过钩子                  | `HUSKY_SKIP=1 git commit -m "chore: skip"`                                       |

### 开发快速启动

```
bun install
bun run dev   # 并行启动 backend + frontend
```

保持“增量、可回滚、小批量”提交，减少 PR 体积，有利于快速审阅与回退。

---

## 🔒 安全要点（当前关注）

1. 所有敏感配置使用 Secrets（不入库）
2. 路由参数 & Body 使用 Zod 校验
3. 统一错误响应格式，避免信息泄露
4. 生产限制 CORS 域名
5. 后续添加速率限制（KV 计数或 Turnstile）

---

## 🧱 下一步实施清单 (Short-term)

- [ ] 添加 `backend/migrations/0001_init.sql`
- [ ] 实现 `/health` 路由
- [ ] 添加错误处理中间件
- [ ] 配置 D1 绑定 (dev)
- [ ] 创建 GitHub Actions `ci.yml`
- [ ] 添加最小任务 CRUD API
