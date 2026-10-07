# 03 JavaScript 语言核心

JavaScript 负责**行为**。这一篇只讲日常开发真正会用到的那部分语言特性。

## 1. 声明变量：默认 const

```javascript
const PI = 3.14159;      // 不可重新赋值，优先使用
let count = 0;           // 需要重新赋值时使用
count += 1;

// var 是历史遗留，存在变量提升与函数作用域问题，新代码不要用
```

注意：`const` 只保证**绑定不变**，对象内部仍可修改。

```javascript
const user = { name: 'Ada' };
user.name = 'Grace';     // 允许
// user = {};            // TypeError
```

## 2. 类型与相等

```javascript
typeof 'abc'          // 'string'
typeof 42             // 'number'
typeof true           // 'boolean'
typeof undefined      // 'undefined'
typeof null           // 'object'   （历史 bug，用 value === null 判断）
typeof {}             // 'object'
typeof []             // 'object'   （用 Array.isArray(value) 判断数组）
typeof (() => {})     // 'function'

0 == ''               // true   ← 隐式转换，别用
0 === ''              // false  ← 始终使用 === / !==
```

假值只有 6 个：`false`、`0`、`''`、`null`、`undefined`、`NaN`。其余都为真值（包括 `[]` 和 `{}`）。

## 3. 字符串

```javascript
const name = 'Ada';
const msg = `你好，${name}！共 ${1 + 2} 条消息`;   // 模板字符串
'abc'.toUpperCase();          // 'ABC'
' a b '.trim();               // 'a b'
'2026-10-07'.split('-');      // ['2026','10','07']
['a', 'b'].join(', ');        // 'a, b'
'a-b-c'.replace('-', '_');    // 'a_b-c'  只替换第一个
'a-b-c'.replaceAll('-', '_'); // 'a_b_c'
```

## 4. 函数

```javascript
function add(a, b = 1) { return a + b; }

const mul = (a, b) => a * b;          // 箭头函数：单表达式可省略 return
const noop = () => {};
const pick = ({ id, name }) => ({ id, name });  // 返回对象要加括号

// 剩余参数与展开
const sum = (...nums) => nums.reduce((t, n) => t + n, 0);
sum(...[1, 2, 3]);                    // 6
```

箭头函数与普通函数的关键区别：箭头函数**没有自己的 `this`**，它捕获外层作用域。回调里用箭头函数通常正是我们想要的。

## 5. 数组：优先用函数式方法

```javascript
const items = [
  { id: 1, title: 'HTML', done: true,  score: 90 },
  { id: 2, title: 'CSS',  done: false, score: 75 },
  { id: 3, title: 'JS',   done: true,  score: 88 },
];

items.filter(i => !i.done);                    // 未完成的
items.map(i => i.title);                       // ['HTML','CSS','JS']
items.find(i => i.id === 2);                   // { id: 2, ... }
items.findIndex(i => i.id === 2);              // 1
items.some(i => i.score > 95);                 // false
items.every(i => i.score >= 60);               // true
items.reduce((sum, i) => sum + i.score, 0);    // 253
items.sort((a, b) => b.score - a.score);       // 注意：sort 会原地修改
[...items].sort((a, b) => a.score - b.score);  // 想保留原数组就先复制
items.includes(items[0]);                      // true（同一引用）
```

## 6. 对象、解构与展开

```javascript
const user = { id: 7, name: 'Ada', address: { city: '上海' } };

const { id, name: userName, address: { city } } = user;   // 解构 + 重命名
const patch = { ...user, name: 'Grace' };                 // 浅拷贝并覆盖字段
const merged = { ...defaults, ...options };               // 常见配置合并

Object.keys(user);    // ['id','name','address']
Object.entries(user); // [['id',7], ...]
Object.values(user);  // [7,'Ada',{...}]
```

不可变更新是前端框架的核心习惯：不改原对象，而是生成新对象。

```javascript
const next = {
  ...state,
  todos: state.todos.map(t => (t.id === id ? { ...t, done: true } : t)),
};
```

## 7. 可选链与空值合并

```javascript
const city = user?.address?.city;            // 任一环节为 null/undefined 就返回 undefined
const len = list?.length ?? 0;               // 只在 null/undefined 时取默认值
const port = config.port || 3000;            // || 会把 0 和 '' 也当成假值，注意区别
users.find(u => u.id === id)?.name;
```

## 8. 模块与错误处理

```javascript
// utils/format.js
export function formatDate(date) { /* ... */ }
export const DEFAULT_LOCALE = 'zh-CN';
export default function formatAll(list) { return list.map(formatDate); }

// main.js
import formatAll, { formatDate, DEFAULT_LOCALE } from './utils/format.js';
```

```javascript
try {
  const data = JSON.parse(raw);
} catch (err) {
  console.error('解析失败', err.message);
} finally {
  console.log('无论成功失败都会执行');
}

throw new Error('参数不合法');
```

## 9. 练习

1. 给定商品数组，用 `filter` + `map` 输出「价格低于 100 元的商品名列表」。
2. 写一个 `groupBy(list, keyFn)` 函数，把数组按某个字段分组（用 `reduce`）。
3. 把下面的错误代码改成不可变更新：

```javascript
state.user.name = '新名字';   // 直接修改，破坏不可变性
```
