async function loadTasks() {
  const res = await fetch('/todos');
  const tasks = await res.json();
  const list = document.getElementById('taskList');
  list.innerHTML = '';
  tasks.forEach(t => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = t.task;
    li.appendChild(span);

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = async () => {
      const newTask = prompt('Update task:', t.task);
      if (newTask) {
        await fetch(`/todos/${t._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ task: newTask })
        });
        loadTasks();
      }
    };
    li.appendChild(editBtn);

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.onclick = async () => {
      await fetch(`/todos/${t._id}`, { method: 'DELETE' });
      loadTasks();
    };
    li.appendChild(delBtn);

    list.appendChild(li);
  });
}

window.onload = loadTasks;
