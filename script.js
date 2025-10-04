// عناصر DOM
const taskInput = document.getElementById('taskInput');
const taskDate = document.getElementById('taskDate');
const addBtn = document.getElementById('addBtn');
const tasksContainer = document.getElementById('tasksContainer');
const tabsContainer = document.getElementById('tabsContainer');
const currentDate = document.getElementById('currentDate');
const totalTasks = document.getElementById('totalTasks');
const completedTasks = document.getElementById('completedTasks');
const pendingTasks = document.getElementById('pendingTasks');
const helpBtn = document.getElementById('helpBtn');
const helpModal = document.getElementById('helpModal');
const closeHelp = document.getElementById('closeHelp');

// Now Date
const today = new Date();
const todayFormatted = today.toISOString().split('T')[0];
taskDate.value = todayFormatted;

const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
currentDate.textContent = today.toLocaleDateString('fa-IR', options);

// active Tab
let activeTab = 'today';

// Load Task From localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Save Task to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateStats();
}

// تابع برای به‌روزرسانی آمار
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    
    totalTasks.textContent = total;
    completedTasks.textContent = completed;
    pendingTasks.textContent = pending;
}

// Show Tabs
function renderTabs() {
    const todayCount = tasks.filter(task => !task.completed && isToday(task.date)).length;
    const tomorrowCount = tasks.filter(task => !task.completed && isTomorrow(task.date)).length;
    const overdueCount = tasks.filter(task => !task.completed && isOverdue(task.date)).length;
    const noDateCount = tasks.filter(task => !task.completed && !task.date).length;
    const allCount = tasks.filter(task => !task.completed).length;
    const completedCount = tasks.filter(task => task.completed).length;
    
    tabsContainer.innerHTML = `
        <div class="tab ${activeTab === 'today' ? 'active' : ''}" data-tab="today">
            <i class="fas fa-sun"></i>
            امروز
            <span class="tab-badge">${todayCount}</span>
        </div>
        <div class="tab ${activeTab === 'tomorrow' ? 'active' : ''}" data-tab="tomorrow">
            <i class="fas fa-clock"></i>
            فردا
            <span class="tab-badge">${tomorrowCount}</span>
        </div>
        <div class="tab ${activeTab === 'overdue' ? 'active' : ''}" data-tab="overdue">
            <i class="fas fa-exclamation-circle"></i>
            گذشته
            <span class="tab-badge">${overdueCount}</span>
        </div>
        <div class="tab ${activeTab === 'no-date' ? 'active' : ''}" data-tab="no-date">
            <i class="fas fa-calendar-times"></i>
            بدون تاریخ
            <span class="tab-badge">${noDateCount}</span>
        </div>
        <div class="tab ${activeTab === 'all' ? 'active' : ''}" data-tab="all">
            <i class="fas fa-list"></i>
            همه کارها
            <span class="tab-badge">${allCount}</span>
        </div>
        <div class="tab ${activeTab === 'completed' ? 'active' : ''}" data-tab="completed">
            <i class="fas fa-check-circle"></i>
            انجام شده
            <span class="tab-badge">${completedCount}</span>
        </div>
    `;
    
    // اضافه کردن event listeners برای تب‌ها
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            activeTab = tab.dataset.tab;
            renderTabs();
            renderTasks();
        });
    });
}

// تابع برای بررسی تاریخ
function isToday(dateString) {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date.toDateString() === today.toDateString();
}

function isTomorrow(dateString) {
    if (!dateString) return false;
    const date = new Date(dateString);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
}

function isOverdue(dateString) {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date < today && date.toDateString() !== today.toDateString();
}

// تابع برای نمایش کارها
function renderTasks() {
    tasksContainer.innerHTML = '';
    
    // فیلتر کردن کارها بر اساس تب فعال
    let filteredTasks = [];
    let showCompleted = false;
    
    switch(activeTab) {
        case 'today':
            filteredTasks = tasks.filter(task => !task.completed && isToday(task.date));
            break;
        case 'tomorrow':
            filteredTasks = tasks.filter(task => !task.completed && isTomorrow(task.date));
            break;
        case 'overdue':
            filteredTasks = tasks.filter(task => !task.completed && isOverdue(task.date));
            break;
        case 'no-date':
            filteredTasks = tasks.filter(task => !task.completed && !task.date);
            break;
        case 'all':
            filteredTasks = tasks.filter(task => !task.completed);
            break;
        case 'completed':
            filteredTasks = tasks.filter(task => task.completed);
            showCompleted = true;
            break;
    }
    
    if (filteredTasks.length === 0) {
        let message = '';
        switch(activeTab) {
            case 'today':
                message = 'هیچ کاری برای امروز ندارید';
                break;
            case 'tomorrow':
                message = 'هیچ کاری برای فردا برنامه‌ریزی نکرده‌اید';
                break;
            case 'overdue':
                message = 'هیچ کار گذشته‌ای وجود ندارد';
                break;
            case 'no-date':
                message = 'هیچ کاری بدون تاریخ وجود ندارد';
                break;
            case 'all':
                message = 'هنوز کاری اضافه نکرده‌اید';
                break;
            case 'completed':
                message = 'هیچ کاری انجام نشده است';
                break;
        }
        
        tasksContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>${message}</p>
            </div>
        `;
        return;
    }
    
    // گروه‌بندی کارها بر اساس تاریخ (فقط برای تب‌های خاص)
    if (activeTab === 'all' && !showCompleted) {
        const todayTasks = filteredTasks.filter(task => isToday(task.date));
        const tomorrowTasks = filteredTasks.filter(task => isTomorrow(task.date));
        const overdueTasks = filteredTasks.filter(task => isOverdue(task.date));
        const noDateTasks = filteredTasks.filter(task => !task.date);
        const otherTasks = filteredTasks.filter(task => 
            !isToday(task.date) && !isTomorrow(task.date) && 
            !isOverdue(task.date) && task.date
        );
        
        if (todayTasks.length > 0) {
            renderTaskGroup('امروز', 'fas fa-sun', todayTasks, showCompleted);
        }
        
        if (tomorrowTasks.length > 0) {
            renderTaskGroup('فردا', 'fas fa-clock', tomorrowTasks, showCompleted);
        }
        
        if (overdueTasks.length > 0) {
            renderTaskGroup('کارهای گذشته', 'fas fa-exclamation-circle', overdueTasks, showCompleted);
        }
        
        if (noDateTasks.length > 0) {
            renderTaskGroup('بدون تاریخ', 'fas fa-calendar-times', noDateTasks, showCompleted);
        }
        
        if (otherTasks.length > 0) {
            renderTaskGroup('سایر تاریخ‌ها', 'fas fa-calendar-alt', otherTasks, showCompleted);
        }
    } else {
        // نمایش ساده لیست کارها
        filteredTasks.forEach(task => {
            renderTask(task, showCompleted);
        });
    }
    
    // نمایش بخش کارهای انجام شده در تب همه
    if (activeTab === 'all') {
        const completedTasksList = tasks.filter(task => task.completed);
        if (completedTasksList.length > 0) {
            const completedSection = document.createElement('div');
            completedSection.className = 'completed-section';
            completedSection.innerHTML = `
                <div class="completed-title">
                    <i class="fas fa-check-circle"></i>
                    کارهای انجام شده
                </div>
            `;
            
            completedTasksList.forEach(task => {
                const taskElement = createTaskElement(task, true);
                completedSection.appendChild(taskElement);
            });
            
            tasksContainer.appendChild(completedSection);
        }
    }
    
    updateStats();
}

// تابع برای نمایش گروه کارها
function renderTaskGroup(title, icon, tasks, showCompleted) {
    const groupElement = document.createElement('div');
    groupElement.className = 'task-group';
    
    groupElement.innerHTML = `
        <div class="task-group-title">
            <i class="${icon}"></i>
            ${title}
        </div>
    `;
    
    tasks.forEach(task => {
        const taskElement = createTaskElement(task, showCompleted);
        groupElement.appendChild(taskElement);
    });
    
    tasksContainer.appendChild(groupElement);
}

// تابع برای نمایش یک کار
function renderTask(task, showCompleted) {
    const taskElement = createTaskElement(task, showCompleted);
    tasksContainer.appendChild(taskElement);
}

// تابع برای ایجاد المان کار
function createTaskElement(task, showCompleted) {
    const taskElement = document.createElement('div');
    taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
    taskElement.dataset.id = task.id;
    
    // تعیین کلاس تاریخ
    let dateClass = '';
    if (task.date) {
        if (isToday(task.date)) dateClass = 'today';
        else if (isTomorrow(task.date)) dateClass = 'tomorrow';
        else if (isOverdue(task.date)) dateClass = 'overdue';
    }
    
    // فرمت تاریخ برای نمایش
    let dateDisplay = '';
    if (task.date) {
        const dateObj = new Date(task.date);
        dateDisplay = dateObj.toLocaleDateString('fa-IR');
    }
    
    taskElement.innerHTML = `
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
        <div class="task-content">
            <span class="task-text">${task.text}</span>
            ${task.date ? `<div class="task-date ${dateClass}"><i class="far fa-calendar"></i> ${dateDisplay}</div>` : ''}
        </div>
        <div class="task-actions">
            <button class="task-action-btn edit-btn">
                <i class="fas fa-edit"></i>
            </button>
            <button class="task-action-btn delete-btn">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // اضافه کردن event listeners
    const checkbox = taskElement.querySelector('.task-checkbox');
    const editBtn = taskElement.querySelector('.edit-btn');
    const deleteBtn = taskElement.querySelector('.delete-btn');
    const taskText = taskElement.querySelector('.task-text');
    
    checkbox.addEventListener('change', () => {
        toggleTask(task.id);
    });
    
    editBtn.addEventListener('click', () => {
        editTask(taskElement, task.id);
    });
    
    deleteBtn.addEventListener('click', () => {
        deleteTask(task.id);
    });
    
    // امکان علامت‌گذاری با کلیک روی متن
    taskText.addEventListener('click', () => {
        if (!showCompleted) {
            toggleTask(task.id);
        }
    });
    
    return taskElement;
}

// تابع برای افزودن کار جدید
function addTask() {
    const text = taskInput.value.trim();
    const date = taskDate.value;
    
    if (text === '') {
        taskInput.focus();
        return;
    }
    
    const newTask = {
        id: Date.now(),
        text: text,
        date: date,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.unshift(newTask);
    saveTasks();
    renderTabs();
    renderTasks();
    
    taskInput.value = '';
    taskInput.focus();
}

// تابع برای حذف کار
function deleteTask(id) {
    const taskElement = document.querySelector(`.task-item[data-id="${id}"]`);
    if (taskElement) {
        taskElement.classList.add('removing');
        setTimeout(() => {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTabs();
            renderTasks();
        }, 300);
    }
}

// تابع برای تغییر وضعیت انجام کار
function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveTasks();
    renderTabs();
    renderTasks();
}

// تابع برای ویرایش کار
function editTask(taskElement, id) {
    const taskContent = taskElement.querySelector('.task-content');
    const taskText = taskContent.querySelector('.task-text');
    const currentText = taskText.textContent;
    const currentDate = tasks.find(task => task.id === id).date;
    
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'edit-input';
    editInput.value = currentText;
    
    const editDate = document.createElement('input');
    editDate.type = 'date';
    editDate.className = 'edit-date';
    editDate.value = currentDate || todayFormatted;
    
    taskContent.innerHTML = '';
    taskContent.appendChild(editInput);
    taskContent.appendChild(editDate);
    
    editInput.focus();
    editInput.select();
    
    function saveEdit() {
        const newText = editInput.value.trim();
        const newDate = editDate.value;
        
        if (newText && (newText !== currentText || newDate !== currentDate)) {
            tasks = tasks.map(task => {
                if (task.id === id) {
                    return { 
                        ...task, 
                        text: newText,
                        date: newDate
                    };
                }
                return task;
            });
            saveTasks();
            renderTabs();
        }
        renderTasks();
    }
    
    editInput.addEventListener('blur', saveEdit);
    editInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        }
    });
    
    editDate.addEventListener('change', saveEdit);
    editDate.addEventListener('blur', saveEdit);
}

// event listeners
addBtn.addEventListener('click', addTask);

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

// راهنمای برنامه
helpBtn.addEventListener('click', () => {
    helpModal.style.display = 'flex';
});

closeHelp.addEventListener('click', () => {
    helpModal.style.display = 'none';
});

helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) {
        helpModal.style.display = 'none';
    }
});

// بارگذاری اولیه
renderTabs();
renderTasks();