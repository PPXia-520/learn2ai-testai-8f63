# 08 性能、可访问性与调试

功能能跑通只是及格线。这一篇讲如何让页面**更快、更好用、更容易排查问题**。

## 1. 三个核心体验指标

| 指标 | 含义 | 目标 |
| --- | --- | --- |
| LCP（Largest Contentful Paint） | 最大内容元素何时渲染完 | < 2.5s |
| INP（Interaction to Next Paint） | 用户交互到界面响应的延迟 | < 200ms |
| CLS（Cumulative Layout Shift） | 布局意外移动的程度 | < 0.1 |

用 Chrome DevTools 的 Lighthouse 面板或 PageSpeed Insights 可以直接得到这三项。

## 2. 加载性能

**图片通常是最大的瓶颈。**

```html
<!-- 首屏大图：预加载 + 高优先级 -->
<link rel="preload" as="image" href="/hero.webp" fetchpriority="high" />
<img src="/hero.webp" alt="" width="1200" height="630" />

<!-- 非首屏图片：懒加载 -->
<img src="/photo.webp" alt="…" width="800" height="600" loading="lazy" decoding="async" />
```

- 使用 WebP / AVIF，通常比 JPEG 小 25%–50%；配 `srcset` 做多倍图适配。
- **一定要写 `width` / `height`**（或用 CSS `aspect-ratio`），否则图片加载时页面会跳动。
- 首屏关键 CSS 内联，其余异步加载；JS 用 `defer` / `type="module"` 避免阻塞渲染。

```html
<script type="module" src="/src/main.jsx"></script>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```

## 3. 代码体积与分割

```javascript
// 路由级分割：进入该页面时才下载对应代码
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));

<Suspense fallback={<Spinner />}>
  <Dashboard />
</Suspense>
```

```javascript
// 按需引入，避免整包引入
import debounce from 'lodash/debounce';
```

其他手段：

- 生产构建开启压缩与 tree-shaking（Vite `npm run build` 默认已做）。
- 用依赖分析工具（`rollup-plugin-visualizer`）找出体积最大的包。
- 第三方脚本（统计、客服）一律异步加载，不阻塞首屏。

## 4. 渲染性能

- **减少重排（layout）**：不要在一个循环里反复读写会触发布局的属性（`offsetHeight`、`getBoundingClientRect`）；先批量读，再批量写。
- **动画用 `transform` / `opacity`**：这两个属性只触发合成，不走重排重绘。
- **长列表虚拟滚动**：上千条数据只渲染可视区域（`react-window`、`vue-virtual-scroller`）。
- **高频事件节流**（见 04 篇），避免滚动时每帧执行重逻辑。
- React 中：`useMemo` / `useCallback` / `memo` 只在确有性能问题且已测得瓶颈时使用，过早优化反而增加复杂度。

```css
.animate { will-change: transform; transition: transform 200ms ease-out; }
```

## 5. 可访问性（a11y）

目标：让键盘用户、屏幕阅读器用户、低视力用户都能正常使用。

```html
<!-- 语义 + 键盘可达 -->
<button onClick={save} aria-label="保存草稿">保存</button>
<a href="/help">帮助</a>
<!-- 不要用 <div onClick> 代替按钮 -->

<!-- 表单：label 关联 + 错误提示 -->
<label for="email">邮箱</label>
<input id="email" type="email" aria-invalid="false" aria-describedby="email-help" />
<p id="email-help">我们会发送确认邮件</p>

<!-- 可展开控件：状态用 aria 表达 -->
<button aria-expanded="false" aria-controls="panel">详情</button>
<div id="panel" hidden>…</div>
```

要点：

- 用正确的语义标签（`button`、`nav`、`main`、`label`），很多无障碍能力是免费的。
- 所有交互都能用 Tab 到达、有**可见的焦点样式**（不要 `outline: none` 后不补替代方案）。
- 颜色对比度：正文至少 4.5:1，大字号至少 3:1。
- 动态内容用 `aria-live="polite"` 播报；模态框打开后把焦点移入并在关闭后归还。
- 装饰性图片 `alt=""`，功能性图片写清楚用途（不是「图片」）。

## 6. 调试与排查

浏览器开发者工具：

- **Console**：看报错与 `console.table` / `console.group` 输出。
- **Elements**：查看最终 DOM 与生效的 CSS 规则、盒模型、对比度。
- **Network**：看请求状态、耗时、体积、瀑布图；勾选 Disable cache 复现首屏。
- **Performance**：录制一段时间，找出卡顿的长任务。
- **Application**：查看 localStorage、Cookie、Service Worker、缓存。
- **Rendering / Layers**：可视化重排区域与合成层。

调试经验：

1. 先看 Console 第一条红色报错，往往能一步定位。
2. 「样式不生效」优先检查选择器是否匹配、是否被更高优先级覆盖、是否被 `!important` 拦截。
3. 「接口有问题」先看 Network 里的真实请求与响应，别猜。
4. 复现步骤越短越好，能在 3 步内复现的问题通常几分钟就能修好。

## 7. 上线前检查清单

- [ ] Lighthouse 四项（Performance / Accessibility / Best Practices / SEO）都在 90 以上
- [ ] 移动端真机（或模拟器）验证关键流程
- [ ] 所有图片有 `alt` 与尺寸，非首屏图片懒加载
- [ ] 键盘可以完成核心操作，焦点样式可见
- [ ] 生产环境无 `console.log` 残留、无源码映射泄漏敏感信息
- [ ] 404 / 加载失败 / 空数据都有友好提示
