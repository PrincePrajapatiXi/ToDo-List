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
        this.form.addEventListener('submit', (e) => this.addTodo(e));
    }

    addTodo(e) {
        e.preventDefault();
        const text = this.input.value.trim();
        if (!text) return;
        const todo = {
            id: Date.now(),
            text: text,
            completed: false
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

    // Gesture integration: handles both swipe left (delete) and drag up/down (reorder)
    setupGestures(li, index, todoId) {
        let dragging = false;
        let startX = 0, startY = 0;
        let currentX = 0, currentY = 0;
        let gestureType = null; // 'horizontal' or 'vertical'
        let swapIndex = null;
        const HORIZONTAL_THRESHOLD = 80;
        const VERTICAL_THRESHOLD = 15;

        // Helper for drag reorder
        const handleMove = (pageY) => {
            const diffY = pageY - startY;
            li.style.transform = `translateY(${diffY}px)`;
            const allItems = Array.from(this.list.children);
            let target = null;
            let targetIdx = -1;
            for (let i = 0; i < allItems.length; i++) {
                if (allItems[i] !== li) {
                    const rect = allItems[i].getBoundingClientRect();
                    if (pageY >= rect.top && pageY <= rect.bottom) {
                        target = allItems[i];
                        targetIdx = i;
                        break;
                    }
                }
            }
            allItems.forEach(el => el.classList.remove('drag-over'));
            if (target && target.classList.contains('task-item')) {
                swapIndex = targetIdx;
                target.classList.add('drag-over');
            }
        };

        // Drag/Swipe Detect (Touch + Mouse support)
        const start = (x, y) => {
            dragging = true;
            startX = x;
            startY = y;
            gestureType = null;
            swapIndex = null;
            li.classList.add('dragging');
            li.style.transition = 'none';
            document.body.style.userSelect = "none";
        };

        const move = (x, y) => {
            if (!dragging) return;
            const diffX = x - startX;
            const diffY = y - startY;

            if (!gestureType) {
                if (Math.abs(diffX) > VERTICAL_THRESHOLD && Math.abs(diffX) > Math.abs(diffY)) {
                    gestureType = 'horizontal';
                } else if (Math.abs(diffY) > VERTICAL_THRESHOLD && Math.abs(diffY) > Math.abs(diffX)) {
                    gestureType = 'vertical';
                } else {
                    return;
                }
            }

            if (gestureType === 'horizontal') {
                if (diffX < 0) { // left swipe only
                    li.style.transform = `translateX(${diffX}px)`;
                    if (Math.abs(diffX) > HORIZONTAL_THRESHOLD * 0.7) {
                        li.classList.add('swiping');
                    } else {
                        li.classList.remove('swiping');
                    }
                }
            }
            if (gestureType === 'vertical') {
                handleMove(y);
            }
        };

        const end = (x, y) => {
            if (!dragging) return;
            const diffX = x - startX;
            const diffY = y - startY;
            li.style.transition = 'all 0.3s ease';

            if (gestureType === 'horizontal') {
                li.classList.remove('swiping');
                if (diffX < -HORIZONTAL_THRESHOLD) {
                    li.style.transform = `translateX(-100%)`;
                    li.style.opacity = '0';
                    setTimeout(() => this.deleteTodo(todoId), 250);
                } else {
                    li.style.transform = '';
                    li.style.opacity = '1';
                }
            } else if (gestureType === 'vertical') {
                li.classList.remove('dragging');
                li.style.transform = '';
                document.body.style.userSelect = "";
                const allItems = Array.from(this.list.children);
                allItems.forEach(el => el.classList.remove('drag-over'));
                if (swapIndex !== null && swapIndex !== index) {
                    const moved = this.todos.splice(index, 1)[0];
                    this.todos.splice(swapIndex, 0, moved);
                    this.saveTodos();
                    this.renderTodos();
                }
            }
            dragging = false;
            gestureType = null;
            swapIndex = null;
        };

        // Mouse events
        li.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            start(e.clientX, e.clientY);
        });
        document.addEventListener('mousemove', (e) => {
            if (!dragging) return;
            move(e.clientX, e.clientY);
        });
        document.addEventListener('mouseup', (e) => {
            if (!dragging) return;
            end(e.clientX, e.clientY);
        });

        // Touch events
        li.addEventListener('touchstart', (e) => {
            const t = e.touches[0];
            start(t.clientX, t.clientY);
        }, { passive: false });
        li.addEventListener('touchmove', (e) => {
            if (!dragging) return;
            const t = e.touches[0];
            move(t.clientX, t.clientY);
            e.preventDefault();
        }, { passive: false });
        li.addEventListener('touchend', (e) => {
            if (!dragging) return;
            const t = e.changedTouches[0];
            end(t.clientX, t.clientY);
        }, { passive: false });
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
            li.className = `task-item${todo.completed ? ' completed' : ''}`;
            li.innerHTML = `
                <div class="task-checkbox${todo.completed ? ' checked' : ''}" 
                    onclick="event.stopPropagation(); app.toggleTodo(${todo.id})"></div>
                <span class="task-text">${this.escapeHtml(todo.text)}</span>
                <div class="task-actions">
                    <button class="delete-btn" onclick="event.stopPropagation(); app.deleteTodo(${todo.id})">×</button>
                </div>
            `;
            this.setupGestures(li, index, todo.id);
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

document.addEventListener('DOMContentLoaded', () => {
    window.app = new TodoApp();
});
