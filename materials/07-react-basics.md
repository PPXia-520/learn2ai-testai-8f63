# 07 组件化与 React 基础

当页面交互变复杂，直接用 DOM 拼装会变得难以维护：状态散落在各处，改了数据还得手动同步界面。React 的核心思想是：**UI = f(state)**，你只描述「状态长什么样时界面长什么样」，同步工作交给框架。

## 1. 组件与 JSX

```jsx
function Welcome({ name }) {
  return <h1 className="title">你好，{name}！</h1>;
}

export default function App() {
  return (
    <div>
      <Welcome name="Ada" />
      <Welcome name="Grace" />
    </div>
  );
}
```

JSX 语法要点：

- 属性用驼峰：`className`、`htmlFor`、`onClick`（不是 `class` / `for` / `onclick`）。
- 表达式写在 `{}` 里，`{}` 中不能写语句（`if` / `for`），要用表达式。
- 组件名必须大写开头，否则会被当成 HTML 标签。
- 必须返回**单个根节点**；需要多个兄弟节点时用 `<>...</>` 包裹。
- 必须闭合标签：`<img />`、`<br />`。

## 2. props：从父到子的数据

```jsx
function Avatar({ src, alt = '头像', size = 48 }) {
  return <img src={src} alt={alt} width={size} height={size} className="avatar" />;
}

<Avatar src="/a.png" size={72} />
```

- props 是**只读**的，子组件不能修改它们。
- 默认值放在参数解构里最简洁。
- 需要传递未知属性时用展开：`<input {...rest} />`。
- `children` 是特殊 prop，表示标签之间的内容：

```jsx
function Card({ title, children }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
```

## 3. state 与事件

```jsx
import { useState } from 'react';

function Counter({ step = 1 }) {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>当前：{count}</p>
      <button onClick={() => setCount(count + step)}>+{step}</button>
      <button onClick={() => setCount(c => c - step)}>-{step}</button>
      <button onClick={() => setCount(0)}>重置</button>
    </div>
  );
}
```

规则：

- **不要直接修改 state**：`count++` 不会触发更新，必须调用 `setCount`。
- 新值依赖旧值时用函数式更新 `setCount(c => c + 1)`，批量更新时更安全。
- 事件处理函数要传函数引用：`onClick={handleClick}`（写 `onClick={handleClick()}` 会立即执行）。
- 一个组件可以有多个 state；相关的几个值建议合并成一个对象，但要整体替换。

## 4. 受控组件

表单的值由 state 管理，DOM 只负责显示。

```jsx
function LoginForm({ onSubmit }) {
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();          // 阻止浏览器默认提交刷新
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">邮箱</label>
      <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />

      <label htmlFor="password">密码</label>
      <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />

      <button type="submit">登录</button>
    </form>
  );
}
```

## 5. 列表、条件与 key

```jsx
function TodoList({ todos, onToggle }) {
  if (todos.length === 0) return <p>还没有待办</p>;

  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id} style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
          <label>
            <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} />
            {todo.title}
          </label>
        </li>
      ))}
    </ul>
  );
}
```

- `key` 必须是稳定且唯一的标识（数据库 id），**不要用数组下标**，否则增删排序时会渲染错乱。
- 条件渲染常用三种写法：

```jsx
{isLoading && <Spinner />}                       // 短路：适合「有就显示」
{error ? <ErrorBox msg={error} /> : <Content />} // 三元：二选一
{isAdmin && <AdminPanel />}
```

## 6. 副作用与 useEffect

渲染应该是纯函数。请求数据、订阅事件、操作 DOM 这些「副作用」放在 `useEffect` 里。

```jsx
import { useEffect, useState } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(`/api/users/${userId}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => { if (!cancelled) setUser(data); })
      .catch(err => { if (!cancelled) console.error(err); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };   // 清理函数
  }, [userId]);                           // 依赖数组

  if (loading) return <p>加载中…</p>;
  if (!user) return <p>加载失败</p>;
  return <h1>{user.name}</h1>;
}
```

依赖数组的三种情况：

| 写法 | 执行时机 |
| --- | --- |
| `useEffect(fn)` | 每次渲染后都执行（很少需要） |
| `useEffect(fn, [])` | 只在挂载后执行一次 |
| `useEffect(fn, [a, b])` | 挂载后 + `a` 或 `b` 变化时执行 |

返回的函数是清理函数，在依赖变化前和组件卸载时执行，用于取消订阅、清除定时器、取消请求。

## 7. 状态提升与自定义 Hook

多个组件需要共享状态时，把状态放到它们最近的共同父组件，通过 props 向下传、通过回调向上传——这叫**状态提升**。

```jsx
function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : initial;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
```

自定义 Hook 就是以 `use` 开头、内部调用其他 Hook 的普通函数，用于把逻辑抽出来复用。

## 8. 常见坑

| 现象 | 原因 | 修正 |
| --- | --- | --- |
| 点了没反应 | 直接改了 state 或写成 `onClick={fn()}` | 用 setState，传函数引用 |
| 列表闪动/串数据 | `key` 用了下标 | 换成稳定 id |
| 无限请求 | `useEffect` 里 setState 且依赖写错 | 明确依赖数组，必要时用 `cancelled` 标志 |
| 状态更新后仍是旧值 | 闭包捕获了旧 state | 用函数式更新或 `useRef` |
| 报错 Hook 顺序变化 | Hook 写在条件或循环里 | Hook 只在组件顶层调用 |

## 9. 练习

1. 实现一个待办应用：添加、删除、切换完成、按状态筛选、显示剩余数量。
2. 用 `useLocalStorage` 让待办在刷新后保留。
3. 封装 `useFetch(url)`，返回 `{ data, loading, error }`，并处理组件卸载后的更新。
