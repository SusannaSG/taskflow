// ----- Grab the elements we need -----
const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const count = document.getElementById("count");
const clearBtn = document.getElementById("clear-completed");
const filterButtons = document.querySelectorAll(".filter");
const themeToggle = document.getElementById("theme-toggle");

// ----- App state -----
let tasks = [];
let currentFilter = "all";

try {
  tasks = JSON.parse(localStorage.getItem("tasks")) || [];
} catch (error) {
  tasks = [];
}

// ----- Save to the browser's storage -----
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ----- Draw everything on the page -----
function render() {
  list.innerHTML = "";

  const visibleTasks = tasks.filter(function (task) {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  if (visibleTasks.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No tasks here yet.";
    list.appendChild(empty);
  }

  visibleTasks.forEach(function (task) {
    const li = document.createElement("li");
    li.className = "task" + (task.completed ? " completed" : "");
    li.dataset.id = task.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;

    const text = document.createElement("span");
    text.textContent = task.text;

    const del = document.createElement("button");
    del.className = "delete";
    del.innerHTML = "&#10005;";
    del.setAttribute("aria-label", "Delete task");

    li.append(checkbox, text, del);
    list.appendChild(li);
  });

  const left = tasks.filter(function (task) {
    return !task.completed;
  }).length;
  count.textContent = left + (left === 1 ? " task left" : " tasks left");
}

// ----- Add a task -----
form.addEventListener("submit", function (event) {
  event.preventDefault();

  const text = input.value.trim();
  if (text === "") return;

  tasks.push({ id: Date.now(), text: text, completed: false });
  input.value = "";
  saveTasks();
  render();
});

// ----- Tick or delete a task -----
list.addEventListener("click", function (event) {
  const li = event.target.closest(".task");
  if (!li) return;

  const id = Number(li.dataset.id);

  if (event.target.classList.contains("delete")) {
    tasks = tasks.filter(function (task) {
      return task.id !== id;
    });
  } else if (event.target.type === "checkbox") {
    const task = tasks.find(function (task) {
      return task.id === id;
    });
    task.completed = event.target.checked;
  } else {
    return;
  }

  saveTasks();
  render();
});

// ----- Edit a task (double-click the text) -----
list.addEventListener("dblclick", function (event) {
  if (event.target.tagName !== "SPAN") return;

  const li = event.target.closest(".task");
  const id = Number(li.dataset.id);
  const task = tasks.find(function (t) {
    return t.id === id;
  });

  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.value = task.text;
  editInput.className = "edit-input";

  li.replaceChild(editInput, event.target);
  editInput.focus();

  let finished = false;

  function finish(save) {
    if (finished) return;
    finished = true;

    const newText = editInput.value.trim();
    if (save && newText !== "") {
      task.text = newText;
      saveTasks();
    }
    render();
  }

  editInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") finish(true);
    if (e.key === "Escape") finish(false);
  });

  editInput.addEventListener("blur", function () {
    finish(true);
  });
});

// ----- Filter buttons -----
filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    currentFilter = button.dataset.filter;

    filterButtons.forEach(function (b) {
      b.classList.remove("active");
    });
    button.classList.add("active");

    render();
  });
});

// ----- Clear completed -----
clearBtn.addEventListener("click", function () {
  tasks = tasks.filter(function (task) {
    return !task.completed;
  });
  saveTasks();
  render();
});

// ----- Dark mode -----
function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
}

let savedTheme = "light";
try {
  savedTheme = localStorage.getItem("theme") || "light";
} catch (error) {
  savedTheme = "light";
}
applyTheme(savedTheme);

themeToggle.addEventListener("click", function () {
  const next = document.body.classList.contains("dark") ? "light" : "dark";
  applyTheme(next);
  try {
    localStorage.setItem("theme", next);
  } catch (error) {
    // Storage is unavailable, so the choice just won't be remembered.
  }
});

// ----- First draw when the page loads -----
render();