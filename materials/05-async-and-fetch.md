# 05 异步与网络请求

浏览器里所有耗时操作（网络、定时器、文件读取）都是异步的。理解异步是前端从「写页面」迈向「写应用」的分水岭。

## 1. 为什么需要异步

JavaScript 主线程只有一个。如果同步等待网络返回，页面会完全卡死。异步的本质是：**先注册好回调，等结果到了再执行**。

```javascript
console.log('1');
setTimeout(() => console.log('3'), 0);
console.log('2');
// 输出顺序：1 2 3 —— 定时器回调要等同步代码跑完
```

这就是**事件循环**：同步代码先执行完，然后从任务队列里取出回调执行。

## 2. 从回调到 Promise

```javascript
// 回调地狱：嵌套、错误处理分散、难以组合
getUser(id, (err, user) => {
  if (err) return handle(err);
  getOrders(user.id, (err, orders) => {
    if (err) return handle(err);
    // ...越写越深
  });
});
```

Promise 表示一个「未来会有结果」的值，有三种状态：`pending` → `fulfilled` / `rejected`，一旦确定就不再改变。

```javascript
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

delay(300).then(() => console.log('等待结束'));

fetchUser(id)
  .then(user => fetchOrders(user.id))   // then 里返回 Promise 会自动展开
  .then(orders => render(orders))
  .catch(err => console.error('出错了', err))   // 统一捕获前面所有错误
  .finally(() => hideLoading());
```

## 3. async / await

`async/await` 是 Promise 的语法糖，让异步代码读起来像同步代码。

```javascript
async function loadDashboard(userId) {
  try {
    const user = await fetchUser(userId);
    const orders = await fetchOrders(user.id);
    return { user, orders };
  } catch (err) {
    console.error('加载失败', err);
    throw err;                  // 需要调用方感知失败时继续抛出
  } finally {
    hideLoading();
  }
}
```

要点：

- `async` 函数总是返回 Promise，即使你 `return 42`。
- `await` 只能写在 `async` 函数或模块顶层（top-level await）。
- 忘记 `try/catch` 会导致未捕获的 Promise 拒绝。

## 4. 并发：让请求同时跑

```javascript
// 串行：前一个结束后才开始下一个，总耗时相加
const a = await fetchA();
const b = await fetchB();

// 并发：同时发起，耗时取决于最慢的一个
const [a2, b2] = await Promise.all([fetchA(), fetchB()]);

await Promise.allSettled([fetchA(), fetchB()]);  // 无论成败都等全部结束，返回状态数组
await Promise.race([fetchA(), timeout(3000)]);   // 谁先完成用谁（常用于加超时）
await Promise.any([mirrorA(), mirrorB()]);       // 第一个成功的
```

注意：`Promise.all` 只要有一个失败就整体失败，需要「全部结果」时用 `allSettled`。

## 5. 用 fetch 调接口

```javascript
async function getJSON(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    // fetch 只在网络故障时 reject，4xx/5xx 也会 resolve，必须自己判断
    throw new Error(`请求失败：HTTP ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// GET
const list = await getJSON('/api/todos');

// POST
await getJSON('/api/todos', {
  method: 'POST',
  body: JSON.stringify({ title: '学习 fetch' }),
});

// 上传文件用 FormData（不要手动设置 Content-Type，浏览器会带 boundary）
const fd = new FormData();
fd.append('file', fileInput.files[0]);
await fetch('/api/upload', { method: 'POST', body: fd });
```

## 6. 超时与取消

```javascript
async function fetchWithTimeout(url, ms = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}
```

`AbortController` 也常用于组件卸载时取消未完成的请求，避免「已卸载组件 setState」类问题。

## 7. 常见坑

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| `res.json()` 报错 | 响应不是 JSON（如 500 返回 HTML） | 先判断 `res.ok` 与 `content-type` |
| 循环里 `await` 很慢 | 无意中写成串行 | 改成 `Promise.all` |
| 请求重复发起 | 快速点击/输入未做控制 | 防抖、禁用按钮、取消上一请求 |
| 跨域报错 | 服务端未配置 CORS | 由后端设置响应头或用代理 |
| `await` 没生效 | 函数没加 `async` | 检查声明，注意 `forEach` 不支持 await |

## 8. 练习

1. 写一个 `getUsers()`，调用 `https://jsonplaceholder.typicode.com/users` 并打印每个用户的姓名和邮箱。
2. 给练习 1 加上 3 秒超时，超时后在页面上显示友好提示。
3. 并发拉取 `/api/posts` 与 `/api/comments`，用 `Promise.all` 合并后按 `postId` 组装数据。
