// Task Data Structure
let tasks = [];
let currentFilter = {
    priority: 'all',
    category: 'all',
    status: 'all'
};
let currentView = 'list';
let currentChartType = 'bar';
let statsChart = null;

// Load tasks from localStorage
function loadTasks() {
    const savedTasks = localStorage.getItem('taskFlowTasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    } else {
        // Sample tasks for demo
        tasks = [
            {
                id: Date.now(),
                title: 'Complete project presentation',
                description: 'Prepare slides and practice for the team meeting',
                dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                priority: 'high',
                category: 'work',
                status: 'in-progress',
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + 1,
                title: 'Morning workout',
                description: '30 minutes cardio and stretching',
                dueDate: new Date().toISOString().split('T')[0],
                priority: 'medium',
                category: 'health',
                status: 'pending',
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + 2,
                title: 'Read programming book',
                description: 'Chapter 4: Advanced JavaScript',
                dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
                priority: 'low',
                category: 'study',
                status: 'pending',
                createdAt: new Date().toISOString()
            }
        ];
    }
    updateUI();
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('taskFlowTasks', JSON.stringify(tasks));
}

// Add new task
function addTask(taskData) {
    const newTask = {
        id: Date.now(),
        ...taskData,
        createdAt: new Date().toISOString()
    };
    tasks.push(newTask);
    saveTasks();
    updateUI();
    showNotification('Task added successfully!', 'success');
}

// Update task
function updateTask(id, updatedData) {
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
        tasks[index] = { ...tasks[index], ...updatedData };
        saveTasks();
        updateUI();
        showNotification('Task updated successfully!', 'success');
    }
}

// Delete task
function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        updateUI();
        showNotification('Task deleted!', 'info');
    }
}

// Toggle task status
function toggleTaskStatus(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        let newStatus;
        switch (task.status) {
            case 'pending':
                newStatus = 'in-progress';
                break;
            case 'in-progress':
                newStatus = 'completed';
                break;
            case 'completed':
                newStatus = 'pending';
                break;
            default:
                newStatus = 'pending';
        }
        updateTask(id, { status: newStatus });
    }
}

// Update statistics
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    
    document.getElementById('totalTasks').textContent = total;
    document.getElementById('completedTasks').textContent = completed;
    document.getElementById('inProgressTasks').textContent = inProgress;
    document.getElementById('pendingTasks').textContent = pending;
    document.getElementById('taskStats').textContent = `${total} task${total !== 1 ? 's' : ''}`;
}

// Update current date
function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);
}

// Filter tasks
function filterTasks() {
    return tasks.filter(task => {
        if (currentFilter.priority !== 'all' && task.priority !== currentFilter.priority) return false;
        if (currentFilter.category !== 'all' && task.category !== currentFilter.category) return false;
        if (currentFilter.status !== 'all' && task.status !== currentFilter.status) return false;
        return true;
    });
}

// Get priority icon
function getPriorityIcon(priority) {
    const icons = {
        high: '🔴',
        medium: '🟡',
        low: '🟢'
    };
    return icons[priority] || '⚪';
}

// Get status icon
function getStatusIcon(status) {
    const icons = {
        completed: '✅',
        'in-progress': '🔄',
        pending: '⏳'
    };
    return icons[status] || '📋';
}

// Render task list
function renderTaskList() {
    const taskListDiv = document.getElementById('taskList');
    const filteredTasks = filterTasks();
    
    if (filteredTasks.length === 0) {
        taskListDiv.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h6>No tasks found</h6>
                <p>Try changing your filters or add a new task!</p>
            </div>
        `;
        return;
    }
    
    taskListDiv.className = currentView === 'list' ? 'task-list-view' : 'task-list-view grid-view';
    
    taskListDiv.innerHTML = filteredTasks.map(task => `
        <div class="task-item" data-id="${task.id}">
            <div class="task-header">
                <div class="task-title-section">
                    <div class="task-title">
                        ${task.status === 'completed' ? '<s>' + escapeHtml(task.title) + '</s>' : escapeHtml(task.title)}
                    </div>
                    ${task.description ? `<div class="task-desc">${escapeHtml(task.description)}</div>` : ''}
                    <div class="task-meta">
                        ${task.dueDate ? `<span><i class="far fa-calendar"></i> ${formatDate(task.dueDate)}</span>` : ''}
                        <span class="priority-badge priority-${task.priority}">
                            ${getPriorityIcon(task.priority)} ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                        <span class="category-badge">
                            <i class="fas fa-folder"></i> ${task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                        </span>
                        <span class="status-badge status-${task.status}">
                            ${getStatusIcon(task.status)} ${formatStatus(task.status)}
                        </span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-action-btn status-btn" onclick="toggleTaskStatus(${task.id})" title="Change Status">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                    <button class="task-action-btn edit-btn" onclick="openEditModal(${task.id})" title="Edit Task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-action-btn delete-btn" onclick="deleteTask(${task.id})" title="Delete Task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Format status
function formatStatus(status) {
    const statusMap = {
        'pending': 'Pending',
        'in-progress': 'In Progress',
        'completed': 'Completed'
    };
    return statusMap[status] || status;
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Update chart
function updateChart() {
    const categories = ['work', 'personal', 'study', 'health', 'other'];
    const categoryData = categories.map(cat => 
        tasks.filter(t => t.category === cat).length
    );
    
    const statuses = ['pending', 'in-progress', 'completed'];
    const statusData = statuses.map(status => 
        tasks.filter(t => t.status === status).length
    );
    
    const priorityLevels = ['low', 'medium', 'high'];
    const priorityData = priorityLevels.map(priority => 
        tasks.filter(t => t.priority === priority).length
    );
    
    let chartData, labels, datasets;
    
    if (currentChartType === 'bar') {
        labels = ['Work', 'Personal', 'Study', 'Health', 'Other'];
        chartData = categoryData;
        datasets = [{
            label: 'Tasks by Category',
            data: chartData,
            backgroundColor: [
                'rgba(102, 126, 234, 0.8)',
                'rgba(0, 176, 155, 0.8)',
                'rgba(246, 211, 101, 0.8)',
                'rgba(245, 87, 108, 0.8)',
                'rgba(240, 147, 251, 0.8)'
            ],
            borderColor: [
                '#667eea',
                '#00b09b',
                '#f6d365',
                '#f5576c',
                '#f093fb'
            ],
            borderWidth: 1
        }];
    } else if (currentChartType === 'pie') {
        labels = ['Pending', 'In Progress', 'Completed'];
        chartData = statusData;
        datasets = [{
            data: chartData,
            backgroundColor: [
                'rgba(255, 68, 68, 0.8)',
                'rgba(255, 193, 7, 0.8)',
                'rgba(0, 255, 136, 0.8)'
            ],
            borderWidth: 0
        }];
    } else {
        labels = ['Low', 'Medium', 'High'];
        chartData = priorityData;
        datasets = [{
            label: 'Tasks by Priority',
            data: chartData,
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
        }];
    }
    
    if (statsChart) {
        statsChart.destroy();
    }
    
    const ctx = document.getElementById('statsChart').getContext('2d');
    statsChart = new Chart(ctx, {
        type: currentChartType,
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: 'white' } }
            }
        }
    });
}

// Open edit modal
function openEditModal(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        document.getElementById('editTaskId').value = task.id;
        document.getElementById('editTaskTitle').value = task.title;
        document.getElementById('editTaskDesc').value = task.description || '';
        document.getElementById('editTaskDate').value = task.dueDate || '';
        document.getElementById('editTaskPriority').value = task.priority;
        document.getElementById('editTaskCategory').value = task.category;
        document.getElementById('editTaskStatus').value = task.status;
        
        const modal = new bootstrap.Modal(document.getElementById('editTaskModal'));
        modal.show();
    }
}

// Show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} position-fixed top-0 start-50 translate-middle-x mt-3`;
    notification.style.zIndex = '9999';
    notification.style.minWidth = '300px';
    notification.style.animation = 'slideInLeft 0.3s ease';
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
        ${message}
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Update all UI
function updateUI() {
    updateStats();
    renderTaskList();
    updateChart();
}

// Event Listeners
document.getElementById('taskForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('taskTitle').value;
    if (!title.trim()) {
        showNotification('Please enter a task title!', 'error');
        return;
    }
    
    const newTask = {
        title: title,
        description: document.getElementById('taskDesc').value,
        dueDate: document.getElementById('taskDate').value,
        priority: document.getElementById('taskPriority').value,
        category: document.getElementById('taskCategory').value,
        status: document.getElementById('taskStatus').value
    };
    
    addTask(newTask);
    e.target.reset();
});

document.getElementById('saveTaskEdit').addEventListener('click', () => {
    const id = parseInt(document.getElementById('editTaskId').value);
    const updatedTask = {
        title: document.getElementById('editTaskTitle').value,
        description: document.getElementById('editTaskDesc').value,
        dueDate: document.getElementById('editTaskDate').value,
        priority: document.getElementById('editTaskPriority').value,
        category: document.getElementById('editTaskCategory').value,
        status: document.getElementById('editTaskStatus').value
    };
    
    if (!updatedTask.title.trim()) {
        showNotification('Task title cannot be empty!', 'error');
        return;
    }
    
    updateTask(id, updatedTask);
    bootstrap.Modal.getInstance(document.getElementById('editTaskModal')).hide();
});

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const filterType = btn.dataset.filter;
        if (filterType.startsWith('priority')) {
            currentFilter.priority = filterType.replace('priority-', '');
            document.querySelectorAll('[data-filter^="priority"]').forEach(b => b.classList.remove('active'));
        } else if (filterType.startsWith('category')) {
            currentFilter.category = filterType.replace('category-', '');
            document.querySelectorAll('[data-filter^="category"]').forEach(b => b.classList.remove('active'));
        } else if (filterType.startsWith('status')) {
            currentFilter.status = filterType.replace('status-', '');
            document.querySelectorAll('[data-filter^="status"]').forEach(b => b.classList.remove('active'));
        }
        btn.classList.add('active');
        renderTaskList();
    });
});

// Clear filters
document.getElementById('clearFilters').addEventListener('click', () => {
    currentFilter = { priority: 'all', category: 'all', status: 'all' };
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.filter-btn[data-filter$="all"]').forEach(btn => btn.classList.add('active'));
    renderTaskList();
});

// View buttons
document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentView = btn.dataset.view;
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTaskList();
    });
});

// Chart type buttons
document.querySelectorAll('.chart-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentChartType = btn.dataset.chart;
        document.querySelectorAll('.chart-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateChart();
    });
});

// Initialize
function init() {
    updateDate();
    setInterval(updateDate, 1000);
    loadTasks();
}

init();