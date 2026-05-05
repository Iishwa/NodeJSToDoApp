const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto'); // ✅ Added import

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Schema & Model
const TodoSchema = new mongoose.Schema({
  task: { type: String, required: true },
  // Optional: add a unique ID using crypto
  taskId: { type: String, default: () => crypto.randomBytes(8).toString('hex') }
});
const Todo = mongoose.model('Todo', TodoSchema);

// Routes

// Show Add Task Form (GET)
app.get('/add', (req, res) => {
  res.send(`
    <h1>Add a Task</h1>
    <form action="/add" method="POST">
      <input type="text" name="task" placeholder="Enter task" required />
      <button type="submit">Add Task</button>
    </form>
    <p><a href="/">Back to Task List</a></p>
  `);
});

// Add task (form submission - POST)
app.post('/add', async (req, res) => {
  try {
    console.log("Received task:", req.body.task); // Debug log
    const todo = new Todo({ task: req.body.task });
    await todo.save();
    res.redirect('/');
  } catch (err) {
    console.error("Error inserting:", err);
    res.status(500).send(err.message);
  }
});

// Homepage - list all tasks
app.get('/', async (req, res) => {
  try {
    const todos = await Todo.find();
    let list = todos.map(t => `<li>${t.task}</li>`).join('');
    res.send(`
      <h1>Todo List</h1>
      <ul>${list}</ul>
      <p><a href="/add">Add a new task</a></p>
    `);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// API: Create task (JSON)
app.post('/todos', async (req, res) => {
  try {
    const todo = new Todo({ task: req.body.task });
    await todo.save();
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get all tasks
app.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Delete task
app.delete('/todos/:id', async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Update task
app.put('/todos/:id', async (req, res) => {
  try {
    const updated = await Todo.findByIdAndUpdate(
      req.params.id,
      { task: req.body.task },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Connect to MongoDB and start server only after connection
const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/todoapp';

mongoose.connect(mongoUrl)
  .then(() => {
    console.log(`✅ MongoDB connected at ${mongoUrl}`);
    app.listen(3000, () => console.log('🚀 API running on port 3000'));
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
