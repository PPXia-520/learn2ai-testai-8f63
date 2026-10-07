# 02 CSS 与页面布局

CSS（Cascading Style Sheets）负责**表现**。核心难点不在属性数量，而在于**层叠、盒模型和布局**三件事。

## 1. 三种引入方式与优先级

```html
<link rel="stylesheet" href="styles.css" />   <!-- 推荐：外部样式表 -->
<style> p { color: red; } </style>            <!-- 内嵌，少量临时样式 -->
<p style="color: blue">文字</p>               <!-- 行内，尽量避免 -->
```

选择器优先级从低到高：元素选择器 → 类选择器 → ID 选择器 → 行内样式 → `!important`。
推荐做法：**只用类选择器**，用命名约定（如 BEM：`card__title--active`）控制命名，避免层层叠加的权重战争。

## 2. 盒模型

```
┌───────── margin ─────────┐
│ ┌─────── border ───────┐ │
│ │ ┌──── padding ────┐  │ │
│ │ │    content      │  │ │
│ │ └─────────────────┘  │ │
│ └──────────────────────┘ │
└──────────────────────────┘
```

```css
.card {
  box-sizing: border-box; /* 让 width 包含 padding 与 border */
  width: 320px;
  padding: 16px;
  border: 1px solid #ddd;
  margin: 12px;
}
```

项目里通常全局设置 `*, *::before, *::after { box-sizing: border-box; }`。

## 3. 布局一：Flexbox（一维）

适合一行或一列内的对齐与分配空间。

```css
.toolbar {
  display: flex;
  align-items: center;      /* 交叉轴对齐 */
  justify-content: space-between; /* 主轴分布 */
  gap: 12px;                /* 元素间距，比 margin 更直观 */
}
.toolbar .grow { flex: 1 1 auto; } /* 可伸缩，占据剩余空间 */
```

口诀：`justify-content` 管主轴，`align-items` 管交叉轴。`flex-direction: column` 后二者互换。

## 4. 布局二：Grid（二维）

适合整页骨架和行列对齐的卡片墙。

```css
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;   /* 侧栏 + 主区 */
  grid-template-rows: auto 1fr auto;  /* 头 / 内容 / 脚 */
  grid-template-areas:
    "sidebar header"
    "sidebar main"
    "sidebar footer";
  min-height: 100vh;
}
.layout > header { grid-area: header; }
.layout > main   { grid-area: main; }

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}
```

`repeat(auto-fill, minmax(240px, 1fr))` 是响应式卡片墙最常用的写法，无需媒体查询。

## 5. 响应式与移动优先

```css
.container { width: 100%; padding: 0 16px; }

@media (min-width: 768px) {
  .container { max-width: 720px; margin: 0 auto; }
}
@media (min-width: 1200px) {
  .container { max-width: 1140px; }
}
```

- **移动优先**：先写小屏样式，再用 `min-width` 逐步增强。
- 常用断点：`640px`（大手机）、`768px`（平板）、`1024px` / `1200px`（桌面）。
- 相对单位优先：`rem`（字号）、`%`、`vw/vh`、`clamp(1rem, 2.5vw, 1.5rem)`。

## 6. 层叠上下文与常见坑

- `position: absolute` 相对最近的 `position: relative/absolute/fixed/sticky` 祖先定位。
- 用 `z-index` 叠加时，父级创建了新的层叠上下文（如 `transform`、`opacity < 1`、`filter`）会「困住」子元素。
- 外边距合并（margin collapse）：相邻块级元素的上下 `margin` 会取较大值而不是相加，用 `gap` 或 `padding` 规避。
- 图片默认是行内元素，底部会出现几像素空隙，用 `display: block` 解决。

## 7. 检查清单

- [ ] 全局设置了 `box-sizing: border-box`
- [ ] 布局使用 Flex 或 Grid，而不是 `float` / `inline-block` 拼装
- [ ] 页面在 375px、768px、1280px 三个宽度下都没有横向滚动条
- [ ] 间距优先用 `gap`，避免大量 `margin` 叠加
- [ ] 文字颜色与背景对比度足够（可用 DevTools 的对比度提示）
