class TodoApp {
    constructor() {
        this.form = document.getElementById('todo-form');
        this.input = document.getElementById('todo-input');
        this.list = document.getElementById('todo-list');
        this.counter = document.getElementById('taskCounter');
        this.emptyState = document.getElementById('empty-state');
        
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        
        // Touch/swipe variables
        this.startX = 0;
        this.currentX = 0;
        this.swipeThreshold = 100;
        this.activeElement = null;
        
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
        const element = document.querySelector(`[data-id="${id}"]`);
        if (element) {
            element.classList.add('swipe-delete');
            setTimeout(() => {
                this.todos = this.todos.filter(t => t.id !== id);
                this.saveTodos();
                this.renderTodos();
                this.updateCounter();
            }, 300);
        }
    }
    
    // Touch event handlers
    handleTouchStart(e, id) {
        this.startX = e.touches[0].clientX;
        this.activeElement = e.currentTarget;
        this.activeElement.style.transition = 'none';
    }
    
    handleTouchMove(e, id) {
        if (!this.activeElement) return;
        
        this.currentX = e.touches[0].clientX;
        const diffX = this.startX - this.currentX;
        
        // Only allow left swipe (positive diffX)
        if (diffX > 0) {
            this.activeElement.style.transform = `translateX(-${diffX}px)`;
            
            // Add visual feedback when approaching threshold
            if (diffX > this.swipeThreshold * 0.5) {
                this.activeElement.classList.add('swiping');
            } else {
                this.activeElement.classList.remove('swiping');
            }
        }
    }
    
    handleTouchEnd(e, id) {
        if (!this.activeElement) return;
        
        const diffX = this.startX - this.currentX;
        
        // Reset styles
        this.activeElement.style.transition = 'all 0.3s ease';
        this.activeElement.classList.remove('swiping');
        
        if (diffX > this.swipeThreshold) {
            // Swipe threshold reached - delete item
            this.deleteTodo(id);
        } else {
            // Return to original position
            this.activeElement.style.transform = 'translateX(0)';
        }
        
        this.activeElement = null;
        this.startX = 0;
        this.currentX = 0;
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
            li.setAttribute('data-id', todo.id);
            
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
            
            // Add touch event listeners for swipe functionality
            li.addEventListener('touchstart', (e) => this.handleTouchStart(e, todo.id), { passive: true });
            li.addEventListener('touchmove', (e) => this.handleTouchMove(e, todo.id), { passive: true });
            li.addEventListener('touchend', (e) => this.handleTouchEnd(e, todo.id), { passive: true });
            
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
