# 速查表

## HTML

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>标题</title>
</head>
<body>
  <header><nav>…</nav></header>
  <main>
    <section>
      <h1>主标题</h1>
      <article>…</article>
    </section>
  </main>
  <footer>…</footer>
</body>
</html>
```

语义标签：`header` `nav` `main` `section` `article` `aside` `footer` `figure` `time`

## CSS

```css
/* 选择器 */
.a .b        /* 后代 */
.a > .b      /* 直接子元素 */
.a:hover     /* 伪类 */
input[type="text"]   /* 属性选择器 */

/* 布局 */
.parent { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.grid   { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }

/* 定位 */
.relative { position: relative; }
.absolute { position: absolute; top: 0; right: 0; }
.fixed    { position: fixed; inset: 0; }
.sticky   { position: sticky; top: 0; }

/* 现代单位与函数 */
width: clamp(280px, 40vw, 640px);
color: color-mix(in srgb, blue 30%, white);

/* 媒体查询（移动优先） */
@media (min-width: 768px) { .container { max-width: 720px; margin: 0 auto; } }
```

## JavaScript

```javascript
const x = 1; let y = 2;
`${x} 与 ${y}`

// 数组
list.map(x => x * 2)
list.filter(x => x > 0)
list.find(x => x.id === id)
list.reduce((sum, x) => sum + x, 0)
[...list, newItem]

// 对象
const { a, b = 1 } = obj;
const next = { ...obj, a: 2 };
Object.entries(obj)

// 可选链与空值合并
user?.profile?.name ?? '匿名'

// 函数
const fn = (a, b = 1) => a + b;
const sum = (...nums) => nums.reduce((t, n) => t + n, 0);
```

## DOM

```javascript
document.querySelector('.item')
document.querySelectorAll('.item')
document.createElement('li')
el.textContent = '文本'
el.classList.toggle('active', isActive)
el.dataset.id
parent.append(child)   // 或 prepend / before / after
el.remove()

el.addEventListener('click', e => {
  e.preventDefault();
  const target = e.target.closest('li');
});
```

## 异步

```javascript
const res = await fetch('/api/items', { method: 'GET', headers: { 'Content-Type': 'application/json' } });
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const data = await res.json();

await Promise.all([a(), b()]);
await Promise.allSettled([a(), b()]);
await Promise.race([a(), delay(3000)]);
```

## React

```jsx
import { useState, useEffect, useMemo, useRef } from 'react';

export default function Counter({ initial = 0, onChange }) {
  const [count, setCount] = useState(initial);
  const inputRef = useRef(null);

  useEffect(() => {                     // 副作用 + 清理
    const id = setInterval(() => setCount(c => c + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const doubled = useMemo(() => count * 2, [count]);

  return (
    <div>
      <p>{count} / {doubled}</p>
      <input ref={inputRef} />
      <button onClick={() => { setCount(c => c + 1); onChange?.(count + 1); }}>+1</button>
    </div>
  );
}

// 列表
{items.map(item => <li key={item.id}>{item.title}</li>)}

// 条件
{loading && <Spinner />}
{error ? <ErrorBox msg={error} /> : <Content />}
```

## 常用命令

```bash
npm install                 # 安装依赖
npm install -D vitest       # 安装开发依赖
npm run dev                 # 启动开发服务器
npm run build               # 生产构建
npm run preview             # 预览构建产物
npm run lint                # 代码检查
npx tsc --noEmit            # 类型检查（TS 项目）

git switch -c feat/xxx      # 新建并切换分支
git add -p && git commit -m "feat(xxx): 说明"
git fetch origin && git merge origin/main
git push -u origin feat/xxx
```

## 调试检查顺序

1. Console 的第一条报错
2. 网络请求的 URL、状态码、响应体（Network）
3. 元素的最终 DOM 与生效样式（Elements）
4. 是否为状态/依赖写错（React 数据流）
5. 是否为缓存或环境变量问题（Application / Network 的 Disable cache）
