# 04 DOM 与事件

DOM（Document Object Model）是浏览器把 HTML 解析出来的对象树。JavaScript 通过操作这棵树来改变页面。

## 1. 查询元素

```javascript
const title = document.querySelector('#title');        // 返回第一个匹配
const items = document.querySelectorAll('.item');      // 返回 NodeList（类数组，可 forEach）
const btn = document.getElementById('submit');          // 等价于 querySelector('#submit')

document.querySelector('ul li:nth-child(2)');           // 支持 CSS 选择器语法
```

`querySelectorAll` 返回的是**静态快照**，之后新增的元素不会出现在里面。

## 2. 读取与修改内容

```javascript
el.textContent = '纯文本，安全';      // 推荐
el.innerText = '受样式影响，会触发重排';
// el.innerHTML = userInput;          // 危险：会执行注入的 HTML/脚本（XSS）

el.setAttribute('aria-expanded', 'true');
el.dataset.userId = '42';             // 对应 HTML 的 data-user-id="42"
el.style.color = 'red';               // 行内样式，优先用 class 切换
el.classList.add('active');
el.classList.toggle('open', isOpen);  // 第二个参数控制强制开关
```

用户输入一律用 `textContent` 写入，需要富文本时先用白名单库清洗，不要直接拼 `innerHTML`。

## 3. 创建、插入与删除

```javascript
const li = document.createElement('li');
li.className = 'item';
li.textContent = '新条目';

const list = document.querySelector('#list');
list.append(li);            // 追加到末尾
list.prepend(li);           // 插入到开头
li.remove();                // 删除自己

// 批量插入用 DocumentFragment，避免多次触发重排
const frag = document.createDocumentFragment();
data.forEach(item => {
  const node = document.createElement('li');
  node.textContent = item.title;
  frag.append(node);
});
list.append(frag);
```

## 4. 事件监听

```javascript
const btn = document.querySelector('#save');

function handleClick(event) {
  console.log(event.type);        // 'click'
  console.log(event.target);      // 实际被点击的元素
  console.log(event.currentTarget); // 绑定监听的元素
}

btn.addEventListener('click', handleClick);
// 不再需要时移除（必须传同一个函数引用）
btn.removeEventListener('click', handleClick);
```

常见事件：`click`、`input`（每次输入）、`change`（值确定后）、`submit`、`keydown`、`scroll`、`focus` / `blur`、`mouseenter` / `mouseleave`。

```javascript
form.addEventListener('submit', (e) => {
  e.preventDefault();             // 阻止表单默认提交刷新页面
  const data = new FormData(form);
  console.log(Object.fromEntries(data));
});

input.addEventListener('input', (e) => {
  console.log(e.target.value);
});
```

## 5. 冒泡与事件委托

事件会从触发元素向上冒泡到 `document`。利用这一点，可以只在一个父元素上监听所有子元素的事件——这就是**事件委托**。

```javascript
document.querySelector('#list').addEventListener('click', (e) => {
  const li = e.target.closest('li[data-id]');
  if (!li) return;                 // 点在空白处，忽略
  console.log('点击了条目', li.dataset.id);
});
```

优点：动态新增的元素自动生效，也不用成百上千个监听器。

## 6. 高频事件的节流与防抖

```javascript
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function throttle(fn, interval = 200) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last < interval) return;
    last = now;
    fn(...args);
  };
}

searchInput.addEventListener('input', debounce(e => fetchSuggestions(e.target.value), 300));
window.addEventListener('scroll', throttle(updateProgressBar, 100));
```

- **防抖**：停止操作一段时间后才执行（搜索联想、表单校验）。
- **节流**：固定频率内最多执行一次（滚动、拖拽）。

## 7. 一个完整的交互示例

```html
<ul id="todo-list"></ul>
<form id="todo-form">
  <input id="todo-input" placeholder="添加待办" required />
  <button>添加</button>
</form>
<p id="count"></p>
```

```javascript
const todos = [];
const list = document.querySelector('#todo-list');
const form = document.querySelector('#todo-form');
const input = document.querySelector('#todo-input');
const count = document.querySelector('#count');

function render() {
  list.replaceChildren();
  const frag = document.createDocumentFragment();
  todos.forEach((todo, index) => {
    const li = document.createElement('li');
    li.textContent = todo.text;
    li.dataset.index = String(index);
    frag.append(li);
  });
  list.append(frag);
  count.textContent = `共 ${todos.length} 项`;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  todos.push({ text });
  input.value = '';
  render();
});

list.addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (!li) return;
  todos.splice(Number(li.dataset.index), 1);
  render();
});

render();
```

## 8. 练习

1. 给上例加上「点击条目切换完成状态」，完成的条目加删除线。
2. 用事件委托实现一个点击卡片高亮、其余取消高亮的逻辑。
3. 实现一个输入框，停止输入 500ms 后在控制台打印当前值（用防抖）。
