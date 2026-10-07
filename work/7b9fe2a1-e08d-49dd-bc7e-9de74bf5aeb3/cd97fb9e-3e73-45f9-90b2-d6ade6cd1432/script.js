"use strict";

(() => {
  const STORAGE_KEY = "learn2ai.todo.cd97fb9e-3e73-45f9-90b2-d6ade6cd1432.v1";
  const MAX_TEXT_LENGTH = 200;
  const form = document.querySelector("#todo-form");
  const input = document.querySelector("#todo-input");
  const inputError = document.querySelector("#input-error");
  const list = document.querySelector("#todo-list");
  const template = document.querySelector("#todo-template");
  const filters = document.querySelector(".filters");
  const clearButton = document.querySelector("#clear-completed");
  const emptyState = document.querySelector("#empty-state");
  const storageWarning = document.querySelector("#storage-warning");
  const announcement = document.querySelector("#announcement");
  let currentFilter = "all";
  let nextId = 1;
  let todos = loadTodos();

  function showStorageWarning(message) {
    storageWarning.textContent = message;
    storageWarning.hidden = !message;
  }

  function loadTodos() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === null) return [];
      const data = JSON.parse(saved);
      if (!Array.isArray(data)) throw new Error("Invalid saved list");
      const ids = new Set();
      const valid = data.every((todo) => {
        if (
          !todo ||
          !Number.isSafeInteger(todo.id) ||
          todo.id < 1 ||
          todo.id >= Number.MAX_SAFE_INTEGER ||
          ids.has(todo.id) ||
          typeof todo.text !== "string" ||
          !todo.text.trim() ||
          todo.text.length > MAX_TEXT_LENGTH ||
          typeof todo.completed !== "boolean"
        ) return false;
        ids.add(todo.id);
        nextId = Math.max(nextId, todo.id + 1);
        return true;
      });
      if (!valid) throw new Error("Invalid saved item");
      return data.map(({ id, text, completed }) => ({ id, text, completed }));
    } catch {
      showStorageWarning("无法读取本地清单，当前显示空列表；本次仍可正常添加事项。");
      return [];
    }
  }

  function saveTodos() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
      showStorageWarning("");
    } catch {
      showStorageWarning("浏览器未能保存清单，本次更改仅在当前页面保留。");
    }
  }

  function setInputError(message) {
    inputError.textContent = message;
    inputError.hidden = !message;
    input.setAttribute("aria-invalid", String(Boolean(message)));
  }

  function announce(message) {
    announcement.textContent = message;
  }

  function isVisible(todo) {
    if (currentFilter === "active") return !todo.completed;
    if (currentFilter === "completed") return todo.completed;
    return true;
  }

  function render() {
    const completed = todos.filter((todo) => todo.completed).length;
    const active = todos.length - completed;
    const percent = todos.length ? Math.round(completed / todos.length * 100) : 0;
    const visible = todos.filter(isVisible);
    const fragment = document.createDocumentFragment();

    for (const todo of visible) {
      const item = template.content.firstElementChild.cloneNode(true);
      item.dataset.id = String(todo.id);
      item.classList.toggle("is-completed", todo.completed);
      item.querySelector(".todo-checkbox").checked = todo.completed;
      // User input stays plain text, never HTML.
      item.querySelector(".todo-text").textContent = todo.text;
      const deleteButton = item.querySelector(".delete-button");
      deleteButton.setAttribute("aria-label", `删除事项：${todo.text}`);
      deleteButton.title = "删除事项";
      fragment.append(item);
    }
    list.replaceChildren(fragment);

    document.querySelector("#all-count").textContent = String(todos.length);
    document.querySelector("#active-count").textContent = String(active);
    document.querySelector("#completed-count").textContent = String(completed);
    document.querySelector("#total-summary").textContent = `共 ${todos.length} 项`;
    document.querySelector("#remaining-count").textContent = `剩余 ${active} 项待完成`;
    document.querySelector("#progress-percent").textContent = `${percent}%`;
    document.querySelector("#progress-count").textContent = `${completed} / ${todos.length}`;
    const progress = document.querySelector("#progress");
    progress.value = percent;
    progress.textContent = `${percent}%`;
    clearButton.disabled = completed === 0;
    for (const button of filters.querySelectorAll("[data-filter]")) {
      button.setAttribute("aria-pressed", String(button.dataset.filter === currentFilter));
    }

    emptyState.hidden = visible.length > 0;
    const emptyMessages = {
      all: ["清单还是空的", "今天的第一件事，会是什么？"],
      active: ["没有待完成的事项", todos.length ? "清单上的事项都已完成。" : "今天还没有新的事项。"],
      completed: ["还没有已完成的事项", "每完成一件事，就离目标更近一点。"],
    };
    document.querySelector("#empty-title").textContent = emptyMessages[currentFilter][0];
    document.querySelector("#empty-description").textContent = emptyMessages[currentFilter][1];
  }

  function commitChange(message) {
    saveTodos();
    render();
    announce(message);
  }

  // Rebuilding a filtered list must not strand keyboard focus on the page body.
  function focusAfterChange(id, control, previousIndex) {
    const items = Array.from(list.children);
    const sameItem = items.find((item) => Number(item.dataset.id) === id);
    const nextItem = sameItem || items[Math.min(previousIndex, items.length - 1)];
    if (nextItem) nextItem.querySelector(control).focus();
    else input.focus();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) {
      setInputError("请先填写待办事项，不能只输入空格。");
      input.focus();
      return;
    }
    if (text.length > MAX_TEXT_LENGTH) {
      setInputError(`待办事项不能超过 ${MAX_TEXT_LENGTH} 个字符。`);
      input.focus();
      return;
    }
    todos.push({ id: nextId++, text, completed: false });
    currentFilter = currentFilter === "completed" ? "all" : currentFilter;
    input.value = "";
    setInputError("");
    commitChange(`已添加：${text}`);
    input.focus();
  });

  input.addEventListener("input", () => setInputError(""));

  list.addEventListener("change", (event) => {
    if (!event.target.matches(".todo-checkbox")) return;
    const item = event.target.closest(".todo-item");
    const id = Number(item.dataset.id);
    const todo = todos.find((entry) => entry.id === id);
    if (!todo) return;
    const previousIndex = Array.from(list.children).indexOf(item);
    todo.completed = event.target.checked;
    commitChange(`${todo.completed ? "已完成" : "已恢复待办"}：${todo.text}`);
    focusAfterChange(id, ".todo-checkbox", previousIndex);
  });

  list.addEventListener("click", (event) => {
    const button = event.target.closest(".delete-button");
    if (!button) return;
    const item = button.closest(".todo-item");
    const id = Number(item.dataset.id);
    const todo = todos.find((entry) => entry.id === id);
    if (!todo) return;
    const previousIndex = Array.from(list.children).indexOf(item);
    todos = todos.filter((entry) => entry.id !== id);
    commitChange(`已删除：${todo.text}`);
    focusAfterChange(id, ".delete-button", previousIndex);
  });

  filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    currentFilter = button.dataset.filter;
    render();
    announce(`当前显示${button.firstChild.textContent}事项，共 ${list.children.length} 项。`);
  });

  clearButton.addEventListener("click", () => {
    const completed = todos.filter((todo) => todo.completed).length;
    if (!completed) return;
    todos = todos.filter((todo) => !todo.completed);
    commitChange(`已清除 ${completed} 项已完成事项。`);
    input.focus();
  });

  const today = document.querySelector("#today");
  const now = new Date();
  const pad = (number) => String(number).padStart(2, "0");
  today.dateTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  today.textContent = new Intl.DateTimeFormat("zh-CN", {
    month: "long", day: "numeric", weekday: "long",
  }).format(now);
  render();
})();
