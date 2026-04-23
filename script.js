let tasks = [];

const API_URL = 'http://localhost:5000/api';

// Fetch all tasks from backend
async function loadTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`);
        tasks = await response.json();
        renderTasks();
        updateForest();
    } catch (err) {
        console.error('Error loading tasks:', err);
        document.getElementById('taskList').innerHTML = '<p class="empty">Error loading tasks</p>';
    }
}

// Add new task to backend
async function addTask(title) {
    if (!title.trim()) return;
    
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title.trim() })
        });
        
        const newTask = await response.json();
        tasks.unshift(newTask);
        renderTasks();
        updateForest();
    } catch (err) {
        console.error('Error adding task:', err);
        alert('Error adding task');
    }
}

// Toggle task completion on backend
async function toggleTask(id) {
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PATCH'
        });
        
        const updated = await response.json();
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = updated.completed;
            renderTasks();
            updateForest();
        }
    } catch (err) {
        console.error('Error toggling task:', err);
    }
}

// Delete task from backend
async function deleteTask(id) {
    try {
        await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE'
        });
        
        tasks = tasks.filter(t => t.id !== id);
        renderTasks();
        updateForest();
    } catch (err) {
        console.error('Error deleting task:', err);
    }
}

// Render task list in DOM
function renderTasks() {
    const taskList = document.getElementById('taskList');
    const taskCount = document.getElementById('taskCount');
    
    taskCount.textContent = tasks.length;

    if (tasks.length === 0) {
        taskList.innerHTML = '<p class="empty">No tasks yet. Add one to grow your forest! 🌱</p>';
        return;
    }

    taskList.innerHTML = tasks.map(task => `
        <li class="task-item ${task.completed ? 'completed' : ''}">
            <input
                type="checkbox"
                class="task-checkbox"
                ${task.completed ? 'checked' : ''}
                onchange="toggleTask(${task.id})"
            />
            <span class="task-title">${escapeHtml(task.title)}</span>
            <button
                type="button"
                class="delete-btn"
                onclick="deleteTask(${task.id})"
                title="Delete task"
            >✕</button>
        </li>
    `).join('');
}

// Update forest visualization
function updateForest() {
    const completedCount = tasks.filter(t => t.completed).length;
    const canvas = document.getElementById('forestCanvas');
    
    // Remove old trees
    canvas.querySelectorAll('.tree').forEach(tree => tree.remove());

    // Update stats
    document.getElementById('completedCount').textContent = completedCount;
    
    // Generate forest
    const treeCount = Math.min(completedCount + 1, 8);
    document.getElementById('treesCount').textContent = treeCount;

    // Add new trees
    for (let i = 0; i < treeCount; i++) {
        const x = (i % 4) * 25 + 12.5;
        const y = Math.floor(i / 4) * 35 + 15;
        const size = Math.min(completedCount * 5 + 40, 120);

        const treeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        treeGroup.setAttribute('class', `tree tree-${i}`);

        // Trunk
        const trunk = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        trunk.setAttribute('x', x - size / 20);
        trunk.setAttribute('y', 50 - size / 2);
        trunk.setAttribute('width', size / 10);
        trunk.setAttribute('height', size / 2);
        trunk.setAttribute('fill', '#8B6F47');

        // Foliage
        const foliage = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        foliage.setAttribute('cx', x);
        foliage.setAttribute('cy', 50 - size / 1.5);
        foliage.setAttribute('r', size / 2);
        foliage.setAttribute('fill', '#2D8659');

        // Highlight
        const highlight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        highlight.setAttribute('cx', x - size / 8);
        highlight.setAttribute('cy', 50 - size / 1.3);
        highlight.setAttribute('r', size / 6);
        highlight.setAttribute('fill', '#4CAF7F');
        highlight.setAttribute('opacity', '0.6');

        treeGroup.appendChild(trunk);
        treeGroup.appendChild(foliage);
        treeGroup.appendChild(highlight);
        canvas.appendChild(treeGroup);
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Form submission
document.getElementById('taskForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('taskInput');
    addTask(input.value);
    input.value = '';
    input.focus();
});

// Load tasks on page load
loadTasks();