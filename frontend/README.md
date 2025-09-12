# Frontend (SvelteKit + Cloudflare Pages)

SvelteKit 构建的前端应用，部署于 Cloudflare Pages / Workers（`@sveltejs/adapter-cloudflare`），集成 TailwindCSS v4、Vitest、Playwright、国际化（Paraglide）。

---

## ✨ 特性

- Svelte 5（runes）+ SvelteKit 2
- TailwindCSS v4 (纯插件 + 原子化)
- Vitest + @vitest/browser + Svelte 组件单测
- Playwright 端到端测试（`e2e/`）
- Cloudflare Pages 适配与边缘运行
- Paraglide 国际化（`messages/` 目录）

---

## 📁 目录结构（分层约定）

```
frontend/
  src/
    app.html                     # HTML 模板
    app.css                      # 全局样式（Tailwind 引入）
    routes/                      # SvelteKit 路由（仅 UI）
    lib/
      api/                      # FEAppSvc：统一 fetch 封装与 API 调用（新）
      stores/                   # 运行时状态（runes store / 自定义 store）（新）
      viewmodels/               # DTO -> VM 转换与展示模型（新）
      assets/                   # 静态资源
      paraglide/                # i18n 构建产物
    worker-configuration.d.ts
  messages/                 # i18n 源文案 (en.json / zh.json)
  e2e/                      # Playwright 测试
  static/                   # 静态文件 (robots.txt...)
  vite.config.ts            # Vite 配置
  svelte.config.js          # SvelteKit + adapter-cloudflare
```

---

## 🔧 NPM 脚本

| 脚本                 | 说明                                          |
| -------------------- | --------------------------------------------- |
| `npm run dev`        | 开发模式 (Vite)                               |
| `npm run build`      | 生产构建（生成 Cloudflare Pages 产物）        |
| `npm run preview`    | 构建后 + `wrangler dev` 预览 Workers 边缘执行 |
| `npm run check`      | 类型 & Svelte 校验                            |
| `npm run lint`       | Prettier + ESLint                             |
| `npm run test:unit`  | Vitest 单测（含 Svelte 组件）                 |
| `npm run test:e2e`   | Playwright 端到端测试                         |
| `npm test`           | 先运行单测再跑 e2e                            |
| `npm run deploy`     | 构建后使用 wrangler 部署                      |
| `npm run cf-typegen` | 生成 Cloudflare bindings 类型                 |

快速启动：

```pwsh
cd frontend
npm install
npm run dev
```

---

## 🧩 国际化（Paraglide）

源文案：`messages/en.json`, `messages/zh.json`

用法示例：

```ts
import { t } from '@inlang/paraglide-js';
$t('home.title');
```

多语言构建：Paraglide 在构建时生成类型安全访问器。新增 key 后建议执行一次 `npm run dev` 以生成缓存。

---

## 🎨 样式

- Tailwind v4：通过 `@tailwind` 指令在 `app.css` 中引入
- 可新增 design tokens 或自定义插件

---

## 🧪 测试策略

| 类型       | 工具            | 说明                   |
| ---------- | --------------- | ---------------------- |
| 组件/逻辑  | Vitest          | 轻量单元测试           |
| 浏览器渲染 | @vitest/browser | 浏览器环境执行（可选） |
| E2E        | Playwright      | 全流程交互测试         |

运行所有测试：

```pwsh
npm test
```

仅单元测试 watch：

```pwsh
npm run test:unit -- --watch
```

---

## 🛠️ 代码质量

- ESLint 规则：`eslint.config.js`（使用 flat config）
- Prettier + tailwindcss 插件格式化 class 顺序
- `svelte-check` 用于 Svelte + TS 校验

---

## 🌐 环境变量

Cloudflare Pages 部署时设置：
| 变量 | 说明 |
| ------------------ | ----------------- |
| `VITE_BACKEND_URL` | 后端 API 基础 URL |

SvelteKit 使用 `import.meta.env.VITE_*` 访问。

---

## 🚀 构建与部署

本地预览 Cloudflare 运行：

```pwsh
npm run preview
```

Cloudflare Pages / Workers 部署：

1. 运行 `npm run build`
2. `npm run deploy`（内部执行 wrangler）

GitHub Actions（规划）：

- 构建 + 上传产物
- 运行 Playwright 作为发布保护

---

## 🧱 约定

- 路由组织遵循 SvelteKit 文件系统路由
- 组件与逻辑放入 `src/lib/`，可按功能域再细分
- API 调用：统一通过 `src/lib/api/` 的 FEAppSvc 调用后端，UI 不直接使用 fetch
- Store：页面订阅 store，store 再调用 FEAppSvc；VM 负责做格式化（时间、本地化等）

示例（建议）调用栈：

UI 组件 -> store(todayStore) -> FEAppSvc.getToday() -> 后端 `/api/views/today` -> DTO -> VM -> UI 渲染

---

## 🔮 待办 / 路线

- [x] 创建目录骨架：`src/lib/api`, `src/lib/stores`, `src/lib/viewmodels`
- [ ] API 客户端封装（`src/lib/api/`）
- [ ] 状态管理（视情况使用 runes store / 自定义 store）
- [ ] 主题 / 暗色模式
- [ ] 更完善的 i18n 语言切换 UI
- [ ] CI 集成测试矩阵（多浏览器）
