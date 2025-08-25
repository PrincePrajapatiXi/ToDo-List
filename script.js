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
        this.startY = 0;
        this.currentX = 0;
        this.swipeThreshold = 80;
        this.activeElement = null;
        this.isHorizontalSwipe = false;
        
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
        } else {
            // Direct deletion if no element found
            this.todos = this.todos.filter(t => t.id !== id);
            this.saveTodos();
            this.renderTodos();
            this.updateCounter();
        }
    }
    
    // Touch event handlers
    handleTouchStart(e, id) {
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
        this.activeElement = e.currentTarget;
        this.activeElement.style.transition = 'none';
        this.isHorizontalSwipe = false;
        
        console.log('Touch start:', id); // Debug log
    }
    
    handleTouchMove(e, id) {
        if (!this.activeElement) return;
        
        this.currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        
        const diffX = this.startX - this.currentX;
        const diffY = Math.abs(this.startY - currentY);
        
        // Determine if this is a horizontal swipe
        if (Math.abs(diffX) > 10 && Math.abs(diffX) > diffY) {
            this.isHorizontalSwipe = true;
            e.preventDefault(); // Prevent scrolling
        }
        
        // Only allow left swipe (positive diffX) and horizontal swipes
        if (this.isHorizontalSwipe && diffX > 0) {
            this.activeElement.style.transform = `translateX(-${diffX}px)`;
            
            console.log('Swiping:', diffX); // Debug log
            
            // Add visual feedback when approaching threshold
            if (diffX > this.swipeThreshold * 0.6) {
                this.activeElement.classList.add('swiping');
            } else {
                this.activeElement.classList.remove('swiping');
            }
        }
    }
    
    handleTouchEnd(e, id) {
        if (!this.activeElement) return;
        
        const diffX = this.startX - this.currentX;
        
        console.log('Touch end:', diffX, 'Threshold:', this.swipeThreshold); // Debug log
        
        // Reset styles
        this.activeElement.style.transition = 'all 0.3s ease';
        this.activeElement.classList.remove('swiping');
        
        if (this.isHorizontalSwipe && diffX > this.swipeThreshold) {
            // Swipe threshold reached - delete item
            console.log('Deleting task:', id); // Debug log
            this.deleteTodo(id);
        } else {
            // Return to original position
            this.activeElement.style.transform = 'translateX(0)';
        }
        
        // Reset variables
        this.activeElement = null;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.isHorizontalSwipe = false;
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
                     onclick="event.stopPropagation(); app.toggleTodo(${todo.id})">
                </div>
                <span class="task-text">${this.escapeHtml(todo.text)}</span>
                <div class="task-actions">
                    <button class="delete-btn" onclick="event.stopPropagation(); app.deleteTodo(${todo.id})">
                        ×
                    </button>
                </div>
            `;
            
            // Add touch event listeners for swipe functionality
            li.addEventListener('touchstart', (e) => this.handleTouchStart(e, todo.id), { passive: false });
            li.addEventListener('touchmove', (e) => this.handleTouchMove(e, todo.id), { passive: false });
            li.addEventListener('touchend', (e) => this.handleTouchEnd(e, todo.id), { passive: false });
            
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
