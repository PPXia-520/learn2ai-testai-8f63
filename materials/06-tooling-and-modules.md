# 06 工程化、模块与协作

当项目超过几个文件，「怎么写代码」就不够用了，还需要「怎么组织与交付代码」。

## 1. npm 与 package.json

```bash
npm init -y                 # 生成 package.json
npm install lodash          # 生产依赖 -> dependencies
npm install -D vitest       # 开发依赖（测试、构建、Lint 等）-> devDependencies
npm install                 # 按 package.json 与 lock 文件还原依赖
npm ci                      # CI 环境用，严格按 lock 文件安装，更快更可靠
npm run dev                 # 执行 scripts 中定义的 dev
```

```json
{
  "name": "my-app",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "test": "vitest run"
  },
  "dependencies": { "react": "^19.0.0" },
  "devDependencies": { "vite": "^7.0.0", "eslint": "^9.0.0" }
}
```

语义化版本 `^1.4.2` 的含义：`主版本.次版本.修订号`，`^` 允许升级次版本与修订号，`~` 只允许升级修订号。**`package-lock.json` 必须提交**，它保证团队与 CI 装出完全一致的依赖树。

## 2. 开发服务器与构建工具

现代前端几乎都使用 Vite 一类的工具，它提供：

- **开发服务器**：秒级冷启动、按需编译、热更新（HMR，改代码不刷新页面即可看到效果）。
- **构建**：把源码打包压缩、做代码分割，产出可部署的静态文件。
- **转换**：TS/JSX 编译、CSS 预处理、图片处理、路径别名等。

```bash
npm create vite@latest my-app -- --template react
cd my-app
npm install
npm run dev        # http://localhost:5173
npm run build      # 产物在 dist/
```

`vite.config.js` 中可以配置别名：

```javascript
import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  resolve: { alias: { '@': path.resolve(process.cwd(), 'src') } },
  server: {
    proxy: { '/api': { target: 'http://localhost:8080', changeOrigin: true } },
  },
});
```

## 3. 模块化

```javascript
// 具名导出：可以导出多个，导入时名字必须对应
export const API_BASE = '/api';
export function request() {}

// 默认导出：一个模块一个，导入时可任意命名
export default class TodoStore {}

// 混合导入
import TodoStore, { API_BASE, request } from './store.js';
// 全部导入
import * as store from './store.js';
// 仅执行副作用
import './styles.css';
```

- ESM（`import` / `export`）是标准，浏览器与打包器都支持。
- CommonJS（`require` / `module.exports`）是 Node 的历史方案，仍会在老依赖里遇到。
- 注意：浏览器中的 `import './x.js'` **必须带扩展名**（打包器中可省略）。
- 动态导入可实现按需加载：`const mod = await import('./heavy.js')`。

## 4. 环境变量与配置

```bash
# .env.local（不要提交到 Git，写进 .gitignore）
VITE_API_BASE=https://api.example.com
```

```javascript
const base = import.meta.env.VITE_API_BASE;   // Vite 中只有 VITE_ 前缀会暴露给前端
```

**重要**：所有进入前端包的内容都会被用户看到。密钥、数据库密码绝不可放进前端环境变量。

## 5. 代码规范与质量

- **Prettier**：只负责格式化（缩进、引号、换行），团队无需争论风格。
- **ESLint**：负责发现错误与坏味道（未使用变量、Hook 依赖缺失等）。
- **TypeScript**：在编译期发现类型错误，大型项目收益明显。
- **Husky + lint-staged**：提交前自动对改动文件跑 Lint 与格式化。

```json
// .prettierrc
{ "semi": true, "singleQuote": true, "printWidth": 100, "trailingComma": "all" }
```

## 6. 推荐目录结构

```
src/
  components/     通用组件（Button、Card）
  features/todos/ 按业务域组织：组件 + hooks + api
  hooks/          复用逻辑
  lib/            工具函数、请求封装
  styles/         全局样式与变量
  App.jsx
  main.jsx
public/           直接拷贝的静态资源（favicon、robots.txt）
```

原则：**按功能而不按文件类型分层**。把「待办」相关的组件、请求、状态放在一起，改需求时只动一个目录。

## 7. Git 协作

```bash
git switch -c feat/todo-filter      # 从最新主干拉新分支
git add -p                          # 分块暂存，便于写出干净提交
git commit -m "feat(todo): 支持按状态筛选"
git fetch origin && git merge origin/main   # 保持与主干同步，保留他人改动
git push -u origin feat/todo-filter
```

- 提交信息用约定式前缀：`feat` / `fix` / `refactor` / `docs` / `test` / `chore`。
- 一个提交只做一件事；不要提交 `node_modules`、构建产物和密钥。
- 同步时**不要**用 `git reset --hard` 或 `push --force` 覆盖别人的工作。
- 冲突处理：打开冲突文件，保留正确内容后 `git add` 再 `git merge --continue`。

## 8. 检查清单

- [ ] `package.json` 的 `scripts` 能一条命令跑起开发、构建、测试
- [ ] `package-lock.json` 已提交，`.env*` 与 `node_modules/` 已忽略
- [ ] 项目中已配置 Prettier + ESLint，且 CI（或提交钩子）会执行
- [ ] 模块导入路径清晰，能用别名代替 `../../..`
