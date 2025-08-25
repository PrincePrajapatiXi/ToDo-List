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
    
    // Simple swipe implementation
    setupSwipe(element, todoId) {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        
        // Mouse events (for desktop testing)
        element.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            isDragging = true;
            element.style.transition = 'none';
            element.style.cursor = 'grabbing';
        });
        
        element.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            currentX = e.clientX;
            const diffX = startX - currentX;
            
            if (diffX > 0) {
                element.style.transform = `translateX(-${diffX}px)`;
                
                if (diffX > 50) {
                    element.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                    element.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                }
            }
        });
        
        element.addEventListener('mouseup', () => {
            if (!isDragging) return;
            
            const diffX = startX - currentX;
            element.style.transition = 'all 0.3s ease';
            element.style.cursor = 'default';
            
            if (diffX > 100) {
                element.style.transform = 'translateX(-100%)';
                element.style.opacity = '0';
                setTimeout(() => this.deleteTodo(todoId), 300);
            } else {
                element.style.transform = 'translateX(0)';
                element.style.backgroundColor = '';
                element.style.borderColor = '';
            }
            
            isDragging = false;
        });
        
        // Touch events (for mobile)
        element.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            element.style.transition = 'none';
        });
        
        element.addEventListener('touchmove', (e) => {
            e.preventDefault();
            currentX = e.touches[0].clientX;
            const diffX = startX - currentX;
            
            if (diffX > 0) {
                element.style.transform = `translateX(-${diffX}px)`;
                
                if (diffX > 50) {
                    element.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                    element.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                }
            }
        });
        
        element.addEventListener('touchend', () => {
            const diffX = startX - currentX;
            element.style.transition = 'all 0.3s ease';
            
            if (diffX > 100) {
                element.style.transform = 'translateX(-100%)';
                element.style.opacity = '0';
                setTimeout(() => this.deleteTodo(todoId), 300);
            } else {
                element.style.transform = 'translateX(0)';
                element.style.backgroundColor = '';
                element.style.borderColor = '';
            }
        });
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
                     onclick="event.stopPropagation(); app.toggleTodo(${todo.id})">
                </div>
                <span class="task-text">${this.escapeHtml(todo.text)}</span>
                <div class="task-actions">
                    <button class="delete-btn" onclick="event.stopPropagation(); app.deleteTodo(${todo.id})">
                        ×
                    </button>
                </div>
            `;
            
            // Setup swipe functionality for this element
            this.setupSwipe(li, todo.id);
            
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
