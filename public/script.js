let API_BASE_URL = 'http://localhost:3000'; 

// Get references to DOM elements
const taskForm = document.getElementById('task-form');
const taskNameInput = document.getElementById('task-name');
const taskDueDateInput = document.getElementById('task-due-date');
const taskList = document.getElementById('task-list');

// Fetch API URL from backend
async function loadConfig() {
  try {
    console.log('Loading configuration...');
    const response = await fetch('/config');
    const config = await response.json();
    API_BASE_URL = config.API_BASE_URL || API_BASE_URL;
    console.log('API Base URL set to:', API_BASE_URL);
    
    // Test API connectivity
    await testAPIConnection();
    fetchTasks();
  } catch (error) {
    console.error('Error fetching config:', error);
    // Fallback to current domain
    API_BASE_URL = window.location.origin;
    console.log('Using fallback API URL:', API_BASE_URL);
    fetchTasks();
  }
}

// Test API connection
async function testAPIConnection() {
  try {
    console.log('Testing API connection...');
    const response = await fetch(`${API_BASE_URL}/health`);
    const result = await response.json();
    console.log('API Health Check:', result);
    
    if (result.database !== 'connected') {
      console.warn('⚠️ Database is not connected');
      showMessage('Warning: Database connection issue detected', 'warning');
    }
  } catch (error) {
    console.error('API connection test failed:', error);
    showMessage('Warning: Cannot connect to API server', 'error');
  }
}

// Show user messages
function showMessage(message, type = 'info') {
  // Remove existing messages
  const existingMessage = document.querySelector('.message');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
    padding: 10px;
    margin: 10px 0;
    border-radius: 4px;
    background-color: ${type === 'error' ? '#ffebee' : type === 'warning' ? '#fff3e0' : '#e3f2fd'};
    color: ${type === 'error' ? '#c62828' : type === 'warning' ? '#ef6c00' : '#1565c0'};
    border: 1px solid ${type === 'error' ? '#ef5350' : type === 'warning' ? '#ff9800' : '#2196f3'};
  `;
  
  document.querySelector('.container').insertBefore(messageDiv, taskForm);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.remove();
    }
  }, 5000);
}

// Fetch tasks from the backend API
async function fetchTasks() {
  try {
    console.log('Fetching tasks from:', `${API_BASE_URL}/tasks`);
    const response = await fetch(`${API_BASE_URL}/tasks`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const tasks = await response.json();
    console.log('Fetched tasks:', tasks);
    taskList.innerHTML = '';

    if (tasks.length === 0) {
      taskList.innerHTML = '<li style="text-align: center; color: #666;">No tasks yet. Add your first task!</li>';
      return;
    }

    tasks.forEach(task => {
      const formattedDate = task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date';
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${task.task_name} - ${formattedDate}</span>
        <button onclick="markAsCompleted(${task.id})">✔</button>
        <button class="delete-btn" onclick="deleteTask(${task.id})">🗑</button>
      `;
      if (task.completed) {
        li.classList.add('completed');
      }
      taskList.appendChild(li);
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    taskList.innerHTML = '<li style="text-align: center; color: #f44336;">Failed to load tasks. Check console for details.</li>';
    showMessage(`Failed to fetch tasks: ${error.message}`, 'error');
  }
}

// Add a new task
taskForm.addEventListener('submit', async function(event) {
  event.preventDefault();

  const taskName = taskNameInput.value.trim();
  const dueDate = taskDueDateInput.value || null;

  if (!taskName) {
    alert('Task name cannot be empty!');
    return;
  }

  try {
    console.log('Creating task:', { taskName, dueDate });
    console.log('Sending to:', `${API_BASE_URL}/tasks`);
    
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskName, dueDate })
    });

    const result = await response.json();
    console.log('Task creation response:', result);
    
    if (!response.ok) {
      throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    console.log('✅ Task created successfully:', result);
    showMessage('Task added successfully!', 'info');
    fetchTasks();
    taskNameInput.value = '';
    taskDueDateInput.value = '';
    
  } catch (error) {
    console.error('❌ Error adding task:', error);
    showMessage(`Failed to add task: ${error.message}`, 'error');
  }
});

// Mark task as completed
async function markAsCompleted(taskId) {
  try {
    console.log('Marking task as completed:', taskId);
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true })
    });
    
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || `HTTP ${response.status}`);
    }
    
    console.log('✅ Task marked as completed');
    fetchTasks();
  } catch (error) {
    console.error('❌ Error marking task as completed:', error);
    showMessage(`Failed to update task: ${error.message}`, 'error');
  }
}

// Delete a task
async function deleteTask(taskId) {
  if (!confirm('Are you sure you want to delete this task?')) {
    return;
  }
  
  try {
    console.log('Deleting task:', taskId);
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, { method: 'DELETE' });
    
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || `HTTP ${response.status}`);
    }
    
    console.log('✅ Task deleted successfully');
    fetchTasks();
  } catch (error) {
    console.error('❌ Error deleting task:', error);
    showMessage(`Failed to delete task: ${error.message}`, 'error');
  }
}

// Load tasks on page load
window.onload = loadConfig;
