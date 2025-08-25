class TodoApp {
    constructor() {
        this.form = document.getElementById('todo-form');
        this.input = document.getElementById('todo-input');
        this.list = document.getElementById('todo-list');
        this.counter = document.getElementById('taskCounter');
        this.emptyState = document.getElementById('empty-state');
        
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        
        this.init();
    }
    
    init() {
        this.renderTodos();
        this.updateCounter();
        this.bindEvents();
    }
    
    bindEvents() {
        this.form.addEventListener('submit', (e) => this.addTodo(e));
    }
    
    addTodo(e) {
        e.preventDefault();
        const text = this.input.value.trim();
        
        if (!text) return;
        
        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.todos.unshift(todo);
        this.saveTodos();
        this.renderTodos();
        this.updateCounter();
        
        this.input.value = '';
        this.input.focus();
    }
    
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.renderTodos();
            this.updateCounter();
        }
    }
    
    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
        this.renderTodos();
        this.updateCounter();
    }
    
    renderTodos() {
        this.list.innerHTML = '';
        
        if (this.todos.length === 0) {
            this.emptyState.style.display = 'block';
            return;
        }
        
        this.emptyState.style.display = 'none';
        
        this.todos.forEach((todo, index) => {
            const li = document.createElement('li');
            li.className = `task-item ${todo.completed ? 'completed' : ''}`;
            li.style.animationDelay = `${index * 0.1}s`;
            
            li.innerHTML = `
                <div class="task-checkbox ${todo.completed ? 'checked' : ''}" 
                     onclick="app.toggleTodo(${todo.id})">
                </div>
                <span class="task-text">${this.escapeHtml(todo.text)}</span>
                <div class="task-actions">
                    <button class="delete-btn" onclick="app.deleteTodo(${todo.id})">
                        ×
                    </button>
                </div>
            `;
            
            this.list.appendChild(li);
        });
    }
    
    updateCounter() {
        const activeCount = this.todos.filter(t => !t.completed).length;
        this.counter.textContent = activeCount;
    }
    
    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TodoApp();
});
