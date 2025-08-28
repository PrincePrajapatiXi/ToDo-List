class TodoApp {
    constructor() {
        // DOM elements - Core
        this.form = document.getElementById('todo-form');
        this.input = document.getElementById('todo-input');
        this.list = document.getElementById('todo-list');
        this.emptyState = document.getElementById('empty-state');
        this.sidebar = document.getElementById('sidebar');
        this.menuToggle = document.getElementById('menu-toggle');
        this.menuOverlay = document.getElementById('menu-overlay');
        this.fab = document.getElementById('fab');
        this.toastContainer = document.getElementById('toast-container');
        
        // DOM elements - Page elements
        this.pageTitle = document.getElementById('page-title');
        this.mobilePageTitle = document.getElementById('mobile-page-title');
        this.currentDateElement = document.getElementById('current-date');
        
        // DOM elements - Section elements
        this.sections = {
            'my-day': document.getElementById('my-day-section'),
            'important': document.getElementById('important-section'),
            'planned': document.getElementById('planned-section'),
            'assigned': document.getElementById('assigned-section'),
            'tasks': document.getElementById('tasks-section')
        };
        
        // DOM elements - List elements
        this.lists = {
            'my-day': document.getElementById('todo-list'),
            'important': document.getElementById('important-list'),
            'planned': document.getElementById('planned-list'),
            'assigned': document.getElementById('assigned-list'),
            'all-my-day-tasks': document.getElementById('all-my-day-tasks'),
            'all-important-tasks': document.getElementById('all-important-tasks'),
            'all-completed-tasks': document.getElementById('all-completed-tasks')
        };
        
        // DOM elements - Count elements
        this.counts = {
            'my-day': document.getElementById('my-day-count'),
            'important': document.getElementById('important-count'),
            'planned': document.getElementById('planned-count'),
            'assigned': document.getElementById('assigned-count'),
            'tasks': document.getElementById('tasks-count')
        };
        
        // DOM elements - Modal elements
        this.taskModal = document.getElementById('task-modal');
        this.addTaskDialog = document.getElementById('add-task-dialog');
        this.addTaskForm = document.getElementById('add-task-form');
        this.dialogTaskInput = document.getElementById('dialog-task-input');
        
        // DOM elements - Custom lists
        this.newListBtn = document.getElementById('new-list-btn');
        this.newListModal = document.getElementById('new-list-modal');
        this.newListForm = document.getElementById('new-list-form');
        this.listNameInput = document.getElementById('list-name-input');
        this.customListsContainer = document.getElementById('custom-lists');
        this.dynamicSections = document.getElementById('dynamic-sections');
        
        // DOM elements - List settings
        this.listSettingsModal = document.getElementById('list-settings-modal');
        this.themeGrid = document.getElementById('theme-grid');
        this.newListThemeGrid = document.getElementById('new-list-theme-grid');
        
        // State
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.customLists = JSON.parse(localStorage.getItem('customLists')) || [];
        this.currentPage = 'my-day';
        this.currentTaskId = null;
        this.currentListId = null;
        this.selectedTheme = 'theme-blue';
        this.lastTouchEnd = 0;
        
        // Page configurations
        this.pageConfigs = {
            'my-day': {
                title: '☀️ My Day',
                subtitle: this.getCurrentDate(),
                showAddTask: true,
                showDate: true
            },
            'important': {
                title: '⭐ Important',
                subtitle: '',
                showAddTask: false,
                showDate: false
            },
            'planned': {
                title: '📅 Planned',
                subtitle: '',
                showAddTask: false,
                showDate: false
            },
            'assigned': {
                title: '👤 Assigned to me',
                subtitle: '',
                showAddTask: false,
                showDate: false
            },
            'tasks': {
                title: '🏠 Tasks',
                subtitle: '',
                showAddTask: true,
                showDate: false
            }
        };
        
        // Theme definitions
        this.themes = {
            'theme-blue': { name: 'Blue', primary: '#4285f4', secondary: '#1976d2' },
            'theme-purple': { name: 'Purple', primary: '#9c27b0', secondary: '#673ab7' },
            'theme-pink': { name: 'Pink', primary: '#e91e63', secondary: '#f06292' },
            'theme-red': { name: 'Red', primary: '#f44336', secondary: '#d32f2f' },
            'theme-green': { name: 'Green', primary: '#4caf50', secondary: '#388e3c' },
            'theme-teal': { name: 'Teal', primary: '#009688', secondary: '#00695c' },
            'theme-gray': { name: 'Gray', primary: '#607d8b', secondary: '#455a64' },
            'theme-light-blue': { name: 'Light Blue', primary: '#03a9f4', secondary: '#0288d1' },
            'theme-light-purple': { name: 'Light Purple', primary: '#ba68c8', secondary: '#9c27b0' },
            'theme-orange': { name: 'Orange', primary: '#ff9800', secondary: '#f57c00' },
            'theme-peach': { name: 'Peach', primary: '#ffab91', secondary: '#ff8a65' },
            'theme-mint': { name: 'Mint', primary: '#a5d6a7', secondary: '#66bb6a' },
            'theme-sky': { name: 'Sky', primary: '#81d4fa', secondary: '#4fc3f7' },
            'theme-slate': { name: 'Slate', primary: '#90a4ae', secondary: '#546e7a' },
            'theme-forest': { name: 'Forest', primary: '#2e7d32', secondary: '#1b5e20' },
            'theme-nature': { name: 'Nature', type: 'image' },
            'theme-ocean': { name: 'Ocean', type: 'image' },
            'theme-sunset': { name: 'Sunset', type: 'image' },
            'theme-mountain': { name: 'Mountain', type: 'image' }
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderCustomLists();
        this.renderAllSections();
        this.updateAllCounts();
        this.updateCurrentDate();
        this.populateThemeGrids();
        this.setupSearch();
        
        // Focus input after short delay
        setTimeout(() => {
            if (window.innerWidth > 768 && this.currentPage === 'my-day') {
                this.input?.focus();
            }
        }, 300);
    }

    setupEventListeners() {
        // Form submissions
        this.form?.addEventListener('submit', (e) => this.addTodo(e));
        this.addTaskForm?.addEventListener('submit', (e) => this.addTodoFromDialog(e));
        this.newListForm?.addEventListener('submit', (e) => this.createNewList(e));
        
        // Mobile menu
        this.menuToggle?.addEventListener('click', () => this.toggleMobileMenu());
        this.menuOverlay?.addEventListener('click', () => this.closeMobileMenu());
        
        // FAB
        this.fab?.addEventListener('click', () => this.handleFabClick());
        
        // New list creation
        this.newListBtn?.addEventListener('click', () => this.showNewListModal());
        
        // Modal events
        this.taskModal?.addEventListener('click', (e) => {
            if (e.target === this.taskModal || e.target.classList.contains('modal-backdrop')) {
                this.hideTaskModal();
            }
        });
        
        this.addTaskDialog?.addEventListener('click', (e) => {
            if (e.target === this.addTaskDialog || e.target.classList.contains('modal-backdrop')) {
                this.hideAddTaskDialog();
            }
        });
        
        // Modal action buttons
        document.getElementById('edit-task-btn')?.addEventListener('click', () => this.editCurrentTask());
        document.getElementById('toggle-important-btn')?.addEventListener('click', () => this.toggleCurrentTaskImportant());
        document.getElementById('add-to-my-day-btn')?.addEventListener('click', () => this.toggleCurrentTaskMyDay());
        document.getElementById('delete-task-btn')?.addEventListener('click', () => this.deleteCurrentTask());
        
        // Close modal buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.hideAllModals());
        });
        
        // List settings
        document.getElementById('rename-list-btn')?.addEventListener('click', () => this.renameCurrentList());
        document.getElementById('delete-list-btn')?.addEventListener('click', () => this.deleteCurrentList());
        
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => this.handleNavigation(item));
        });
        
        // Theme selection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('theme-option')) {
                this.selectTheme(e.target.dataset.theme);
            }
        });
        
        // Context menu for custom lists
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.custom-lists .nav-item')) {
                e.preventDefault();
                this.showListContextMenu(e, e.target.closest('.nav-item'));
            }
        });
        
        // Close context menu on click outside
        document.addEventListener('click', () => this.hideContextMenu());
        
        // Header buttons
        document.getElementById('sort-btn')?.addEventListener('click', () => this.showToast('Sort functionality coming soon!'));
        document.getElementById('suggestions-btn')?.addEventListener('click', () => this.showSuggestions());
        document.getElementById('more-btn')?.addEventListener('click', () => this.showToast('More options coming soon!'));
        
        // Input events
        this.input?.addEventListener('input', () => this.handleInputChange());
        this.input?.addEventListener('focus', () => this.handleInputFocus());
        this.input?.addEventListener('blur', () => this.handleInputBlur());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Window events
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('beforeunload', () => this.saveData());
        
        // Prevent zoom on double tap (iOS)
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - this.lastTouchEnd <= 300) {
                e.preventDefault();
            }
            this.lastTouchEnd = now;
        }, false);
    }

    // Navigation Functions
    handleNavigation(navItem) {
        const previousPage = this.currentPage;
        const newPage = navItem.dataset.page;
        
        if (newPage === this.currentPage) return;
        
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to clicked item
        navItem.classList.add('active');
        
        // Check if it's a custom list
        const listId = navItem.dataset.listId;
        if (listId) {
            this.switchToCustomList(parseInt(listId));
        } else {
            // Switch to standard page
            this.switchToPage(newPage, previousPage);
        }
        
        // Close mobile menu
        if (window.innerWidth <= 768) {
            this.closeMobileMenu();
        }
    }

    switchToPage(newPage, previousPage) {
        const previousSection = this.sections[previousPage];
        const newSection = this.sections[newPage];
        
        if (!newSection) return;
        
        // Hide previous section
        if (previousSection) {
            previousSection.classList.remove('active');
        }
        
        // Hide all custom sections
        document.querySelectorAll('.custom-list-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show new section with animation
        setTimeout(() => {
            newSection.classList.add('active');
            newSection.classList.add('slide-in-right');
            
            setTimeout(() => {
                newSection.classList.remove('slide-in-right');
            }, 300);
        }, 100);
        
        // Update current page
        this.currentPage = newPage;
        this.currentListId = null;
        
        // Update page title and subtitle
        this.updatePageHeader();
        
        // Render content for the new page
        this.renderCurrentPage();
        
        // Update input focus
        if (newPage === 'my-day' && window.innerWidth > 768) {
            setTimeout(() => this.input?.focus(), 400);
        }
    }

    updatePageHeader() {
        const config = this.pageConfigs[this.currentPage];
        if (!config) return;
        
        // Update desktop header
        if (this.pageTitle) {
            this.pageTitle.textContent = config.title;
        }
        
        // Update mobile header
        if (this.mobilePageTitle) {
            this.mobilePageTitle.textContent = config.title.replace(/[^\w\s]/gi, '').trim();
        }
        
        // Update subtitle
        if (this.currentDateElement) {
            if (config.showDate) {
                this.currentDateElement.textContent = config.subtitle;
                this.currentDateElement.style.display = 'block';
            } else {
                this.currentDateElement.style.display = 'none';
            }
        }
    }

    updateCustomPageTitle(title) {
        if (this.pageTitle) {
            this.pageTitle.textContent = title;
        }
        
        if (this.mobilePageTitle) {
            this.mobilePageTitle.textContent = title;
        }
        
        if (this.currentDateElement) {
            this.currentDateElement.style.display = 'none';
        }
    }

    // Todo Functions
    addTodo(e) {
        e.preventDefault();
        const text = this.input?.value.trim();
        if (!text) return;
        
        this.createTodo(text);
        this.input.value = '';
        this.handleInputBlur();
        if (window.innerWidth > 768) {
            this.input?.focus();
        }
    }

    addTodoFromDialog(e) {
        e.preventDefault();
        const text = this.dialogTaskInput?.value.trim();
        if (!text) return;
        
        this.createTodo(text);
        this.hideAddTaskDialog();
    }

    createTodo(text) {
        if (text.length > 255) {
            this.showToast('Task is too long. Maximum 255 characters.', 'error');
            return;
        }
        
        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            important: false,
            myDay: this.currentPage === 'my-day' || this.currentPage.startsWith('custom-'),
            planned: false,
            assigned: false,
            listId: this.currentListId || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.todos.unshift(todo);
        this.saveData();
        this.renderAllSections();
        this.updateAllCounts();
        
        this.showToast('Task added successfully!', 'success');
        this.vibrate(50);
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;
        
        todo.completed = !todo.completed;
        todo.updatedAt = new Date().toISOString();
        
        if (todo.completed) {
            todo.completedAt = new Date().toISOString();
        } else {
            delete todo.completedAt;
        }
        
        this.saveData();
        this.renderAllSections();
        this.updateAllCounts();
        
        const message = todo.completed ? 'Task completed! 🎉' : 'Task reopened';
        this.showToast(message, todo.completed ? 'success' : 'info');
        this.vibrate(todo.completed ? [50, 50, 50] : 30);
    }

    toggleImportant(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;
        
        todo.important = !todo.important;
        todo.updatedAt = new Date().toISOString();
        
        this.saveData();
        this.renderAllSections();
        this.updateAllCounts();
        
        const message = todo.important ? 'Marked as important ⭐' : 'Removed from important';
        this.showToast(message);
        this.vibrate(30);
    }

    toggleMyDay(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;
        
        todo.myDay = !todo.myDay;
        todo.updatedAt = new Date().toISOString();
        
        this.saveData();
        this.renderAllSections();
        this.updateAllCounts();
        
        const message = todo.myDay ? 'Added to My Day ☀️' : 'Removed from My Day';
        this.showToast(message);
        this.vibrate(30);
    }

    deleteTodo(id, showUndo = true) {
        const todoIndex = this.todos.findIndex(t => t.id === id);
        if (todoIndex === -1) return;
        
        const todo = this.todos[todoIndex];
        this.todos.splice(todoIndex, 1);
        
        this.saveData();
        this.renderAllSections();
        this.updateAllCounts();
        
        if (showUndo) {
            this.showUndoToast(todo, todoIndex);
        } else {
            this.showToast('Task deleted', 'info');
        }
        
        this.vibrate(50);
    }

    restoreTodo(todo, index) {
        this.todos.splice(index, 0, todo);
        this.saveData();
        this.renderAllSections();
        this.updateAllCounts();
        this.showToast('Task restored!', 'success');
        this.vibrate(30);
    }

    editTodo(id, newText) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;
        
        todo.text = newText.trim();
        todo.updatedAt = new Date().toISOString();
        
        this.saveData();
        this.renderAllSections();
        this.showToast('Task updated!', 'success');
    }

    // Rendering Functions
    renderAllSections() {
        this.renderMyDay();
        this.renderImportant();
        this.renderPlanned();
        this.renderAssigned();
        this.renderTasks();
        
        // Render custom lists
        this.customLists.forEach(list => {
            this.renderCustomListTasks(list.id);
        });
    }

    renderCurrentPage() {
        if (this.currentPage.startsWith('custom-')) {
            const listId = parseInt(this.currentPage.split('-')[1]);
            this.renderCustomListTasks(listId);
        } else {
            switch (this.currentPage) {
                case 'my-day':
                    this.renderMyDay();
                    break;
                case 'important':
                    this.renderImportant();
                    break;
                case 'planned':
                    this.renderPlanned();
                    break;
                case 'assigned':
                    this.renderAssigned();
                    break;
                case 'tasks':
                    this.renderTasks();
                    break;
            }
        }
    }

    renderMyDay() {
        const myDayTodos = this.todos.filter(t => t.myDay && !t.completed);
        this.renderTodoList(this.lists['my-day'], myDayTodos, 'my-day');
        
        // Show/hide empty state
        const emptyState = this.sections['my-day']?.querySelector('.empty-state');
        if (emptyState) {
            emptyState.style.display = myDayTodos.length === 0 ? 'flex' : 'none';
        }
    }

    renderImportant() {
        const importantTodos = this.todos.filter(t => t.important && !t.completed);
        this.renderTodoList(this.lists['important'], importantTodos, 'important');
    }

    renderPlanned() {
        const plannedTodos = this.todos.filter(t => t.planned && !t.completed);
        this.renderTodoList(this.lists['planned'], plannedTodos, 'planned');
    }

    renderAssigned() {
        const assignedTodos = this.todos.filter(t => t.assigned && !t.completed);
        this.renderTodoList(this.lists['assigned'], assignedTodos, 'assigned');
    }

    renderTasks() {
        // Render different groups in Tasks section
        const myDayTodos = this.todos.filter(t => t.myDay);
        const importantTodos = this.todos.filter(t => t.important);
        const completedTodos = this.todos.filter(t => t.completed);
        
        this.renderTodoList(this.lists['all-my-day-tasks'], myDayTodos, 'tasks');
        this.renderTodoList(this.lists['all-important-tasks'], importantTodos, 'tasks');
        this.renderTodoList(this.lists['all-completed-tasks'], completedTodos, 'tasks');
        
        // Show/hide groups based on content
        const importantGroup = document.getElementById('important-group');
        const completedGroup = document.getElementById('completed-group');
        
        if (importantGroup) {
            importantGroup.style.display = importantTodos.length > 0 ? 'block' : 'none';
        }
        
        if (completedGroup) {
            completedGroup.style.display = completedTodos.length > 0 ? 'block' : 'none';
        }
    }

    renderTodoList(listElement, todos, section) {
        if (!listElement) return;
        
        listElement.innerHTML = '';
        
        todos.forEach((todo) => {
            const li = this.createTaskElement(todo, section);
            listElement.appendChild(li);
        });
    }

    createTaskElement(todo, section) {
        const li = document.createElement('li');
        li.className = `task-item${todo.completed ? ' completed' : ''}`;
        li.setAttribute('data-id', todo.id);
        li.setAttribute('role', 'listitem');
        
        li.innerHTML = `
            <button class="task-checkbox${todo.completed ? ' checked' : ''}" 
                    onclick="app.toggleTodo(${todo.id})"
                    aria-label="${todo.completed ? 'Mark as incomplete' : 'Mark as complete'}">
            </button>
            <div class="task-text">${this.escapeHtml(todo.text)}</div>
            <div class="task-actions">
                <button class="task-action-btn important${todo.important ? ' active' : ''}" 
                        onclick="app.toggleImportant(${todo.id})" 
                        aria-label="${todo.important ? 'Remove from important' : 'Mark as important'}">
                    ⭐
                </button>
                <button class="task-action-btn delete" 
                        onclick="app.deleteTodo(${todo.id})" 
                        aria-label="Delete task">
                    🗑️
                </button>
            </div>
        `;
        
        // Setup touch gestures
        this.setupTouchGestures(li, todo.id);
        
        return li;
    }

    // Custom List Management
    showNewListModal() {
        this.newListModal?.classList.add('show');
        document.body.style.overflow = 'hidden';
        setTimeout(() => this.listNameInput?.focus(), 100);
    }

    hideNewListModal() {
        this.newListModal?.classList.remove('show');
        document.body.style.overflow = '';
        if (this.listNameInput) {
            this.listNameInput.value = '';
        }
        this.selectedTheme = 'theme-blue';
        this.updateThemeSelection();
    }

    createNewList(e) {
        e.preventDefault();
        const name = this.listNameInput?.value.trim();
        
        if (!name) {
            this.showToast('Please enter a list name', 'error');
            return;
        }
        
        if (name.length > 50) {
            this.showToast('List name is too long', 'error');
            return;
        }
        
        // Check for duplicate names
        if (this.customLists.some(list => list.name.toLowerCase() === name.toLowerCase())) {
            this.showToast('A list with this name already exists', 'error');
            return;
        }
        
        const newList = {
            id: Date.now(),
            name: name,
            theme: this.selectedTheme,
            createdAt: new Date().toISOString(),
            taskCount: 0
        };
        
        this.customLists.push(newList);
        this.saveData();
        this.renderCustomLists();
        this.createCustomListSection(newList);
        this.hideNewListModal();
        
        this.showToast(`List "${name}" created successfully!`, 'success');
        this.vibrate(50);
        
        // Switch to the new list
        setTimeout(() => {
            this.switchToCustomList(newList.id);
        }, 300);
    }

    renderCustomLists() {
        if (!this.customListsContainer) return;
        
        this.customListsContainer.innerHTML = '';
        
        this.customLists.forEach(list => {
            const li = document.createElement('li');
            li.className = 'nav-item new-list';
            li.dataset.page = `custom-${list.id}`;
            li.dataset.listId = list.id;
            
            const theme = this.themes[list.theme];
            let themeColor = '#4285f4';
            if (theme && theme.primary) {
                themeColor = theme.primary;
            }
            
            li.innerHTML = `
                <div class="custom-list-indicator" style="background: ${themeColor};"></div>
                <span class="nav-text">${this.escapeHtml(list.name)}</span>
                <span class="nav-count" id="custom-${list.id}-count">0</span>
            `;
            
            // Add click event
            li.addEventListener('click', () => this.switchToCustomList(list.id));
            
            this.customListsContainer.appendChild(li);
        });
        
        // Update counts
        this.updateCustomListCounts();
    }

    createCustomListSection(list) {
        const section = document.createElement('section');
        section.id = `custom-${list.id}-section`;
        section.className = 'page-section custom-list-section';
        
        const theme = this.themes[list.theme];
        let headerStyle = '';
        if (theme && theme.primary) {
            headerStyle = `style="border-left: 4px solid ${theme.primary};"`;
        }
        
        section.innerHTML = `
            <div class="custom-list-header" ${headerStyle}>
                <h1 class="custom-list-title">
                    <div class="custom-list-indicator" style="background: ${theme?.primary || '#4285f4'};"></div>
                    ${this.escapeHtml(list.name)}
                </h1>
            </div>
            <div class="custom-list-content">
                <div class="add-task-container">
                    <div class="add-task-simple">
                        <button class="add-task-simple-btn" onclick="app.showAddTaskToList(${list.id})">
                            <span class="add-icon">+</span>
                            <span class="add-text">Add a task</span>
                        </button>
                    </div>
                </div>
                <div class="tasks-section">
                    <ul id="custom-${list.id}-list" class="task-list" role="list"></ul>
                    
                    <div class="empty-state" style="display: flex;">
                        <div class="empty-illustration">
                            <div class="empty-card" style="background: linear-gradient(135deg, ${theme?.primary || '#4285f4'}20, ${theme?.secondary || '#1976d2'}20); border-color: ${theme?.primary || '#4285f4'}40;">
                                <div class="card-icon">📋</div>
                            </div>
                        </div>
                        <h2 class="empty-title">Your list is empty</h2>
                        <p class="empty-description">Add tasks to get started with "${list.name}"</p>
                        <button class="empty-action-btn" onclick="app.showAddTaskToList(${list.id})">
                            Add your first task
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.dynamicSections?.appendChild(section);
    }

    switchToCustomList(listId) {
        const list = this.customLists.find(l => l.id === listId);
        if (!list) return;
        
        // Hide all sections
        Object.values(this.sections).forEach(section => {
            if (section) section.classList.remove('active');
        });
        
        document.querySelectorAll('.custom-list-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show custom list section
        const customSection = document.getElementById(`custom-${listId}-section`);
        if (customSection) {
            customSection.classList.add('active');
        }
        
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const navItem = document.querySelector(`[data-list-id="${listId}"]`);
        if (navItem) {
            navItem.classList.add('active');
        }
        
        // Update page title
        this.updateCustomPageTitle(list.name);
        
        this.currentPage = `custom-${listId}`;
        this.currentListId = listId;
        
        // Render tasks for this list
        this.renderCustomListTasks(listId);
    }

    renderCustomListTasks(listId) {
        const listElement = document.getElementById(`custom-${listId}-list`);
        const emptyState = document.querySelector(`#custom-${listId}-section .empty-state`);
        
        if (!listElement) return;
        
        const customListTodos = this.todos.filter(t => t.listId === listId && !t.completed);
        
        listElement.innerHTML = '';
        customListTodos.forEach(todo => {
            const li = this.createTaskElement(todo, `custom-${listId}`);
            listElement.appendChild(li);
        });
        
        // Show/hide empty state
        if (emptyState) {
            emptyState.style.display = customListTodos.length === 0 ? 'flex' : 'none';
        }
    }

    showAddTaskToList(listId) {
        this.currentListId = listId;
        const list = this.customLists.find(l => l.id === listId);
        if (!list) return;
        
        const taskText = prompt(`Add task to "${list.name}":`);
        if (taskText && taskText.trim()) {
            this.createTodoForList(taskText.trim(), listId);
        }
    }

    createTodoForList(text, listId) {
        if (text.length > 255) {
            this.showToast('Task is too long. Maximum 255 characters.', 'error');
            return;
        }
        
        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            important: false,
            myDay: false,
            planned: false,
            assigned: false,
            listId: listId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.todos.unshift(todo);
        this.saveData();
        this.renderCustomListTasks(listId);
        this.updateAllCounts();
        
        this.showToast('Task added successfully!', 'success');
        this.vibrate(50);
    }

    // List Settings & Context Menu
    showListContextMenu(e, navItem) {
        const listId = parseInt(navItem.dataset.listId);
        if (!listId) return;
        
        this.hideContextMenu();
        
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.left = `${e.pageX}px`;
        contextMenu.style.top = `${e.pageY}px`;
        
        contextMenu.innerHTML = `
            <button class="context-menu-item" onclick="app.showListSettings(${listId})">
                <span>⚙️</span>
                <span>List settings</span>
            </button>
            <button class="context-menu-item" onclick="app.renameList(${listId})">
                <span>📝</span>
                <span>Rename list</span>
            </button>
            <button class="context-menu-item danger" onclick="app.deleteList(${listId})">
                <span>🗑️</span>
                <span>Delete list</span>
            </button>
        `;
        
        document.body.appendChild(contextMenu);
        
        // Adjust position if near screen edge
        const rect = contextMenu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            contextMenu.style.left = `${e.pageX - rect.width}px`;
        }
        if (rect.bottom > window.innerHeight) {
            contextMenu.style.top = `${e.pageY - rect.height}px`;
        }
    }

    hideContextMenu() {
        const existing = document.querySelector('.context-menu');
        if (existing) {
            existing.remove();
        }
    }

    showListSettings(listId) {
        this.currentListId = listId;
        const list = this.customLists.find(l => l.id === listId);
        if (!list) return;
        
        document.getElementById('list-settings-title').textContent = `${list.name} Settings`;
        this.selectedTheme = list.theme;
        this.updateThemeSelection();
        
        this.listSettingsModal?.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        this.hideContextMenu();
    }

    hideListSettings() {
        this.listSettingsModal?.classList.remove('show');
        document.body.style.overflow = '';
        this.currentListId = null;
    }

    renameList(listId) {
        const list = this.customLists.find(l => l.id === listId);
        if (!list) return;
        
        const newName = prompt('Rename list:', list.name);
        if (newName && newName.trim() && newName.trim() !== list.name) {
            const trimmedName = newName.trim();
            
            if (trimmedName.length > 50) {
                this.showToast('List name is too long', 'error');
                return;
            }
            
            // Check for duplicates
            if (this.customLists.some(l => l.id !== listId && l.name.toLowerCase() === trimmedName.toLowerCase())) {
                this.showToast('A list with this name already exists', 'error');
                return;
            }
            
            list.name = trimmedName;
            this.saveData();
            this.renderCustomLists();
            
            // Update section if currently viewing
            if (this.currentPage === `custom-${listId}`) {
                this.updateCustomPageTitle(trimmedName);
                const header = document.querySelector(`#custom-${listId}-section .custom-list-title`);
                if (header) {
                    header.innerHTML = `
                        <div class="custom-list-indicator" style="background: ${this.themes[list.theme]?.primary || '#4285f4'};"></div>
                        ${this.escapeHtml(trimmedName)}
                    `;
                }
            }
            
            this.showToast('List renamed successfully!', 'success');
        }
        
        this.hideContextMenu();
    }

    deleteList(listId) {
        const list = this.customLists.find(l => l.id === listId);
        if (!list) return;
        
        if (confirm(`Are you sure you want to delete "${list.name}"? This will also delete all tasks in this list.`)) {
            // Remove list
            this.customLists = this.customLists.filter(l => l.id !== listId);
            
            // Remove tasks in this list
            this.todos = this.todos.filter(t => t.listId !== listId);
            
            // Remove section
            const section = document.getElementById(`custom-${listId}-section`);
            if (section) {
                section.remove();
            }
            
            // Switch to My Day if currently viewing deleted list
            if (this.currentPage === `custom-${listId}`) {
                const myDayNav = document.querySelector('[data-page="my-day"]');
                if (myDayNav) {
                    myDayNav.click();
                }
            }
            
            this.saveData();
            this.renderCustomLists();
            this.updateAllCounts();
            
            this.showToast('List deleted successfully', 'success');
        }
        
        this.hideContextMenu();
    }

    renameCurrentList() {
        if (this.currentListId) {
            this.renameList(this.currentListId);
            this.hideListSettings();
        }
    }

    deleteCurrentList() {
        if (this.currentListId) {
            this.deleteList(this.currentListId);
            this.hideListSettings();
        }
    }

    // Theme Management
    populateThemeGrids() {
        const grids = [this.themeGrid, this.newListThemeGrid];
        
        grids.forEach(grid => {
            if (!grid) return;
            
            grid.innerHTML = '';
            Object.keys(this.themes).forEach(themeKey => {
                const themeOption = document.createElement('div');
                themeOption.className = `theme-option ${themeKey}`;
                themeOption.dataset.theme = themeKey;
                themeOption.title = this.themes[themeKey].name;
                
                grid.appendChild(themeOption);
            });
        });
        
        this.updateThemeSelection();
    }

    selectTheme(themeKey) {
        this.selectedTheme = themeKey;
        this.updateThemeSelection();
        
        // If in list settings, update the list theme
        if (this.currentListId && this.listSettingsModal?.classList.contains('show')) {
            const list = this.customLists.find(l => l.id === this.currentListId);
            if (list) {
                list.theme = themeKey;
                this.saveData();
                this.renderCustomLists();
                
                // Update current section if viewing this list
                if (this.currentPage === `custom-${this.currentListId}`) {
                    // Recreate the section with new theme
                    const oldSection = document.getElementById(`custom-${this.currentListId}-section`);
                    if (oldSection) {
                        oldSection.remove();
                        this.createCustomListSection(list);
                        this.renderCustomListTasks(this.currentListId);
                    }
                }
                
                this.showToast('Theme updated!', 'success');
            }
        }
    }

    updateThemeSelection() {
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.theme === this.selectedTheme) {
                option.classList.add('selected');
            }
        });
    }

    // Modal Functions
    showTaskModal(todoId) {
        this.currentTaskId = todoId;
        const todo = this.todos.find(t => t.id === todoId);
        if (!todo) return;
        
        // Update button texts
        const importantText = document.getElementById('important-text');
        const myDayText = document.getElementById('my-day-text');
        
        if (importantText) {
            importantText.textContent = todo.important ? 'Remove from important' : 'Mark as important';
        }
        
        if (myDayText) {
            myDayText.textContent = todo.myDay ? 'Remove from My Day' : 'Add to My Day';
        }
        
        this.taskModal?.classList.add('show');
        this.taskModal?.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    hideTaskModal() {
        this.taskModal?.classList.remove('show');
        this.taskModal?.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        this.currentTaskId = null;
    }

    showAddTaskDialog() {
        this.addTaskDialog?.classList.add('show');
        document.body.style.overflow = 'hidden';
        setTimeout(() => this.dialogTaskInput?.focus(), 100);
    }

    hideAddTaskDialog() {
        this.addTaskDialog?.classList.remove('show');
        document.body.style.overflow = '';
        if (this.dialogTaskInput) {
            this.dialogTaskInput.value = '';
        }
    }

    hideAllModals() {
        this.hideTaskModal();
        this.hideAddTaskDialog();
        this.hideNewListModal();
        this.hideListSettings();
    }

    editCurrentTask() {
        if (!this.currentTaskId) return;
        
        const todo = this.todos.find(t => t.id === this.currentTaskId);
        if (!todo) return;
        
        const newText = prompt('Edit task:', todo.text);
        if (newText !== null && newText.trim() !== todo.text) {
            this.editTodo(this.currentTaskId, newText);
        }
        
        this.hideTaskModal();
    }

    toggleCurrentTaskImportant() {
        if (!this.currentTaskId) return;
        this.toggleImportant(this.currentTaskId);
        this.hideTaskModal();
    }

    toggleCurrentTaskMyDay() {
        if (!this.currentTaskId) return;
        this.toggleMyDay(this.currentTaskId);
        this.hideTaskModal();
    }

    deleteCurrentTask() {
        if (!this.currentTaskId) return;
        this.deleteTodo(this.currentTaskId);
        this.hideTaskModal();
    }

    // Touch Gestures
    setupTouchGestures(element, todoId) {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        let longPressTimer = null;
        let hasLongPressed = false;
        
        const SWIPE_THRESHOLD = 120;
        const LONG_PRESS_DURATION = 500;
        
        const handleStart = (e) => {
            const touch = e.touches?.[0] || e;
            startX = touch.clientX;
            isDragging = false;
            hasLongPressed = false;
            
            element.style.transition = 'none';
            
            longPressTimer = setTimeout(() => {
                if (!isDragging) {
                    hasLongPressed = true;
                    this.showTaskModal(todoId);
                    this.vibrate(100);
                }
            }, LONG_PRESS_DURATION);
        };
        
        const handleMove = (e) => {
            if (hasLongPressed) return;
            
            const touch = e.touches?.[0] || e;
            currentX = touch.clientX;
            const diffX = currentX - startX;
            
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
            
            if (Math.abs(diffX) > 10) {
                isDragging = true;
                e.preventDefault();
                
                if (diffX < 0) {
                    const progress = Math.min(Math.abs(diffX) / SWIPE_THRESHOLD, 1);
                    element.style.transform = `translateX(${diffX}px)`;
                    
                    if (progress > 0.6) {
                        element.classList.add('swiping');
                    } else {
                        element.classList.remove('swiping');
                    }
                }
            }
        };
        
        const handleEnd = (e) => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
            
            if (hasLongPressed) return;
            
            element.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            
            const diffX = currentX - startX;
            
            if (isDragging && diffX < -SWIPE_THRESHOLD) {
                element.style.transform = 'translateX(-100%)';
                element.style.opacity = '0';
                setTimeout(() => this.deleteTodo(todoId), 300);
            } else {
                element.style.transform = '';
                element.classList.remove('swiping');
            }
            
            isDragging = false;
            startX = currentX = 0;
        };
        
        element.addEventListener('touchstart', handleStart, { passive: false });
        element.addEventListener('touchmove', handleMove, { passive: false });
        element.addEventListener('touchend', handleEnd, { passive: false });
        
        element.addEventListener('mousedown', handleStart);
        element.addEventListener('mousemove', handleMove);
        element.addEventListener('mouseup', handleEnd);
        element.addEventListener('mouseleave', handleEnd);
        
        element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showTaskModal(todoId);
        });
    }

    // Count Updates
    updateAllCounts() {
        // Original counts
        const counts = {
            'my-day': this.todos.filter(t => t.myDay && !t.completed).length,
            'important': this.todos.filter(t => t.important && !t.completed).length,
            'planned': this.todos.filter(t => t.planned && !t.completed).length,
            'assigned': this.todos.filter(t => t.assigned && !t.completed).length,
            'tasks': this.todos.length
        };
        
        Object.keys(counts).forEach(key => {
            const countElement = this.counts[key];
            if (countElement) {
                countElement.textContent = counts[key];
                if (counts[key] > 0) {
                    countElement.classList.add('show');
                } else {
                    countElement.classList.remove('show');
                }
            }
        });
        
        // Custom list counts
        this.updateCustomListCounts();
    }

    updateCustomListCounts() {
        this.customLists.forEach(list => {
            const count = this.todos.filter(t => t.listId === list.id && !t.completed).length;
            const countElement = document.getElementById(`custom-${list.id}-count`);
            
            if (countElement) {
                countElement.textContent = count;
                if (count > 0) {
                    countElement.classList.add('show');
                } else {
                    countElement.classList.remove('show');
                }
            }
        });
    }

    // UI Helper Functions
    toggleMobileMenu() {
        this.sidebar?.classList.toggle('open');
        this.menuOverlay?.classList.toggle('show');
        this.menuToggle?.classList.toggle('active');
        
        if (this.sidebar?.classList.contains('open')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    closeMobileMenu() {
        this.sidebar?.classList.remove('open');
        this.menuOverlay?.classList.remove('show');
        this.menuToggle?.classList.remove('active');
        document.body.style.overflow = '';
    }

    focusInput() {
        this.input?.focus();
        if (window.innerWidth <= 768) {
            this.input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    handleInputChange() {
        const hasText = this.input?.value.trim().length > 0;
        const addBtn = document.querySelector('.add-task-btn');
        
        if (hasText && addBtn) {
            addBtn.style.color = 'var(--active-bg)';
            addBtn.style.transform = 'scale(1.1)';
        } else if (addBtn) {
            addBtn.style.color = 'var(--text-muted)';
            addBtn.style.transform = 'scale(1)';
        }
    }

    handleInputFocus() {
        if (this.todos.filter(t => t.myDay).length === 0) {
            if (this.input) this.input.placeholder = 'Add your first task';
        } else {
            if (this.input) this.input.placeholder = 'Add a task';
        }
    }

    handleInputBlur() {
        if (this.input) {
            this.input.placeholder = 'Try typing \'Pay utilities bill by Friday 6pm\'';
        }
    }

    handleFabClick() {
        if (this.currentPage === 'my-day') {
            this.focusInput();
        } else if (this.currentPage === 'tasks') {
            this.showAddTaskDialog();
        } else if (this.currentPage.startsWith('custom-')) {
            const listId = parseInt(this.currentPage.split('-')[1]);
            this.showAddTaskToList(listId);
        } else {
            // Switch to My Day and add task
            const myDayNav = document.querySelector('[data-page="my-day"]');
            if (myDayNav) {
                myDayNav.click();
                setTimeout(() => this.focusInput(), 400);
            }
        }
    }

    handleKeyboardShortcuts(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            this.focusInput();
        }
        
        if (e.key === 'Escape') {
            if (this.taskModal?.classList.contains('show')) {
                this.hideTaskModal();
            } else if (this.addTaskDialog?.classList.contains('show')) {
                this.hideAddTaskDialog();
            } else if (this.newListModal?.classList.contains('show')) {
                this.hideNewListModal();
            } else if (this.listSettingsModal?.classList.contains('show')) {
                this.hideListSettings();
            } else if (this.input?.value) {
                this.input.value = '';
                this.handleInputChange();
            }
        }
    }

    handleResize() {
        if (window.innerWidth > 768) {
            this.closeMobileMenu();
        }
    }

    // Search functionality
    setupSearch() {
        const searchInput = document.getElementById('search-input');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            if (query) {
                this.performSearch(query);
            } else {
                this.clearSearch();
            }
        });
    }

    performSearch(query) {
        // Simple search implementation
        const results = this.todos.filter(todo => 
            todo.text.toLowerCase().includes(query)
        );
        
        if (results.length > 0) {
            this.showToast(`Found ${results.length} task${results.length > 1 ? 's' : ''}`);
        } else {
            this.showToast('No tasks found');
        }
    }

    clearSearch() {
        // Reset search state
        this.renderAllSections();
    }

    // Utility Functions
    getCurrentDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
        };
        return now.toLocaleDateString('en-US', options);
    }

    updateCurrentDate() {
        if (this.currentDateElement) {
            this.currentDateElement.textContent = this.getCurrentDate();
        }
        
        // Update page config
        if (this.pageConfigs['my-day']) {
            this.pageConfigs['my-day'].subtitle = this.getCurrentDate();
        }
    }

    showSuggestions() {
        const suggestions = [
            'Review emails',
            'Plan tomorrow',
            'Call mom',
            'Exercise for 30 minutes',
            'Read a book chapter',
            'Organize desk',
            'Water plants',
            'Prepare lunch'
        ];
        
        const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        if (this.input) {
            this.input.value = randomSuggestion;
            this.input.focus();
            this.input.select();
            this.handleInputChange();
        }
        
        this.showToast('Suggestion added! ✨', 'success');
    }

    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        this.toastContainer?.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'toastSlideIn 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    showUndoToast(todo, index) {
        const toast = document.createElement('div');
        toast.className = 'toast undo';
        toast.innerHTML = `
            <span>Task deleted</span>
            <button class="undo-btn" onclick="app.restoreTodo(${JSON.stringify(todo).replace(/"/g, '&quot;')}, ${index}); this.parentElement.remove();">
                Undo
            </button>
        `;
        
        this.toastContainer?.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'toastSlideIn 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    // Data Management
    saveData() {
        try {
            localStorage.setItem('todos', JSON.stringify(this.todos));
            localStorage.setItem('customLists', JSON.stringify(this.customLists));
            localStorage.setItem('lastSaved', new Date().toISOString());
        } catch (error) {
            console.error('Error saving data:', error);
            this.showToast('Error saving data', 'error');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    vibrate(pattern) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TodoApp();
});

// Handle app visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && app) {
        app.updateCurrentDate();
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (app && window.innerWidth > 768) {
        app.closeMobileMenu();
    }
});
