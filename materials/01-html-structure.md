# 01 HTML 与语义化结构

HTML（HyperText Markup Language）负责**内容与结构**。样式交给 CSS，行为交给 JavaScript，三者各司其职。

## 1. 最小文档结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>页面标题</title>
  </head>
  <body>
    <h1>Hello, world</h1>
  </body>
</html>
```

- `<!DOCTYPE html>`：声明使用 HTML5 标准模式，缺失会导致浏览器进入怪异模式。
- `lang="zh-CN"`：告诉浏览器与屏幕阅读器页面语言。
- `meta viewport`：移动端页面按设备宽度渲染，是响应式的前提。

## 2. 常用语义化标签

| 标签 | 含义 | 典型用途 |
| --- | --- | --- |
| `header` | 页头 | 站点标题、导航 |
| `nav` | 导航 | 主导航链接集合 |
| `main` | 主内容（每页只应有一个） | 核心内容区 |
| `section` | 主题分组 | 需要标题的内容块 |
| `article` | 独立可分发的内容 | 文章、卡片、评论 |
| `aside` | 附属内容 | 侧边栏、相关推荐 |
| `footer` | 页脚 | 版权、联系方式 |

```html
<body>
  <header>
    <h1>我的博客</h1>
    <nav>
      <ul>
        <li><a href="/">首页</a></li>
        <li><a href="/about">关于</a></li>
      </ul>
    </nav>
  </header>
  <main>
    <article>
      <h2>第一篇帖子</h2>
      <p>正文内容……</p>
    </article>
  </main>
  <footer><p>© 2026 我的博客</p></footer>
</body>
```

用 `div` 堆砌也能「显示正常」，但语义标签能带来：更好的可访问性、更利于 SEO、更易读的代码。

## 3. 表单

```html
<form action="/login" method="post">
  <label for="email">邮箱</label>
  <input id="email" name="email" type="email" required autocomplete="email" />

  <label for="pwd">密码</label>
  <input id="pwd" name="password" type="password" minlength="8" required />

  <button type="submit">登录</button>
</form>
```

要点：

- `label` 的 `for` 必须等于输入框的 `id`，点击文字即可聚焦输入框。
- 用 `type="email"` / `type="number"` 等语义类型，浏览器会做基础校验并给出合适的键盘。
- `required`、`minlength`、`pattern` 提供原生校验，比手写 JS 校验更省事。

## 4. 图片、链接与多媒体

```html
<img src="cat.jpg" alt="一只橘猫趴在键盘上" width="640" height="480" loading="lazy" />
<a href="https://example.com" target="_blank" rel="noopener noreferrer">外部链接</a>
<video src="clip.mp4" controls poster="cover.jpg"></video>
```

- `alt` 是必需信息：描述图片内容；纯装饰图写 `alt=""`。
- 同时写 `width` / `height` 可以避免布局抖动（CLS）。
- `target="_blank"` 要搭配 `rel="noopener noreferrer"` 以防止安全风险。

## 5. 检查清单

- [ ] 文档以 `<!DOCTYPE html>` 开头，`html` 上写了 `lang`
- [ ] 页面有且只有一个 `h1`，标题层级不跳级（h2 → h4 是错误）
- [ ] 交互元素用 `button` / `a`，而不是给 `div` 绑定点击
- [ ] 每张图片都有合适的 `alt`
- [ ] 表单控件都有对应的 `label`
- [ ] 使用 HTML 校验器（validator.w3.org）检查通过
