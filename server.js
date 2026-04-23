const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// In-memory tasks (for simplicity - could use database)
let tasks = [];
let nextId = 1;

// Load tasks from file if exists
const tasksFile = path.join(__dirname, 'tasks.json');
if (fs.existsSync(tasksFile)) {
    const data = fs.readFileSync(tasksFile, 'utf8');
    const loaded = JSON.parse(data);
    tasks = loaded.tasks;
    nextId = loaded.nextId;
}

// Save tasks to file
function saveTasks() {
    fs.writeFileSync(tasksFile, JSON.stringify({ tasks, nextId }, null, 2));
}

// GET all tasks
app.get('/api/tasks', (req, res) => {
    res.json(tasks);
});

// POST new task
app.post('/api/tasks', (req, res) => {
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }
    
    const task = {
        id: nextId++,
        title: title.trim(),
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.unshift(task);
    saveTasks();
    res.json(task);
});

// PATCH complete task
app.patch('/api/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const task = tasks.find(t => t.id === id);
    
    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }
    
    task.completed = !task.completed;
    saveTasks();
    res.json(task);
});

// DELETE task
app.delete('/api/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id);
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    res.json({ success: true });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════╗
║   🌲 FOREST TODO APP - BACKEND RUNNING        ║
║   Server: http://localhost:${PORT}              ║
║   API: http://localhost:${PORT}/api/tasks       ║
║   Frontend: http://localhost:${PORT}            ║
╚════════════════════════════════════════════════╝
    `);
});