/**
 * Zenith Productivity Suite - Core Application Logic
 * High-performance, zero-dependency modern JavaScript
 */

(function () {
  'use strict';

  // ==========================================================================
  // Default Data
  // ==========================================================================

  const DEFAULT_CATEGORIES = [
    { id: 'work', name: 'Work', color: '#6366f1' },
    { id: 'personal', name: 'Personal', color: '#ec4899' },
    { id: 'projects', name: 'Projects', color: '#3b82f6' },
    { id: 'health', name: 'Health & Fitness', color: '#10b981' },
    { id: 'learning', name: 'Learning', color: '#8b5cf6' }
  ];

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const DEFAULT_TASKS = [
    {
      id: 'task-1',
      title: 'Design high-fidelity dashboard wireframes',
      description: 'Review contrast ratios, glassmorphism tokens, and mobile responsiveness.',
      category: 'work',
      priority: 'urgent',
      dueDate: todayStr,
      completed: false,
      subtasks: [
        { id: 's1', text: 'Color palette review', done: true },
        { id: 's2', text: 'Typography hierarchy', done: true },
        { id: 's3', text: 'Interactive prototypes', done: false }
      ],
      createdAt: Date.now() - 3600000,
      order: 1
    },
    {
      id: 'task-2',
      title: 'Prepare quarterly product roadmap presentation',
      description: 'Align milestones with engineering and marketing deliverables.',
      category: 'projects',
      priority: 'high',
      dueDate: tomorrowStr,
      completed: false,
      subtasks: [
        { id: 's4', text: 'Gather OKR metrics', done: false },
        { id: 's5', text: 'Draft slide deck', done: false }
      ],
      createdAt: Date.now() - 7200000,
      order: 2
    },
    {
      id: 'task-3',
      title: '30-minute cardio & strength training session',
      description: 'Hit heart rate zone 3 and stay hydrated.',
      category: 'health',
      priority: 'medium',
      dueDate: todayStr,
      completed: true,
      subtasks: [],
      createdAt: Date.now() - 14400000,
      order: 3
    },
    {
      id: 'task-4',
      title: 'Read Chapter 4: Atomic Habits',
      description: 'Highlight key passages on cue design and friction reduction.',
      category: 'learning',
      priority: 'low',
      dueDate: '',
      completed: false,
      subtasks: [],
      createdAt: Date.now() - 86400000,
      order: 4
    }
  ];

  // Quotes for motivational rotation
  const MOTIVATIONAL_QUOTES = [
    "Focus on being productive instead of busy.",
    "Small daily improvements over time lead to stunning results.",
    "The secret of getting ahead is getting started.",
    "One task at a time. Total clarity.",
    "Action cures anxiety. Take the next small step."
  ];

  // ==========================================================================
  // State Store
  // ==========================================================================

  const State = {
    tasks: [],
    categories: [],
    activeView: 'all', // 'all', 'today', 'upcoming', 'priority', 'completed'
    activeTagFilter: 'all',
    searchQuery: '',
    sortBy: 'due_asc',
    theme: 'dark',
    soundEnabled: true,
    streak: { count: 3, lastCompletedDate: todayStr },
    lastDeletedTask: null,
    deleteTimeout: null
  };

  // ==========================================================================
  // Web Audio Synthesizer (Zero external audio files needed)
  // ==========================================================================

  class SoundEffects {
    constructor() {
      this.ctx = null;
    }

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
    }

    playComplete() {
      if (!State.soundEnabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.18); // A5

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.35);
      } catch (e) {
        // Audio error handling
      }
    }

    playClick() {
      if (!State.soundEnabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.05);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
      } catch (e) {
        // Audio error handling
      }
    }
  }

  const sfx = new SoundEffects();

  // ==========================================================================
  // Canvas Confetti Celebration Engine
  // ==========================================================================

  class ConfettiEngine {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
      this.particles = [];
      this.animationId = null;

      if (this.canvas) {
        this.resize();
        window.addEventListener('resize', () => this.resize());
      }
    }

    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    burst(x = window.innerWidth / 2, y = window.innerHeight / 3, count = 45) {
      if (!this.ctx) return;
      const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ffffff'];

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 3;
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 4,
          size: Math.random() * 7 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 12,
          opacity: 1,
          gravity: 0.25,
          decay: Math.random() * 0.015 + 0.012
        });
      }

      if (!this.animationId) {
        this.animate();
      }
    }

    animate() {
      if (!this.ctx) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rotationSpeed;
        p.opacity -= p.decay;

        if (p.opacity <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.globalAlpha = p.opacity;
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        this.ctx.restore();
      }

      if (this.particles.length > 0) {
        this.animationId = requestAnimationFrame(() => this.animate());
      } else {
        this.animationId = null;
      }
    }
  }

  const confetti = new ConfettiEngine('confetti-canvas');

  // ==========================================================================
  // LocalStorage Persistence
  // ==========================================================================

  function loadState() {
    try {
      const savedTasks = localStorage.getItem('zenith_tasks');
      const savedCategories = localStorage.getItem('zenith_categories');
      const savedTheme = localStorage.getItem('zenith_theme');
      const savedSound = localStorage.getItem('zenith_sound');
      const savedStreak = localStorage.getItem('zenith_streak');

      State.tasks = savedTasks ? JSON.parse(savedTasks) : DEFAULT_TASKS;
      State.categories = savedCategories ? JSON.parse(savedCategories) : DEFAULT_CATEGORIES;
      State.theme = savedTheme || 'dark';
      State.soundEnabled = savedSound !== null ? JSON.parse(savedSound) : true;
      State.streak = savedStreak ? JSON.parse(savedStreak) : { count: 3, lastCompletedDate: todayStr };
    } catch (e) {
      State.tasks = DEFAULT_TASKS;
      State.categories = DEFAULT_CATEGORIES;
    }
  }

  function saveTasks() {
    localStorage.setItem('zenith_tasks', JSON.stringify(State.tasks));
  }

  function saveCategories() {
    localStorage.setItem('zenith_categories', JSON.stringify(State.categories));
  }

  function saveTheme() {
    localStorage.setItem('zenith_theme', State.theme);
  }

  function saveSound() {
    localStorage.setItem('zenith_sound', JSON.stringify(State.soundEnabled));
  }

  function saveStreak() {
    localStorage.setItem('zenith_streak', JSON.stringify(State.streak));
  }

  // ==========================================================================
  // Pomodoro Timer Logic
  // ==========================================================================

  const Pomodoro = {
    duration: 25 * 60,
    remaining: 25 * 60,
    timerId: null,
    isRunning: false,
    mode: 'Focus', // 'Focus' or 'Break'

    init() {
      this.updateDisplay();
      const startBtn = document.getElementById('pomo-start-btn');
      const resetBtn = document.getElementById('pomo-reset-btn');

      if (startBtn) {
        startBtn.addEventListener('click', () => this.toggle());
      }
      if (resetBtn) {
        resetBtn.addEventListener('click', () => this.reset());
      }
    },

    toggle() {
      sfx.playClick();
      if (this.isRunning) {
        this.pause();
      } else {
        this.start();
      }
    },

    start() {
      this.isRunning = true;
      const startBtn = document.getElementById('pomo-start-btn');
      if (startBtn) {
        startBtn.textContent = 'Pause';
        startBtn.classList.add('active');
      }

      this.timerId = setInterval(() => {
        this.remaining--;
        this.updateDisplay();

        if (this.remaining <= 0) {
          clearInterval(this.timerId);
          this.isRunning = false;
          sfx.playComplete();
          confetti.burst();

          if (this.mode === 'Focus') {
            this.mode = 'Break';
            this.remaining = 5 * 60;
            showToast('Focus session complete! Take a 5-minute breather ☕', 'success');
          } else {
            this.mode = 'Focus';
            this.remaining = 25 * 60;
            showToast('Break over! Ready for the next focus sprint? 🚀', 'info');
          }

          document.getElementById('pomo-mode').textContent = this.mode;
          if (startBtn) {
            startBtn.textContent = 'Start';
            startBtn.classList.remove('active');
          }
          this.updateDisplay();
        }
      }, 1000);
    },

    pause() {
      clearInterval(this.timerId);
      this.isRunning = false;
      const startBtn = document.getElementById('pomo-start-btn');
      if (startBtn) {
        startBtn.textContent = 'Resume';
        startBtn.classList.remove('active');
      }
    },

    reset() {
      sfx.playClick();
      clearInterval(this.timerId);
      this.isRunning = false;
      this.mode = 'Focus';
      this.remaining = 25 * 60;
      document.getElementById('pomo-mode').textContent = this.mode;
      const startBtn = document.getElementById('pomo-start-btn');
      if (startBtn) {
        startBtn.textContent = 'Start';
        startBtn.classList.remove('active');
      }
      this.updateDisplay();
    },

    updateDisplay() {
      const minutes = Math.floor(this.remaining / 60).toString().padStart(2, '0');
      const seconds = (this.remaining % 60).toString().padStart(2, '0');
      const display = document.getElementById('pomo-display');
      if (display) {
        display.textContent = `${minutes}:${seconds}`;
      }
    }
  };

  // ==========================================================================
  // Helper Utilities
  // ==========================================================================

  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getCategoryById(id) {
    return State.categories.find(c => c.id === id) || { name: 'General', color: '#6366f1' };
  }

  function formatRelativeDate(dateStr) {
    if (!dateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = dateStr.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);

    const diffTime = targetDate - today;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)}d overdue`, className: 'overdue' };
    }
    if (diffDays === 0) {
      return { text: 'Today', className: 'today' };
    }
    if (diffDays === 1) {
      return { text: 'Tomorrow', className: 'normal' };
    }
    if (diffDays < 7) {
      return { text: `In ${diffDays} days`, className: 'normal' };
    }
    return { text: targetDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), className: 'normal' };
  }

  function showToast(message, type = 'info', actionCallback = null, actionText = 'Undo') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'undo' ? 'toast-undo' : type === 'success' ? 'toast-success' : ''}`;

    let html = `<span>${message}</span>`;
    if (actionCallback) {
      html += `<button class="toast-undo-btn">${actionText}</button>`;
    }
    toast.innerHTML = html;

    if (actionCallback) {
      const btn = toast.querySelector('.toast-undo-btn');
      btn.addEventListener('click', () => {
        actionCallback();
        toast.remove();
      });
    }

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 4500);
  }

  function updateGreeting() {
    const heading = document.getElementById('greeting-text');
    const sub = document.getElementById('current-date-text');
    if (!heading || !sub) return;

    const now = new Date();
    const hour = now.getHours();
    let greet = 'Good morning';
    if (hour >= 12 && hour < 17) greet = 'Good afternoon';
    else if (hour >= 17) greet = 'Good evening';

    heading.innerHTML = `${greet}, <span class="name-gradient">Anshika</span> ✨`;

    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    sub.textContent = `${now.toLocaleDateString(undefined, options)} • Let's crush your goals`;
  }

  // ==========================================================================
  // Renderers & UI Updates
  // ==========================================================================

  function renderCategoryOptions() {
    const quickSelect = document.getElementById('quick-task-category');
    const editSelect = document.getElementById('edit-task-category');
    const sidebarList = document.getElementById('category-nav-list');
    const tagFilterContainer = document.getElementById('tag-filter-container');

    // Populate Select Dropdowns
    const optionsHtml = State.categories
      .map(c => `<option value="${c.id}">${escapeHTML(c.name)}</option>`)
      .join('');

    if (quickSelect) quickSelect.innerHTML = optionsHtml;
    if (editSelect) editSelect.innerHTML = optionsHtml;

    // Populate Sidebar Category Navigation
    if (sidebarList) {
      sidebarList.innerHTML = State.categories
        .map(c => {
          const count = State.tasks.filter(t => t.category === c.id && !t.completed).length;
          const isActive = State.activeTagFilter === c.id;
          return `
            <li class="nav-item ${isActive ? 'active' : ''}">
              <button class="nav-btn category-filter-btn" data-tag-id="${c.id}">
                <span class="cat-dot" style="background:${c.color}; color:${c.color};"></span>
                <span class="nav-label">${escapeHTML(c.name)}</span>
                <span class="nav-badge">${count}</span>
              </button>
            </li>
          `;
        })
        .join('');

      // Add click listeners to sidebar category items
      sidebarList.querySelectorAll('.category-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const tagId = btn.getAttribute('data-tag-id');
          State.activeTagFilter = State.activeTagFilter === tagId ? 'all' : tagId;
          renderCategoryOptions();
          renderTasks();
        });
      });
    }

    // Populate Top Filter Pills
    if (tagFilterContainer) {
      let pillsHtml = `<button class="filter-pill ${State.activeTagFilter === 'all' ? 'active' : ''}" data-filter="all">All Tags</button>`;
      pillsHtml += State.categories
        .map(c => `
          <button class="filter-pill ${State.activeTagFilter === c.id ? 'active' : ''}" data-filter="${c.id}">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${c.color};margin-right:6px;"></span>${escapeHTML(c.name)}
          </button>
        `)
        .join('');
      tagFilterContainer.innerHTML = pillsHtml;

      tagFilterContainer.querySelectorAll('.filter-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          State.activeTagFilter = pill.getAttribute('data-filter');
          renderCategoryOptions();
          renderTasks();
        });
      });
    }
  }

  function updateOverviewStats() {
    const total = State.tasks.length;
    const completed = State.tasks.filter(t => t.completed).length;
    const active = total - completed;

    const todayDate = new Date().toISOString().split('T')[0];
    const dueToday = State.tasks.filter(t => !t.completed && t.dueDate === todayDate).length;

    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    // Update Progress Ring
    const circle = document.getElementById('progress-circle');
    const text = document.getElementById('progress-text');
    const ratio = document.getElementById('progress-ratio');

    if (circle && text && ratio) {
      const radius = 36;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (percentage / 100) * circumference;
      circle.style.strokeDashoffset = offset;
      text.textContent = `${percentage}%`;
      ratio.textContent = `${completed} of ${total} done`;
    }

    // Update Metric Numbers
    const activeCountEl = document.getElementById('stat-active-count');
    const dueTodayEl = document.getElementById('stat-due-today');
    const completedCountEl = document.getElementById('stat-completed-count');

    if (activeCountEl) activeCountEl.textContent = active;
    if (dueTodayEl) dueTodayEl.textContent = dueToday;
    if (completedCountEl) completedCountEl.textContent = completed;

    // Update Sidebar Navigation Badges
    const countAll = document.getElementById('count-all');
    const countToday = document.getElementById('count-today');
    const countUpcoming = document.getElementById('count-upcoming');
    const countPriority = document.getElementById('count-priority');
    const countCompleted = document.getElementById('count-completed');

    if (countAll) countAll.textContent = State.tasks.filter(t => !t.completed).length;
    if (countToday) countToday.textContent = dueToday;
    if (countUpcoming) {
      const upcoming = State.tasks.filter(t => !t.completed && t.dueDate && t.dueDate > todayDate).length;
      countUpcoming.textContent = upcoming;
    }
    if (countPriority) {
      const priority = State.tasks.filter(t => !t.completed && (t.priority === 'high' || t.priority === 'urgent')).length;
      countPriority.textContent = priority;
    }
    if (countCompleted) countCompleted.textContent = completed;

    // Update Streak Widget
    const streakEl = document.getElementById('streak-counter');
    if (streakEl) {
      streakEl.textContent = `${State.streak.count} Day Streak`;
    }
  }

  function filterAndSortTasks() {
    const todayDate = new Date().toISOString().split('T')[0];

    return State.tasks.filter(task => {
      // View Filter
      if (State.activeView === 'today') {
        if (task.dueDate !== todayDate) return false;
      } else if (State.activeView === 'upcoming') {
        if (!task.dueDate || task.dueDate <= todayDate) return false;
      } else if (State.activeView === 'priority') {
        if (task.priority !== 'high' && task.priority !== 'urgent') return false;
      } else if (State.activeView === 'completed') {
        if (!task.completed) return false;
      }

      // Tag Filter
      if (State.activeTagFilter !== 'all') {
        if (task.category !== State.activeTagFilter) return false;
      }

      // Search Query
      if (State.searchQuery.trim() !== '') {
        const query = State.searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description && task.description.toLowerCase().includes(query);
        const matchesTag = getCategoryById(task.category).name.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesTag) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sorting Logic
      if (State.sortBy === 'due_asc') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (State.sortBy === 'priority_desc') {
        const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      }
      if (State.sortBy === 'created_desc') {
        return b.createdAt - a.createdAt;
      }
      if (State.sortBy === 'title_asc') {
        return a.title.localeCompare(b.title);
      }
      return (a.order || 0) - (b.order || 0);
    });
  }

  function renderTasks() {
    updateOverviewStats();

    const pendingList = document.getElementById('pending-tasks-list');
    const completedList = document.getElementById('completed-tasks-list');
    const emptyState = document.getElementById('empty-state');
    const pendingCount = document.getElementById('pending-tasks-count');
    const completedCount = document.getElementById('completed-tasks-count');
    const viewTitle = document.getElementById('current-view-title');
    const viewCount = document.getElementById('current-view-count');

    const viewTitles = {
      all: 'All Tasks',
      today: 'Tasks Due Today',
      upcoming: 'Upcoming Schedule',
      priority: 'Important & Urgent',
      completed: 'Completed Archive'
    };
    if (viewTitle) viewTitle.textContent = viewTitles[State.activeView] || 'Tasks';

    const filtered = filterAndSortTasks();
    const pendingTasks = filtered.filter(t => !t.completed);
    const completedTasks = filtered.filter(t => t.completed);

    if (viewCount) viewCount.textContent = `${filtered.length} total`;
    if (pendingCount) pendingCount.textContent = pendingTasks.length;
    if (completedCount) completedCount.textContent = completedTasks.length;

    // Empty State Visibility
    if (filtered.length === 0) {
      if (emptyState) emptyState.classList.remove('hidden');
    } else {
      if (emptyState) emptyState.classList.add('hidden');
    }

    // Render Incomplete (Pending) Tasks
    if (pendingList) {
      pendingList.innerHTML = pendingTasks.map(t => createTaskCardHTML(t)).join('');
      attachTaskCardListeners(pendingList);
    }

    // Render Completed Tasks
    if (completedList) {
      completedList.innerHTML = completedTasks.map(t => createTaskCardHTML(t)).join('');
      attachTaskCardListeners(completedList);
    }
  }

  function createTaskCardHTML(task) {
    const cat = getCategoryById(task.category);
    const relativeDate = formatRelativeDate(task.dueDate);

    // Subtasks summary
    const totalSub = task.subtasks ? task.subtasks.length : 0;
    const completedSub = task.subtasks ? task.subtasks.filter(s => s.done).length : 0;
    const subPercent = totalSub > 0 ? Math.round((completedSub / totalSub) * 100) : 0;

    let subtaskSnippet = '';
    if (totalSub > 0) {
      subtaskSnippet = `
        <div class="subtasks-indicator toggle-subtask-accordion" data-task-id="${task.id}" title="Toggle subtasks checklist">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          <span>${completedSub}/${totalSub} steps</span>
          <div class="mini-bar"><div class="mini-bar-fill" style="width: ${subPercent}%"></div></div>
        </div>
      `;
    }

    // Due badge
    let dueBadgeHtml = '';
    if (relativeDate) {
      dueBadgeHtml = `
        <span class="due-pill ${relativeDate.className}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${relativeDate.text}
        </span>
      `;
    }

    return `
      <div class="task-card ${task.completed ? 'completed' : ''}" data-task-id="${task.id}" draggable="true">
        <div class="drag-handle" title="Drag to reorder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
        </div>

        <div class="task-check-wrapper">
          <input type="checkbox" class="custom-checkbox task-complete-check" data-task-id="${task.id}" ${task.completed ? 'checked' : ''} aria-label="Mark task completed">
        </div>

        <div class="task-content">
          <div class="task-title-row">
            <span class="task-title">${escapeHTML(task.title)}</span>
          </div>

          ${task.description ? `<p class="task-desc">${escapeHTML(task.description)}</p>` : ''}

          <div class="task-meta-row">
            <span class="category-tag" style="background: ${cat.color}22; color: ${cat.color}; border: 1px solid ${cat.color}44;">
              ${escapeHTML(cat.name)}
            </span>
            <span class="priority-pill ${task.priority}">${task.priority}</span>
            ${dueBadgeHtml}
            ${subtaskSnippet}
          </div>

          <!-- Collapsible inline subtasks checklist -->
          ${totalSub > 0 ? `
            <div class="card-subtasks-list hidden" id="subtasks-dropdown-${task.id}">
              ${task.subtasks.map(s => `
                <label class="card-subtask-item ${s.done ? 'done' : ''}">
                  <input type="checkbox" class="subtask-checkbox" data-task-id="${task.id}" data-subtask-id="${s.id}" ${s.done ? 'checked' : ''}>
                  <span>${escapeHTML(s.text)}</span>
                </label>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <div class="task-actions">
          <button class="action-icon-btn edit-task-btn" data-task-id="${task.id}" title="Edit task details">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="action-icon-btn delete-btn delete-task-btn" data-task-id="${task.id}" title="Delete task">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    `;
  }

  function attachTaskCardListeners(container) {
    // Checkbox toggle
    container.querySelectorAll('.task-complete-check').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const taskId = chk.getAttribute('data-task-id');
        toggleTaskCompletion(taskId, chk.checked, e.clientX, e.clientY);
      });
    });

    // Subtask toggle indicator
    container.querySelectorAll('.toggle-subtask-accordion').forEach(btn => {
      btn.addEventListener('click', () => {
        const taskId = btn.getAttribute('data-task-id');
        const list = document.getElementById(`subtasks-dropdown-${taskId}`);
        if (list) list.classList.toggle('hidden');
      });
    });

    // Subtask inline checkboxes
    container.querySelectorAll('.subtask-checkbox').forEach(chk => {
      chk.addEventListener('change', () => {
        const taskId = chk.getAttribute('data-task-id');
        const subtaskId = chk.getAttribute('data-subtask-id');
        toggleSubtask(taskId, subtaskId, chk.checked);
      });
    });

    // Edit button
    container.querySelectorAll('.edit-task-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const taskId = btn.getAttribute('data-task-id');
        openEditModal(taskId);
      });
    });

    // Delete button
    container.querySelectorAll('.delete-task-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const taskId = btn.getAttribute('data-task-id');
        deleteTask(taskId);
      });
    });

    // Drag and Drop
    setupDragAndDrop(container);
  }

  // ==========================================================================
  // Task Manipulation Functions
  // ==========================================================================

  function toggleTaskCompletion(taskId, isCompleted, mouseX, mouseY) {
    const task = State.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.completed = isCompleted;

    if (isCompleted) {
      sfx.playComplete();
      confetti.burst(mouseX || window.innerWidth / 2, mouseY || window.innerHeight / 3, 40);

      // Check streak
      const today = new Date().toISOString().split('T')[0];
      if (State.streak.lastCompletedDate !== today) {
        State.streak.count += 1;
        State.streak.lastCompletedDate = today;
        saveStreak();
      }
    } else {
      sfx.playClick();
    }

    saveTasks();
    renderTasks();
  }

  function toggleSubtask(taskId, subtaskId, isDone) {
    const task = State.tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) return;

    const sub = task.subtasks.find(s => s.id === subtaskId);
    if (sub) {
      sub.done = isDone;
      sfx.playClick();
      saveTasks();
      renderTasks();
    }
  }

  function deleteTask(taskId) {
    const index = State.tasks.findIndex(t => t.id === taskId);
    if (index === -1) return;

    sfx.playClick();
    const removedTask = State.tasks.splice(index, 1)[0];
    State.lastDeletedTask = { task: removedTask, index };

    saveTasks();
    renderTasks();

    // Show Undo Toast
    showToast(`Deleted "${removedTask.title}"`, 'undo', () => {
      if (State.lastDeletedTask) {
        State.tasks.splice(State.lastDeletedTask.index, 0, State.lastDeletedTask.task);
        State.lastDeletedTask = null;
        saveTasks();
        renderTasks();
        showToast('Task restored!', 'success');
      }
    });
  }

  function setupDragAndDrop(container) {
    let draggedCard = null;

    container.querySelectorAll('.task-card').forEach(card => {
      card.addEventListener('dragstart', (e) => {
        draggedCard = card;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', card.getAttribute('data-task-id'));
      });

      card.addEventListener('dragend', () => {
        if (draggedCard) draggedCard.classList.remove('dragging');
        draggedCard = null;
        container.querySelectorAll('.task-card').forEach(c => c.classList.remove('drag-over'));
      });

      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        card.classList.add('drag-over');
      });

      card.addEventListener('dragleave', () => {
        card.classList.remove('drag-over');
      });

      card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('drag-over');
        const draggedId = e.dataTransfer.getData('text/plain');
        const targetId = card.getAttribute('data-task-id');

        if (draggedId && targetId && draggedId !== targetId) {
          reorderTasks(draggedId, targetId);
        }
      });
    });
  }

  function reorderTasks(draggedId, targetId) {
    const fromIndex = State.tasks.findIndex(t => t.id === draggedId);
    const toIndex = State.tasks.findIndex(t => t.id === targetId);

    if (fromIndex !== -1 && toIndex !== -1) {
      const [moved] = State.tasks.splice(fromIndex, 1);
      State.tasks.splice(toIndex, 0, moved);

      // Re-assign order properties
      State.tasks.forEach((t, i) => { t.order = i; });
      saveTasks();
      renderTasks();
      sfx.playClick();
    }
  }

  // ==========================================================================
  // Quick Add Form Handling
  // ==========================================================================

  function initQuickAdd() {
    const form = document.getElementById('quick-add-form');
    const toggleBtn = document.getElementById('toggle-advanced-add');
    const detailsDiv = document.getElementById('quick-add-details');
    const titleInput = document.getElementById('quick-task-title');

    if (toggleBtn && detailsDiv) {
      toggleBtn.addEventListener('click', () => {
        detailsDiv.classList.toggle('hidden');
        sfx.playClick();
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = titleInput.value.trim();
        if (!title) return;

        const desc = document.getElementById('quick-task-desc')?.value.trim() || '';
        const category = document.getElementById('quick-task-category')?.value || State.categories[0].id;
        const priority = document.getElementById('quick-task-priority')?.value || 'medium';
        const dueDate = document.getElementById('quick-task-due')?.value || '';

        const newTask = {
          id: 'task-' + Date.now(),
          title: title,
          description: desc,
          category: category,
          priority: priority,
          dueDate: dueDate,
          completed: false,
          subtasks: [],
          createdAt: Date.now(),
          order: State.tasks.length + 1
        };

        State.tasks.unshift(newTask);
        saveTasks();
        renderTasks();

        form.reset();
        if (detailsDiv) detailsDiv.classList.add('hidden');
        sfx.playClick();
        showToast('New task added!', 'success');
      });
    }
  }

  // ==========================================================================
  // Edit Task Modal & Subtasks
  // ==========================================================================

  let currentEditingSubtasks = [];

  function openEditModal(taskId) {
    const task = State.tasks.find(t => t.id === taskId);
    if (!task) return;

    document.getElementById('edit-task-id').value = task.id;
    document.getElementById('edit-task-title').value = task.title;
    document.getElementById('edit-task-desc').value = task.description || '';
    document.getElementById('edit-task-category').value = task.category;
    document.getElementById('edit-task-priority').value = task.priority;
    document.getElementById('edit-task-due').value = task.dueDate || '';

    currentEditingSubtasks = task.subtasks ? JSON.parse(JSON.stringify(task.subtasks)) : [];
    renderModalSubtasks();

    const modal = document.getElementById('edit-task-modal');
    modal.classList.remove('hidden');
    document.getElementById('edit-task-title').focus();
  }

  function renderModalSubtasks() {
    const container = document.getElementById('modal-subtasks-list');
    const progress = document.getElementById('modal-subtask-progress');
    if (!container) return;

    const completed = currentEditingSubtasks.filter(s => s.done).length;
    if (progress) progress.textContent = `${completed}/${currentEditingSubtasks.length}`;

    container.innerHTML = currentEditingSubtasks.map((s, index) => `
      <div class="modal-subtask-item">
        <div class="modal-subtask-left">
          <input type="checkbox" ${s.done ? 'checked' : ''} data-index="${index}" class="modal-subtask-check">
          <span>${escapeHTML(s.text)}</span>
        </div>
        <button type="button" class="action-icon-btn remove-modal-subtask" data-index="${index}" title="Remove step">
          &times;
        </button>
      </div>
    `).join('');

    container.querySelectorAll('.modal-subtask-check').forEach(chk => {
      chk.addEventListener('change', () => {
        const idx = Number(chk.getAttribute('data-index'));
        currentEditingSubtasks[idx].done = chk.checked;
        renderModalSubtasks();
      });
    });

    container.querySelectorAll('.remove-modal-subtask').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-index'));
        currentEditingSubtasks.splice(idx, 1);
        renderModalSubtasks();
      });
    });
  }

  function initEditModal() {
    const modal = document.getElementById('edit-task-modal');
    const closeBtn = document.getElementById('close-edit-modal-btn');
    const cancelBtn = document.getElementById('cancel-edit-modal-btn');
    const form = document.getElementById('edit-task-form');
    const addSubtaskBtn = document.getElementById('add-subtask-btn');
    const subtaskInput = document.getElementById('new-subtask-input');

    const closeModal = () => modal.classList.add('hidden');

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Add subtask inside modal
    if (addSubtaskBtn && subtaskInput) {
      const handleAdd = () => {
        const text = subtaskInput.value.trim();
        if (text) {
          currentEditingSubtasks.push({
            id: 'sub-' + Date.now() + Math.random().toString(36).substring(2, 5),
            text: text,
            done: false
          });
          subtaskInput.value = '';
          renderModalSubtasks();
        }
      };

      addSubtaskBtn.addEventListener('click', handleAdd);
      subtaskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAdd();
        }
      });
    }

    // Save edited task
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskId = document.getElementById('edit-task-id').value;
        const task = State.tasks.find(t => t.id === taskId);
        if (!task) return;

        task.title = document.getElementById('edit-task-title').value.trim();
        task.description = document.getElementById('edit-task-desc').value.trim();
        task.category = document.getElementById('edit-task-category').value;
        task.priority = document.getElementById('edit-task-priority').value;
        task.dueDate = document.getElementById('edit-task-due').value;
        task.subtasks = currentEditingSubtasks;

        saveTasks();
        renderTasks();
        closeModal();
        sfx.playClick();
        showToast('Task updated successfully!', 'success');
      });
    }
  }

  // ==========================================================================
  // Tag / Category Creation Modal
  // ==========================================================================

  function initCategoryModal() {
    const modal = document.getElementById('category-modal');
    const openBtn = document.getElementById('add-tag-btn');
    const closeBtn = document.getElementById('close-category-modal-btn');
    const cancelBtn = document.getElementById('cancel-category-modal-btn');
    const form = document.getElementById('new-category-form');
    const input = document.getElementById('category-name-input');
    const swatches = document.querySelectorAll('.color-swatch');

    let selectedColor = '#6366f1';

    const closeModal = () => modal.classList.add('hidden');

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        input.value = '';
        input.focus();
      });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    swatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        swatches.forEach(s => s.classList.remove('selected'));
        swatch.classList.add('selected');
        selectedColor = swatch.getAttribute('data-color');
      });
    });

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = input.value.trim();
        if (!name) return;

        const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString(36).slice(-4);
        State.categories.push({ id, name, color: selectedColor });

        saveCategories();
        renderCategoryOptions();
        closeModal();
        sfx.playClick();
        showToast(`Tag "${name}" created!`, 'success');
      });
    }
  }

  // ==========================================================================
  // Navigation & View Filters
  // ==========================================================================

  function initNavigation() {
    const viewList = document.getElementById('view-nav-list');
    if (!viewList) return;

    viewList.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        viewList.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        State.activeView = item.getAttribute('data-view');
        sfx.playClick();
        renderTasks();

        // Close mobile drawer if open
        document.getElementById('sidebar')?.classList.remove('mobile-open');
      });
    });
  }

  // ==========================================================================
  // Search, Sorting, and Theme Management
  // ==========================================================================

  function initSearchAndSort() {
    const searchInput = document.getElementById('global-search-input');
    const clearBtn = document.getElementById('search-clear-btn');
    const sortSelect = document.getElementById('task-sort-select');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        State.searchQuery = e.target.value;
        if (clearBtn) {
          clearBtn.classList.toggle('visible', State.searchQuery.length > 0);
        }
        renderTasks();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        State.searchQuery = '';
        clearBtn.classList.remove('visible');
        renderTasks();
        searchInput.focus();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        State.sortBy = e.target.value;
        sfx.playClick();
        renderTasks();
      });
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    State.theme = theme;
    saveTheme();

    const moon = document.getElementById('theme-moon');
    const sun = document.getElementById('theme-sun');
    if (moon && sun) {
      if (theme === 'light') {
        moon.classList.add('hidden');
        sun.classList.remove('hidden');
      } else {
        moon.classList.remove('hidden');
        sun.classList.add('hidden');
      }
    }
  }

  function initTheme() {
    applyTheme(State.theme);

    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const nextTheme = State.theme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
        sfx.playClick();
      });
    }
  }

  function initSoundToggle() {
    const btn = document.getElementById('sound-toggle-btn');
    const iconOn = document.getElementById('sound-icon-on');
    const iconOff = document.getElementById('sound-icon-off');

    const updateSoundIcons = () => {
      if (iconOn && iconOff) {
        iconOn.classList.toggle('hidden', !State.soundEnabled);
        iconOff.classList.toggle('hidden', State.soundEnabled);
      }
    };

    updateSoundIcons();

    if (btn) {
      btn.addEventListener('click', () => {
        State.soundEnabled = !State.soundEnabled;
        saveSound();
        updateSoundIcons();
        if (State.soundEnabled) sfx.playClick();
        showToast(State.soundEnabled ? 'Audio cues enabled' : 'Audio cues muted', 'info');
      });
    }
  }

  // ==========================================================================
  // Data Backup (Export / Import / Clear)
  // ==========================================================================

  function initDataMenu() {
    const menuBtn = document.getElementById('data-menu-btn');
    const dropdown = document.getElementById('data-dropdown');
    const exportBtn = document.getElementById('export-json-btn');
    const importInput = document.getElementById('import-file-input');
    const clearCompletedBtn = document.getElementById('clear-completed-btn');
    const resetAllBtn = document.getElementById('reset-all-btn');

    if (menuBtn && dropdown) {
      menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
      });

      document.addEventListener('click', () => {
        dropdown.classList.remove('show');
      });
    }

    // Export to JSON
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const backupData = {
          tasks: State.tasks,
          categories: State.categories,
          exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zenith-tasks-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Backup JSON exported successfully!', 'success');
      });
    }

    // Import from JSON
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            if (Array.isArray(data.tasks)) {
              State.tasks = data.tasks;
              if (Array.isArray(data.categories)) State.categories = data.categories;

              saveTasks();
              saveCategories();
              renderCategoryOptions();
              renderTasks();
              showToast('Data imported successfully!', 'success');
            } else {
              showToast('Invalid backup file format.', 'danger');
            }
          } catch (err) {
            showToast('Failed to parse backup JSON file.', 'danger');
          }
        };
        reader.readAsText(file);
      });
    }

    // Clear Completed
    if (clearCompletedBtn) {
      clearCompletedBtn.addEventListener('click', () => {
        const prevCount = State.tasks.filter(t => t.completed).length;
        if (prevCount === 0) {
          showToast('No completed tasks to clear.', 'info');
          return;
        }

        State.tasks = State.tasks.filter(t => !t.completed);
        saveTasks();
        renderTasks();
        sfx.playClick();
        showToast(`Cleared ${prevCount} completed task(s)!`, 'success');
      });
    }

    // Reset Demo Tasks
    if (resetAllBtn) {
      resetAllBtn.addEventListener('click', () => {
        if (confirm('Reset all tasks to the sample template? (Your current tasks will be replaced)')) {
          State.tasks = JSON.parse(JSON.stringify(DEFAULT_TASKS));
          State.categories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
          saveTasks();
          saveCategories();
          renderCategoryOptions();
          renderTasks();
          showToast('Reset to demo workspace!', 'info');
        }
      });
    }
  }

  // ==========================================================================
  // Keyboard Shortcuts & Modals
  // ==========================================================================

  function initShortcuts() {
    const modal = document.getElementById('shortcuts-modal');
    const openBtn = document.getElementById('shortcuts-info-btn');
    const closeBtn = document.getElementById('close-shortcuts-modal-btn');
    const okBtn = document.getElementById('ok-shortcuts-modal-btn');

    const toggleModal = () => modal.classList.toggle('hidden');

    if (openBtn) openBtn.addEventListener('click', toggleModal);
    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    if (okBtn) okBtn.addEventListener('click', () => modal.classList.add('hidden'));

    window.addEventListener('keydown', (e) => {
      // Don't trigger if typing in an input
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);

      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.add('hidden'));
        document.getElementById('quick-task-title')?.blur();
        document.getElementById('global-search-input')?.blur();
      }

      if (isInput) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        document.getElementById('quick-task-title')?.focus();
      }

      if (e.key === '/') {
        e.preventDefault();
        document.getElementById('global-search-input')?.focus();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('global-search-input')?.focus();
      }

      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        document.getElementById('theme-toggle-btn')?.click();
      }

      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        Pomodoro.toggle();
      }

      if (e.key === '?') {
        e.preventDefault();
        toggleModal();
      }
    });
  }

  // ==========================================================================
  // Mobile Sidebar & Accordion Toggle
  // ==========================================================================

  function initMobileAndAccordion() {
    const sidebar = document.getElementById('sidebar');
    const mobileOpenBtn = document.getElementById('mobile-sidebar-toggle');
    const mobileCloseBtn = document.getElementById('mobile-sidebar-close');

    if (mobileOpenBtn && sidebar) {
      mobileOpenBtn.addEventListener('click', () => {
        sidebar.classList.add('mobile-open');
      });
    }

    if (mobileCloseBtn && sidebar) {
      mobileCloseBtn.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
      });
    }

    // New task modal button in sidebar focuses quick-add
    const newTaskBtn = document.getElementById('open-new-task-modal-btn');
    if (newTaskBtn) {
      newTaskBtn.addEventListener('click', () => {
        const input = document.getElementById('quick-task-title');
        if (input) {
          input.focus();
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        sidebar?.classList.remove('mobile-open');
      });
    }

    // Empty state button
    const emptyAddBtn = document.getElementById('empty-add-btn');
    if (emptyAddBtn) {
      emptyAddBtn.addEventListener('click', () => {
        document.getElementById('quick-task-title')?.focus();
      });
    }

    // Completed Group Accordion Toggle
    const completedToggle = document.getElementById('completed-toggle-btn');
    const completedList = document.getElementById('completed-tasks-list');
    const chevron = document.getElementById('completed-chevron');

    if (completedToggle && completedList && chevron) {
      completedToggle.addEventListener('click', () => {
        completedList.classList.toggle('hidden');
        chevron.classList.toggle('collapsed');
      });
    }
  }

  // ==========================================================================
  // App Initialization
  // ==========================================================================

  function init() {
    loadState();
    updateGreeting();
    initTheme();
    initSoundToggle();
    initNavigation();
    initSearchAndSort();
    initQuickAdd();
    initEditModal();
    initCategoryModal();
    initDataMenu();
    initShortcuts();
    initMobileAndAccordion();
    Pomodoro.init();

    // Motivational quote rotation
    const quoteEl = document.getElementById('progress-quote');
    if (quoteEl) {
      quoteEl.textContent = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    }

    renderCategoryOptions();
    renderTasks();
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
