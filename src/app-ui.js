// StockFlow Pro - UI Rendering & Event Handling Engine
window.AppUI = {
  init() {
    window.AppUtils.loadData();
    this.applyTheme();
    this.render();
    window.addEventListener('resize', () => {
      if (window.appState.currentTab === 'analytics') {
        window.AppCharts.renderCharts();
      }
    });

    // Global keyboard shortcut: '/' to focus search, and Numpad/Calc keys on miniKhata tab
    window.addEventListener('keydown', (e) => {
      if ((e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k')) && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        window.AppUI.focusSearch();
      } else if (window.appState.currentTab === 'miniKhata' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        if (/^[0-9]$/.test(e.key)) {
          window.AppUI.pressCalcKey(e.key);
        } else if (['+', '-', '*', '/'].includes(e.key)) {
          const mapped = e.key === '*' ? '×' : e.key === '/' ? '÷' : e.key;
          window.AppUI.pressCalcKey(mapped);
        } else if (e.key === 'Enter' || e.key === '=') {
          e.preventDefault();
          window.AppUI.pressCalcKey('=');
        } else if (e.key === 'Backspace') {
          window.AppUI.pressCalcKey('backspace');
        } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
          window.AppUI.pressCalcKey('C');
        }
      }
    });
  },

  focusSearch() {
    if (window.appState.currentTab !== 'inventory') {
      window.appState.currentTab = 'inventory';
      this.render();
    }
    setTimeout(() => {
      const input = document.getElementById('product-search-input');
      if (input) {
        input.focus();
        input.select();
      }
    }, 50);
  },

  applyTheme() {
    const isDark = window.appState.settings.theme === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  },

  toggleTheme() {
    window.appState.settings.theme = window.appState.settings.theme === 'dark' ? 'light' : 'dark';
    window.AppUtils.saveData();
    this.applyTheme();
    this.render();
  },

  setTab(tab) {
    window.appState.currentTab = tab;
    this.render();
  },

  openModal(modalType, item = null) {
    window.appState.activeModal = modalType;
    window.appState.editingItem = item;
    this.renderModal();
  },

  closeModal() {
    window.appState.activeModal = null;
    window.appState.editingItem = null;
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) modalContainer.innerHTML = '';
  },

  render() {
    const app = document.getElementById('app');
    if (!app) return;

    // Authentication Gate: If no user is logged in, show the login/registration screen
    if (!window.appState.currentUser) {
      this.renderAuthScreen(app);
      return;
    }

    const totals = window.AppUtils.getTotals();
    const isDark = window.appState.settings.theme === 'dark';
    const user = window.appState.currentUser;

    app.innerHTML = `
      <!-- Header Bar -->
      <header class="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-xl px-4 lg:px-8 py-3.5 transition-colors">
        <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <!-- Logo & Brand -->
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl overflow-hidden shadow-lg shadow-emerald-500/20 border border-emerald-500/30 flex-shrink-0 bg-slate-900">
              <img src="/app-logo.jpg" alt="Dokaner Hisab Logo" class="w-full h-full object-cover" onerror="this.onerror=null; this.src=''; this.parentElement.innerHTML='<div class=\'w-full h-full flex items-center justify-center bg-gradient-to-tr from-emerald-500 to-cyan-500 text-white font-bold\'><i class=\'fa-solid fa-shop\'></i></div>';" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
                  Dokaner Hisab <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">PRO</span>
                </h1>
                <span class="text-xs text-slate-400 font-bengali hidden sm:inline">দোকানের হিসাব ও স্টক</span>
                <span class="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[10px] font-mono" title="Firebase Online Cloud Sync">
                  <i class="fa-solid fa-cloud text-emerald-400"></i> Firebase: dokaner-hisab-94e6d
                </span>
              </div>
              <p class="text-xs text-emerald-400/90 font-medium truncate max-w-[200px] sm:max-w-xs">
                ${user ? (user.businessName || 'Business Enterprise') : 'আমার দোকান (সেটআপ করুন)'}
              </p>
            </div>
          </div>

          <!-- Quick Navigation Tabs -->
          <nav class="flex items-center p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs sm:text-sm overflow-x-auto scrollbar-thin">
            <button onclick="window.AppUI.setTab('inventory')" class="px-3 sm:px-4 py-1.5 rounded-lg font-medium transition-all ${window.appState.currentTab === 'inventory' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}">
              <i class="fa-solid fa-boxes-packing mr-1.5"></i> <span class="hidden sm:inline">ইনভেন্টরি / </span>Inventory
            </button>
            <button onclick="window.AppUI.setTab('expenses')" class="px-3 sm:px-4 py-1.5 rounded-lg font-medium transition-all ${window.appState.currentTab === 'expenses' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}">
              <i class="fa-solid fa-wallet mr-1.5"></i> <span class="hidden sm:inline">খরচ / </span>Expenses
            </button>
            <button onclick="window.AppUI.setTab('dues')" class="px-3 sm:px-4 py-1.5 rounded-lg font-medium transition-all relative ${window.appState.currentTab === 'dues' ? 'bg-amber-500 text-white shadow-md font-bold' : 'text-slate-400 hover:text-white'}">
              <i class="fa-solid fa-hand-holding-dollar mr-1.5"></i> <span class="hidden sm:inline">বাকির তালিকা / </span>Due List
              ${totals.unpaidDuesCount > 0 ? `<span class="ml-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px]">${totals.unpaidDuesCount}</span>` : ''}
            </button>
            <!-- আলাদা ছোট বাকির খাতা ও ক্যালকুলেটর (Separate Mini Baki Khata & Calculator) -->
            <button onclick="window.AppUI.setTab('miniKhata')" class="px-3 sm:px-4 py-1.5 rounded-lg font-medium transition-all relative flex items-center ${window.appState.currentTab === 'miniKhata' ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md font-bold' : 'text-slate-400 hover:text-white'}">
              <i class="fa-solid fa-book-open-reader mr-1.5 text-teal-300"></i>
              <span class="font-bengali font-bold">ছোট বাকির খাতা</span>
              <span class="ml-1.5 px-1.5 py-0.2 rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/30 font-mono text-[10px] hidden sm:inline">🧮 ক্যালকুলেটর</span>
              ${totals.unpaidMiniCount > 0 ? `<span class="ml-1.5 px-1.5 py-0.2 rounded-full bg-teal-300 text-slate-950 font-bold text-[10px]">${totals.unpaidMiniCount}</span>` : ''}
            </button>
            <button onclick="window.AppUI.setTab('analytics')" class="px-3 sm:px-4 py-1.5 rounded-lg font-medium transition-all ${window.appState.currentTab === 'analytics' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}">
              <i class="fa-solid fa-chart-pie mr-1.5"></i> <span class="hidden sm:inline">অ্যানালিটিক্স / </span>Analytics
            </button>
            <button onclick="window.AppUI.setTab('tips')" class="px-3 sm:px-4 py-1.5 rounded-lg font-medium transition-all relative ${window.appState.currentTab === 'tips' ? 'bg-purple-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}">
              <i class="fa-solid fa-lightbulb mr-1.5"></i> <span class="hidden sm:inline">পরামর্শ / </span>Tips
              ${totals.lowStockCount + totals.outOfStockCount > 0 ? '<span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span><span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full"></span>' : ''}
            </button>
          </nav>

          <!-- User Profile & Action Controls -->
          <div class="flex items-center gap-2">
            <!-- Header Search Trigger -->
            <button onclick="window.AppUI.focusSearch()" title="পণ্য খুঁজুন (Search Products - Press /)" class="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-all">
              <i class="fa-solid fa-magnifying-glass text-emerald-400 text-xs"></i>
              <span class="font-bengali">খুঁজুন</span>
              <kbd class="px-1.5 py-0.2 rounded bg-slate-900 text-[10px] text-slate-400 font-mono border border-slate-700">/</kbd>
            </button>
            <!-- Header Voice Search Microphone Button -->
            <button id="voice-btn-header" onclick="window.AppUI.toggleVoiceSearch('header')" title="মাইক্রোফোন দিয়ে মুখে বলে খুঁজুন (Voice Search)" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-xs text-emerald-400 hover:text-emerald-300 transition-all font-semibold">
              <i class="fa-solid fa-microphone text-xs ${window.appState.voiceSearch?.isListening ? 'text-rose-400 animate-pulse' : ''}"></i>
              <span class="font-bengali hidden md:inline">ভয়েস সার্চ</span>
            </button>
            <!-- Export Excel Button -->
            <button onclick="window.AppUtils.exportToExcel()" title="Export Excel / এক্সেলে ডাউনলোড করুন" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all">
              <i class="fa-solid fa-file-excel text-emerald-400 text-sm"></i>
              <span class="hidden lg:inline">Excel</span>
            </button>

            <!-- Mobile App / APK Install Button -->
            <button onclick="window.AppUI.openModal('installAppModal')" title="অ্যান্ড্রয়েড ফোনে অ্যাপ ইন্সটল করুন (Android APK / PWA)" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/25 text-xs font-bold transition-all">
              <i class="fa-brands fa-android text-sm"></i>
              <span class="hidden md:inline">অ্যাপ (APK)</span>
            </button>

            <!-- Backup Account Button -->
            <button onclick="window.AppUtils.exportAccountBackup()" title="Download Account Backup JSON / অ্যাকাউন্ট ব্যাকআপ ডাউনলোড" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition-all">
              <i class="fa-solid fa-cloud-arrow-down text-cyan-400 text-sm"></i>
              <span class="hidden lg:inline">Backup</span>
            </button>

            <!-- Theme Switcher -->
            <button onclick="window.AppUI.toggleTheme()" title="Toggle Dark/Light Mode" class="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-all text-xs">
              <i class="fa-solid ${isDark ? 'fa-sun text-amber-400' : 'fa-moon text-indigo-400'} text-sm"></i>
            </button>

            <!-- User Profile Avatar & Account Switcher Modal Trigger -->
            <button onclick="window.AppUI.openModal('auth')" class="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs transition-all text-left">
              <div class="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs">
                ${user?.name ? user.name.charAt(0) : '<i class="fa-solid fa-user-plus text-[10px]"></i>'}
              </div>
              <div class="hidden sm:block leading-tight">
                <p class="font-semibold text-white truncate max-w-[100px]">${user?.name ? user.name.split(' ')[0] : 'অ্যাকাউন্ট'}</p>
                <p class="text-[10px] text-emerald-400 truncate max-w-[100px]">${user ? 'প্রোফাইল' : 'সেটআপ / লগইন'} <i class="fa-solid fa-chevron-down text-[8px] ml-0.5"></i></p>
              </div>
            </button>

            ${user ? `
            <!-- Quick Logout Button -->
            <button onclick="window.AppUI.handleLogout()" title="লগআউট করুন ও একাউন্ট রিমুভ করুন" class="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs transition-all flex items-center gap-1.5 font-bold font-bengali">
              <i class="fa-solid fa-arrow-right-from-bracket text-xs"></i>
              <span>লগআউট</span>
            </button>
            ` : ''}
          </div>
        </div>
      </header>

      <!-- Sub-Bar Quick KPI Metrics -->
      <section class="border-b border-slate-800 bg-slate-950/60 px-4 lg:px-8 py-3">
        <div class="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
            <div>
              <p class="text-[11px] text-slate-400 font-medium font-bengali">মোট পণ্য সংখ্যা (Items)</p>
              <p class="text-base sm:text-lg font-bold text-white mt-0.5">${totals.totalProductsCount} <span class="text-xs text-slate-400 font-normal">Products</span></p>
            </div>
            <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm">
              <i class="fa-solid fa-boxes-stacked"></i>
            </div>
          </div>

          <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
            <div>
              <p class="text-[11px] text-slate-400 font-medium font-bengali">ইনভেন্টরি কেনা মান (Cost)</p>
              <p class="text-base sm:text-lg font-bold text-emerald-400 mt-0.5">${window.AppUtils.formatMoney(totals.totalInventoryCost)}</p>
            </div>
            <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm">
              <i class="fa-solid fa-cart-shopping"></i>
            </div>
          </div>

          <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
            <div>
              <p class="text-[11px] text-slate-400 font-medium font-bengali">খুচরা সম্ভাব্য লাভ (Profit)</p>
              <p class="text-base sm:text-lg font-bold text-cyan-400 mt-0.5">${window.AppUtils.formatMoney(totals.totalPotentialProfit)}</p>
            </div>
            <div class="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-sm">
              <i class="fa-solid fa-sack-dollar"></i>
            </div>
          </div>

          <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
            <div>
              <p class="text-[11px] text-slate-400 font-medium font-bengali">মোট ব্যয় (Expenses)</p>
              <p class="text-base sm:text-lg font-bold text-rose-400 mt-0.5">${window.AppUtils.formatMoney(totals.totalExpenses)}</p>
            </div>
            <div class="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center text-sm">
              <i class="fa-solid fa-receipt"></i>
            </div>
          </div>

          <div class="col-span-2 sm:col-span-1 p-3 rounded-xl bg-slate-900/60 border border-amber-500/30 flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2">
                <p class="text-[11px] text-amber-300 font-medium font-bengali">বাকি পাওনা (Customer Due)</p>
                ${totals.totalMiniDueAmount > 0 ? `<span onclick="window.AppUI.setTab('miniKhata')" class="cursor-pointer text-[10px] text-teal-400 bg-teal-950/80 px-1.5 py-0.5 rounded border border-teal-500/30 font-bengali hover:underline" title="ছোট বাকির খাতা">+ ছোট খাতা: ${window.AppUtils.formatMoney(totals.totalMiniDueAmount)}</span>` : ''}
              </div>
              <p class="text-base sm:text-lg font-bold text-amber-400 mt-0.5">${window.AppUtils.formatMoney(totals.totalDueAmount)}</p>
            </div>
            <div class="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-sm">
              <i class="fa-solid fa-hand-holding-dollar"></i>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Content Area based on Selected Tab -->
      <main class="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8">
        ${this.renderActiveTabContent()}
      </main>

      <!-- Toast Container -->
      <div id="toast-container" class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none"></div>

      <!-- Modal Placeholder -->
      <div id="modal-container"></div>
    `;

    // Re-render chart if analytics tab is active
    if (window.appState.currentTab === 'analytics') {
      setTimeout(() => window.AppCharts.renderCharts(), 50);
    }
  },

  renderActiveTabContent() {
    switch (window.appState.currentTab) {
      case 'inventory':
        return this.renderInventorySection();
      case 'expenses':
        return this.renderExpenseSection();
      case 'dues':
        return this.renderDueSection();
      case 'miniKhata':
        return this.renderMiniKhataSection();
      case 'analytics':
        return this.renderAnalyticsSection();
      case 'tips':
        return this.renderTipsSection();
      default:
        return this.renderInventorySection();
    }
  },

  renderInventorySection() {
    const products = window.appState.products;
    const query = (window.appState.searchQuery || '').toLowerCase().trim();
    const stockFilter = window.appState.stockFilter;
    const catFilter = window.appState.categoryFilter;

    // Distinct categories
    const categories = ['all', ...new Set(products.map(p => p.category))];

    const filtered = this.getFilteredProducts();

    return `
      <div class="space-y-6">
        <!-- Controls & Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>পণ্য ও ইনভেন্টরি তালিকা</span>
              <span class="text-sm font-normal text-slate-400 font-sans">(Product & Inventory Management)</span>
            </h2>
            <p class="text-xs text-slate-400 mt-1 font-bengali">সহজে নাম, SKU বা ক্যাটাগরি দিয়ে পণ্য খুঁজুন ও স্টক পর্যবেক্ষণ করুন</p>
          </div>

          <div class="flex items-center gap-2.5">
            <button onclick="window.AppUI.openModal('productForm')" class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all">
              <i class="fa-solid fa-plus text-xs"></i>
              <span>নতুন পণ্য যোগ করুন (Add Product)</span>
            </button>
          </div>
        </div>

        <!-- Dedicated High-Performance Search & Filter Toolbar -->
        <div class="glass-card p-4 sm:p-5 rounded-2xl space-y-3.5 border border-slate-700/80 shadow-lg">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <!-- Search Input Box -->
            <div class="relative flex-1">
              <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 text-sm"></i>
              <input 
                id="product-search-input"
                type="text" 
                placeholder="পণ্যের নাম, SKU বা ক্যাটাগরি লিখে খুঁজুন (অথবা মাইক্রোফোনে বলুন)..." 
                value="${window.appState.searchQuery || ''}"
                oninput="window.AppUI.handleSearch(this.value)"
                class="w-full pl-10 pr-24 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner font-sans"
              />
              <div class="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <!-- Microphone Voice Search Button -->
                <button 
                  id="voice-btn-inventory"
                  type="button" 
                  onclick="window.AppUI.toggleVoiceSearch('inventory')" 
                  title="মাইক্রোফোন চালু করে মুখে বলুন (Voice Search)" 
                  class="p-1.5 px-2 rounded-lg transition-all flex items-center justify-center text-xs ${window.appState.voiceSearch?.isListening && window.appState.voiceSearch?.activeTarget === 'inventory' ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/50 ring-2 ring-rose-400' : 'bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-slate-700'}">
                  <i class="fa-solid ${window.appState.voiceSearch?.isListening && window.appState.voiceSearch?.activeTarget === 'inventory' ? 'fa-microphone-lines animate-pulse' : 'fa-microphone'}"></i>
                </button>
                <button 
                  id="search-clear-btn" 
                  type="button" 
                  onclick="window.AppUI.clearSearch()" 
                  class="${query ? '' : 'hidden'} text-slate-400 hover:text-white px-1.5 py-0.5 rounded text-xs bg-slate-800"
                  title="সার্চ মুছুন (Clear Search)">
                  <i class="fa-solid fa-xmark"></i>
                </button>
                <span class="text-[10px] text-slate-500 hidden sm:inline px-1 py-0.5 rounded border border-slate-700 font-mono">/</span>
              </div>
            </div>

            <!-- Filters -->
            <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <!-- Stock Filter -->
              <select 
                id="product-stock-filter"
                onchange="window.appState.stockFilter = this.value; window.AppUI.handleSearch(window.appState.searchQuery);"
                class="px-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500">
                <option value="all" ${stockFilter === 'all' ? 'selected' : ''}>সকল স্টক (All Stocks)</option>
                <option value="inStock" ${stockFilter === 'inStock' ? 'selected' : ''}>পর্যাপ্ত (In Stock)</option>
                <option value="lowStock" ${stockFilter === 'lowStock' ? 'selected' : ''}>স্বল্প স্টক (Low Stock)</option>
                <option value="outOfStock" ${stockFilter === 'outOfStock' ? 'selected' : ''}>স্টক শেষ (Out of Stock)</option>
              </select>

              <!-- Category Filter -->
              <select 
                id="product-category-filter"
                onchange="window.appState.categoryFilter = this.value; window.AppUI.handleSearch(window.appState.searchQuery);"
                class="px-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500 max-w-[170px] truncate">
                ${categories.map(c => `<option value="${c}" ${catFilter === c ? 'selected' : ''}>${c === 'all' ? 'সকল ক্যাটাগরি (All)' : c}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- Quick Search Filter Chips / Tags -->
          <div class="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
            <span class="text-[11px] text-slate-400 mr-1 font-bengali"><i class="fa-solid fa-tags text-[10px] mr-1 text-emerald-400"></i>দ্রুত ফিল্টার:</span>
            <button onclick="window.AppUI.filterByTag('')" class="px-2.5 py-1 rounded-lg ${!query ? 'bg-emerald-500 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:text-white'} text-[11px] transition-all">সকল</button>
            <button onclick="window.AppUI.filterByTag('চাল')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-all">চাল (Rice)</button>
            <button onclick="window.AppUI.filterByTag('তেল')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-all">তেল (Oil)</button>
            <button onclick="window.AppUI.filterByTag('চা')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-all">চা পাতা (Tea)</button>
            <button onclick="window.AppUI.filterByTag('আটা')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-all">আটা (Flour)</button>
            <button onclick="window.AppUI.filterByTag('দুধ')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-all">দুধ (Milk)</button>
            <span id="search-count-badge" class="ml-auto text-[11px] text-emerald-400 font-semibold bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              ${filtered.length} টি পণ্য প্রদর্শিত (Total ${products.length})
            </span>
          </div>
        </div>

        <!-- Inventory Table -->
        <div class="glass-card rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
          <div class="overflow-x-auto scrollbar-thin">
            <table class="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr class="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th class="py-3.5 px-4">পণ্য (Product)</th>
                  <th class="py-3.5 px-3">ওজন / পরিমাণ</th>
                  <th class="py-3.5 px-3 text-right">কেনা দাম (Cost)</th>
                  <th class="py-3.5 px-3 text-right">পাইকারি (Wholesale)</th>
                  <th class="py-3.5 px-3 text-right">খুচরা (Retail)</th>
                  <th class="py-3.5 px-3 text-center">মার্জিন (Margin %)</th>
                  <th class="py-3.5 px-3 text-center">স্টক (Stock)</th>
                  <th class="py-3.5 px-4 text-center">অ্যাকশন (Action)</th>
                </tr>
              </thead>
              <tbody id="inventory-table-body" class="divide-y divide-slate-800/60">
                ${this.renderInventoryRows(filtered, query)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  getFilteredProducts() {
    const products = window.appState.products || [];
    const query = (window.appState.searchQuery || '').toLowerCase().trim();
    const stockFilter = window.appState.stockFilter || 'all';
    const catFilter = window.appState.categoryFilter || 'all';

    return products.filter(p => {
      const matchSearch = !query || 
        (p.nameBn && p.nameBn.toLowerCase().includes(query)) || 
        (p.nameEn && p.nameEn.toLowerCase().includes(query)) || 
        (p.sku && p.sku.toLowerCase().includes(query)) ||
        (p.category && p.category.toLowerCase().includes(query)) ||
        (p.netWeight && p.netWeight.toLowerCase().includes(query));

      const m = window.AppUtils.calculateProductMetrics(p);
      const matchStock = stockFilter === 'all' || m.status === stockFilter;
      const matchCat = catFilter === 'all' || p.category === catFilter;

      return matchSearch && matchStock && matchCat;
    });
  },

  renderInventoryRows(filtered, query = '') {
    if (!filtered || filtered.length === 0) {
      if (!query && window.appState.products.length === 0) {
        return `
          <tr>
            <td colspan="8" class="text-center py-14 text-slate-400 font-bengali">
              <div class="max-w-md mx-auto p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div class="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mb-3">
                  <i class="fa-solid fa-boxes-stacked"></i>
                </div>
                <h4 class="font-bold text-white text-base mb-1 font-bengali">ইনভেন্টরি সম্পূর্ণ খালি</h4>
                <p class="text-xs text-slate-400 mb-4 font-bengali">আপনার দোকানে এখনো কোনো পণ্য যুক্ত করা হয়নি। নিচের বাটনে ক্লিক করে আপনার প্রথম পণ্য এন্ট্রি করুন।</p>
                <button onclick="window.AppUI.openModal('productForm')" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all">
                  <i class="fa-solid fa-plus"></i>
                  <span>নতুন পণ্য যোগ করুন (Add Product)</span>
                </button>
              </div>
            </td>
          </tr>
        `;
      }
      return `
        <tr>
          <td colspan="8" class="text-center py-12 text-slate-400 font-bengali">
            <i class="fa-solid fa-magnifying-glass text-3xl mb-3 text-slate-600 block"></i>
            <p class="font-bold text-white text-base">"${query || 'ফিল্টার'}" দিয়ে কোন পণ্য পাওয়া যায়নি!</p>
            <p class="text-xs text-slate-400 mt-1">দয়া করে সঠিক নাম লিখুন অথবা <button onclick="window.AppUI.clearSearch()" class="text-emerald-400 underline font-semibold">সকল পণ্য দেখুন</button></p>
          </td>
        </tr>
      `;
    }

    return filtered.map(p => {
      const m = window.AppUtils.calculateProductMetrics(p);
      return `
        <tr class="hover:bg-slate-800/40 transition-colors">
          <td class="py-3 px-4">
            <div class="font-bold text-white text-sm font-bengali leading-snug">${p.nameBn}</div>
            <div class="text-[11px] text-slate-400 font-sans flex items-center gap-1.5 mt-0.5">
              <span>${p.nameEn}</span>
              <span class="px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">${p.sku}</span>
            </div>
          </td>
          <td class="py-3 px-3">
            <span class="inline-block px-2.5 py-1 rounded-md bg-slate-800/90 text-slate-300 font-medium text-xs">
              ${p.netWeight || p.unit}
            </span>
          </td>
          <td class="py-3 px-3 text-right font-medium text-rose-300 font-mono">
            ${window.AppUtils.formatMoney(p.costPrice)}
          </td>
          <td class="py-3 px-3 text-right font-medium text-blue-300 font-mono">
            ${window.AppUtils.formatMoney(p.wholesalePrice)}
            <span class="block text-[10px] text-blue-400 font-sans">+${m.wholesaleMargin}%</span>
          </td>
          <td class="py-3 px-3 text-right font-bold text-emerald-400 font-mono">
            ${window.AppUtils.formatMoney(p.retailPrice)}
            <span class="block text-[10px] text-emerald-400 font-sans">+${m.retailMargin}%</span>
          </td>
          <td class="py-3 px-3 text-center">
            <span class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${Number(m.retailMargin) >= 20 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : Number(m.retailMargin) >= 10 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}">
              ${m.retailMargin}%
            </span>
          </td>
          <td class="py-3 px-3 text-center">
            <div class="flex items-center justify-center gap-1.5">
              <button onclick="window.AppUI.adjustStock('${p.id}', -1)" title="Decrease Stock (-1)" class="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs transition-colors">-</button>
              <span class="font-bold text-sm min-w-[28px] ${p.stock <= 0 ? 'text-rose-400' : p.stock <= p.minStock ? 'text-amber-400' : 'text-slate-200'}">${p.stock}</span>
              <button onclick="window.AppUI.adjustStock('${p.id}', 1)" title="Increase Stock (+1)" class="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs transition-colors">+</button>
            </div>
            <span class="inline-block text-[10px] px-2 py-0.5 rounded border mt-1 ${m.statusClass}">
              ${m.statusLabel}
            </span>
          </td>
          <td class="py-3 px-4 text-center">
            <div class="flex items-center justify-center gap-1.5">
              <button onclick="window.AppUI.openModal('sellForm', ${JSON.stringify(p).replace(/"/g, '&quot;')})" title="Quick Sell / বিক্রি করুন" class="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs transition-all">
                <i class="fa-solid fa-cart-arrow-down"></i>
              </button>
              <button onclick="window.AppUI.openModal('productForm', ${JSON.stringify(p).replace(/"/g, '&quot;')})" title="Edit Product / সংশোধন" class="p-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 text-xs transition-all">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button onclick="window.AppUI.deleteProduct('${p.id}')" title="Delete / ডিলিট" class="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-xs transition-all">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  handleSearch(val) {
    window.appState.searchQuery = val;
    const filtered = this.getFilteredProducts();

    const tbody = document.getElementById('inventory-table-body');
    if (tbody) {
      tbody.innerHTML = this.renderInventoryRows(filtered, val);
    } else {
      // If user searched while on another tab, switch to inventory
      this.setTab('inventory');
      return;
    }

    const badge = document.getElementById('search-count-badge');
    if (badge) {
      badge.innerText = `${filtered.length} টি পণ্য প্রদর্শিত (Total ${window.appState.products.length})`;
    }

    const clearBtn = document.getElementById('search-clear-btn');
    if (clearBtn) {
      if (val && val.trim().length > 0) {
        clearBtn.classList.remove('hidden');
      } else {
        clearBtn.classList.add('hidden');
      }
    }
  },

  clearSearch() {
    window.appState.searchQuery = '';
    const input = document.getElementById('product-search-input');
    if (input) {
      input.value = '';
      input.focus();
    }
    this.handleSearch('');
  },

  filterByTag(tag) {
    window.appState.searchQuery = tag;
    const input = document.getElementById('product-search-input');
    if (input) {
      input.value = tag;
      input.focus();
    }
    this.handleSearch(tag);
  },

  // ==========================================
  // ভয়েস সার্চ ও মাইক্রোফোন ইঞ্জিন (Voice Search Engine)
  // ==========================================

  playVoiceBeep(type = 'start') {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (type === 'start') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.09);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      }
    } catch (e) {}
  },

  initVoiceRecognition(target = 'inventory') {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return null;
    }

    if (window._appSpeechRecognizer) {
      try {
        window._appSpeechRecognizer.abort();
      } catch (e) {}
      window._appSpeechRecognizer = null;
    }

    const recognizer = new SpeechRecognition();
    recognizer.continuous = false;
    recognizer.interimResults = true;
    recognizer.maxAlternatives = 1;
    recognizer.lang = window.appState.voiceSearch?.lang || 'bn-BD';

    recognizer.onstart = () => {
      if (!window.appState.voiceSearch) window.appState.voiceSearch = {};
      window.appState.voiceSearch.isListening = true;
      window.appState.voiceSearch.activeTarget = target;
      this.playVoiceBeep('start');
      this.updateVoiceUI();
      window.AppUtils.showToast('🎙️ মাইক্রোফোন চালু হয়েছে! বাংলায় পণ্য বা গ্রাহকের নাম বলুন...');
    };

    recognizer.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      const text = (final || interim).trim();
      if (text) {
        this.updateLiveVoicePreview(target, text);
        if (final) {
          this.applyVoiceTranscriptToTarget(target, final.trim());
          this.playVoiceBeep('success');
          this.stopVoiceSearch();
        }
      }
    };

    recognizer.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        window.AppUtils.showToast('⚠️ মাইক্রোফোন পারমিশন প্রয়োজন। অনুমতি দিন।', 'error');
        this.openVoiceModal(target);
      } else if (event.error === 'no-speech') {
        window.AppUtils.showToast('কোনো কথা শোনা যায়নি। মাইক্রোফোনে আবার ক্লিক করুন।');
      } else if (event.error === 'network') {
        window.AppUtils.showToast('ভয়েস সেবার জন্য ইন্টারনেট সংযোগ পরীক্ষা করুন।');
      }
      this.stopVoiceSearch();
    };

    recognizer.onend = () => {
      if (window.appState.voiceSearch?.isListening) {
        this.stopVoiceSearch();
      }
    };

    window._appSpeechRecognizer = recognizer;
    return recognizer;
  },

  toggleVoiceSearch(target = 'inventory') {
    if (!window.appState.voiceSearch) {
      window.appState.voiceSearch = { isListening: false, activeTarget: null, lang: 'bn-BD', lastTranscript: '' };
    }

    if (target === 'header') {
      if (window.appState.currentTab !== 'inventory' && window.appState.currentTab !== 'dues' && window.appState.currentTab !== 'miniKhata') {
        this.setTab('inventory');
      }
      target = window.appState.currentTab === 'dues' ? 'dues' : window.appState.currentTab === 'miniKhata' ? 'miniKhata' : 'inventory';
    }

    if (window.appState.voiceSearch.isListening) {
      this.stopVoiceSearch();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.openVoiceModal(target);
      return;
    }

    window.appState.voiceSearch.activeTarget = target;
    const recognizer = this.initVoiceRecognition(target);
    if (!recognizer) {
      this.openVoiceModal(target);
      return;
    }

    try {
      recognizer.lang = window.appState.voiceSearch.lang || 'bn-BD';
      recognizer.start();
    } catch (e) {
      console.warn('Speech recognizer start error:', e);
      try {
        recognizer.abort();
        setTimeout(() => {
          try {
            recognizer.start();
          } catch (err) {
            this.openVoiceModal(target);
          }
        }, 150);
      } catch (err) {
        this.openVoiceModal(target);
      }
    }
  },

  stopVoiceSearch() {
    if (window._appSpeechRecognizer) {
      try {
        window._appSpeechRecognizer.abort();
      } catch (e) {}
      window._appSpeechRecognizer = null;
    }
    if (window.appState.voiceSearch) {
      window.appState.voiceSearch.isListening = false;
    }
    this.updateVoiceUI();
  },

  updateLiveVoicePreview(target, text) {
    if (window.appState.voiceSearch) {
      window.appState.voiceSearch.lastTranscript = text;
    }

    const liveText = document.getElementById('voice-live-text');
    if (liveText) {
      liveText.textContent = `"${text}"`;
    }

    const inputId = target === 'dues' ? 'due-search-input' : target === 'miniKhata' ? 'mini-search-input' : 'product-search-input';
    const input = document.getElementById(inputId);
    if (input) {
      input.value = text;
      const clearId = target === 'dues' ? 'due-search-clear-btn' : target === 'miniKhata' ? 'mini-search-clear-btn' : 'search-clear-btn';
      const clearBtn = document.getElementById(clearId);
      if (clearBtn) clearBtn.classList.remove('hidden');
    }
  },

  applyVoiceTranscript(transcript) {
    const target = window.appState.voiceSearch?.activeTarget || 'inventory';
    this.applyVoiceTranscriptToTarget(target, transcript);
  },

  applyVoiceTranscriptToTarget(target, transcript) {
    if (target === 'inventory') {
      window.appState.searchQuery = transcript;
      const input = document.getElementById('product-search-input');
      if (input) {
        input.value = transcript;
        input.focus();
        const clearBtn = document.getElementById('search-clear-btn');
        if (clearBtn) clearBtn.classList.remove('hidden');
      }
      this.handleSearch(transcript);
    } else if (target === 'dues') {
      window.appState.dueSearchQuery = transcript;
      const input = document.getElementById('due-search-input');
      if (input) {
        input.value = transcript;
        input.focus();
        const clearBtn = document.getElementById('due-search-clear-btn');
        if (clearBtn) clearBtn.classList.remove('hidden');
      }
      this.handleDueSearch(transcript);
    } else if (target === 'miniKhata') {
      window.appState.miniKhataSearchQuery = transcript;
      const input = document.getElementById('mini-search-input');
      if (input) {
        input.value = transcript;
        input.focus();
        const clearBtn = document.getElementById('mini-search-clear-btn');
        if (clearBtn) clearBtn.classList.remove('hidden');
      }
      this.handleMiniKhataSearch(transcript);
    }

    window.AppUtils.showToast(`🎙️ সার্চ করা হলো: "${transcript}"`);
  },

  setVoiceLanguage(lang) {
    if (!window.appState.voiceSearch) {
      window.appState.voiceSearch = { isListening: false, activeTarget: null, lang: 'bn-BD', lastTranscript: '' };
    }
    window.appState.voiceSearch.lang = lang;
    window.AppUtils.showToast(`ভয়েস ভাষা: ${lang === 'bn-BD' ? '🇧🇩 বাংলা' : '🇺🇸 English'}`);
    if (window.appState.voiceSearch.isListening) {
      const activeTarget = window.appState.voiceSearch.activeTarget || 'inventory';
      this.stopVoiceSearch();
      setTimeout(() => this.toggleVoiceSearch(activeTarget), 150);
    } else {
      this.updateVoiceUI();
    }
  },

  openVoiceModal(target = 'inventory') {
    if (!window.appState.voiceSearch) {
      window.appState.voiceSearch = { isListening: false, activeTarget: target, lang: 'bn-BD', lastTranscript: '' };
    } else {
      window.appState.voiceSearch.activeTarget = target;
    }
    this.openModal('voiceModal');
  },

  updateVoiceUI() {
    const isListening = !!window.appState.voiceSearch?.isListening;
    const target = window.appState.voiceSearch?.activeTarget || 'inventory';
    const lang = window.appState.voiceSearch?.lang || 'bn-BD';

    let banner = document.getElementById('voice-listening-banner');
    if (isListening) {
      if (!banner) {
        banner = document.createElement('div');
        banner.id = 'voice-listening-banner';
        banner.className = 'fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border-2 border-rose-500 rounded-2xl px-4 sm:px-5 py-3 shadow-2xl flex items-center gap-3.5 text-white backdrop-blur-md transition-all shadow-rose-500/25 max-w-[92vw] sm:max-w-md';
        document.body.appendChild(banner);
      }
      
      const targetLabel = target === 'dues' ? '📋 বাকির খাতা' : target === 'miniKhata' ? '📒 ছোট খাতা' : '📦 পণ্য স্টক';
      banner.innerHTML = `
        <div class="relative flex items-center justify-center shrink-0">
          <div class="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center text-base animate-pulse">
            <i class="fa-solid fa-microphone"></i>
          </div>
          <span class="absolute -inset-1 rounded-full border border-rose-400 animate-ping opacity-75"></span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-bold text-rose-300 font-bengali">মাইক্রোফোন শুনছে...</span>
            <div class="flex items-center gap-0.5 h-3">
              <span class="w-1 bg-rose-400 rounded-full animate-bounce h-2"></span>
              <span class="w-1 bg-rose-300 rounded-full animate-bounce h-3" style="animation-delay: 120ms"></span>
              <span class="w-1 bg-rose-500 rounded-full animate-bounce h-2" style="animation-delay: 240ms"></span>
              <span class="w-1 bg-rose-400 rounded-full animate-bounce h-2.5" style="animation-delay: 360ms"></span>
            </div>
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-bold">${targetLabel}</span>
          </div>
          <p id="voice-live-text" class="text-xs text-amber-300 font-medium truncate font-bengali mt-0.5">
            ${window.appState.voiceSearch?.lastTranscript ? `"${window.appState.voiceSearch.lastTranscript}"` : 'এখন কথা বলুন (যেমন: চিনি, তেল, চাল, রফিক)...'}
          </p>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <button onclick="window.AppUI.setVoiceLanguage('${lang === 'bn-BD' ? 'en-US' : 'bn-BD'}')" title="ভাষা পরিবর্তন করুন" class="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 hover:text-white border border-slate-700">
            ${lang === 'bn-BD' ? '🇺🇸 EN' : '🇧🇩 বাং'}
          </button>
          <button onclick="window.AppUI.stopVoiceSearch()" class="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-bengali transition-colors">
            বন্ধ
          </button>
        </div>
      `;
    } else {
      if (banner) {
        banner.remove();
      }
    }

    ['inventory', 'dues', 'miniKhata', 'header'].forEach(t => {
      const btn = document.getElementById(t === 'header' ? 'voice-btn-header' : `voice-btn-${t}`);
      if (btn) {
        const active = isListening && (target === t || (t === 'header'));
        const colorClass = t === 'dues' ? 'text-amber-400 hover:text-amber-300' : t === 'miniKhata' ? 'text-teal-400 hover:text-teal-300' : 'text-emerald-400 hover:text-emerald-300';
        if (t === 'header') {
          btn.className = `flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition-all font-semibold ${active ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/50 border-rose-400' : 'bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-emerald-400 hover:text-emerald-300'}`;
          btn.innerHTML = `<i class="fa-solid ${active ? 'fa-microphone-lines animate-pulse text-white' : 'fa-microphone text-emerald-400'} text-xs"></i><span class="font-bengali hidden md:inline">ভয়েস সার্চ</span>`;
        } else {
          btn.className = `p-1.5 px-2 rounded-lg transition-all flex items-center justify-center text-xs ${active ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/50 ring-2 ring-rose-400' : `bg-slate-800 hover:bg-slate-700 ${colorClass} border border-slate-700`}`;
          btn.innerHTML = `<i class="fa-solid ${active ? 'fa-microphone-lines animate-pulse text-sm' : 'fa-microphone'}"></i>`;
        }
      }
    });

    // Update active input border / placeholder
    const inputIds = [
      { id: 'product-search-input', target: 'inventory', defaultPh: 'পণ্যের নাম, SKU বা ক্যাটাগরি লিখে খুঁজুন (অথবা মাইক্রোফোনে বলুন)...' },
      { id: 'due-search-input', target: 'dues', defaultPh: 'গ্রাহকের নাম, মোবাইল নম্বর বা পণ্যের বিবরণ লিখে খুঁজুন (অথবা মাইক্রোফোনে বলুন)...' },
      { id: 'mini-search-input', target: 'miniKhata', defaultPh: 'নাম, মোবাইল বা পণ্য লিখে খুঁজুন (অথবা মাইক্রোফোনে বলুন)...' }
    ];

    inputIds.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) {
        if (isListening && target === item.target) {
          el.classList.add('ring-2', 'ring-rose-500/80', 'border-rose-500');
          el.placeholder = '🎙️ মাইক্রোফোনে কথা বলুন... শুনছি...';
        } else {
          el.classList.remove('ring-2', 'ring-rose-500/80', 'border-rose-500');
          el.placeholder = item.defaultPh;
        }
      }
    });
  },

  renderExpenseSection() {
    const expenses = window.appState.expenses;
    const totals = window.AppUtils.getTotals();

    // Group by category
    const catMap = {};
    expenses.forEach(e => {
      catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount || 0);
    });

    return `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>ব্যবসায়িক খরচ ট্র্যাকার</span>
              <span class="text-sm font-normal text-slate-400 font-sans">(Expense Tracker Module)</span>
            </h2>
            <p class="text-xs text-slate-400 mt-1 font-bengali">দোকান ভাড়া, বিদ্যুৎ বিল, কর্মচারীর বেতন ও অন্যান্য আনুষঙ্গিক ব্যয়ের নিখুঁত হিসাব</p>
          </div>

          <div class="flex items-center gap-2.5">
            <button onclick="window.AppUI.openModal('expenseForm')" class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-rose-500/20 transition-all">
              <i class="fa-solid fa-plus text-xs"></i>
              <span>নতুন খরচ রেকর্ড করুন (Add Expense)</span>
            </button>
          </div>
        </div>

        <!-- Expense Summary Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="glass-card p-4 rounded-2xl border-l-4 border-l-rose-500">
            <p class="text-xs text-slate-400 font-medium font-bengali">সর্বমোট ব্যবসায়িক ব্যয় (Total Expenses)</p>
            <p class="text-2xl font-black text-rose-400 mt-1">${window.AppUtils.formatMoney(totals.totalExpenses)}</p>
            <p class="text-[11px] text-slate-400 mt-1">মোট ${expenses.length} টি খরচের ভাউচার রেকর্ড করা হয়েছে</p>
          </div>
          <div class="glass-card p-4 rounded-2xl border-l-4 border-l-amber-500">
            <p class="text-xs text-slate-400 font-medium font-bengali">খরচ বনাম মুনাফা অনুপাত (Expense Ratio)</p>
            <p class="text-2xl font-black text-amber-400 mt-1">${totals.expenseToProfitRatio}%</p>
            <p class="text-[11px] text-slate-400 mt-1">গ্রস সম্ভাব্য লাভের সাথে ব্যয়ের শতকরা ভাগ</p>
          </div>
          <div class="glass-card p-4 rounded-2xl border-l-4 border-l-emerald-500">
            <p class="text-xs text-slate-400 font-medium font-bengali">নিট মুনাফা পূর্বাভাস (Net Projected Profit)</p>
            <p class="text-2xl font-black ${totals.netProjectedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'} mt-1">
              ${window.AppUtils.formatMoney(totals.netProjectedProfit)}
            </p>
            <p class="text-[11px] text-slate-400 mt-1">সম্ভাব্য লাভ থেকে খরচ বাদ দিয়ে অবশিষ্ট লাভ</p>
          </div>
        </div>

        <!-- Expense Table -->
        <div class="glass-card rounded-2xl overflow-hidden border border-slate-800">
          <div class="overflow-x-auto scrollbar-thin">
            <table class="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr class="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th class="py-3.5 px-4">তারিখ (Date)</th>
                  <th class="py-3.5 px-4">খরচের খাত ও বিবরণ (Expense Details)</th>
                  <th class="py-3.5 px-3">ক্যাটাগরি (Category)</th>
                  <th class="py-3.5 px-3">পেমেন্ট মাধ্যম</th>
                  <th class="py-3.5 px-4 text-right">টাকার পরিমাণ (Amount)</th>
                  <th class="py-3.5 px-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                ${expenses.length === 0 ? `
                  <tr>
                    <td colspan="6" class="text-center py-12 text-slate-400 font-bengali">
                      <i class="fa-solid fa-receipt text-4xl mb-3 text-slate-600 block"></i>
                      এখনো কোন খরচ এন্ট্রি করা হয়নি। নতুন খরচ যোগ করতে বাটনে ক্লিক করুন।
                    </td>
                  </tr>
                ` : expenses.map(e => `
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="py-3.5 px-4 text-slate-300 font-mono text-xs">${e.date}</td>
                    <td class="py-3.5 px-4">
                      <p class="font-bold text-white text-sm font-bengali">${e.title}</p>
                      ${e.description ? `<p class="text-xs text-slate-400 mt-0.5">${e.description}</p>` : ''}
                    </td>
                    <td class="py-3.5 px-3">
                      <span class="inline-block px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-xs border border-slate-700">
                        ${e.category}
                      </span>
                    </td>
                    <td class="py-3.5 px-3 text-slate-400 text-xs">
                      <i class="fa-regular fa-credit-card mr-1 text-slate-500"></i> ${e.paymentMethod || 'Cash'}
                    </td>
                    <td class="py-3.5 px-4 text-right font-bold text-rose-400 font-mono text-sm">
                      ${window.AppUtils.formatMoney(e.amount)}
                    </td>
                    <td class="py-3.5 px-4 text-center">
                      <button onclick="window.AppUI.deleteExpense('${e.id}')" title="Delete" class="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-xs transition-all">
                        <i class="fa-solid fa-trash-can"></i>
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  renderDueSection() {
    const dues = window.appState.dues || [];
    const totals = window.AppUtils.getTotals();
    const query = (window.appState.dueSearchQuery || '').toLowerCase().trim();
    const filter = window.appState.dueFilter || 'all';

    const filtered = dues.filter(d => {
      const matchSearch = !query ||
        (d.customerName && d.customerName.toLowerCase().includes(query)) ||
        (d.phone && d.phone.toLowerCase().includes(query)) ||
        (d.address && d.address.toLowerCase().includes(query)) ||
        (d.itemsDesc && d.itemsDesc.toLowerCase().includes(query));

      const isPaid = Number(d.dueAmount || 0) <= 0 || d.status === 'paid';
      const matchStatus = filter === 'all' || 
        (filter === 'paid' && isPaid) ||
        (filter === 'unpaid' && !isPaid);

      return matchSearch && matchStatus;
    });

    return `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>বাকির খাতা ও দেনা-পাওনা তালিকা</span>
              <span class="text-sm font-normal text-slate-400 font-sans">(Customer Credit & Due Ledger)</span>
            </h2>
            <p class="text-xs text-slate-400 mt-1 font-bengali">খুচরা ও পাইকারি কাস্টমারদের বকেয়া পাওনা, জমা এবং পরিশোধের হিসাব রাখুন</p>
          </div>

          <div class="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <!-- Separate Mini Khata button -->
            <button onclick="window.AppUI.setTab('miniKhata')" title="আলাদা ছোট বাকির খাতা ও ক্যালকুলেটর" class="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 font-semibold text-xs sm:text-sm shadow-md transition-all">
              <i class="fa-solid fa-calculator text-teal-400"></i>
              <span>ছোট বাকির খাতা (🧮 ক্যালকুলেটর)</span>
            </button>

            <button onclick="window.AppUI.openModal('dueForm')" class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all">
              <i class="fa-solid fa-plus text-xs"></i>
              <span>নতুন বাকি এন্ট্রি (Add Due)</span>
            </button>
          </div>
        </div>

        <!-- KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="glass-card p-4 rounded-2xl border-l-4 border-l-amber-500">
            <p class="text-xs text-slate-400 font-medium font-bengali">সর্বমোট বাকি পাওনা (Total Due Amount)</p>
            <p class="text-2xl font-black text-amber-400 mt-1">${window.AppUtils.formatMoney(totals.totalDueAmount)}</p>
            <p class="text-[11px] text-amber-300/80 mt-1">বর্তমানে গ্রাহকদের নিকট পাওনা বকেয়া</p>
          </div>

          <div class="glass-card p-4 rounded-2xl border-l-4 border-l-emerald-500">
            <p class="text-xs text-slate-400 font-medium font-bengali">মোট সংগৃহীত / আদায়কৃত টাকা (Collected)</p>
            <p class="text-2xl font-black text-emerald-400 mt-1">${window.AppUtils.formatMoney(totals.totalDueCollected)}</p>
            <p class="text-[11px] text-emerald-300/80 mt-1">পূর্বের বাকি থেকে ইতিমধ্যে জমা হয়েছে</p>
          </div>

          <div class="glass-card p-4 rounded-2xl border-l-4 border-l-cyan-500">
            <p class="text-xs text-slate-400 font-medium font-bengali">বাকি থাকা গ্রাহক সংখ্যা (Active Debtors)</p>
            <p class="text-2xl font-black text-cyan-400 mt-1">${totals.unpaidDuesCount} <span class="text-sm font-normal text-slate-400">জন</span></p>
            <p class="text-[11px] text-slate-400 mt-1">মোট নথিভুক্ত গ্রাহক: ${dues.length} জন</p>
          </div>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="glass-card p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 border border-slate-700/80 shadow-lg">
          <div class="relative flex-1">
            <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400 text-xs"></i>
            <input 
              id="due-search-input"
              type="text" 
              placeholder="গ্রাহকের নাম, মোবাইল নম্বর বা পণ্যের বিবরণ লিখে খুঁজুন (অথবা মাইক্রোফোনে বলুন)..." 
              value="${window.appState.dueSearchQuery || ''}"
              oninput="window.AppUI.handleDueSearch(this.value)"
              class="w-full pl-9 pr-24 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors font-sans shadow-inner"
            />
            <div class="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <!-- Voice Search Microphone Button -->
              <button 
                id="voice-btn-dues"
                type="button" 
                onclick="window.AppUI.toggleVoiceSearch('dues')" 
                title="মাইক্রোফোন চালু করে মুখে বলুন (Voice Search)" 
                class="p-1.5 px-2 rounded-lg transition-all flex items-center justify-center text-xs ${window.appState.voiceSearch?.isListening && window.appState.voiceSearch?.activeTarget === 'dues' ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/50 ring-2 ring-rose-400' : 'bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700'}">
                <i class="fa-solid ${window.appState.voiceSearch?.isListening && window.appState.voiceSearch?.activeTarget === 'dues' ? 'fa-microphone-lines animate-pulse' : 'fa-microphone'}"></i>
              </button>
              <button 
                id="due-search-clear-btn" 
                type="button" 
                onclick="window.AppUI.clearDueSearch()" 
                class="${query ? '' : 'hidden'} text-slate-400 hover:text-white px-1.5 py-0.5 rounded text-xs bg-slate-800"
                title="সার্চ মুছুন">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <!-- Filter buttons -->
            <div class="flex items-center p-1 bg-slate-950/80 rounded-xl border border-slate-700 text-xs">
              <button onclick="window.AppUI.filterDueByStatus('all')" class="px-2.5 py-1 rounded-lg transition-all ${filter === 'all' ? 'bg-amber-500 text-white font-bold' : 'text-slate-400 hover:text-white'}">
                সকল (${dues.length})
              </button>
              <button onclick="window.AppUI.filterDueByStatus('unpaid')" class="px-2.5 py-1 rounded-lg transition-all ${filter === 'unpaid' ? 'bg-amber-500 text-white font-bold' : 'text-slate-400 hover:text-white'}">
                বাকি আছে (${totals.unpaidDuesCount})
              </button>
              <button onclick="window.AppUI.filterDueByStatus('paid')" class="px-2.5 py-1 rounded-lg transition-all ${filter === 'paid' ? 'bg-emerald-500 text-white font-bold' : 'text-slate-400 hover:text-white'}">
                পরিশোধিত (${dues.length - totals.unpaidDuesCount})
              </button>
            </div>

            <span id="due-count-badge" class="text-[11px] text-amber-400 font-semibold bg-amber-950/40 px-2.5 py-1.5 rounded-xl border border-amber-500/20 whitespace-nowrap">
              ${filtered.length} জন গ্রাহক
            </span>
          </div>
        </div>

        <!-- Dues Table -->
        <div class="glass-card rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
          <div class="overflow-x-auto scrollbar-thin">
            <table class="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr class="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th class="py-3.5 px-4">গ্রাহকের নাম ও ঠিকানা</th>
                  <th class="py-3.5 px-3">পণ্যের বিবরণ</th>
                  <th class="py-3.5 px-3 text-right">মোট বিল</th>
                  <th class="py-3.5 px-3 text-right">জমা (Paid)</th>
                  <th class="py-3.5 px-3 text-right">বাকি (Due)</th>
                  <th class="py-3.5 px-3 text-center">পরিশোধের তারিখ</th>
                  <th class="py-3.5 px-3 text-center">অবস্থা</th>
                  <th class="py-3.5 px-4 text-center">অ্যাকশন (Action)</th>
                </tr>
              </thead>
              <tbody id="due-table-body" class="divide-y divide-slate-800/60">
                ${this.renderDueRows(filtered)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  renderDueRows(filtered) {
    if (!filtered || filtered.length === 0) {
      return `
        <tr>
          <td colspan="8" class="text-center py-12 text-slate-400 font-bengali">
            <i class="fa-solid fa-hand-holding-dollar text-4xl mb-3 text-slate-600 block"></i>
            কোন বাকির হিসাব পাওয়া যায়নি। নতুন বাকি যোগ করতে উপরের বাটনে ক্লিক করুন।
          </td>
        </tr>
      `;
    }

    return filtered.map(d => {
      const isPaid = Number(d.dueAmount || 0) <= 0;
      return `
        <tr class="hover:bg-slate-800/40 transition-colors">
          <td class="py-3 px-4">
            <div class="font-bold text-white text-sm font-bengali">${d.customerName}</div>
            <div class="text-[11px] text-slate-400 font-sans flex flex-wrap items-center gap-1.5 mt-0.5">
              <span title="সাধারণ মোবাইল নম্বর"><i class="fa-solid fa-mobile-screen text-[10px] text-emerald-400 mr-0.5"></i>${d.phone}</span>
              ${d.brilliantNumber ? `
                <span title="ব্রিলিয়ান্ট নম্বর" class="px-1.5 py-0.5 rounded bg-cyan-950/90 border border-cyan-500/40 text-[10px] text-cyan-300 font-mono inline-flex items-center gap-1">
                  <i class="fa-solid fa-tower-broadcast text-[8px] text-cyan-400"></i>${d.brilliantNumber}
                </span>
              ` : ''}
              ${d.address ? `<span class="text-slate-500">•</span><span class="truncate max-w-[130px]">${d.address}</span>` : ''}
            </div>
          </td>
          <td class="py-3 px-3">
            <p class="text-xs text-slate-200 font-bengali max-w-[180px] truncate" title="${d.itemsDesc}">${d.itemsDesc}</p>
            ${d.notes ? `<p class="text-[10px] text-slate-400 italic truncate max-w-[180px]">${d.notes}</p>` : ''}
          </td>
          <td class="py-3 px-3 text-right font-medium text-slate-300 font-mono">
            ${window.AppUtils.formatMoney(d.totalAmount)}
          </td>
          <td class="py-3 px-3 text-right font-medium text-emerald-400 font-mono">
            ${window.AppUtils.formatMoney(d.paidAmount)}
          </td>
          <td class="py-3 px-3 text-right font-bold font-mono text-sm ${isPaid ? 'text-slate-500' : 'text-amber-400'}">
            ${window.AppUtils.formatMoney(d.dueAmount)}
          </td>
          <td class="py-3 px-3 text-center">
            <p class="text-xs text-slate-300 font-mono">${d.dueDate || d.date}</p>
            <p class="text-[10px] text-slate-500 font-bengali">এন্ট্রি: ${d.date}</p>
          </td>
          <td class="py-3 px-3 text-center">
            <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${isPaid ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : Number(d.paidAmount) > 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}">
              ${isPaid ? 'পরিশোধিত' : Number(d.paidAmount) > 0 ? 'আংশিক বাকি' : 'বাকি আছে'}
            </span>
          </td>
          <td class="py-3 px-4 text-center">
            <div class="flex items-center justify-center gap-1.5 flex-wrap">
              ${!isPaid ? `
                <button onclick="window.AppUI.openModal('duePaymentModal', ${JSON.stringify(d).replace(/"/g, '&quot;')})" title="টাকা জমা নিন (Collect Money)" class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all">
                  <i class="fa-solid fa-money-bill-wave"></i>
                  <span>জমা</span>
                </button>
                <button onclick="window.AppUI.openSmsModal('${d.id}')" title="এসএমএস পাঠান (Send SMS Due Reminder)" class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold transition-all">
                  <i class="fa-solid fa-comment-sms text-indigo-400"></i>
                  <span>SMS পাঠান</span>
                </button>
                <!-- Dedicated Brilliant SMS Button -->
                <button onclick="window.AppUI.openBrilliantSmsModal('${d.id}')" title="ব্রিলিয়ান্ট নম্বরে সরাসরি এসএমএস পাঠান (09638 Brilliant SMS)" class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 hover:text-white border border-cyan-500/40 text-xs font-semibold transition-all">
                  <i class="fa-solid fa-tower-broadcast text-cyan-400"></i>
                  <span>ব্রিলিয়ান্ট SMS</span>
                </button>
                <button onclick="window.AppUI.sendWhatsAppReminder('${d.id}')" title="হোয়াটসঅ্যাপে তাগাদা পাঠান (WhatsApp)" class="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs transition-all">
                  <i class="fa-brands fa-whatsapp text-sm"></i>
                </button>
              ` : `
                <button onclick="window.AppUI.openSmsModal('${d.id}', true)" title="টাকা পরিশোধ হয়েছে জানিয়ে এসএমএস পাঠান" class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-semibold transition-all shadow-sm">
                  <i class="fa-solid fa-circle-check text-emerald-400"></i>
                  <span>টাকা পরিশোধ SMS</span>
                </button>
              `}
              <button onclick="window.AppUI.openModal('dueForm', ${JSON.stringify(d).replace(/"/g, '&quot;')})" title="Edit / সংশোধন" class="p-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 text-xs transition-all">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button onclick="window.AppUI.deleteDue('${d.id}')" title="Delete / ডিলিট" class="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-xs transition-all">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  getFilteredDues() {
    const dues = window.appState.dues || [];
    const query = (window.appState.dueSearchQuery || '').toLowerCase().trim();
    const filter = window.appState.dueFilter || 'all';

    return dues.filter(d => {
      const matchSearch = !query ||
        (d.customerName && d.customerName.toLowerCase().includes(query)) ||
        (d.phone && d.phone.toLowerCase().includes(query)) ||
        (d.brilliantNumber && d.brilliantNumber.toLowerCase().includes(query)) ||
        (d.address && d.address.toLowerCase().includes(query)) ||
        (d.itemsDesc && d.itemsDesc.toLowerCase().includes(query));

      const isPaid = Number(d.dueAmount || 0) <= 0 || d.status === 'paid';
      const matchStatus = filter === 'all' || 
        (filter === 'paid' && isPaid) ||
        (filter === 'unpaid' && !isPaid);

      return matchSearch && matchStatus;
    });
  },

  handleDueSearch(val) {
    window.appState.dueSearchQuery = val;
    const filtered = this.getFilteredDues();

    const tbody = document.getElementById('due-table-body');
    if (tbody) {
      tbody.innerHTML = this.renderDueRows(filtered);
    } else {
      this.render();
      return;
    }

    const badge = document.getElementById('due-count-badge');
    if (badge) {
      badge.innerText = `${filtered.length} জন গ্রাহক`;
    }

    const clearBtn = document.getElementById('due-search-clear-btn');
    if (clearBtn) {
      if (val && val.trim().length > 0) {
        clearBtn.classList.remove('hidden');
      } else {
        clearBtn.classList.add('hidden');
      }
    }
  },

  clearDueSearch() {
    window.appState.dueSearchQuery = '';
    const input = document.getElementById('due-search-input');
    if (input) {
      input.value = '';
      input.focus();
    }
    this.handleDueSearch('');
  },

  filterDueByStatus(status) {
    window.appState.dueFilter = status;
    this.render();
  },

  // ==========================================
  // আলাদা ছোট বাকির খাতা ও ক্যালকুলেটর (Mini Baki Khata & Calculator)
  // ==========================================

  getFilteredMiniKhata() {
    const list = window.appState.miniKhata || [];
    const query = (window.appState.miniKhataSearchQuery || '').toLowerCase().trim();
    const filter = window.appState.miniKhataFilter || 'all';

    return list.filter(item => {
      const matchSearch = !query ||
        (item.customerName && item.customerName.toLowerCase().includes(query)) ||
        (item.phone && item.phone.toLowerCase().includes(query)) ||
        (item.brilliantNumber && item.brilliantNumber.toLowerCase().includes(query)) ||
        (item.note && item.note.toLowerCase().includes(query));

      const isPaid = item.status === 'paid' || Number(item.dueAmount != null ? item.dueAmount : (item.amount - (item.paidAmount || 0))) <= 0;
      const matchStatus = filter === 'all' || 
        (filter === 'paid' && isPaid) ||
        (filter === 'unpaid' && !isPaid);

      return matchSearch && matchStatus;
    });
  },

  renderMiniKhataSection() {
    const miniList = window.appState.miniKhata || [];
    const query = window.appState.miniKhataSearchQuery || '';
    const filter = window.appState.miniKhataFilter || 'all';
    const filtered = this.getFilteredMiniKhata();
    const editingItem = window.appState.editingItem && window.appState.editingItem.isEditingMini ? window.appState.editingItem : null;

    const totalDue = miniList.reduce((sum, m) => sum + (m.status !== 'paid' ? Number(m.dueAmount != null ? m.dueAmount : (m.amount - (m.paidAmount || 0))) : 0), 0);
    const totalPaid = miniList.reduce((sum, m) => sum + Number(m.paidAmount || (m.status === 'paid' ? m.amount : 0)), 0);
    const unpaidCount = miniList.filter(m => m.status !== 'paid' && Number(m.dueAmount != null ? m.dueAmount : (m.amount - (m.paidAmount || 0))) > 0).length;
    const paidCount = miniList.length - unpaidCount;

    return `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2.5 flex-wrap">
              <h2 class="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <span class="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-lg border border-teal-500/30">
                  <i class="fa-solid fa-book-open-reader"></i>
                </span>
                <span>আলাদা ছোট বাকির খাতা</span>
              </h2>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono font-semibold">
                🧮 ক্যালকুলেটর যুক্ত খাতা
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-1 font-bengali">
              খুচরা ক্রেতাদের তাৎক্ষণিক দৈনিক বাকি হিসাব। ক্যালকুলেটরে দ্রুত হিসাব বের করে এক ক্লিকে খাতায় বসান!
            </p>
          </div>

          <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button onclick="window.AppUI.printTodayMiniKhata()" title="আজকের ছোট খাতা প্রিন্ট করুন" class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all">
              <i class="fa-solid fa-print text-teal-400"></i>
              <span class="hidden md:inline">প্রিন্ট খাতা</span>
            </button>
            <button onclick="window.AppUtils.exportToExcel()" title="এক্সেলে এক্সপোর্ট করুন" class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all">
              <i class="fa-solid fa-file-excel text-emerald-400"></i>
              <span class="hidden md:inline">Excel</span>
            </button>
            <button onclick="window.AppUI.setTab('dues')" title="প্রধান বাকির তালিকায় ফিরে যান" class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all">
              <i class="fa-solid fa-arrow-left text-amber-400"></i>
              <span>মূল বাকির তালিকা</span>
            </button>
          </div>
        </div>

        <!-- KPI Mini Ribbon -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div class="glass-card p-3.5 sm:p-4 rounded-2xl border-l-4 border-l-teal-500">
            <p class="text-xs text-slate-400 font-medium font-bengali">চলতি ছোট বাকি (Due)</p>
            <p class="text-xl sm:text-2xl font-black text-teal-400 mt-1 font-mono">${window.AppUtils.formatMoney(totalDue)}</p>
            <p class="text-[11px] text-teal-300/80 mt-0.5">অনাদায়ি খুচরা বাকি</p>
          </div>

          <div class="glass-card p-3.5 sm:p-4 rounded-2xl border-l-4 border-l-emerald-500">
            <p class="text-xs text-slate-400 font-medium font-bengali">মোট আদায় (Paid)</p>
            <p class="text-xl sm:text-2xl font-black text-emerald-400 mt-1 font-mono">${window.AppUtils.formatMoney(totalPaid)}</p>
            <p class="text-[11px] text-emerald-300/80 mt-0.5">পরিশোধ হয়েছে</p>
          </div>

          <div class="glass-card p-3.5 sm:p-4 rounded-2xl border-l-4 border-l-amber-500">
            <p class="text-xs text-slate-400 font-medium font-bengali">বাকি থাকা কাস্টমার</p>
            <p class="text-xl sm:text-2xl font-black text-amber-400 mt-1 font-mono">${unpaidCount} <span class="text-xs font-normal text-slate-400 font-bengali">জন</span></p>
            <p class="text-[11px] text-slate-400 mt-0.5">টাকা পাওনা রয়েছে</p>
          </div>

          <div class="glass-card p-3.5 sm:p-4 rounded-2xl border-l-4 border-l-cyan-500">
            <p class="text-xs text-slate-400 font-medium font-bengali">মোট এন্ট্রি সংখ্যা</p>
            <p class="text-xl sm:text-2xl font-black text-cyan-400 mt-1 font-mono">${miniList.length} <span class="text-xs font-normal text-slate-400 font-bengali">টি</span></p>
            <p class="text-[11px] text-slate-400 mt-0.5">পরিশোধিত: ${paidCount} টি</p>
          </div>
        </div>

        <!-- 2 Column Workspace: Left (Calculator + Quick Form) & Right (Ledger Table) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- LEFT COLUMN: Pocket Calculator & Quick Entry Form -->
          <div class="lg:col-span-5 xl:col-span-4 space-y-6">
            
            <!-- 🧮 Interactive Pocket Calculator Card -->
            <div class="glass-card p-4 sm:p-5 rounded-3xl border border-teal-500/40 shadow-2xl relative">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <span class="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs">
                    <i class="fa-solid fa-calculator"></i>
                  </span>
                  <h3 class="font-bold text-white text-sm font-bengali">ছোট ক্যালকুলেটর</h3>
                  <span class="text-[10px] text-teal-400/80 font-mono">Pocket Calc</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="text-[10px] text-slate-400 font-mono hidden sm:inline">Numpad সাপোর্টেড</span>
                  <button type="button" onclick="window.AppUI.pressCalcKey('C')" title="মুছুন (Clear)" class="px-2 py-0.5 rounded text-[11px] bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-mono">
                    C
                  </button>
                </div>
              </div>

              <!-- Calculator Screen -->
              <div class="bg-slate-950 p-3 rounded-2xl border border-teal-500/30 mb-3 shadow-inner">
                <div id="calc-formula-val" class="text-right text-xs text-slate-400 font-mono h-4 truncate tracking-wider">
                  ${window.appState.miniCalc?.formula || ''}
                </div>
                <div id="calc-display-val" class="text-right text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight overflow-x-auto select-all">
                  ${window.appState.miniCalc?.display || '0'}
                </div>
              </div>

              <!-- Action Bar to Pipe into Khata -->
              <div class="grid grid-cols-2 gap-2 mb-3">
                <button type="button" onclick="window.AppUI.calcUseInKhata()" class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs shadow-md shadow-teal-600/30 transition-all font-bengali">
                  <i class="fa-solid fa-arrow-down text-[11px]"></i>
                  <span>খাতায় বসান (Use)</span>
                </button>
                <button type="button" onclick="window.AppUI.calcAddToKhata()" class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 font-bold text-xs transition-all font-bengali">
                  <i class="fa-solid fa-plus text-[11px]"></i>
                  <span>যোগ করুন (+Add)</span>
                </button>
              </div>

              <!-- Calculator Keypad Grid -->
              <div class="grid grid-cols-4 gap-1.5 text-sm font-mono font-bold select-none">
                <!-- Row 1 -->
                <button type="button" onclick="window.AppUI.pressCalcKey('C')" class="p-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 border border-rose-500/30 active:scale-95 transition-all">C</button>
                <button type="button" onclick="window.AppUI.pressCalcKey('backspace')" class="p-2.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-500/30 active:scale-95 transition-all"><i class="fa-solid fa-delete-left"></i></button>
                <button type="button" onclick="window.AppUI.pressCalcKey('%')" class="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 transition-all">%</button>
                <button type="button" onclick="window.AppUI.pressCalcKey('÷')" class="p-2.5 rounded-xl bg-teal-950/70 hover:bg-teal-900/80 text-teal-300 border border-teal-500/30 active:scale-95 transition-all">÷</button>

                <!-- Row 2 -->
                <button type="button" onclick="window.AppUI.pressCalcKey('7')" class="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 active:scale-95 transition-all">7</button>
                <button type="button" onclick="window.AppUI.pressCalcKey('8')" class="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 active:scale-95 transition-all">8</button>
                <button type="button" onclick="window.AppUI.pressCalcKey('9')" class="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 active:scale-95 transition-all">9</button>
                <button type="button" onclick="window.AppUI.pressCalcKey('×')" class="p-2.5 rounded-xl bg-teal-950/70 hover:bg-teal-900/80 text-teal-300 border border-teal-500/30 active:scale-95 transition-all">×</button>

                <!-- Row 3 -->
                <button type="button" onclick="window.AppUI.pressCalcKey('4')" class="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 active:scale-95 transition-all">4</button>
                <button type="button" onclick="window.AppUI.pressCalcKey('5')" class="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 active:scale-95 transition-all">5</button>
                <button type="button" onclick="window.AppUI.pressCalcKey('6')" class="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 active:scale-95 transition-all">6</button>
                <button type="button" onclick="window.AppUI.pressCalcKey('-')" class="p-2.5 rounded-xl bg-teal-950/70 hover:bg-teal-900/80 text-teal-300 border border-teal-500/30 active:scale-95 transition-all">-</button>

                <!-- Row 4 -->
                <button type="button" onclick="window.AppUI.pressCalcKey('1')" class="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 active:scale-95 transition-all">1</button>
                <button type="button" onclick="window.AppUI.pressCalcKey('2')" class="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 active:scale-95 transition-all">2</button>
                <button type="button" onclick="window.AppUI.pressCalcKey('3')" class="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 active:scale-95 transition-all">3</button>
                <button type="button" onclick="window.AppUI.pressCalcKey('+')" class="p-2.5 rounded-xl bg-teal-950/70 hover:bg-teal-900/80 text-teal-300 border border-teal-500/30 active:scale-95 transition-all">+</button>

                <!-- Row 5 -->
                <button type="button" onclick="window.AppUI.pressCalcKey('0')" class="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 active:scale-95 transition-all">0</button>
                <button type="button" onclick="window.AppUI.pressCalcKey('00')" class="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 active:scale-95 transition-all">00</button>
                <button type="button" onclick="window.AppUI.pressCalcKey('.')" class="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 active:scale-95 transition-all">.</button>
                <button type="button" onclick="window.AppUI.pressCalcKey('=')" class="p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-lg active:scale-95 transition-all shadow-md shadow-emerald-500/25">=</button>
              </div>

              <!-- Recent Calculations Tape / Memory -->
              ${(window.appState.miniCalc?.history && window.appState.miniCalc.history.length > 0) ? `
                <div class="mt-3 pt-2.5 border-t border-slate-800 text-[11px]">
                  <p class="text-slate-400 font-bengali mb-1.5 flex items-center justify-between">
                    <span>হিসাব হিস্ট্রি (ক্লিক করে বসান):</span>
                    <button type="button" onclick="window.appState.miniCalc.history=[]; window.AppUI.render();" class="text-rose-400 hover:underline">ক্লিয়ার</button>
                  </p>
                  <div class="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto scrollbar-thin">
                    ${window.appState.miniCalc.history.slice(0, 4).map(h => `
                      <button type="button" onclick="window.AppUI.calcRecallHistory('${h.replace(/'/g, "\\'")}')" class="px-2 py-0.5 rounded bg-slate-900/90 hover:bg-slate-800 text-slate-300 font-mono border border-slate-800 text-[10px]">
                        ${h}
                      </button>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>

            <!-- 📝 Quick Baki Entry Form Card -->
            <div class="glass-card p-4 sm:p-5 rounded-3xl border border-slate-800 shadow-xl">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-bold text-white text-base font-bengali flex items-center gap-2">
                  <i class="fa-solid fa-pen-to-square text-teal-400"></i>
                  <span>${editingItem ? 'বাকি এন্ট্রি পরিবর্তন করুন' : 'ঝটপট বাকি তুলুন (Quick Entry)'}</span>
                </h3>
                ${editingItem ? `
                  <button type="button" onclick="window.AppUI.cancelEditMiniKhata()" class="text-xs text-rose-400 hover:underline font-bengali">
                    বাতিল করুন
                  </button>
                ` : ''}
              </div>

              <form onsubmit="window.AppUI.handleSaveMiniKhata(event)" class="space-y-3 text-xs">
                ${editingItem ? `<input type="hidden" name="id" value="${editingItem.id}">` : ''}

                <!-- Customer Name -->
                <div>
                  <label class="block text-slate-300 font-medium mb-1 font-bengali">
                    গ্রাহক / ব্যক্তির নাম *
                  </label>
                  <input 
                    id="mini-name-input"
                    required 
                    type="text" 
                    name="customerName" 
                    placeholder="যেমন: আলম ভাই, সুমন, রফিক ড্রাইভার"
                    value="${editingItem ? editingItem.customerName : ''}"
                    class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 font-bengali"
                  />
                </div>

                <!-- Dual Phone Numbers: Regular & Brilliant -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label class="block text-slate-300 font-medium mb-1 font-bengali flex items-center gap-1">
                      <i class="fa-solid fa-mobile-screen text-emerald-400 text-[10px]"></i>
                      <span>সাধারণ মোবাইল</span>
                    </label>
                    <input 
                      type="tel" 
                      name="phone" 
                      placeholder="017xxxxxxxx"
                      value="${editingItem ? (editingItem.phone || '') : ''}"
                      class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label class="block text-slate-300 font-medium mb-1 font-bengali flex items-center gap-1">
                      <i class="fa-solid fa-tower-broadcast text-cyan-400 text-[10px]"></i>
                      <span>ব্রিলিয়ান্ট নম্বর</span>
                    </label>
                    <input 
                      type="tel" 
                      name="brilliantNumber" 
                      placeholder="09638-xxxxxx"
                      value="${editingItem ? (editingItem.brilliantNumber || '') : ''}"
                      class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                    />
                  </div>
                </div>

                <!-- Amount ৳ (Linked to calculator) -->
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="text-slate-300 font-medium font-bengali">
                      বাকি টাকার পরিমাণ (৳) *
                    </label>
                    <button type="button" onclick="window.AppUI.calcUseInKhata()" class="text-[10px] text-teal-400 hover:underline font-bengali">
                      <i class="fa-solid fa-calculator mr-0.5"></i>ক্যালকুলেটরের হিসাব বসান
                    </button>
                  </div>
                  <div class="relative">
                    <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                    <input 
                      id="mini-amount-input"
                      required 
                      type="number" 
                      step="any"
                      min="1" 
                      name="amount" 
                      placeholder="0"
                      value="${editingItem ? editingItem.amount : ''}"
                      class="w-full pl-8 pr-3 py-2.5 bg-slate-950 border border-teal-500/80 rounded-xl text-white font-mono font-bold text-base focus:outline-none focus:border-teal-400 transition-all"
                    />
                  </div>
                </div>

                <!-- Items or Note -->
                <div>
                  <label class="block text-slate-300 font-medium mb-1 font-bengali">
                    পণ্য বা সংক্ষিপ্ত বিবরণ (Note)
                  </label>
                  <input 
                    type="text" 
                    name="note" 
                    placeholder="যেমন: ডিম ও রুটি, ২ কাপ চা, ১ কেজি চিনি"
                    value="${editingItem ? (editingItem.note || '') : ''}"
                    class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 font-bengali text-xs"
                  />
                </div>

                <!-- Action Button -->
                <div class="pt-1 flex items-center gap-2">
                  <button type="submit" class="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold shadow-lg shadow-teal-600/30 font-bengali flex items-center justify-center gap-2 transition-all">
                    <i class="fa-solid ${editingItem ? 'fa-pen-nib' : 'fa-bookmark'}"></i>
                    <span>${editingItem ? 'আপডেট সম্পন্ন করুন' : 'ছোট খাতায় সেভ করুন'}</span>
                  </button>
                  ${editingItem ? `
                    <button type="button" onclick="window.AppUI.cancelEditMiniKhata()" class="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium">
                      বাতিল
                    </button>
                  ` : ''}
                </div>
              </form>
            </div>

          </div>

          <!-- RIGHT COLUMN: Mini Khata Ledger Table & Records -->
          <div class="lg:col-span-7 xl:col-span-8 space-y-4">
            
            <!-- Toolbar & Filter -->
            <div class="glass-card p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-700/80 shadow-lg">
              
              <!-- Search box with Voice Search Microphone -->
              <div class="relative flex-1">
                <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-400 text-xs"></i>
                <input 
                  id="mini-search-input"
                  type="text" 
                  placeholder="নাম, মোবাইল বা পণ্য লিখে খুঁজুন (অথবা মাইক্রোফোনে বলুন)..." 
                  value="${query}"
                  oninput="window.AppUI.handleMiniKhataSearch(this.value)"
                  class="w-full pl-9 pr-24 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors font-sans shadow-inner"
                />
                <div class="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <!-- Microphone Voice Search Button -->
                  <button 
                    id="voice-btn-miniKhata"
                    type="button" 
                    onclick="window.AppUI.toggleVoiceSearch('miniKhata')" 
                    title="মাইক্রোফোন চালু করে মুখে বলুন (Voice Search)" 
                    class="p-1.5 px-2 rounded-lg transition-all flex items-center justify-center text-xs ${window.appState.voiceSearch?.isListening && window.appState.voiceSearch?.activeTarget === 'miniKhata' ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/50 ring-2 ring-rose-400' : 'bg-slate-800 hover:bg-slate-700 text-teal-400 hover:text-teal-300 border border-slate-700'}">
                    <i class="fa-solid ${window.appState.voiceSearch?.isListening && window.appState.voiceSearch?.activeTarget === 'miniKhata' ? 'fa-microphone-lines animate-pulse' : 'fa-microphone'}"></i>
                  </button>
                  <button 
                    id="mini-search-clear-btn" 
                    type="button" 
                    onclick="window.AppUI.clearMiniKhataSearch()" 
                    class="${query ? '' : 'hidden'} text-slate-400 hover:text-white px-1.5 py-0.5 rounded text-xs bg-slate-800"
                    title="মুছুন">
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>
              </div>

              <!-- Status Filters -->
              <div class="flex items-center gap-2 flex-wrap">
                <div class="flex items-center p-1 bg-slate-950/80 rounded-xl border border-slate-700 text-xs">
                  <button onclick="window.AppUI.filterMiniKhata('all')" class="px-2.5 py-1 rounded-lg transition-all ${filter === 'all' ? 'bg-teal-500 text-white font-bold' : 'text-slate-400 hover:text-white'}">
                    সকল (${miniList.length})
                  </button>
                  <button onclick="window.AppUI.filterMiniKhata('unpaid')" class="px-2.5 py-1 rounded-lg transition-all ${filter === 'unpaid' ? 'bg-amber-500 text-white font-bold' : 'text-slate-400 hover:text-white'}">
                    বাকি আছে (${unpaidCount})
                  </button>
                  <button onclick="window.AppUI.filterMiniKhata('paid')" class="px-2.5 py-1 rounded-lg transition-all ${filter === 'paid' ? 'bg-emerald-500 text-white font-bold' : 'text-slate-400 hover:text-white'}">
                    পরিশোধিত (${paidCount})
                  </button>
                </div>

                <span id="mini-count-badge" class="text-[11px] text-teal-400 font-semibold bg-teal-950/40 px-2.5 py-1 rounded-xl border border-teal-500/20 whitespace-nowrap">
                  ${filtered.length} টি হিসাব
                </span>
              </div>

            </div>

            <!-- Mini Khata Ledger Table -->
            <div class="glass-card rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
              <div class="overflow-x-auto scrollbar-thin">
                <table class="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr class="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                      <th class="py-3.5 px-4 font-bengali">তারিখ ও সময়</th>
                      <th class="py-3.5 px-3 font-bengali">গ্রাহকের নাম ও যোগাযোগ</th>
                      <th class="py-3.5 px-3 font-bengali">পণ্য / বিবরণ</th>
                      <th class="py-3.5 px-3 text-right font-bengali">টাকার পরিমাণ</th>
                      <th class="py-3.5 px-3 text-center font-bengali">অবস্থা</th>
                      <th class="py-3.5 px-4 text-center font-bengali">অ্যাকশন (Action)</th>
                    </tr>
                  </thead>
                  <tbody id="mini-table-body" class="divide-y divide-slate-800/60">
                    ${this.renderMiniKhataRows(filtered)}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      </div>
    `;
  },

  renderMiniKhataRows(filtered) {
    if (!filtered || filtered.length === 0) {
      return `
        <tr>
          <td colspan="6" class="text-center py-14 text-slate-400 font-bengali">
            <i class="fa-solid fa-book-open-reader text-4xl mb-3 text-slate-600 block"></i>
            ছোট বাকির খাতায় কোনো হিসাব পাওয়া যায়নি।<br>
            <span class="text-xs text-slate-400">নতুন বাকি লিখতে বামপাশের ফর্মে নাম ও টাকার পরিমাণ দিন।</span>
          </td>
        </tr>
      `;
    }

    return filtered.map(item => {
      const isPaid = item.status === 'paid' || Number(item.dueAmount != null ? item.dueAmount : (item.amount - (item.paidAmount || 0))) <= 0;
      const cleanPhone = (item.phone || '').replace(/[^0-9]/g, '');
      const cleanBrilliant = (item.brilliantNumber || '').replace(/[^0-9]/g, '');
      const remaining = isPaid ? 0 : (item.dueAmount != null ? item.dueAmount : (item.amount - (item.paidAmount || 0)));

      return `
        <tr class="hover:bg-slate-800/40 transition-colors ${isPaid ? 'opacity-75' : ''}">
          <!-- Date & Time -->
          <td class="py-3 px-4 whitespace-nowrap">
            <div class="text-xs text-slate-300 font-mono">${item.date || ''}</div>
            <div class="text-[11px] text-slate-400 font-bengali">${item.time || ''}</div>
          </td>

          <!-- Customer Name & Contacts -->
          <td class="py-3 px-3">
            <div class="font-bold text-white text-sm font-bengali flex items-center gap-1.5">
              <span>${item.customerName}</span>
            </div>
            <div class="flex items-center gap-1.5 flex-wrap mt-0.5 text-[11px]">
              ${item.phone ? `
                <a href="tel:${cleanPhone}" title="সাধারণ ফোনে কল দিন" class="text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-0.5 hover:underline">
                  <i class="fa-solid fa-mobile-screen text-[10px]"></i>
                  <span>${item.phone}</span>
                </a>
              ` : ''}
              ${item.brilliantNumber ? `
                <a href="tel:${cleanBrilliant}" title="ব্রিলিয়ান্ট অ্যাপে কল দিন" class="text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-0.5 px-1 rounded bg-cyan-950/60 border border-cyan-500/30 hover:underline">
                  <i class="fa-solid fa-tower-broadcast text-[9px]"></i>
                  <span>${item.brilliantNumber}</span>
                </a>
              ` : ''}
              ${!item.phone && !item.brilliantNumber ? `<span class="text-slate-400 text-[10px] font-bengali">নম্বর নেই</span>` : ''}
            </div>
          </td>

          <!-- Items Note -->
          <td class="py-3 px-3 max-w-[180px]">
            <div class="text-xs text-slate-200 font-bengali truncate" title="${item.note || ''}">
              ${item.note || 'খুচরা বাকি'}
            </div>
          </td>

          <!-- Amount -->
          <td class="py-3 px-3 text-right whitespace-nowrap">
            <div class="font-mono font-bold text-sm ${isPaid ? 'text-slate-400 line-through' : 'text-amber-400'}">
              ৳ ${item.amount}
            </div>
            ${item.paidAmount > 0 && !isPaid ? `
              <div class="text-[10px] text-emerald-400 font-mono">
                জমা: ৳${item.paidAmount} | বাকি: ৳${remaining}
              </div>
            ` : ''}
          </td>

          <!-- Status Badge -->
          <td class="py-3 px-3 text-center whitespace-nowrap">
            ${isPaid ? `
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bengali">
                <i class="fa-solid fa-circle-check text-[9px]"></i> পরিশোধিত
              </span>
            ` : `
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bengali">
                <i class="fa-solid fa-clock text-[9px]"></i> বাকি আছে
              </span>
            `}
          </td>

          <!-- Actions -->
          <td class="py-3 px-4 text-center whitespace-nowrap">
            <div class="flex items-center justify-center gap-1.5">
              
              <!-- Quick Pay Button -->
              ${!isPaid ? `
                <button 
                  onclick="window.AppUI.openMiniPayModal('${item.id}')" 
                  title="টাকা পরিশোধ ও জমা রেকর্ড করুন"
                  class="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-bold transition-all font-bengali flex items-center gap-1">
                  <i class="fa-solid fa-hand-holding-dollar"></i>
                  <span>পরিশোধ</span>
                </button>
              ` : `
                <button 
                  onclick="window.AppUI.openSmsModal('${item.id}', true)" 
                  title="'টাকা পরিশোধ হয়েছে' এসএমএস পাঠান"
                  class="px-2 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold transition-all">
                  <i class="fa-solid fa-circle-check text-emerald-400 mr-0.5"></i>SMS রসিদ
                </button>
              `}

              <!-- SMS Modal Trigger -->
              <button 
                onclick="window.AppUI.openSmsModal('${item.id}', ${isPaid})" 
                title="এসএমএস বা বার্তা পাঠান (SMS / WhatsApp Reminder)"
                class="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs transition-all">
                <i class="fa-solid fa-comment-sms"></i>
              </button>

              <!-- Dedicated Brilliant SMS Trigger -->
              <button 
                onclick="window.AppUI.openBrilliantSmsModal('${item.id}')" 
                title="ব্রিলিয়ান্ট নম্বরে সরাসরি এসএমএস পাঠান (09638 Brilliant Connect)"
                class="p-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30 text-xs transition-all">
                <i class="fa-solid fa-tower-broadcast text-cyan-400"></i>
              </button>

              <!-- Send to Calculator -->
              <button 
                onclick="window.AppUI.calcLoadAmount(${remaining || item.amount}, '${item.customerName.replace(/'/g, "\\'")}')" 
                title="এই টাকার হিসাব ক্যালকুলেটরে নিন"
                class="p-1.5 rounded-lg bg-teal-600/20 hover:bg-teal-600 text-teal-300 hover:text-white border border-teal-500/30 text-xs transition-all">
                <i class="fa-solid fa-calculator"></i>
              </button>

              <!-- Transfer to Main Dues -->
              <button 
                onclick="window.AppUI.transferMiniKhataToMainDues('${item.id}')" 
                title="প্রধান বাকির তালিকায় স্থানান্তর করুন"
                class="p-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 text-xs transition-all">
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
              </button>

              <!-- Print Slip -->
              <button 
                onclick="window.AppUI.printMiniSlip('${item.id}')" 
                title="কাস্টমার স্লিপ প্রিন্ট করুন"
                class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-all">
                <i class="fa-solid fa-print"></i>
              </button>

              <!-- Edit -->
              <button 
                onclick="window.AppUI.editMiniKhata('${item.id}')" 
                title="এডিট করুন"
                class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-all">
                <i class="fa-solid fa-pen"></i>
              </button>

              <!-- Delete -->
              <button 
                onclick="window.AppUI.deleteMiniKhata('${item.id}')" 
                title="মুছে ফেলুন"
                class="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs transition-all">
                <i class="fa-solid fa-trash-can"></i>
              </button>

            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  printTodayMiniKhata() {
    const list = this.getFilteredMiniKhata();
    const user = window.appState.currentUser || {};
    const totalDue = list.reduce((sum, m) => sum + (m.status !== 'paid' ? Number(m.dueAmount != null ? m.dueAmount : (m.amount - (m.paidAmount || 0))) : 0), 0);
    
    const win = window.open('', '_blank');
    if (!win) {
      alert('পপআপ উইন্ডো ব্লক করা আছে, অনুগ্রহ করে ব্রাউজারে অনুমতি দিন।');
      return;
    }

    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>ছোট বাকির খাতা - ${new Date().toLocaleDateString('bn-BD')}</title>
        <style>
          body { font-family: 'Hind Siliguri', sans-serif; padding: 20px; color: #111; }
          h2, h4 { margin: 2px 0; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
          th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
          th { background: #f0f0f0; }
          .text-right { text-align: right; }
          .bold { font-weight: bold; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <h2>${user.businessName || 'দোকানের হিসাব'}</h2>
        <h4>ছোট বাকির খাতা রিপোর্ট (${new Date().toLocaleDateString('bn-BD')})</h4>
        <div style="text-align:center; font-size:12px; margin-bottom:10px;">পরিচালক: ${user.name || ''} ${user.phone ? '| মোবাইল: ' + user.phone : ''} ${user.brilliantNumber ? '| ব্রিলিয়ান্ট: ' + user.brilliantNumber : ''}</div>
        
        <table>
          <thead>
            <tr>
              <th>ক্রমিক</th>
              <th>তারিখ ও সময়</th>
              <th>গ্রাহকের নাম</th>
              <th>মোবাইল / ব্রিলিয়ান্ট</th>
              <th>পণ্য / নোট</th>
              <th class="text-right">টাকা (৳)</th>
              <th>অবস্থা</th>
            </tr>
          </thead>
          <tbody>
            ${list.map((m, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${m.date} (${m.time || ''})</td>
                <td class="bold">${m.customerName}</td>
                <td>${m.phone || ''} ${m.brilliantNumber ? ' | ' + m.brilliantNumber : ''}</td>
                <td>${m.note || ''}</td>
                <td class="text-right bold">৳ ${m.amount}</td>
                <td>${m.status === 'paid' ? 'পরিশোধিত' : 'বাকি আছে'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="margin-top:15px; font-weight:bold; text-align:right; font-size:15px;">
          মোট বকেয়া বাকি: ৳ ${totalDue}
        </div>

        <div style="margin-top:20px; text-align:center;">
          <button onclick="window.print()" style="padding:8px 16px; font-weight:bold; cursor:pointer;">🖨️ প্রিন্ট করুন</button>
        </div>
      </body>
      </html>
    `);
    win.document.close();
  },

  pressCalcKey(key) {
    if (!window.appState.miniCalc) {
      window.appState.miniCalc = { display: '0', formula: '', history: [] };
    }
    const calc = window.appState.miniCalc;

    if (key === 'C') {
      calc.display = '0';
      calc.formula = '';
    } else if (key === 'backspace') {
      if (calc.display.length > 1) {
        calc.display = calc.display.slice(0, -1);
      } else {
        calc.display = '0';
      }
    } else if (key === '=') {
      try {
        let full = (calc.formula ? calc.formula + ' ' : '') + calc.display;
        let sanitized = full
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/[^0-9+\-*/.%() ]/g, '')
          .trim();
        sanitized = sanitized.replace(/[+\-*/.]+$/, '');
        if (!sanitized) sanitized = '0';
        const res = Function('"use strict"; return (' + sanitized + ')')();
        const finalNum = Number.isFinite(res) ? Math.round(res * 100) / 100 : 0;
        if (calc.formula) {
          const hist = `${calc.formula} ${calc.display} = ${finalNum}`;
          if (!calc.history) calc.history = [];
          calc.history.unshift(hist);
          if (calc.history.length > 6) calc.history.pop();
        }
        calc.display = String(finalNum);
        calc.formula = '';
      } catch (err) {
        calc.display = 'Error';
      }
    } else if (['+', '-', '×', '÷', '%'].includes(key)) {
      if (key === '%') {
        const num = parseFloat(calc.display) || 0;
        calc.display = String(num / 100);
      } else {
        calc.formula = (calc.formula ? calc.formula + ' ' : '') + calc.display + ' ' + key;
        calc.display = '0';
      }
    } else if (key === '.') {
      if (!calc.display.includes('.')) {
        calc.display += '.';
      }
    } else if (key === '00') {
      if (calc.display !== '0') {
        calc.display += '00';
      }
    } else {
      // Digit 0-9
      if (calc.display === '0' || calc.display === 'Error') {
        calc.display = String(key);
      } else {
        calc.display += String(key);
      }
    }

    this.updateCalcDisplay();
  },

  updateCalcDisplay() {
    const screenDisp = document.getElementById('calc-display-val');
    const screenFormula = document.getElementById('calc-formula-val');
    if (screenDisp && window.appState.miniCalc) {
      screenDisp.innerText = window.appState.miniCalc.display || '0';
    }
    if (screenFormula && window.appState.miniCalc) {
      screenFormula.innerText = window.appState.miniCalc.formula || '';
    }
  },

  calcUseInKhata() {
    const val = parseFloat(window.appState.miniCalc?.display || '0');
    if (val <= 0 || isNaN(val)) {
      window.AppUtils.showToast('ক্যালকুলেটরে সঠিক টাকার পরিমাণ হিসাব করুন');
      return;
    }
    const input = document.getElementById('mini-amount-input');
    if (input) {
      input.value = val;
      input.classList.add('ring-2', 'ring-teal-400');
      setTimeout(() => input.classList.remove('ring-2', 'ring-teal-400'), 1000);
      window.AppUtils.showToast(`৳ ${val} বাকির ফর্মে বসানো হয়েছে!`);
      const nameInput = document.getElementById('mini-name-input');
      if (nameInput && !nameInput.value) {
        nameInput.focus();
      }
    }
  },

  calcAddToKhata() {
    const val = parseFloat(window.appState.miniCalc?.display || '0');
    if (val <= 0 || isNaN(val)) return;
    const input = document.getElementById('mini-amount-input');
    if (input) {
      const cur = parseFloat(input.value) || 0;
      input.value = cur + val;
      window.AppUtils.showToast(`৳ ${val} যোগ হয়েছে (মোট ৳ ${input.value})`);
    }
  },

  calcLoadAmount(amount, label) {
    if (!window.appState.miniCalc) {
      window.appState.miniCalc = { display: '0', formula: '', history: [] };
    }
    window.appState.miniCalc.display = String(amount);
    window.appState.miniCalc.formula = '';
    this.updateCalcDisplay();
    window.AppUtils.showToast(`${label || 'টাকার পরিমাণ'} ক্যালকুলেটরে নেওয়া হয়েছে`);
    const screen = document.getElementById('calc-display-val');
    if (screen) screen.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  calcRecallHistory(entry) {
    const parts = entry.split('=');
    if (parts.length > 1) {
      const res = parts[1].trim();
      if (!window.appState.miniCalc) {
        window.appState.miniCalc = { display: '0', formula: '', history: [] };
      }
      window.appState.miniCalc.display = res;
      this.updateCalcDisplay();
    }
  },

  handleSaveMiniKhata(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const id = fd.get('id') || 'mkhata_' + Date.now();
    const customerName = (fd.get('customerName') || '').trim();
    const phone = (fd.get('phone') || '').trim();
    const brilliantNumber = (fd.get('brilliantNumber') || '').trim();
    const amount = parseFloat(fd.get('amount')) || 0;
    const note = (fd.get('note') || '').trim();

    if (!customerName || amount <= 0) {
      alert('দয়া করে গ্রাহকের নাম ও সঠিক টাকার পরিমাণ দিন।');
      return;
    }

    const existingIndex = (window.appState.miniKhata || []).findIndex(m => m.id === id);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];

    const record = {
      id,
      customerName,
      phone,
      brilliantNumber,
      amount,
      paidAmount: existingIndex >= 0 ? (window.appState.miniKhata[existingIndex].paidAmount || 0) : 0,
      dueAmount: existingIndex >= 0 
        ? Math.max(0, amount - (window.appState.miniKhata[existingIndex].paidAmount || 0))
        : amount,
      status: existingIndex >= 0 
        ? ((amount - (window.appState.miniKhata[existingIndex].paidAmount || 0)) <= 0 ? 'paid' : 'unpaid')
        : 'unpaid',
      note: note || 'খুচরা বাকি',
      date: existingIndex >= 0 ? window.appState.miniKhata[existingIndex].date : dateStr,
      time: existingIndex >= 0 ? window.appState.miniKhata[existingIndex].time : timeStr
    };

    if (existingIndex >= 0) {
      window.appState.miniKhata[existingIndex] = record;
      window.AppUtils.showToast(`'${customerName}' এর হিসাব আপডেট হয়েছে`);
    } else {
      if (!Array.isArray(window.appState.miniKhata)) window.appState.miniKhata = [];
      window.appState.miniKhata.unshift(record);
      window.AppUtils.showToast(`'${customerName}' এর বাকি (৳ ${amount}) ছোট খাতায় যুক্ত হয়েছে!`);
    }

    window.appState.editingItem = null;
    window.AppUtils.saveData();
    this.render();
  },

  editMiniKhata(id) {
    const item = (window.appState.miniKhata || []).find(m => m.id === id);
    if (!item) return;
    window.appState.editingItem = { ...item, isEditingMini: true };
    this.render();
    const nameInput = document.getElementById('mini-name-input');
    if (nameInput) {
      nameInput.focus();
      nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  },

  cancelEditMiniKhata() {
    window.appState.editingItem = null;
    this.render();
  },

  deleteMiniKhata(id) {
    const item = (window.appState.miniKhata || []).find(m => m.id === id);
    const name = item ? item.customerName : 'হিসাবটি';
    if (!confirm(`আপনি কি '${name}' এর ছোট বাকির হিসাব মুছে ফেলতে চান?`)) return;
    window.appState.miniKhata = (window.appState.miniKhata || []).filter(m => m.id !== id);
    window.AppUtils.saveData();
    this.render();
    window.AppUtils.showToast('ছোট বাকির হিসাব মুছে ফেলা হয়েছে');
  },

  openMiniPayModal(id) {
    const item = (window.appState.miniKhata || []).find(m => m.id === id);
    if (!item) return;
    const remaining = item.status === 'paid' ? 0 : (item.dueAmount != null ? item.dueAmount : (item.amount - (item.paidAmount || 0)));
    this.openModal('miniPayModal', { ...item, remaining });
  },

  handleConfirmMiniPay(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const id = fd.get('id');
    const payAmount = parseFloat(fd.get('payAmount')) || 0;
    const sendSms = fd.get('sendSms') === 'on';

    const item = (window.appState.miniKhata || []).find(m => m.id === id);
    if (!item) return;

    item.paidAmount = (Number(item.paidAmount) || 0) + payAmount;
    item.dueAmount = Math.max(0, item.amount - item.paidAmount);
    item.status = item.dueAmount <= 0 ? 'paid' : 'unpaid';

    window.AppUtils.saveData();
    window.AppUtils.showToast(`৳ ${payAmount} পরিশোধ সম্পন্ন হয়েছে!`);

    if (sendSms) {
      this.openSmsModal(id, item.status === 'paid');
    } else {
      this.closeModal();
      this.render();
    }
  },

  transferMiniKhataToMainDues(id) {
    const item = (window.appState.miniKhata || []).find(m => m.id === id);
    if (!item) return;
    if (!confirm(`'${item.customerName}' এর ৳ ${item.amount} বাকিকে প্রধান বাকির তালিকায় স্থানান্তর করতে চান?`)) return;

    const remaining = item.status === 'paid' ? 0 : (item.dueAmount != null ? item.dueAmount : (item.amount - (item.paidAmount || 0)));
    const mainDue = {
      id: 'due_' + Date.now(),
      customerName: item.customerName,
      phone: item.phone || '',
      brilliantNumber: item.brilliantNumber || '',
      address: 'ছোট খাতা থেকে স্থানান্তরিত',
      itemsDesc: item.note || 'দৈনিক খুচরা বাকি',
      totalAmount: item.amount,
      paidAmount: item.paidAmount || 0,
      dueAmount: remaining,
      date: item.date || new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: remaining <= 0 ? 'paid' : (item.paidAmount > 0 ? 'partial' : 'unpaid'),
      notes: `ছোট বাকির খাতা থেকে আনা হয়েছে (${item.date || ''})`
    };

    if (!Array.isArray(window.appState.dues)) window.appState.dues = [];
    window.appState.dues.unshift(mainDue);

    window.appState.miniKhata = window.appState.miniKhata.filter(m => m.id !== id);
    window.AppUtils.saveData();
    window.AppUtils.showToast(`সফলভাবে প্রধান বাকির তালিকায় স্থানান্তর করা হয়েছে!`);
    this.render();
  },

  printMiniSlip(id) {
    const item = (window.appState.miniKhata || []).find(m => m.id === id);
    if (!item) return;
    const user = window.appState.currentUser || {};
    const remaining = item.status === 'paid' ? 0 : (item.dueAmount != null ? item.dueAmount : (item.amount - (item.paidAmount || 0)));

    const slipWindow = window.open('', '_blank', 'width=380,height=550');
    if (!slipWindow) {
      alert('পপআপ উইন্ডো ব্লক করা আছে, অনুগ্রহ করে ব্রাউজারে অনুমতি দিন।');
      return;
    }

    slipWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>বাকির স্লিপ - ${item.customerName}</title>
        <style>
          body { font-family: 'Hind Siliguri', sans-serif, monospace; padding: 15px; max-width: 340px; margin: 0 auto; color: #111; font-size: 13px; line-height: 1.4; }
          .center { text-align: center; }
          .border-b { border-bottom: 1px dashed #666; padding-bottom: 8px; margin-bottom: 8px; }
          .flex { display: flex; justify-content: space-between; margin: 4px 0; }
          .bold { font-weight: bold; }
          .text-lg { font-size: 16px; }
          .status { display: inline-block; padding: 2px 8px; border: 1px solid #111; font-weight: bold; font-size: 12px; margin-top: 5px; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <div class="center border-b">
          <div class="bold text-lg">${user.businessName || 'দোকানের হিসাব'}</div>
          <div>${user.name || ''} ${user.phone ? '| মোবাইল: ' + user.phone : ''}</div>
          ${user.brilliantNumber ? '<div>ব্রিলিয়ান্ট: ' + user.brilliantNumber + '</div>' : ''}
          <div style="font-size:11px; color:#555; margin-top:4px;">ছোট বাকির খাতা রসিদ</div>
        </div>

        <div class="border-b">
          <div class="flex"><span>গ্রাহক:</span> <span class="bold">${item.customerName}</span></div>
          ${item.phone ? `<div class="flex"><span>মোবাইল:</span> <span>${item.phone}</span></div>` : ''}
          ${item.brilliantNumber ? `<div class="flex"><span>ব্রিলিয়ান্ট:</span> <span>${item.brilliantNumber}</span></div>` : ''}
          <div class="flex"><span>তারিখ ও সময়:</span> <span>${item.date} (${item.time || ''})</span></div>
          <div class="flex"><span>বিবরণ/পণ্য:</span> <span class="bold">${item.note || 'খুচরা বাকি'}</span></div>
        </div>

        <div class="border-b">
          <div class="flex"><span>মোট টাকা:</span> <span class="bold">৳ ${item.amount}</span></div>
          <div class="flex"><span>জমা / পরিশোধ:</span> <span>৳ ${item.paidAmount || (item.status === 'paid' ? item.amount : 0)}</span></div>
          <div class="flex text-lg bold" style="margin-top:6px;"><span>অবশিষ্ট বাকি:</span> <span>৳ ${remaining}</span></div>
          <div class="center">
            <span class="status">${item.status === 'paid' ? 'পরিশোধিত (PAID)' : 'বাকি আছে (UNPAID)'}</span>
          </div>
        </div>

        <div class="center" style="font-size:11px; color:#555; margin-top:10px;">
          ধন্যবাদ! সততার সাথে লেনদেনের জন্য কৃতজ্ঞ।<br>
          সফটওয়্যার: Dokaner Hisab PRO
        </div>

        <div class="center" style="margin-top:15px;">
          <button onclick="window.print()" style="padding:6px 14px; font-weight:bold; cursor:pointer;">🖨️ প্রিন্ট করুন</button>
        </div>
      </body>
      </html>
    `);
    slipWindow.document.close();
  },

  handleMiniKhataSearch(val) {
    window.appState.miniKhataSearchQuery = val;
    const filtered = this.getFilteredMiniKhata();
    const tbody = document.getElementById('mini-table-body');
    if (tbody) {
      tbody.innerHTML = this.renderMiniKhataRows(filtered);
    } else {
      this.render();
      return;
    }

    const badge = document.getElementById('mini-count-badge');
    if (badge) {
      badge.innerText = `${filtered.length} টি হিসাব`;
    }

    const clearBtn = document.getElementById('mini-search-clear-btn');
    if (clearBtn) {
      if (val && val.trim().length > 0) {
        clearBtn.classList.remove('hidden');
      } else {
        clearBtn.classList.add('hidden');
      }
    }
  },

  clearMiniKhataSearch() {
    window.appState.miniKhataSearchQuery = '';
    const input = document.getElementById('mini-search-input');
    if (input) {
      input.value = '';
      input.focus();
    }
    this.handleMiniKhataSearch('');
  },

  filterMiniKhata(status) {
    window.appState.miniKhataFilter = status;
    this.render();
  },

  renderAnalyticsSection() {
    const totals = window.AppUtils.getTotals();

    return `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>ব্যবসায়িক অ্যানালিটিক্স ও চার্ট</span>
              <span class="text-sm font-normal text-slate-400 font-sans">(Analytics & Visualization)</span>
            </h2>
            <p class="text-xs text-slate-400 mt-1 font-bengali">ইন্টারেক্টিভ গ্রাফের মাধ্যমে দামের অনুপাত ও খরচের সার্বিক পর্যালোচনা</p>
          </div>

          <button onclick="window.AppCharts.renderCharts()" class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition-all">
            <i class="fa-solid fa-arrows-rotate"></i>
            <span>রিফ্রেশ চার্ট (Refresh)</span>
          </button>
        </div>

        <!-- 2 Main Interactive Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Graph 1: Buy Price vs Wholesale vs Retail Price Comparison -->
          <div class="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="font-bold text-white text-base font-bengali">১. কেনা দাম বনাম পাইকারি ও খুচরা বিক্রয়মূল্য</h3>
                <p class="text-xs text-slate-400 font-sans">Buy Price vs Wholesale vs Retail Price Comparison</p>
              </div>
              <span class="p-2 rounded-lg bg-blue-500/10 text-blue-400 text-xs"><i class="fa-solid fa-chart-column"></i></span>
            </div>
            <div class="relative h-72 w-full flex-1">
              <canvas id="priceComparisonChart"></canvas>
            </div>
          </div>

          <!-- Graph 2: Sales/Profit vs Expense Breakdown -->
          <div class="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="font-bold text-white text-base font-bengali">২. খরচের খাতভিত্তিক বিশ্লেষণ ও বিভাজন</h3>
                <p class="text-xs text-slate-400 font-sans">Expense Distribution Breakdown by Category</p>
              </div>
              <span class="p-2 rounded-lg bg-rose-500/10 text-rose-400 text-xs"><i class="fa-solid fa-chart-pie"></i></span>
            </div>
            <div class="relative h-72 w-full flex-1">
              <canvas id="expenseBreakdownChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Financial Summary KPI Box -->
        <div class="glass-card p-6 rounded-2xl border border-slate-800">
          <h3 class="text-lg font-bold text-white mb-4 font-bengali">সার্বিক আর্থিক সারসংক্ষেপ (Fiscal Health Overview)</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span class="text-xs text-slate-400">মোট ক্রয়মূল্য (Cost)</span>
              <p class="text-xl font-bold text-slate-200 mt-1">${window.AppUtils.formatMoney(totals.totalInventoryCost)}</p>
            </div>
            <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span class="text-xs text-slate-400">সম্ভাব্য পাইকারি মূল্য</span>
              <p class="text-xl font-bold text-blue-400 mt-1">${window.AppUtils.formatMoney(totals.totalWholesalePotential)}</p>
            </div>
            <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span class="text-xs text-slate-400">সম্ভাব্য খুচরা মূল্য</span>
              <p class="text-xl font-bold text-emerald-400 mt-1">${window.AppUtils.formatMoney(totals.totalRetailPotential)}</p>
            </div>
            <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span class="text-xs text-slate-400">ব্যবসায়িক ব্যয় অনুপাত</span>
              <p class="text-xl font-bold text-amber-400 mt-1">${totals.expenseToProfitRatio}%</p>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderTipsSection() {
    const tips = window.AppTips.generateTips();

    return `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>স্মার্ট ব্যয় নিয়ন্ত্রণ ও ব্যবসায়িক পরামর্শ</span>
              <span class="text-sm font-normal text-slate-400 font-sans">(Smart Expense Control & Business Advice)</span>
            </h2>
            <p class="text-xs text-slate-400 mt-1 font-bengali">বর্তমান লাভ ও ব্যয়ের গাণিতিক অনুপাতের ওপর ভিত্তি করে স্বয়ংক্রিয় পরামর্শ</p>
          </div>
        </div>

        <!-- Tips Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${tips.map(t => {
            let colorBorder = 'border-blue-500/40 bg-blue-950/20 text-blue-400';
            if (t.type === 'critical' || t.type === 'danger') {
              colorBorder = 'border-rose-500/40 bg-rose-950/20 text-rose-400';
            } else if (t.type === 'warning') {
              colorBorder = 'border-amber-500/40 bg-amber-950/20 text-amber-400';
            } else if (t.type === 'healthy') {
              colorBorder = 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400';
            }

            return `
              <div class="glass-card p-5 rounded-2xl border ${colorBorder.split(' ')[0]} flex flex-col justify-between hover:border-opacity-80 transition-all">
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${colorBorder}">
                      <i class="fa-solid ${t.icon} mr-1"></i> ${t.badge}
                    </span>
                  </div>
                  <h3 class="text-base font-bold text-white font-bengali mb-1">${t.titleBn}</h3>
                  <p class="text-xs text-slate-400 font-sans mb-3">${t.titleEn}</p>
                  <p class="text-xs text-slate-300 font-bengali leading-relaxed">${t.descBn}</p>
                  <p class="text-[11px] text-slate-400 font-sans mt-1 leading-relaxed">${t.descEn}</p>
                </div>
                <div class="mt-4 pt-3 border-t border-slate-800/80 flex justify-end">
                  <button onclick="window.AppUI.setTab('${t.tabTarget}')" class="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors">
                    <span>${t.action}</span>
                    <i class="fa-solid fa-arrow-right text-[10px]"></i>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  // Stock Adjuster helper
  adjustStock(id, delta) {
    const product = window.appState.products.find(p => p.id === id);
    if (!product) return;
    const newStock = Math.max(0, Number(product.stock || 0) + delta);
    product.stock = newStock;
    window.AppUtils.saveData();
    this.render();
    window.AppUtils.showToast(`Stock updated: ${product.nameBn} (${newStock})`);
  },

  deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product? (আপনি কি নিশ্চিতভাবে এই পণ্যটি ডিলিট করতে চান?)')) return;
    window.appState.products = window.appState.products.filter(p => p.id !== id);
    window.AppUtils.saveData();
    this.render();
    window.AppUtils.showToast('পণ্য সফলভাবে মুছে ফেলা হয়েছে (Product deleted)');
  },

  deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense record? (এই খরচের হিসাব ডিলিট করতে চান?)')) return;
    window.appState.expenses = window.appState.expenses.filter(e => e.id !== id);
    window.AppUtils.saveData();
    this.render();
    window.AppUtils.showToast('খরচের এন্ট্রি মুছে ফেলা হয়েছে');
  },

  renderModal() {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer || !window.appState.activeModal) return;

    let content = '';
    const item = window.appState.editingItem;

    if (window.appState.activeModal === 'productForm') {
      const isEdit = !!item;
      content = `
        <div class="glass-modal max-w-lg w-full mx-4 p-6 rounded-3xl border border-slate-700/80 shadow-2xl relative">
          <button onclick="window.AppUI.closeModal()" class="absolute top-5 right-5 text-slate-400 hover:text-white text-lg">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <h3 class="text-xl font-bold text-white mb-1 font-bengali">
            ${isEdit ? 'পণ্য সংশোধন (Edit Product)' : 'নতুন পণ্য যোগ করুন (Add Product)'}
          </h3>
          <p class="text-xs text-slate-400 mb-5">পণ্যের নাম, ওজন, ক্রয়মূল্য, পাইকারি ও খুচরা বিক্রয়মূল্য নির্ধারণ করুন</p>

          <form onsubmit="window.AppUI.handleSaveProduct(event)" class="space-y-4 text-xs sm:text-sm">
            <input type="hidden" name="id" value="${item ? item.id : ''}">
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-300 font-medium mb-1 font-bengali">পণ্যের নাম (বাংলা) *</label>
                <input required type="text" name="nameBn" value="${item ? item.nameBn : ''}" placeholder="যেমন: চিনি ১ কেজি" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500">
              </div>
              <div>
                <label class="block text-slate-300 font-medium mb-1">Product Name (English)</label>
                <input type="text" name="nameEn" value="${item ? item.nameEn : ''}" placeholder="e.g. Sugar 1kg" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-300 font-medium mb-1">SKU / বারকোড</label>
                <input type="text" name="sku" value="${item ? item.sku : 'PROD-' + Math.floor(1000 + Math.random() * 9000)}" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500">
              </div>
              <div>
                <label class="block text-slate-300 font-medium mb-1 font-bengali">ক্যাটাগরি</label>
                <input type="text" name="category" value="${item ? item.category : 'Grocery / মুদি'}" placeholder="Grocery, Oil, Drinks..." class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500">
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-slate-300 font-medium mb-1 font-bengali">নেট ওজন/পরিমাণ</label>
                <input required type="text" name="netWeight" value="${item ? item.netWeight : '1 kg'}" placeholder="50 kg, 5L, 1pc" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500">
              </div>
              <div>
                <label class="block text-slate-300 font-medium mb-1 font-bengali">মজুদ সংখ্যা (Stock)</label>
                <input required type="number" name="stock" value="${item ? item.stock : 10}" min="0" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500">
              </div>
              <div>
                <label class="block text-slate-300 font-medium mb-1 font-bengali">সতর্কতা সীমা</label>
                <input type="number" name="minStock" value="${item ? item.minStock : 5}" min="1" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500">
              </div>
            </div>

            <div class="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
              <p class="text-xs font-semibold text-emerald-400 font-bengali">মূল্য নির্ধারণ (Pricing & Profit Calculation)</p>
              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-slate-300 text-xs mb-1 font-bengali">কেনা দাম (Cost) ৳ *</label>
                  <input required type="number" step="0.5" name="costPrice" value="${item ? item.costPrice : ''}" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-rose-300 font-mono focus:outline-none focus:border-emerald-500">
                </div>
                <div>
                  <label class="block text-slate-300 text-xs mb-1 font-bengali">পাইকারি দাম ৳ *</label>
                  <input required type="number" step="0.5" name="wholesalePrice" value="${item ? item.wholesalePrice : ''}" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-blue-300 font-mono focus:outline-none focus:border-emerald-500">
                </div>
                <div>
                  <label class="block text-slate-300 text-xs mb-1 font-bengali">খুচরা দাম ৳ *</label>
                  <input required type="number" step="0.5" name="retailPrice" value="${item ? item.retailPrice : ''}" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-emerald-400 font-mono focus:outline-none focus:border-emerald-500">
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-3">
              <button type="button" onclick="window.AppUI.closeModal()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium">Cancel / বাতিল</button>
              <button type="submit" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30">সংরক্ষণ করুন (Save Product)</button>
            </div>
          </form>
        </div>
      `;
    } else if (window.appState.activeModal === 'expenseForm') {
      content = `
        <div class="glass-modal max-w-md w-full mx-4 p-6 rounded-3xl border border-slate-700/80 shadow-2xl relative">
          <button onclick="window.AppUI.closeModal()" class="absolute top-5 right-5 text-slate-400 hover:text-white text-lg">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <h3 class="text-xl font-bold text-white mb-1 font-bengali">নতুন খরচ এন্ট্রি (Record Expense)</h3>
          <p class="text-xs text-slate-400 mb-5">দোকানের নিয়মিত বা অনিয়মিত ব্যয় হিসাব ভুক্ত করুন</p>

          <form onsubmit="window.AppUI.handleSaveExpense(event)" class="space-y-4 text-xs sm:text-sm">
            <div>
              <label class="block text-slate-300 font-medium mb-1 font-bengali">খরচের খাত বা শিরোনাম *</label>
              <input required type="text" name="title" placeholder="যেমন: দোকান বিদ্যুৎ বিল / ভ্যান ভাড়া" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-300 font-medium mb-1 font-bengali">খরচের ক্যাটাগরি</label>
                <select name="category" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-rose-500">
                  <option value="Rent / দোকান ভাড়া">Rent / দোকান ভাড়া</option>
                  <option value="Utilities / বিদ্যুৎ বিল">Utilities / বিদ্যুৎ বিল</option>
                  <option value="Salaries / কর্মচারী বেতন">Salaries / কর্মচারী বেতন</option>
                  <option value="Transport / পরিবহন খরচ">Transport / পরিবহন খরচ</option>
                  <option value="Packaging / প্যাকেজিং">Packaging / প্যাকেজিং</option>
                  <option value="Refreshment / আপ্যায়ন">Refreshment / আপ্যায়ন</option>
                  <option value="Maintenance / মেরামত">Maintenance / মেরামত</option>
                  <option value="Others / অন্যান্য">Others / অন্যান্য</option>
                </select>
              </div>
              <div>
                <label class="block text-slate-300 font-medium mb-1 font-bengali">টাকার পরিমাণ (৳) *</label>
                <input required type="number" step="1" name="amount" placeholder="500" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-rose-400 font-mono font-bold focus:outline-none focus:border-rose-500">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-300 font-medium mb-1 font-bengali">তারিখ</label>
                <input type="date" name="date" value="${new Date().toISOString().split('T')[0]}" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-rose-500">
              </div>
              <div>
                <label class="block text-slate-300 font-medium mb-1 font-bengali">পেমেন্ট মাধ্যম</label>
                <select name="paymentMethod" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-rose-500">
                  <option value="Cash / নগদ">Cash / নগদ</option>
                  <option value="bKash / বিকাশ">bKash / বিকাশ</option>
                  <option value="Nagad / নগদ (MFS)">Nagad / নগদ (MFS)</option>
                  <option value="Bank / ব্যাংক">Bank / ব্যাংক</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-slate-300 font-medium mb-1 font-bengali">মন্তব্য / বিবরণ (ঐচ্ছিক)</label>
              <textarea name="description" rows="2" placeholder="খরচ সম্পর্কে বিস্তারিত..." class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500"></textarea>
            </div>

            <div class="flex items-center justify-end gap-3 pt-3">
              <button type="button" onclick="window.AppUI.closeModal()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium">বাতিল</button>
              <button type="submit" class="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/30">সংরক্ষণ করুন (Save Expense)</button>
            </div>
          </form>
        </div>
      `;
    } else if (window.appState.activeModal === 'sellForm' && item) {
      content = `
        <div class="glass-modal max-w-md w-full mx-4 p-6 rounded-3xl border border-slate-700/80 shadow-2xl relative">
          <button onclick="window.AppUI.closeModal()" class="absolute top-5 right-5 text-slate-400 hover:text-white text-lg">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <h3 class="text-xl font-bold text-white mb-1 font-bengali">পণ্য বিক্রি এন্ট্রি (Sell Product)</h3>
          <p class="text-xs text-emerald-400 font-bold mb-4">${item.nameBn} (${item.netWeight})</p>

          <form onsubmit="window.AppUI.handleQuickSale(event)" class="space-y-4 text-xs sm:text-sm">
            <input type="hidden" name="productId" value="${item.id}">

            <div class="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
              <div class="flex justify-between text-xs text-slate-400">
                <span>বর্তমান মজুদ:</span>
                <span class="font-bold text-white">${item.stock} Units</span>
              </div>
              <div class="flex justify-between text-xs text-slate-400">
                <span>কেনা দাম:</span>
                <span class="font-bold text-rose-300 font-mono">${window.AppUtils.formatMoney(item.costPrice)}</span>
              </div>
              <div class="flex justify-between text-xs text-slate-400">
                <span>খুচরা দাম:</span>
                <span class="font-bold text-emerald-400 font-mono">${window.AppUtils.formatMoney(item.retailPrice)}</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-300 font-medium mb-1 font-bengali">বিক্রির পরিমাণ (Quantity) *</label>
                <input required type="number" min="1" max="${item.stock}" name="qty" value="1" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-emerald-500">
              </div>
              <div>
                <label class="block text-slate-300 font-medium mb-1 font-bengali">বিক্রির ধরন</label>
                <select name="saleType" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500">
                  <option value="retail">খুচরা (Retail - ${window.AppUtils.formatMoney(item.retailPrice)})</option>
                  <option value="wholesale">পাইকারি (Wholesale - ${window.AppUtils.formatMoney(item.wholesalePrice)})</option>
                </select>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-3">
              <button type="button" onclick="window.AppUI.closeModal()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium">বাতিল</button>
              <button type="submit" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30">বিক্রি সম্পন্ন করুন (Confirm Sale)</button>
            </div>
          </form>
        </div>
      `;
    } else if (window.appState.activeModal === 'dueForm') {
      const isEdit = !!item;
      content = `
        <div class="glass-modal max-w-lg w-full mx-4 p-6 rounded-3xl border border-slate-700/80 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-thin">
          <button onclick="window.AppUI.closeModal()" class="absolute top-5 right-5 text-slate-400 hover:text-white text-lg">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <h3 class="text-xl font-bold text-white mb-1 font-bengali">
            ${isEdit ? 'বাকির হিসাব সংশোধন (Edit Due)' : 'নতুন বাকির হিসাব যোগ করুন (New Due Entry)'}
          </h3>
          <p class="text-xs text-slate-400 mb-5 font-bengali">গ্রাহকের নাম, মোবাইল নম্বর এবং বাকি টাকার সঠিক হিসাব রাখুন</p>

          <form onsubmit="window.AppUI.handleSaveDue(event)" class="space-y-4 text-xs sm:text-sm">
            <input type="hidden" name="id" value="${item ? item.id : ''}">

            <div>
              <label class="block text-slate-300 font-medium mb-1 font-bengali">গ্রাহক / কাস্টমারের নাম *</label>
              <input required type="text" name="customerName" value="${item ? item.customerName : ''}" placeholder="গ্রাহকের নাম লিখুন" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 font-bengali">
            </div>

            <!-- Both Ordinary Contact Phone and Brilliant Number -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-300 font-medium mb-1 font-bengali flex items-center justify-between">
                  <span>সাধারণ কন্টাক্ট / মোবাইল নম্বর *</span>
                  <span class="text-[10px] text-emerald-400">০১৭১২...</span>
                </label>
                <div class="relative">
                  <i class="fa-solid fa-mobile-screen absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 text-xs"></i>
                  <input required type="tel" name="phone" value="${item ? item.phone : ''}" placeholder="018XXXXXXXX" class="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 font-sans">
                </div>
              </div>
              <div>
                <label class="block text-slate-300 font-medium mb-1 font-bengali flex items-center justify-between">
                  <span>ব্রিলিয়ান্ট নম্বর (ঐচ্ছিক)</span>
                  <span class="text-[10px] text-cyan-400">০৯৬৩৮...</span>
                </label>
                <div class="relative">
                  <i class="fa-solid fa-tower-broadcast absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 text-xs"></i>
                  <input type="tel" name="brilliantNumber" value="${item ? (item.brilliantNumber || '') : ''}" placeholder="09638-XXXXXX" class="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-cyan-300 font-mono focus:outline-none focus:border-amber-500 font-sans">
                </div>
              </div>
            </div>

            <div>
              <label class="block text-slate-300 font-medium mb-1 font-bengali">গ্রাহকের ঠিকানা / এলাকা</label>
              <input type="text" name="address" value="${item ? (item.address || '') : ''}" placeholder="ঠিকানা বা এলাকা লিখুন" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 font-bengali">
            </div>

            <div>
              <label class="block text-slate-300 font-medium mb-1 font-bengali">নেওয়া পণ্যের বিবরণ বা খাতের নাম *</label>
              <input required type="text" name="itemsDesc" value="${item ? item.itemsDesc : ''}" placeholder="যেমন: চাল ১ বস্তা, সয়াবিন তেল ৫ লিটার" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 font-bengali">
            </div>

            <div class="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
              <p class="text-xs font-semibold text-amber-400 font-bengali">টাকার হিসাব ও জমা (Amount & Payment)</p>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-300 text-xs mb-1 font-bengali">মোট বিলের টাকা (৳) *</label>
                  <input required type="number" step="1" name="totalAmount" value="${item ? item.totalAmount : ''}" placeholder="1000" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-amber-500">
                </div>
                <div>
                  <label class="block text-slate-300 text-xs mb-1 font-bengali">তাৎক্ষণিক জমা / পরিশোধ (৳)</label>
                  <input type="number" step="1" name="paidAmount" value="${item ? item.paidAmount : '0'}" placeholder="0" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-emerald-400 font-mono font-bold focus:outline-none focus:border-amber-500">
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-300 font-medium mb-1 font-bengali">বাকি দেওয়ার তারিখ</label>
                <input type="date" name="date" value="${item ? item.date : new Date().toISOString().split('T')[0]}" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500 font-mono">
              </div>
              <div>
                <label class="block text-slate-300 font-medium mb-1 font-bengali">পরিশোধের প্রতিশ্রুত তারিখ</label>
                <input type="date" name="dueDate" value="${item ? (item.dueDate || '') : new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]}" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500 font-mono">
              </div>
            </div>

            <div>
              <label class="block text-slate-300 font-medium mb-1 font-bengali">মন্তব্য / বিশেষ নোট</label>
              <textarea name="notes" rows="2" placeholder="পরিশোধের শর্ত বা বিশেষ কোনো কথা..." class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 font-bengali">${item ? (item.notes || '') : ''}</textarea>
            </div>

            <div class="flex items-center justify-end gap-3 pt-3">
              <button type="button" onclick="window.AppUI.closeModal()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium">বাতিল</button>
              <button type="submit" class="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-lg shadow-amber-600/30">
                ${isEdit ? 'হালনাগাদ করুন' : 'বাকি সংরক্ষণ করুন (Save Due)'}
              </button>
            </div>
          </form>
        </div>
      `;
    } else if (window.appState.activeModal === 'duePaymentModal' && item) {
      content = `
        <div class="glass-modal max-w-md w-full mx-4 p-6 rounded-3xl border border-slate-700/80 shadow-2xl relative">
          <button onclick="window.AppUI.closeModal()" class="absolute top-5 right-5 text-slate-400 hover:text-white text-lg">
            <i class="fa-solid fa-xmark"></i>
          </button>
          
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg">
              <i class="fa-solid fa-money-bill-transfer"></i>
            </div>
            <div>
              <h3 class="text-xl font-bold text-white font-bengali">বাকি টাকা জমা নিন</h3>
              <p class="text-xs text-slate-400">Record Payment & Due Collection</p>
            </div>
          </div>

          <div class="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 mb-4 space-y-1.5 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-400 font-bengali">গ্রাহকের নাম:</span>
              <span class="font-bold text-white font-bengali">${item.customerName}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400 font-bengali">মোট বিল:</span>
              <span class="font-bold text-slate-300 font-mono">${window.AppUtils.formatMoney(item.totalAmount)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400 font-bengali">ইতিমধ্যে জমা:</span>
              <span class="font-bold text-emerald-400 font-mono">${window.AppUtils.formatMoney(item.paidAmount)}</span>
            </div>
            <div class="flex justify-between pt-1 border-t border-slate-800 text-sm">
              <span class="font-bold text-amber-400 font-bengali">বর্তমান বাকি:</span>
              <span class="font-black text-amber-400 font-mono">${window.AppUtils.formatMoney(item.dueAmount)}</span>
            </div>
          </div>

          <form onsubmit="window.AppUI.handleDuePayment(event)" class="space-y-4 text-xs sm:text-sm">
            <input type="hidden" name="dueId" value="${item.id}">

            <div>
              <label class="block text-slate-300 font-medium mb-1 font-bengali">এখন জমা নেওয়া টাকার পরিমাণ (৳) *</label>
              <input required type="number" step="1" min="1" max="${item.dueAmount}" name="depositAmount" value="${item.dueAmount}" class="w-full px-3 py-2.5 bg-slate-950 border border-emerald-500/80 rounded-xl text-emerald-400 font-mono font-black text-lg focus:outline-none focus:border-emerald-400">
            </div>

            <div>
              <label class="block text-slate-300 font-medium mb-1 font-bengali">পেমেন্ট মাধ্যম</label>
              <select name="paymentMethod" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500">
                <option value="Cash / নগদ">Cash / নগদ টাকা</option>
                <option value="bKash / বিকাশ">bKash / বিকাশ</option>
                <option value="Nagad / নগদ (MFS)">Nagad / নগদ</option>
                <option value="Bank / ব্যাংক">Bank / ব্যাংক ট্রান্সফার</option>
              </select>
            </div>

            <div>
              <label class="block text-slate-300 font-medium mb-1 font-bengali">রসিদ নোট / মন্তব্য (ঐচ্ছিক)</label>
              <input type="text" name="paymentNote" placeholder="যেমন: আংশিক বা পূর্ণ পরিশোধ" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500">
            </div>

            <div class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <label class="flex items-center gap-2 cursor-pointer text-xs font-bengali">
                <input type="checkbox" name="sendSmsImmediately" checked class="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4">
                <span class="font-semibold text-emerald-400">টাকা জমা শেষে গ্রাহককে সরাসরি "টাকা পরিশোধ হয়েছে" SMS পাঠান</span>
              </label>
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button type="button" onclick="window.AppUI.closeModal()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium">বাতিল</button>
              <button type="submit" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30">
                <i class="fa-solid fa-circle-check mr-1"></i> জমা নিশ্চিত করুন (Confirm Collection)
              </button>
            </div>
          </form>
        </div>
      `;
    } else if (window.appState.activeModal === 'miniPayModal' && item) {
      const remaining = item.status === 'paid' ? 0 : (item.dueAmount != null ? item.dueAmount : (item.amount - (item.paidAmount || 0)));
      content = `
        <div class="glass-modal max-w-md w-full mx-4 p-6 sm:p-7 rounded-3xl border border-emerald-500/40 shadow-2xl relative">
          <button onclick="window.AppUI.closeModal()" class="absolute top-5 right-5 text-slate-400 hover:text-white text-lg">
            <i class="fa-solid fa-xmark"></i>
          </button>
          
          <div class="flex items-center gap-3 mb-4">
            <div class="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
              <i class="fa-solid fa-hand-holding-dollar"></i>
            </div>
            <div>
              <h3 class="text-xl font-bold text-white font-bengali">ছোট বাকি টাকা পরিশোধ</h3>
              <p class="text-xs text-slate-400">Quick Due Settlement (Mini Khata)</p>
            </div>
          </div>

          <div class="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5 text-xs mb-4">
            <div class="flex justify-between">
              <span class="text-slate-400 font-bengali">গ্রাহক / ব্যক্তি:</span>
              <span class="font-bold text-white font-bengali text-sm">${item.customerName}</span>
            </div>
            ${item.phone ? `
              <div class="flex justify-between">
                <span class="text-slate-400 font-bengali">মোবাইল:</span>
                <span class="font-mono text-emerald-400">${item.phone}</span>
              </div>
            ` : ''}
            ${item.brilliantNumber ? `
              <div class="flex justify-between">
                <span class="text-slate-400 font-bengali">ব্রিলিয়ান্ট নম্বর:</span>
                <span class="font-mono text-cyan-400">${item.brilliantNumber}</span>
              </div>
            ` : ''}
            <div class="flex justify-between">
              <span class="text-slate-400 font-bengali">মোট বাকি ছিল:</span>
              <span class="font-mono text-slate-300">৳ ${item.amount}</span>
            </div>
            <div class="flex justify-between pt-1 border-t border-slate-800 text-sm">
              <span class="font-bold text-amber-400 font-bengali">বর্তমান বকেয়া বাকি:</span>
              <span class="font-black text-amber-400 font-mono">৳ ${remaining}</span>
            </div>
          </div>

          <form onsubmit="window.AppUI.handleConfirmMiniPay(event)" class="space-y-4 text-xs sm:text-sm">
            <input type="hidden" name="id" value="${item.id}">
            
            <div>
              <label class="block text-slate-300 font-medium mb-1 font-bengali">জমা নেওয়া টাকার পরিমাণ (৳) *</label>
              <input required type="number" step="1" min="1" max="${remaining}" name="payAmount" value="${remaining}" class="w-full px-3 py-2.5 bg-slate-950 border border-emerald-500/80 rounded-xl text-emerald-400 font-mono font-black text-lg focus:outline-none focus:border-emerald-400">
            </div>

            <div class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <label class="flex items-center gap-2 cursor-pointer text-xs font-bengali">
                <input type="checkbox" name="sendSms" checked class="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4">
                <span class="font-semibold text-emerald-400">টাকা জমা শেষে গ্রাহককে সরাসরি "টাকা পরিশোধ হয়েছে" SMS / WhatsApp পাঠান</span>
              </label>
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button type="button" onclick="window.AppUI.closeModal()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium">বাতিল</button>
              <button type="submit" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30">
                <i class="fa-solid fa-circle-check mr-1"></i> পরিশোধ নিশ্চিত করুন (Confirm Paid)
              </button>
            </div>
          </form>
        </div>
      `;
    } else if (window.appState.activeModal === 'smsModal' && item && item.due) {
      const due = item.due;
      const initialText = item.messageText || '';
      let cleanPhone = (due.phone || '').replace(/[^0-9]/g, '');
      let cleanBrilliantPhone = (due.brilliantNumber || '').replace(/[^0-9]/g, '');
      let activeRecipientPhone = item.selectedRecipientPhone || cleanPhone;
      let cleanWaPhone = activeRecipientPhone.startsWith('01') ? '88' + activeRecipientPhone : activeRecipientPhone;
      const encoded = encodeURIComponent(initialText);

      content = `
        <div class="glass-modal max-w-lg w-full mx-4 p-6 sm:p-7 rounded-3xl border border-indigo-500/40 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-thin">
          <button onclick="window.AppUI.closeModal()" class="absolute top-5 right-5 text-slate-400 hover:text-white text-lg">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <!-- Modal Header -->
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-500/25">
              <i class="fa-solid fa-comment-sms"></i>
            </div>
            <div>
              <h3 class="text-xl font-bold text-white font-bengali">বাকির তাগাদা এসএমএস / মেসেজ পাঠান</h3>
              <p class="text-xs text-indigo-300 font-sans">Send Due Reminder via SMS or WhatsApp</p>
            </div>
          </div>

          <!-- Customer & Due Details Box -->
          <div class="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 mb-3 space-y-2 text-xs">
            <div class="flex flex-wrap justify-between items-center gap-2">
              <div>
                <span class="text-slate-400 font-bengali">গ্রাহকের নাম:</span>
                <span class="font-bold text-white font-bengali text-sm ml-1">${due.customerName}</span>
              </div>
              <div class="flex items-center gap-1.5 flex-wrap">
                <!-- Customer Regular Phone Badge -->
                <span title="গ্রাহকের সাধারণ মোবাইল নম্বর" class="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-emerald-400 font-mono text-xs font-semibold flex items-center gap-1">
                  <i class="fa-solid fa-mobile-screen text-[10px]"></i>
                  <span>${due.phone}</span>
                </span>
                <!-- Customer Brilliant Badge if exists or add button -->
                ${due.brilliantNumber ? `
                  <span title="গ্রাহকের ব্রিলিয়ান্ট নম্বর" class="px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-semibold flex items-center gap-1">
                    <i class="fa-solid fa-tower-broadcast text-[10px] text-cyan-400"></i>
                    <span>${due.brilliantNumber}</span>
                  </span>
                ` : `
                  <button type="button" onclick="window.AppUI.promptAddCustomerBrilliant('${due.id}')" title="গ্রাহকের ব্রিলিয়ান্ট নম্বর যোগ করুন" class="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 border border-slate-700 text-[10px] font-bengali transition-all">
                    <i class="fa-solid fa-plus text-[9px] mr-1"></i>ব্রিলিয়ান্ট নম্বর
                  </button>
                `}
              </div>
            </div>

            <!-- Destination Number Selector if both numbers are available -->
            ${due.brilliantNumber ? `
              <div class="flex items-center gap-3 pt-1 border-t border-slate-800/80 text-[11px]">
                <span class="text-slate-400 font-bengali">মেসেজ প্রাপক:</span>
                <label class="cursor-pointer flex items-center gap-1 text-emerald-400 font-bengali">
                  <input type="radio" name="smsRecipientChoice" value="regular" ${(item.selectedRecipientType || 'regular') === 'regular' ? 'checked' : ''} onchange="window.AppUI.setSmsRecipientTarget('regular')" class="rounded-full bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500">
                  <span>সাধারণ (${due.phone})</span>
                </label>
                <label class="cursor-pointer flex items-center gap-1 text-cyan-400 font-bengali">
                  <input type="radio" name="smsRecipientChoice" value="brilliant" ${item.selectedRecipientType === 'brilliant' ? 'checked' : ''} onchange="window.AppUI.setSmsRecipientTarget('brilliant')" class="rounded-full bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500">
                  <span>ব্রিলিয়ান্ট (${due.brilliantNumber})</span>
                </label>
              </div>
            ` : ''}

            <div class="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
              <div>
                <span class="text-slate-400 font-bengali">নেওয়া পণ্য:</span>
                <span class="text-slate-200 font-bengali truncate block">${due.itemsDesc}</span>
              </div>
              <div class="text-right">
                <span class="text-slate-400 font-bengali">পরিশোধের তারিখ:</span>
                <span class="text-amber-300 font-mono ml-1 font-semibold">${due.dueDate || due.date}</span>
              </div>
            </div>
            <div class="flex justify-between items-center pt-1.5 border-t border-slate-800">
              <span class="font-bold text-slate-300 font-bengali">বকেয়া বাকি পরিমাণ:</span>
              <span class="font-black text-amber-400 font-mono text-base">${window.AppUtils.formatMoney(due.dueAmount)}</span>
            </div>
          </div>

          <!-- Dual Contact Numbers Configuration Card (Brilliant + Regular Mobile) -->
          <div class="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 mb-4 space-y-2.5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 text-white flex items-center justify-center text-xs font-bold shadow">
                  <i class="fa-solid fa-address-book"></i>
                </div>
                <div>
                  <h4 class="text-xs font-bold text-white font-bengali">যোগাযোগের নম্বরসমূহ (Sender Contact Numbers)</h4>
                  <p class="text-[10px] text-cyan-300 font-bengali">মেসেজে পাঠানোর জন্য ব্রিলিয়ান্ট ও সাধারণ কন্টাক্ট নম্বর</p>
                </div>
              </div>
            </div>

            <!-- Two Inputs: Brilliant & Regular Phone -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-cyan-900/50 text-xs">
              <!-- Brilliant Input -->
              <div>
                <label class="block text-[11px] text-slate-300 mb-1 font-bengali flex items-center justify-between">
                  <span><i class="fa-solid fa-tower-broadcast text-cyan-400 mr-1"></i>ব্রিলিয়ান্ট নম্বর:</span>
                  <span class="text-[9px] text-cyan-400">০৯৬৩৮...</span>
                </label>
                <input 
                  id="quick-brilliant-input" 
                  type="tel" 
                  value="${(window.appState.currentUser && window.appState.currentUser.brilliantNumber) || ''}" 
                  placeholder="09638-XXXXXX" 
                  class="w-full px-2.5 py-1.5 bg-slate-950 border border-cyan-500/40 rounded-xl text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-400 placeholder-slate-500"
                />
              </div>

              <!-- Regular Mobile Input -->
              <div>
                <label class="block text-[11px] text-slate-300 mb-1 font-bengali flex items-center justify-between">
                  <span><i class="fa-solid fa-mobile-screen text-emerald-400 mr-1"></i>সাধারণ মোবাইল নম্বর:</span>
                  <span class="text-[9px] text-emerald-400">০১৭১২...</span>
                </label>
                <input 
                  id="quick-regular-phone-input" 
                  type="tel" 
                  value="${(window.appState.currentUser && window.appState.currentUser.phone) || ''}" 
                  placeholder="017XXXXXXXX" 
                  class="w-full px-2.5 py-1.5 bg-slate-950 border border-emerald-500/40 rounded-xl text-emerald-300 font-mono text-xs focus:outline-none focus:border-emerald-400 placeholder-slate-500"
                />
              </div>
            </div>

            <!-- Save Numbers Button & Checkboxes -->
            <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div class="flex items-center gap-3">
                <label class="inline-flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300 font-bengali">
                  <input 
                    id="include-brilliant-checkbox" 
                    type="checkbox" 
                    checked 
                    onchange="window.AppUI.handleContactCheckboxChange()" 
                    class="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500 w-3.5 h-3.5"
                  />
                  <span>ব্রিলিয়ান্ট যুক্ত</span>
                </label>

                <label class="inline-flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300 font-bengali">
                  <input 
                    id="include-phone-checkbox" 
                    type="checkbox" 
                    checked 
                    onchange="window.AppUI.handleContactCheckboxChange()" 
                    class="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500 w-3.5 h-3.5"
                  />
                  <span>সাধারণ মোবাইল যুক্ত</span>
                </label>
              </div>

              <div class="flex items-center gap-1.5">
                <button 
                  type="button" 
                  onclick="window.AppUI.saveSenderContactNumbers()" 
                  class="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-[11px] transition-all shadow shadow-cyan-600/25">
                  <i class="fa-solid fa-floppy-disk mr-1"></i> সেভ
                </button>
                <button 
                  type="button" 
                  onclick="window.AppUI.appendAllContactsToTextarea()" 
                  class="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] transition-all border border-slate-700"
                  title="মেসেজে উভয় নম্বর যুক্ত করুন">
                  + উভয় নম্বর
                </button>
              </div>
            </div>
          </div>

          <!-- Template Presets Selector -->
          <div class="mb-3">
            <label class="block text-slate-300 text-xs font-semibold mb-1.5 font-bengali flex items-center justify-between">
              <span><i class="fa-solid fa-wand-magic-sparkles text-amber-400 mr-1"></i>মেসেজ টেমপ্লেট নির্বাচন করুন:</span>
              <span class="text-[10px] text-slate-400 font-normal">ক্লিক করে মেসেজ পরিবর্তন করুন</span>
            </label>
            <div class="grid grid-cols-2 sm:grid-cols-6 gap-1.5 text-[11px]">
              <button type="button" onclick="window.AppUI.setSmsTemplate('brilliant')" class="px-2 py-1.5 rounded-xl bg-cyan-950/90 hover:bg-cyan-900 text-cyan-300 hover:text-white border border-cyan-500/50 transition-all font-bengali text-center font-bold shadow-sm">
                ব্রিলিয়ান্ট তাগাদা 📞
              </button>
              <button type="button" onclick="window.AppUI.setSmsTemplate('paid')" class="px-2 py-1.5 rounded-xl bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 hover:text-white border border-emerald-500/50 transition-all font-bengali text-center font-bold shadow-sm">
                টাকা পরিশোধ হয়েছে
              </button>
              <button type="button" onclick="window.AppUI.setSmsTemplate('receipt')" class="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-600/30 text-slate-300 hover:text-white border border-slate-700 transition-all font-bengali text-center">
                আংশিক পরিশোধ
              </button>
              <button type="button" onclick="window.AppUI.setSmsTemplate('standard')" class="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-white border border-slate-700 transition-all font-bengali text-center">
                সাধারণ তাগাদা
              </button>
              <button type="button" onclick="window.AppUI.setSmsTemplate('date')" class="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-white border border-slate-700 transition-all font-bengali text-center">
                তারিখের নোটিশ
              </button>
              <button type="button" onclick="window.AppUI.setSmsTemplate('urgent')" class="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-600/30 text-slate-300 hover:text-white border border-slate-700 transition-all font-bengali text-center">
                জরুরি তাগাদা
              </button>
            </div>
          </div>

          <!-- SMS Content Textarea -->
          <div class="space-y-1 mb-4">
            <div class="flex items-center justify-between text-xs text-slate-400">
              <label class="font-bengali font-medium text-slate-300">এসএমএস বার্তা লিখুন বা এডিট করুন:</label>
              <div class="font-mono text-[11px] text-slate-400">
                <span id="sms-char-count" class="text-indigo-400 font-bold">${initialText.length}</span> অক্ষর | 
                <span id="sms-parts-count" class="text-emerald-400">${initialText.length <= 70 ? 1 : Math.ceil(initialText.length / 67)} টি SMS</span>
              </div>
            </div>
            <textarea 
              id="sms-message-textarea" 
              rows="4" 
              oninput="window.AppUI.updateSmsLinksAndCounter()" 
              class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-2xl text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500 font-bengali leading-relaxed shadow-inner"
            >${initialText}</textarea>
            <p class="text-[10px] text-slate-500 font-bengali">মোবাইল থেকে সরাসরি পাঠাতে নিচের বাটনে ক্লিক করুন অথবা মেসেজ কপি করে যে কোনো মাধ্যমে পাঠান।</p>
          </div>

          <!-- Actions: 5 Fast Dispatch & Call Options -->
          <div class="space-y-2 pt-1">
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <!-- Native Device SMS Link -->
              <a 
                id="native-sms-link" 
                href="sms:${activeRecipientPhone}?body=${encoded}" 
                class="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all text-center">
                <i class="fa-solid fa-mobile-screen-button text-sm"></i>
                <span>মোবাইল SMS</span>
              </a>

              <!-- Brilliant SMS Direct Link -->
              <a 
                id="native-brilliant-sms-link" 
                href="sms:${cleanBrilliantPhone || activeRecipientPhone}?body=${encoded}" 
                title="ব্রিলিয়ান্ট নম্বরে সরাসরি এসএমএস পাঠান"
                class="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all text-center ring-1 ring-cyan-400/50">
                <i class="fa-solid fa-tower-broadcast text-sm text-cyan-200"></i>
                <span>ব্রিলিয়ান্ট SMS</span>
              </a>

              <!-- WhatsApp Direct Link -->
              <a 
                id="native-wa-link" 
                href="https://api.whatsapp.com/send?phone=${cleanWaPhone}&text=${encoded}" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all text-center">
                <i class="fa-brands fa-whatsapp text-base"></i>
                <span>WhatsApp</span>
              </a>

              <!-- Brilliant Call Direct Link -->
              <a 
                id="brilliant-call-link"
                href="tel:${cleanBrilliantPhone || cleanPhone}" 
                title="ব্রিলিয়ান্ট অ্যাপ বা কল করুন"
                class="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-gradient-to-r from-cyan-700 to-blue-600 hover:from-cyan-600 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all text-center">
                <i class="fa-solid fa-phone-volume text-sm"></i>
                <span>ব্রিলিয়ান্ট কল</span>
              </a>

              <!-- Ordinary Phone Call Direct Link -->
              <a 
                id="phone-call-link"
                href="tel:${cleanPhone}" 
                title="গ্রাহকের সাধারণ মোবাইল নম্বরে কল করুন"
                class="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 font-bold text-xs transition-all text-center">
                <i class="fa-solid fa-phone text-sm"></i>
                <span>সাধারণ কল</span>
              </a>
            </div>

            <div class="flex items-center justify-between gap-2 pt-2">
              <button 
                type="button" 
                onclick="window.AppUI.copySmsText()" 
                class="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all">
                <i class="fa-solid fa-copy text-indigo-400"></i>
                <span>মেসেজ কপি করুন (Copy SMS)</span>
              </button>

              <button 
                type="button" 
                onclick="window.AppUI.closeModal()" 
                class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-medium transition-all">
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      `;
    } else if (window.appState.activeModal === 'auth') {
      const u = window.appState.currentUser || {};
      const accounts = window.appState.accounts || [];
      content = `
        <div class="glass-modal max-w-lg w-full mx-4 p-6 rounded-3xl border border-slate-700/80 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-thin">
          <button onclick="window.AppUI.closeModal()" class="absolute top-5 right-5 text-slate-400 hover:text-white text-lg">
            <i class="fa-solid fa-xmark"></i>
          </button>
          
          <div class="flex items-center gap-3 mb-5">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
              ${u.name ? u.name.charAt(0) : 'U'}
            </div>
            <div>
              <h3 class="text-xl font-bold text-white font-bengali">অ্যাকাউন্ট ও প্রোফাইল ব্যবস্থাপনা</h3>
              <p class="text-xs text-slate-400">Account Management & Data Persistence</p>
            </div>
          </div>

          <!-- Active Profile Edit Form -->
          <form onsubmit="window.AppUI.handleSaveProfile(event)" class="space-y-3 text-xs sm:text-sm">
            <div>
              <label class="block text-slate-300 font-medium mb-1 font-bengali">আপনার পুরো নাম (Full Name) *</label>
              <input required type="text" name="name" value="${u.name || ''}" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500">
            </div>

            <div>
              <label class="block text-slate-300 font-medium mb-1 font-bengali">ব্যবসা প্রতিষ্ঠানের নাম (Business Name) *</label>
              <input required type="text" name="businessName" value="${u.businessName || ''}" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-300 font-medium mb-1 font-bengali">মোবাইল নম্বর (Phone)</label>
                <input type="tel" name="phone" value="${u.phone || ''}" placeholder="01712..." class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500">
              </div>
              <div>
                <label class="block text-slate-300 font-medium mb-1 font-bengali">Gmail / ইমেইল</label>
                <input type="email" name="email" value="${u.email || ''}" placeholder="example@gmail.com" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-300 font-medium mb-1 font-bengali flex items-center justify-between">
                  <span>ব্রিলিয়ান্ট নাম্বার (Brilliant Number)</span>
                  <span class="text-[10px] text-cyan-400 font-normal">০৯৬৩৮...</span>
                </label>
                <div class="relative">
                  <i class="fa-solid fa-tower-broadcast absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 text-xs"></i>
                  <input type="tel" name="brilliantNumber" value="${u.brilliantNumber || ''}" placeholder="যেমন: 09638-XXXXXX" class="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-cyan-300 font-mono focus:outline-none focus:border-cyan-500 text-xs sm:text-sm">
                </div>
              </div>
              <div>
                <label class="block text-slate-300 font-medium mb-1 font-bengali">লগইন পিন / পাসওয়ার্ড (PIN)</label>
                <input type="text" name="password" value="${u.password || '1234'}" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500 text-xs sm:text-sm">
              </div>
            </div>

            <div class="flex items-center justify-between pt-1">
              <button type="submit" class="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md shadow-cyan-600/30">
                <i class="fa-solid fa-floppy-disk mr-1"></i> তথ্য সংরক্ষণ
              </button>
              <button type="button" onclick="window.AppUtils.exportAccountBackup()" class="px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-medium">
                <i class="fa-solid fa-download mr-1"></i> ব্যাকআপ ফাইল ডাউনলোড
              </button>
            </div>
          </form>

          <!-- Accounts Switcher List -->
          <div class="mt-6 pt-5 border-t border-slate-800">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider font-bengali">এই ডিভাইসের সংরক্ষিত অ্যাকাউন্টসমূহ (${accounts.length})</h4>
              <button onclick="window.AppUI.showAddAccountPrompt()" class="text-xs text-emerald-400 hover:text-emerald-300 font-medium">
                <i class="fa-solid fa-user-plus mr-1"></i> নতুন অ্যাকাউন্ট
              </button>
            </div>

            <div class="space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
              ${accounts.map(acc => {
                const isCurrent = acc.id === u.id;
                return `
                  <div class="flex items-center justify-between p-2.5 rounded-xl border ${isCurrent ? 'bg-emerald-950/30 border-emerald-500/40' : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'}">
                    <div class="flex items-center gap-2.5 truncate">
                      <div class="w-8 h-8 rounded-lg ${isCurrent ? 'bg-emerald-500' : 'bg-slate-800'} flex items-center justify-center font-bold text-white text-xs">
                        ${acc.name ? acc.name.charAt(0) : 'U'}
                      </div>
                      <div class="truncate text-left">
                        <p class="text-xs font-bold text-white truncate font-bengali">${acc.name}</p>
                        <p class="text-[10px] text-slate-400 truncate">${acc.businessName || acc.phone || acc.email}</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-1.5">
                      ${isCurrent ? `
                        <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">সক্রিয়</span>
                      ` : `
                        <button onclick="window.AppUI.switchAccount('${acc.id}')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium">
                          সুইচ করুন
                        </button>
                      `}
                      <button onclick="window.AppUI.handleDeleteAccount('${acc.id}')" title="ডিভাইস থেকে এই অ্যাকাউন্ট মুছে ফেলুন" class="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs transition-colors">
                        <i class="fa-solid fa-trash-can text-xs"></i>
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Restore Backup File & Account Actions Section -->
          <div class="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div>
              <label class="cursor-pointer text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5">
                <i class="fa-solid fa-file-import"></i>
                <span>ব্যাকআপ ফাইল থেকে রিস্টোর (.json)</span>
                <input type="file" accept=".json" onchange="window.AppUI.handleImportFile(event)" class="hidden">
              </label>
            </div>

            <div class="flex items-center gap-2">
              <button onclick="window.AppUI.handleDeleteAccount('${u.id}')" title="বর্তমান অ্যাকাউন্ট সম্পূর্ণ রিমুভ করুন" class="px-2.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center gap-1 transition-all">
                <i class="fa-solid fa-trash-can text-xs"></i>
                <span>অ্যাকাউন্ট রিমুভ</span>
              </button>
              <button onclick="window.AppUI.handleLogout()" class="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1 transition-all">
                <i class="fa-solid fa-arrow-right-from-bracket text-xs"></i>
                <span>লগআউট</span>
              </button>
            </div>
          </div>
        </div>
      `;
    } else if (window.appState.activeModal === 'installAppModal') {
      content = `
        <div class="glass-modal max-w-lg w-full mx-4 p-6 sm:p-7 rounded-3xl border border-emerald-500/40 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-thin">
          <button onclick="window.AppUI.closeModal()" class="absolute top-5 right-5 text-slate-400 hover:text-white text-lg">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <!-- Modal Header -->
          <div class="flex items-center gap-3.5 mb-5">
            <div class="w-14 h-14 rounded-2xl overflow-hidden shadow-xl shadow-emerald-500/30 border-2 border-emerald-500/40 flex-shrink-0 bg-slate-900">
              <img src="/app-logo.jpg" alt="Dokaner Hisab Logo" class="w-full h-full object-cover" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-white font-bengali">মোবাইল অ্যাপ প্রজেক্ট ও ইনস্টল</h3>
              <p class="text-xs text-emerald-400 font-mono">Flutter (Firebase) & Kotlin Native Projects</p>
            </div>
          </div>

          <!-- Flutter + Firebase Download Card -->
          <div class="p-4 bg-gradient-to-br from-cyan-950/80 via-slate-950/90 to-indigo-950/80 rounded-2xl border border-cyan-500/50 mb-4">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <i class="fa-brands fa-flutter text-cyan-400 text-xl"></i>
                <h4 class="font-bold text-white text-sm font-bengali">Flutter + Firebase প্রজেক্ট (Auth & Firestore)</h4>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Official</span>
            </div>
            <p class="text-xs text-slate-300 font-bengali mb-2.5 leading-relaxed">
              আপনার কাঙ্ক্ষিত <code class="text-cyan-300 font-mono">firebase_core: ^2.27.0</code>, <code class="text-cyan-300 font-mono">firebase_auth: ^4.17.8</code>, ও <code class="text-cyan-300 font-mono">cloud_firestore: ^4.15.8</code> দিয়ে তৈরি পূর্ণাঙ্গ Flutter অ্যাপ। এতে ইনভেন্টরি, খরচ, বাকির খাতা, ব্রিলিয়ান্ট এসএমএস তাগাদা ও পাসওয়ার্ড রিসেট যুক্ত রয়েছে।
            </p>
            <button onclick="window.AppUtils.downloadFlutterProjectZip()" class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2 mb-2">
              <i class="fa-solid fa-file-zipper text-base"></i>
              <span>Flutter + Firebase প্রজেক্ট ডাউনলোড (.ZIP)</span>
            </button>
            <div class="text-[11px] text-slate-400 font-mono bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <div class="text-emerald-400 font-bold mb-1 font-bengali">🚀 রান করার কমান্ড:</div>
              <code>cd flutter && flutter pub get && flutter run</code>
            </div>
          </div>

          <!-- Native Kotlin & Jetpack Compose Download Banner -->
          <div class="p-4 bg-gradient-to-br from-emerald-950/70 to-slate-950/90 rounded-2xl border border-emerald-500/50 mb-4">
            <div class="flex items-center gap-2 mb-2">
              <i class="fa-brands fa-android text-emerald-400 text-lg"></i>
              <h4 class="font-bold text-white text-sm font-bengali">নেটিভ অ্যান্ড্রয়েড প্রজেক্ট (Kotlin + Jetpack Compose)</h4>
            </div>
            <p class="text-xs text-slate-300 font-bengali mb-3 leading-relaxed">
              বাংলা ভাষা, ইনভেন্টরি, খরচ, বাকির খাতা, ছোট বাকি, লাভ-ক্ষতি ক্যালকুলেশন ও ভয়েস সার্চ সহ অফলাইন রুম ডাটাবেজ অ্যান্ড্রয়েড প্রজেক্ট।
            </p>
            <button onclick="window.AppUtils.downloadAndroidProjectZip()" class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2">
              <i class="fa-solid fa-file-zipper text-base"></i>
              <span>Kotlin অ্যান্ড্রয়েড প্রজেক্ট ডাউনলোড (.ZIP)</span>
            </button>
          </div>

          <!-- Step-by-Step Android Studio APK Build Guide -->
          <div class="space-y-3 mb-5 text-xs">
            <h4 class="font-bold text-slate-200 font-bengali flex items-center gap-1.5">
              <i class="fa-solid fa-gears text-cyan-400"></i>
              <span>মোবাইলে APK বানিয়ে ইনস্টল করার নিয়ম:</span>
            </h4>

            <div class="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2.5 text-slate-300 font-bengali leading-relaxed">
              <div class="flex items-start gap-2.5">
                <span class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs flex-shrink-0">১</span>
                <p>উপরের বাটন চেপে <strong>Dokaner_Hisab_Kotlin_Compose_Android_Project.zip</strong> ডাউনলোড করে আনজিপ করুন অথবা প্রজেক্ট ফোল্ডারের <strong>/android</strong> ফোল্ডারটি ব্যবহার করুন।</p>
              </div>
              <div class="flex items-start gap-2.5">
                <span class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs flex-shrink-0">২</span>
                <p><strong>Android Studio</strong> সফটওয়্যার ওপেন করে <code class="px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 font-mono">Open</code> অপশন দিয়ে ফোল্ডারটি সিলেক্ট করুন।</p>
              </div>
              <div class="flex items-start gap-2.5">
                <span class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs flex-shrink-0">৩</span>
                <p>মেনুবার থেকে <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong> চাপুন অথবা টার্মিনালে <code class="px-1.5 py-0.5 rounded bg-slate-900 text-emerald-300 font-mono">./gradlew assembleDebug</code> রান করুন।</p>
              </div>
              <div class="flex items-start gap-2.5">
                <span class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs flex-shrink-0">৪</span>
                <p>জেনারেট হওয়া <code class="px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 font-mono">app-debug.apk</code> ফাইলে ক্লিক করে আপনার অ্যান্ড্রয়েড ফোনে ইনস্টল করে নিন!</p>
              </div>
            </div>
          </div>

          <!-- Chrome PWA 1-Click Install Button -->
          <div class="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 mb-4 text-center">
            <p class="text-xs font-semibold text-slate-300 font-bengali mb-2">ব্রাউজারে সরাসরি ১-ক্লিকে ফোনে ইনস্টল করতে:</p>
            <button onclick="window.AppUI.triggerAppInstall()" class="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs border border-emerald-500/30 transition-all flex items-center justify-center gap-2">
              <i class="fa-solid fa-mobile-screen-button"></i>
              <span>হোম স্ক্রিনে ইনস্টল করুন (Add to Home Screen)</span>
            </button>
          </div>

          <div class="flex justify-end">
            <button type="button" onclick="window.AppUI.closeModal()" class="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800">
              ঠিক আছে, বন্ধ করুন
            </button>
          </div>
        </div>
      `;
    } else if (window.appState.activeModal === 'voiceModal') {
      const isListening = !!window.appState.voiceSearch?.isListening;
      const target = window.appState.voiceSearch?.activeTarget || 'inventory';
      const lang = window.appState.voiceSearch?.lang || 'bn-BD';
      const lastTranscript = window.appState.voiceSearch?.lastTranscript || '';

      content = `
        <div class="glass-modal max-w-lg w-full mx-4 p-6 sm:p-7 rounded-3xl border border-emerald-500/40 shadow-2xl relative">
          <button onclick="window.AppUI.closeModal()" class="absolute top-5 right-5 text-slate-400 hover:text-white text-lg">
            <i class="fa-solid fa-xmark"></i>
          </button>
          
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/25">
              <i class="fa-solid fa-microphone"></i>
            </div>
            <div>
              <h3 class="text-xl font-bold text-white font-bengali">মাইক্রোফোন ভয়েস সার্চ</h3>
              <p class="text-xs text-slate-400 font-bengali">মুখে বাংলায় বলে পণ্য, বাকির খাতা ও ছোট খাতা অনুসন্ধান</p>
            </div>
          </div>

          <!-- Target Tab Selector inside modal -->
          <div class="grid grid-cols-3 gap-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs mb-4">
            <button type="button" onclick="window.appState.voiceSearch.activeTarget = 'inventory'; window.AppUI.renderModal();" class="py-2 px-1 rounded-xl transition-all font-bengali font-semibold truncate ${target === 'inventory' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}">
              <i class="fa-solid fa-boxes-stacked mr-1"></i>পণ্য স্টক
            </button>
            <button type="button" onclick="window.appState.voiceSearch.activeTarget = 'dues'; window.AppUI.renderModal();" class="py-2 px-1 rounded-xl transition-all font-bengali font-semibold truncate ${target === 'dues' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}">
              <i class="fa-solid fa-file-invoice-dollar mr-1"></i>বাকির খাতা
            </button>
            <button type="button" onclick="window.appState.voiceSearch.activeTarget = 'miniKhata'; window.AppUI.renderModal();" class="py-2 px-1 rounded-xl transition-all font-bengali font-semibold truncate ${target === 'miniKhata' ? 'bg-teal-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}">
              <i class="fa-solid fa-book mr-1"></i>ছোট খাতা
            </button>
          </div>

          <!-- Voice Control Center & Status -->
          <div class="p-5 bg-slate-950/90 rounded-2xl border border-slate-800 text-center space-y-3 mb-4">
            <!-- Big Microphone Button -->
            <button 
              type="button"
              onclick="window.AppUI.toggleVoiceSearch('${target}')" 
              class="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl transition-all shadow-xl ${isListening ? 'bg-rose-500 text-white ring-4 ring-rose-400 animate-pulse shadow-rose-500/50' : 'bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/30 hover:scale-105 active:scale-95'}">
              <i class="fa-solid ${isListening ? 'fa-microphone-lines' : 'fa-microphone'}"></i>
            </button>

            <div>
              <p class="font-bold text-sm text-white font-bengali flex items-center justify-center gap-2">
                <span>${isListening ? '🎙️ মাইক্রোফোন চালু... কথা বলুন' : 'মাইক্রোফোনে চাপুন এবং মুখে বলুন'}</span>
                ${isListening ? '<span class="flex items-center gap-0.5"><span class="w-1.5 h-3 bg-rose-400 rounded-full animate-bounce"></span><span class="w-1.5 h-4 bg-rose-300 rounded-full animate-bounce" style="animation-delay:100ms"></span><span class="w-1.5 h-2 bg-rose-500 rounded-full animate-bounce" style="animation-delay:200ms"></span></span>' : ''}
              </p>
              <p id="modal-voice-live-text" class="text-xs text-amber-300 font-medium font-bengali mt-1">
                ${lastTranscript ? `"${lastTranscript}"` : (isListening ? 'স্পষ্টভাবে পণ্যের বা ব্যক্তির নাম বলুন...' : 'যেকোনো ভাষায় নাম বলতে পারেন')}
              </p>
            </div>

            <!-- Language Selector Pill -->
            <div class="inline-flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
              <button type="button" onclick="window.AppUI.setVoiceLanguage('bn-BD'); window.AppUI.renderModal();" class="px-3 py-1 rounded-lg transition-all font-bengali ${lang === 'bn-BD' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}">
                🇧🇩 বাংলা (bn-BD)
              </button>
              <button type="button" onclick="window.AppUI.setVoiceLanguage('en-US'); window.AppUI.renderModal();" class="px-3 py-1 rounded-lg transition-all ${lang === 'en-US' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}">
                🇺🇸 English (en-US)
              </button>
            </div>
          </div>

          <!-- Quick Voice Keywords (এক ক্লিকে বলুন) -->
          <div class="space-y-2 mb-4">
            <div class="flex items-center justify-between text-xs text-slate-400">
              <span class="font-bengali font-semibold">⚡ দ্রুত সার্চ কি-ওয়ার্ড (ক্লিক করলেই সার্চ হবে):</span>
            </div>
            <div class="flex flex-wrap gap-1.5">
              ${(target === 'dues' ? [
                'বাকি আছে', 'পরিশোধিত', 'আজকের বাকি', 'পুরোনো বাকি', 'তাগাদা'
              ] : target === 'miniKhata' ? [
                'বাকি আছে', 'পরিশোধিত', 'নগদ জমা', 'খুচরা বাকি'
              ] : [
                'চাল', 'তেল', 'চিনি', 'ডাল', 'লবণ', 'আটা', 'সাবান', 'বিস্কুট'
              ]).map(kw => `
                <button type="button" onclick="window.AppUI.applyVoiceTranscriptToTarget('${target}', '${kw}'); window.AppUI.closeModal();" class="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-800 text-xs transition-all font-bengali flex items-center gap-1">
                  <i class="fa-solid fa-volume-high text-[10px] text-emerald-400"></i>
                  <span>${kw}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Browser Microphone Permission Help Tips -->
          <div class="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <p class="font-bold text-slate-300 font-bengali flex items-center gap-1.5">
              <i class="fa-solid fa-circle-info text-cyan-400"></i>
              <span>মাইক্রোফোন পারমিশন চালুর সহজ নিয়ম:</span>
            </p>
            <p class="font-bengali leading-relaxed text-slate-400">
              ১. ব্রাউজারের অ্যাড্রেস বারের শুরুতে তালা (🔒) বা ক্যামেরা/মাইক্রোফোন আইকনে ক্লিক করুন।<br>
              ২. "Microphone" অপশনটি "Allow" (অনুমতি) দিয়ে দিন।<br>
              ৩. এরপর যেকোনো সার্চ বক্সে মাইক্রোফোন আইকনে চাপলেই সরাসরি কথা বলে সার্চ হবে।
            </p>
          </div>

          <div class="mt-4 flex justify-between items-center">
            <button type="button" onclick="window.AppUI.setTab('${target}'); window.AppUI.closeModal();" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bengali font-semibold transition-all">
              <i class="fa-solid fa-arrow-up-right-from-square mr-1"></i>তালিকায় যান
            </button>
            <button type="button" onclick="window.AppUI.closeModal()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bengali transition-all">
              বন্ধ করুন
            </button>
          </div>
        </div>
      `;
    }

    modalContainer.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
        ${content}
      </div>
    `;
  },

  handleSaveProduct(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const id = fd.get('id') || 'prod_' + Date.now();
    const costPrice = parseFloat(fd.get('costPrice')) || 0;
    const wholesalePrice = parseFloat(fd.get('wholesalePrice')) || 0;
    const retailPrice = parseFloat(fd.get('retailPrice')) || 0;

    const newProd = {
      id,
      nameBn: fd.get('nameBn'),
      nameEn: fd.get('nameEn') || fd.get('nameBn'),
      sku: fd.get('sku') || 'SKU-' + Date.now().toString().slice(-4),
      category: fd.get('category') || 'General',
      netWeight: fd.get('netWeight'),
      stock: parseInt(fd.get('stock')) || 0,
      minStock: parseInt(fd.get('minStock')) || 5,
      costPrice,
      wholesalePrice,
      retailPrice,
      unit: fd.get('netWeight')
    };

    const existingIndex = window.appState.products.findIndex(p => p.id === id);
    if (existingIndex >= 0) {
      window.appState.products[existingIndex] = newProd;
      window.AppUtils.showToast('পণ্য সফলভাবে হালনাগাদ করা হয়েছে (Updated)');
    } else {
      window.appState.products.unshift(newProd);
      window.AppUtils.showToast('নতুন পণ্য সফলভাবে যোগ করা হয়েছে (Product Added)');
    }

    window.AppUtils.saveData();
    this.closeModal();
    this.render();
  },

  handleSaveExpense(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const newExp = {
      id: 'exp_' + Date.now(),
      title: fd.get('title'),
      category: fd.get('category'),
      amount: parseFloat(fd.get('amount')) || 0,
      date: fd.get('date'),
      paymentMethod: fd.get('paymentMethod'),
      description: fd.get('description')
    };

    window.appState.expenses.unshift(newExp);
    window.AppUtils.saveData();
    window.AppUtils.showToast('খরচ হিসাব সফলভাবে সংরক্ষিত হয়েছে (Expense Saved)');
    this.closeModal();
    this.render();
  },

  handleQuickSale(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const prodId = fd.get('productId');
    const qty = parseInt(fd.get('qty')) || 1;
    const type = fd.get('saleType');

    const product = window.appState.products.find(p => p.id === prodId);
    if (!product) return;

    if (product.stock < qty) {
      alert('মজুদ স্টক এর চেয়ে বেশি বিক্রি করা সম্ভব নয়!');
      return;
    }

    product.stock -= qty;
    window.AppUtils.saveData();

    const price = type === 'wholesale' ? product.wholesalePrice : product.retailPrice;
    const profit = (price - product.costPrice) * qty;

    window.AppUtils.showToast(`বিক্রি সফল! অর্জিত তাৎক্ষণিক লাভ: ${window.AppUtils.formatMoney(profit)}`);
    this.closeModal();
    this.render();
  },

  handleSaveDue(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const id = fd.get('id') || 'due_' + Date.now();
    const totalAmount = parseFloat(fd.get('totalAmount')) || 0;
    const paidAmount = parseFloat(fd.get('paidAmount')) || 0;
    const dueAmount = Math.max(0, totalAmount - paidAmount);
    const status = dueAmount <= 0 ? 'paid' : (paidAmount > 0 ? 'partial' : 'unpaid');

    const newDue = {
      id,
      customerName: fd.get('customerName'),
      phone: fd.get('phone'),
      brilliantNumber: fd.get('brilliantNumber') || '',
      address: fd.get('address'),
      itemsDesc: fd.get('itemsDesc'),
      totalAmount,
      paidAmount,
      dueAmount,
      date: fd.get('date'),
      dueDate: fd.get('dueDate'),
      status,
      notes: fd.get('notes')
    };

    if (!window.appState.dues) window.appState.dues = [];
    const idx = window.appState.dues.findIndex(d => d.id === id);
    if (idx >= 0) {
      window.appState.dues[idx] = newDue;
      window.AppUtils.showToast('বাকির হিসাব সফলভাবে সংশোধন করা হয়েছে');
    } else {
      window.appState.dues.unshift(newDue);
      window.AppUtils.showToast('নতুন বাকির হিসাব যোগ করা হয়েছে');
    }

    window.AppUtils.saveData();
    this.closeModal();
    this.render();
  },

  handleDuePayment(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const dueId = fd.get('dueId');
    const depositAmount = parseFloat(fd.get('depositAmount')) || 0;
    const paymentMethod = fd.get('paymentMethod');
    const paymentNote = fd.get('paymentNote');
    const sendSmsImmediately = fd.get('sendSmsImmediately') !== null;

    const due = (window.appState.dues || []).find(d => d.id === dueId);
    if (!due) return;

    due.paidAmount = (Number(due.paidAmount) || 0) + depositAmount;
    due.dueAmount = Math.max(0, (Number(due.totalAmount) || 0) - due.paidAmount);
    due.status = due.dueAmount <= 0 ? 'paid' : 'partial';
    if (paymentNote) {
      due.notes = (due.notes ? due.notes + ' | ' : '') + `${new Date().toLocaleDateString('bn-BD')}: ৳${depositAmount} জমা (${paymentMethod})`;
    }

    window.AppUtils.saveData();
    window.AppUtils.showToast(`জমা সফল! ${due.customerName} এর নিকট অবশিষ্ট বাকি: ${window.AppUtils.formatMoney(due.dueAmount)}`);

    if (sendSmsImmediately) {
      this.openSmsModal(dueId, due.dueAmount <= 0);
    } else {
      this.closeModal();
      this.render();
    }
  },

  deleteDue(id) {
    if (!confirm('আপনি কি এই গ্রাহকের বাকির রেকর্ড মুছে ফেলতে চান? (Delete Due Record?)')) return;
    window.appState.dues = (window.appState.dues || []).filter(d => d.id !== id);
    window.AppUtils.saveData();
    this.render();
    window.AppUtils.showToast('বাকির রেকর্ড মুছে ফেলা হয়েছে');
  },

  openSmsModal(id, isPaidReceipt = false, preferBrilliant = false) {
    let due = (window.appState.dues || []).find(d => d.id === id);
    if (!due) {
      const mini = (window.appState.miniKhata || []).find(m => m.id === id);
      if (mini) {
        due = {
          id: mini.id,
          customerName: mini.customerName,
          phone: mini.phone,
          brilliantNumber: mini.brilliantNumber,
          totalAmount: mini.amount,
          paidAmount: mini.paidAmount || (mini.status === 'paid' ? mini.amount : 0),
          dueAmount: mini.status === 'paid' ? 0 : (mini.dueAmount != null ? mini.dueAmount : (mini.amount - (mini.paidAmount || 0))),
          notes: mini.note || 'ছোট বাকির খাতা',
          itemsDesc: mini.note || 'খুচরা পণ্য',
          isMini: true
        };
      }
    }
    if (!due) return;
    const user = window.appState.currentUser || {};
    const store = user.businessName || 'আমাদের ব্যবসা প্রতিষ্ঠান';
    const storePhone = user.phone || '';
    const brilliant = user.brilliantNumber || '';

    let contactParts = [];
    if (brilliant) contactParts.push(`ব্রিলিয়ান্ট: ${brilliant}`);
    if (storePhone) contactParts.push(`মোবাইল: ${storePhone}`);
    let contactText = contactParts.length > 0 ? ` (যোগাযোগ: ${contactParts.join(', ')})` : '';

    const isFullyPaid = isPaidReceipt || Number(due.dueAmount || 0) <= 0;
    let defaultText = '';
    if (preferBrilliant) {
      defaultText = `ব্রিলিয়ান্ট কানেক্ট তাগাদা: সম্মানিত ${due.customerName}, ${store} এ আপনার পূর্বের বকেয়া বাকি রয়েছে ৳ ${due.dueAmount}। ব্রিলিয়ান্ট অ্যাপ বা সরাসরি ফোনে যোগাযোগের জন্য: ${contactText}। দ্রুত পরিশোধের বিনীত অনুরোধ রইল। ধন্যবাদ।`;
    } else if (isFullyPaid) {
      defaultText = `সম্মানিত ${due.customerName}, ${store} এ আপনার পূর্বের বকেয়া হিসাবের টাকা সম্পূর্ণ পরিশোধ হয়েছে (মোট পরিশোধ: ৳ ${due.paidAmount || due.totalAmount})। আপনার নিকট আর কোনো বকেয়া বা বাকি নেই। সততার সাথে লেনদেনের জন্য আন্তরিক ধন্যবাদ!${contactText ? contactText : ''}`;
    } else if (Number(due.paidAmount || 0) > 0) {
      defaultText = `পেমেন্ট রসিদ: সম্মানিত ${due.customerName}, ${store} এ আপনার ৳ ${due.paidAmount} টাকা পরিশোধ হয়েছে। বর্তমান অবশিষ্ট বাকি রয়েছে: ৳ ${due.dueAmount}। সাথে থাকার জন্য ধন্যবাদ!${contactText ? contactText : ''}`;
    } else {
      defaultText = `সম্মানিত ${due.customerName}, ${store} এ আপনার পূর্বের কেনাকাটায় বকেয়া বাকি রয়েছে ৳ ${due.dueAmount}। অনুগ্রহ করে দ্রুত পরিশোধের বিনীত অনুরোধ রইল।${contactText ? contactText : ''} ধন্যবাদ।`;
    }

    const cleanRegular = (due.phone || '').replace(/[^0-9]/g, '');
    const cleanBrilliant = (due.brilliantNumber || '').replace(/[^0-9]/g, '');
    const initialType = (preferBrilliant && cleanBrilliant) ? 'brilliant' : 'regular';
    const initialPhone = initialType === 'brilliant' ? cleanBrilliant : cleanRegular;

    this.openModal('smsModal', {
      due,
      selectedRecipientType: initialType,
      selectedRecipientPhone: initialPhone,
      messageText: defaultText,
      isPaidReceipt: isFullyPaid,
      preferBrilliant
    });
  },

  openBrilliantSmsModal(id) {
    this.openSmsModal(id, false, true);
  },

  setSmsRecipientTarget(type) {
    const item = window.appState.editingItem;
    if (!item || !item.due) return;
    const due = item.due;
    item.selectedRecipientType = type;
    if (type === 'brilliant' && due.brilliantNumber) {
      item.selectedRecipientPhone = due.brilliantNumber.replace(/[^0-9]/g, '');
    } else {
      item.selectedRecipientPhone = (due.phone || '').replace(/[^0-9]/g, '');
    }
    this.updateSmsLinksAndCounter();
    window.AppUtils.showToast(`মেসেজ গন্তব্য: ${type === 'brilliant' ? 'ব্রিলিয়ান্ট নম্বর' : 'সাধারণ মোবাইল'}`);
  },

  promptAddCustomerBrilliant(dueId) {
    let due = (window.appState.dues || []).find(d => d.id === dueId);
    if (!due) {
      due = (window.appState.miniKhata || []).find(m => m.id === dueId);
    }
    if (!due) return;
    const current = due.brilliantNumber || '';
    const val = prompt('গ্রাহকের ব্রিলিয়ান্ট নম্বর লিখুন (Enter Customer Brilliant Number):', current || '09638-');
    if (val !== null) {
      due.brilliantNumber = val.trim();
      window.AppUtils.saveData();
      window.AppUtils.showToast('গ্রাহকের ব্রিলিয়ান্ট নম্বর সেভ হয়েছে!');
      this.openSmsModal(dueId);
    }
  },

  setSmsTemplate(templateKey) {
    const item = window.appState.editingItem;
    if (!item || !item.due) return;
    const due = item.due;
    const user = window.appState.currentUser || {};
    const store = user.businessName || 'আমাদের ব্যবসা প্রতিষ্ঠান';

    const quickBrilliant = document.getElementById('quick-brilliant-input');
    const quickPhone = document.getElementById('quick-regular-phone-input');
    const brilliant = (quickBrilliant ? quickBrilliant.value.trim() : '') || user.brilliantNumber || '';
    const phone = (quickPhone ? quickPhone.value.trim() : '') || user.phone || '';

    const brilliantCb = document.getElementById('include-brilliant-checkbox');
    const phoneCb = document.getElementById('include-phone-checkbox');
    const includeBrilliant = brilliantCb ? brilliantCb.checked : true;
    const includePhone = phoneCb ? phoneCb.checked : true;

    const contactParts = [];
    if (includeBrilliant && brilliant) contactParts.push(`ব্রিলিয়ান্ট: ${brilliant}`);
    if (includePhone && phone) contactParts.push(`মোবাইল: ${phone}`);

    const contactStr = contactParts.length > 0 ? ` (যোগাযোগ: ${contactParts.join(', ')})` : '';

    let text = '';
    switch (templateKey) {
      case 'brilliant':
        text = `ব্রিলিয়ান্ট কানেক্ট তাগাদা: সম্মানিত ${due.customerName}, ${store} এ আপনার পূর্বের বকেয়া বাকি রয়েছে ৳ ${due.dueAmount}। ব্রিলিয়ান্ট অ্যাপ বা সরাসরি ফোনে যোগাযোগের জন্য: ${contactStr}। দ্রুত পরিশোধের বিনীত অনুরোধ রইল। ধন্যবাদ।`;
        break;
      case 'paid':
        text = `সম্মানিত ${due.customerName}, ${store} এ আপনার পূর্বের বকেয়া হিসাবের টাকা সম্পূর্ণ পরিশোধ হয়েছে (মোট পরিশোধ: ৳ ${due.totalAmount || due.paidAmount})। আপনার নিকট আর কোনো বকেয়া বা বাকি নেই। সততার সাথে লেনদেনের জন্য আন্তরিক ধন্যবাদ!${contactStr}`;
        break;
      case 'partial':
      case 'receipt':
        text = `পেমেন্ট রসিদ: সম্মানিত ${due.customerName}, ${store} এ আপনার ৳ ${due.paidAmount} টাকা পরিশোধ হয়েছে। বর্তমান অবশিষ্ট বাকি রয়েছে: ৳ ${due.dueAmount}। সাথে থাকার জন্য ধন্যবাদ!${contactStr ? ' (' + contactStr.trim() + ')' : ''}`;
        break;
      case 'standard':
        text = `সম্মানিত ${due.customerName}, ${store} এ আপনার বকেয়া বাকি রয়েছে ৳ ${due.dueAmount}। অনুগ্রহ করে দ্রুত পরিশোধের বিনীত অনুরোধ রইল।${contactStr} ধন্যবাদ।`;
        break;
      case 'date':
        text = `সম্মানিত ${due.customerName}, ${store} এ আপনার ৳ ${due.dueAmount} বাকি রয়েছে, যা ${due.dueDate || 'নির্দিষ্ট'} তারিখের মধ্যে পরিশোধের কথা ছিল। অনুগ্রহ করে দ্রুত পরিশোধ করুন।${contactStr} ধন্যবাদ।`;
        break;
      case 'urgent':
        text = `জরুরি তাগাদা: সম্মানিত ${due.customerName}, ${store} এর পাওনা ৳ ${due.dueAmount} অনেকদিন যাবত বাকি রয়েছে। অনুগ্রহ করে অতিসত্বর যোগাযোগ করে বকেয়া পরিশোধ করুন।${contactStr}`;
        break;
      default:
        text = item.messageText;
    }

    const textarea = document.getElementById('sms-message-textarea');
    if (textarea) {
      textarea.value = text;
      this.updateSmsLinksAndCounter();
    }
  },

  saveSenderContactNumbers() {
    const quickBrilliant = document.getElementById('quick-brilliant-input');
    const quickPhone = document.getElementById('quick-regular-phone-input');
    const brilliantVal = quickBrilliant ? quickBrilliant.value.trim() : '';
    const phoneVal = quickPhone ? quickPhone.value.trim() : '';

    const u = window.appState.currentUser;
    if (u) {
      u.brilliantNumber = brilliantVal;
      if (phoneVal) u.phone = phoneVal;
      const accIndex = window.appState.accounts.findIndex(a => a.id === u.id);
      if (accIndex >= 0) {
        window.appState.accounts[accIndex] = { ...u };
      }
      window.AppUtils.saveData();
      window.AppUtils.showToast('ব্রিলিয়ান্ট ও সাধারণ কন্টাক্ট নম্বর সফলভাবে সেভ হয়েছে!');
      this.setSmsTemplate('standard');
    }
  },

  handleContactCheckboxChange() {
    this.setSmsTemplate('standard');
  },

  appendAllContactsToTextarea() {
    const textarea = document.getElementById('sms-message-textarea');
    if (!textarea) return;
    const u = window.appState.currentUser || {};
    const quickBrilliant = document.getElementById('quick-brilliant-input');
    const quickPhone = document.getElementById('quick-regular-phone-input');
    const brilliant = (quickBrilliant ? quickBrilliant.value.trim() : '') || u.brilliantNumber || '';
    const phone = (quickPhone ? quickPhone.value.trim() : '') || u.phone || '';

    const parts = [];
    if (brilliant) parts.push(`ব্রিলিয়ান্ট: ${brilliant}`);
    if (phone) parts.push(`মোবাইল: ${phone}`);

    if (parts.length === 0) {
      window.AppUtils.showToast('আগে ব্রিলিয়ান্ট বা সাধারণ মোবাইল নম্বর লিখে সেভ করুন', 'error');
      return;
    }

    const phrase = ` | যোগাযোগ: ${parts.join(', ')}`;
    if (!textarea.value.includes(parts[0])) {
      textarea.value = textarea.value.trim() + phrase;
      this.updateSmsLinksAndCounter();
      window.AppUtils.showToast('কন্টাক্ট নম্বরসমূহ মেসেজে যুক্ত করা হয়েছে!');
    } else {
      window.AppUtils.showToast('নম্বর ইতিমধ্যে মেসেজে যুক্ত আছে');
    }
  },

  saveQuickBrilliantNumber() {
    this.saveSenderContactNumbers();
  },

  toggleBrilliantInSms(include) {
    this.handleContactCheckboxChange();
  },

  appendBrilliantToTextarea() {
    this.appendAllContactsToTextarea();
  },

  updateSmsLinksAndCounter() {
    const textarea = document.getElementById('sms-message-textarea');
    if (!textarea) return;
    const text = textarea.value;
    const countSpan = document.getElementById('sms-char-count');
    const partsSpan = document.getElementById('sms-parts-count');
    const nativeSmsLink = document.getElementById('native-sms-link');
    const nativeBrilliantSmsLink = document.getElementById('native-brilliant-sms-link');
    const waLink = document.getElementById('native-wa-link');
    const brilliantCallLink = document.getElementById('brilliant-call-link');
    const phoneCallLink = document.getElementById('phone-call-link');

    const len = text.length;
    if (countSpan) countSpan.innerText = len;
    const parts = len <= 70 ? 1 : Math.ceil(len / 67);
    if (partsSpan) partsSpan.innerText = `${parts} টি SMS`;

    const item = window.appState.editingItem;
    if (!item || !item.due) return;
    const due = item.due;

    let cleanPhone = (due.phone || '').replace(/[^0-9]/g, '');
    let cleanBrilliantPhone = (due.brilliantNumber || '').replace(/[^0-9]/g, '');
    let activeRecipient = item.selectedRecipientPhone || cleanPhone;

    let cleanWaPhone = activeRecipient;
    if (cleanWaPhone.startsWith('01')) {
      cleanWaPhone = '88' + cleanWaPhone;
    }

    const encoded = encodeURIComponent(text);
    if (nativeSmsLink) {
      nativeSmsLink.href = `sms:${activeRecipient}?body=${encoded}`;
    }
    if (nativeBrilliantSmsLink) {
      const targetBrilliant = cleanBrilliantPhone || activeRecipient;
      nativeBrilliantSmsLink.href = `sms:${targetBrilliant}?body=${encoded}`;
    }
    if (waLink) {
      waLink.href = `https://api.whatsapp.com/send?phone=${cleanWaPhone}&text=${encoded}`;
    }
    if (brilliantCallLink) {
      brilliantCallLink.href = `tel:${cleanBrilliantPhone || cleanPhone}`;
    }
    if (phoneCallLink) {
      phoneCallLink.href = `tel:${cleanPhone}`;
    }
  },

  copySmsText() {
    const textarea = document.getElementById('sms-message-textarea');
    if (!textarea) return;
    const text = textarea.value;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        window.AppUtils.showToast('এসএমএস মেসেজ ক্লিপবোর্ডে কপি করা হয়েছে!');
      }).catch(() => {
        textarea.select();
        document.execCommand('copy');
        window.AppUtils.showToast('মেসেজ কপি করা হয়েছে!');
      });
    } else {
      textarea.select();
      document.execCommand('copy');
      window.AppUtils.showToast('মেসেজ কপি করা হয়েছে!');
    }
  },

  sendWhatsAppReminder(id) {
    this.openSmsModal(id);
  },

  triggerAppInstall() {
    if (window.deferredInstallPrompt) {
      window.deferredInstallPrompt.prompt();
      window.deferredInstallPrompt.userChoice.then((choiceResult) => {
        if (choiceResult && choiceResult.outcome === 'accepted') {
          window.AppUtils.showToast('অ্যাপ ইন্সটল প্রক্রিয়া সফল হয়েছে!');
          this.closeModal();
        }
        window.deferredInstallPrompt = null;
      });
    } else {
      window.AppUtils.showToast('ব্রাউজারের ৩টি ডট মেনু (⋮) থেকে "Install app" বা "Add to Home screen" চাপুন।');
    }
  },

  renderAuthScreen(container) {
    const tab = window.appState.authViewTab || 'login';
    const accounts = window.appState.accounts || [];

    container.innerHTML = `
      <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-darkbg via-slate-900 to-darkbg">
        <div class="max-w-md w-full glass-modal p-6 sm:p-8 rounded-3xl border border-slate-700/80 shadow-2xl relative">
          <!-- Logo & Header -->
          <div class="text-center mb-6">
            <div class="w-16 h-16 mx-auto rounded-3xl overflow-hidden shadow-xl shadow-emerald-500/25 border-2 border-emerald-500/40 mb-3 bg-slate-900">
              <img src="/app-logo.jpg" alt="Dokaner Hisab Logo" class="w-full h-full object-cover" onerror="this.onerror=null; this.src=''; this.parentElement.innerHTML='<div class=\'w-full h-full flex items-center justify-center bg-gradient-to-tr from-emerald-500 to-cyan-500 text-white text-2xl font-bold\'><i class=\'fa-solid fa-shop\'></i></div>';" />
            </div>
            <h2 class="text-2xl font-extrabold text-white tracking-tight">Dokaner Hisab</h2>
            <p class="text-xs text-emerald-400 font-bengali mt-0.5 font-medium">দোকানের হিসাব: ইনভেন্টরি, পাইকারি ও খুচরা বিক্রয় এবং বাকির খাতা</p>
            <div class="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 text-xs font-mono">
              <i class="fa-solid fa-fire text-amber-400"></i> Firebase Cloud: dokaner-hisab-94e6d
            </div>
            <p class="text-[11px] text-slate-400 mt-2 font-bengali">আপনার অ্যাকাউন্টে লগইন করে পূর্বের সব ডাটা ও হিসাব ফিরে পান</p>
          </div>

          <!-- Auth View Tabs -->
          <div class="grid grid-cols-2 sm:grid-cols-4 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs mb-6 font-medium gap-1">
            <button onclick="window.appState.authViewTab = 'login'; window.AppUI.render();" class="py-2 px-2 rounded-xl text-center transition-all ${tab === 'login' ? 'bg-emerald-500 text-white shadow-md font-bold' : 'text-slate-400 hover:text-white'}">
              লগইন (Login)
            </button>
            <button onclick="window.appState.authViewTab = 'register'; window.AppUI.render();" class="py-2 px-2 rounded-xl text-center transition-all ${tab === 'register' ? 'bg-cyan-500 text-white shadow-md font-bold' : 'text-slate-400 hover:text-white'}">
              নতুন অ্যাকাউন্ট
            </button>
            <button onclick="window.appState.authViewTab = 'forgot'; window.AppUI.render();" class="py-2 px-2 rounded-xl text-center transition-all ${tab === 'forgot' ? 'bg-amber-500 text-slate-950 shadow-md font-bold' : 'text-amber-400/90 hover:text-amber-300'}">
              ফরগেট পিন 🔑
            </button>
            <button onclick="window.appState.authViewTab = 'restore'; window.AppUI.render();" class="py-2 px-2 rounded-xl text-center transition-all ${tab === 'restore' ? 'bg-purple-500 text-white shadow-md font-bold' : 'text-slate-400 hover:text-white'}">
              রিস্টোর (.json)
            </button>
          </div>

          <!-- Tab 1: Login Form -->
          ${tab === 'login' ? `
            ${accounts.length > 0 ? `
              <div class="mb-4 p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-[11px] font-bold text-slate-300 font-bengali">ডিভাইসের সংরক্ষিত অ্যাকাউন্ট (${accounts.length})</span>
                  <button type="button" onclick="window.AppUI.handleClearAllAccounts()" class="text-[10px] text-rose-400 hover:text-rose-300 font-bengali flex items-center gap-1">
                    <i class="fa-solid fa-trash-can text-[10px]"></i>
                    <span>সব রিমুভ</span>
                  </button>
                </div>
                <div class="space-y-1.5 max-h-32 overflow-y-auto scrollbar-thin">
                  ${accounts.map(acc => `
                    <div class="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <div class="truncate text-left flex items-center gap-2">
                        <div class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                          ${acc.name ? acc.name.charAt(0) : 'U'}
                        </div>
                        <div class="truncate">
                          <p class="font-bold text-white text-xs truncate font-bengali leading-tight">${acc.name}</p>
                          <p class="text-[10px] text-slate-400 truncate leading-tight">${acc.phone || acc.email}</p>
                        </div>
                      </div>
                      <div class="flex items-center gap-1.5 flex-shrink-0">
                        <button type="button" onclick="window.AppUI.handleQuickLogin('${acc.phone || acc.email}', '${acc.password}')" class="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold">
                          লগইন
                        </button>
                        <button type="button" onclick="window.AppUI.handleDeleteAccount('${acc.id}')" title="অ্যাকাউন্ট রিমুভ করুন" class="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[11px]">
                          <i class="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <form onsubmit="window.AppUI.handleLogin(event)" class="space-y-4 text-xs sm:text-sm">
              <div>
                <label class="block text-slate-300 font-medium mb-1 font-bengali">মোবাইল নম্বর অথবা Gmail *</label>
                <div class="relative">
                  <i class="fa-solid fa-user absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                  <input required type="text" name="identifier" value="" placeholder="017XXXXXXXX বা example@gmail.com" class="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-sans">
                </div>
              </div>

              <div>
                <label class="block text-slate-300 font-medium mb-1 font-bengali">পাসওয়ার্ড / পিন (PIN) *</label>
                <div class="relative">
                  <i class="fa-solid fa-key absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                  <input required type="password" name="password" placeholder="আপনার পিন লিখুন" class="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono tracking-widest">
                </div>
                <div class="flex items-center justify-between mt-2">
                  <span class="text-[11px] text-slate-500 font-bengali">পিন মনে নেই?</span>
                  <button type="button" onclick="window.appState.authViewTab = 'forgot'; window.AppUI.render();" class="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors font-bengali flex items-center gap-1 hover:underline">
                    <i class="fa-solid fa-unlock-keyhole text-[11px]"></i>
                    <span>ফরগেট পাসওয়ার্ড / পিন রিসেট</span>
                  </button>
                </div>
              </div>

              <button type="submit" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all">
                <i class="fa-solid fa-arrow-right-to-bracket mr-1.5"></i> অ্যাকাউন্টে প্রবেশ করুন (Log In)
              </button>
            </form>
          ` : tab === 'forgot' ? `
            <!-- Tab 3: Forgot Password / PIN Reset Form -->
            <form onsubmit="window.AppUI.handleResetPassword(event)" class="space-y-3.5 text-xs sm:text-sm">
              <div class="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bengali leading-relaxed flex items-start gap-2.5">
                <i class="fa-solid fa-shield-halved text-lg text-amber-400 flex-shrink-0 mt-0.5"></i>
                <div>
                  <h4 class="font-bold text-amber-300 text-xs mb-0.5 font-bengali">ফরগেট পাসওয়ার্ড / পিন রিকভারি</h4>
                  <p class="text-[11px] text-slate-300">আপনার অ্যাকাউন্টের মোবাইল নম্বর দিয়ে সহজেই নতুন পিন সেট করে নিন। ওটিপি কোড অথবা দোকানের নাম দিয়ে যাচাই করুন।</p>
                </div>
              </div>

              <div>
                <label class="block text-slate-300 font-medium mb-1 font-bengali">রেজিস্টার্ড মোবাইল নম্বর বা Gmail *</label>
                <div class="relative flex gap-2">
                  <div class="relative flex-1">
                    <i class="fa-solid fa-phone absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                    <input required type="text" id="forgot-identifier-input" name="identifier" placeholder="017XXXXXXXX বা Gmail" class="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500">
                  </div>
                  <button type="button" onclick="window.AppUI.requestForgotOtp()" class="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold font-bengali whitespace-nowrap transition-all">
                    <i class="fa-solid fa-paper-plane mr-1"></i> কোড পান
                  </button>
                </div>
              </div>

              <div id="forgot-otp-banner" class="hidden p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bengali">
              </div>

              <div>
                <label class="block text-slate-300 font-medium mb-1 font-bengali">দোকানের নাম অথবা ওটিপি ভেরিফিকেশন কোড *</label>
                <div class="relative">
                  <i class="fa-solid fa-store absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                  <input required type="text" id="forgot-verification-input" name="businessName" placeholder="দোকানের নাম অথবা ওটিপি কোড লিখুন" class="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500">
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label class="block text-slate-300 font-medium mb-1 font-bengali">নতুন পিন / পাসওয়ার্ড *</label>
                  <input required type="password" name="newPassword" placeholder="নতুন পিন লিখুন" class="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500">
                </div>
                <div>
                  <label class="block text-slate-300 font-medium mb-1 font-bengali">নতুন পিন নিশ্চিত করুন *</label>
                  <input required type="password" name="confirmPassword" placeholder="পুনরায় পিন লিখুন" class="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500">
                </div>
              </div>

              <div class="pt-2 space-y-2">
                <button type="submit" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2">
                  <i class="fa-solid fa-key text-xs"></i>
                  <span>পিন পরিবর্তন ও অ্যাকাউন্টে প্রবেশ করুন</span>
                </button>

                <button type="button" onclick="window.appState.authViewTab = 'login'; window.AppUI.render();" class="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-all flex items-center justify-center gap-1.5">
                  <i class="fa-solid fa-arrow-left"></i>
                  <span>লগইন পেজে ফিরে যান</span>
                </button>
              </div>
            </form>
          ` : tab === 'register' ? `
            <!-- Tab 2: Registration Form -->
            <form onsubmit="window.AppUI.handleRegister(event)" class="space-y-3 text-xs sm:text-sm">
              <div>
                <label class="block text-slate-300 font-medium mb-1 font-bengali">আপনার পুরো নাম (Full Name) *</label>
                <input required type="text" name="name" placeholder="আপনার নাম লিখুন" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500">
              </div>

              <div>
                <label class="block text-slate-300 font-medium mb-1 font-bengali">দোকান বা ব্যবসা প্রতিষ্ঠানের নাম *</label>
                <input required type="text" name="businessName" placeholder="আপনার দোকানের নাম লিখুন" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500">
              </div>

              <div class="grid grid-cols-2 gap-2.5">
                <div>
                  <label class="block text-slate-300 font-medium mb-1 font-bengali">মোবাইল নম্বর *</label>
                  <input required type="tel" name="phone" placeholder="017XXXXXXXX" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500">
                </div>
                <div>
                  <label class="block text-slate-300 font-medium mb-1 font-bengali">ব্রিলিয়ান্ট নম্বর (ঐচ্ছিক)</label>
                  <input type="tel" name="brilliantNumber" placeholder="09638..." class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-cyan-300 font-mono focus:outline-none focus:border-cyan-500">
                </div>
              </div>

              <div>
                <label class="block text-slate-300 font-medium mb-1 font-bengali">Gmail / ইমেইল (ঐচ্ছিক)</label>
                <input type="email" name="email" placeholder="shop@gmail.com" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500">
              </div>

              <div>
                <label class="block text-slate-300 font-medium mb-1 font-bengali">গোপন পিন / পাসওয়ার্ড (PIN) *</label>
                <input required type="password" name="password" placeholder="যেমন: 1234" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500">
                <p class="text-[10px] text-slate-500 mt-1">ভবিষ্যতে লগইন করার জন্য এই পিন মনে রাখুন</p>
              </div>

              <button type="submit" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all mt-2">
                <i class="fa-solid fa-user-check mr-1.5"></i> অ্যাকাউন্ট খুলুন ও শুরু করুন (Sign Up)
              </button>
            </form>
          ` : `
            <!-- Tab 3: Restore Backup Form -->
            <div class="space-y-4 text-xs sm:text-sm">
              <div class="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                <i class="fa-solid fa-cloud-arrow-up text-3xl text-purple-400 mb-2 block"></i>
                <h4 class="font-bold text-white text-sm font-bengali mb-1">ব্যাকআপ ফাইল (.json) আপলোড করুন</h4>
                <p class="text-xs text-slate-400 mb-4 font-bengali">অন্য ডিভাইস বা পূর্বের ডাউনলোড করা ব্যাকআপ থেকে সম্পূর্ণ পণ্য ও খরচের হিসাব পুনরুদ্ধার করুন।</p>

                <label class="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all">
                  <i class="fa-solid fa-folder-open"></i>
                  <span>ফাইল নির্বাচন করুন (.json File)</span>
                  <input type="file" accept=".json" onchange="window.AppUI.handleImportFile(event)" class="hidden">
                </label>
              </div>
            </div>
          `}

          <!-- Clear Device Stored Accounts / Storage Options -->
          <div class="mt-5 pt-3 border-t border-slate-800/80 text-center">
            <button type="button" onclick="window.AppUI.handleClearAllAccounts()" class="text-[11px] text-slate-400 hover:text-rose-400 transition-colors font-bengali inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-slate-800/40">
              <i class="fa-solid fa-trash-can text-rose-400 text-[10px]"></i>
              <span>ডিভাইস সংরক্ষিত একাউন্ট সম্পূর্ণ রিমুভ করুন (Clear Device Accounts)</span>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  async handleQuickLogin(identifier, password) {
    window.AppUtils.showToast('ফায়ারবেসে লগইন হচ্ছে...');
    const res = await window.AppUtils.login(identifier, password);
    if (res.success) {
      window.AppUtils.showToast(`স্বাগতম, ${res.user.name}! ফায়ারবেস ক্লাউড ডাটা লোড হয়েছে।`);
      this.render();
    } else {
      alert(res.message);
    }
  },

  async handleLogin(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const origHtml = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> Firebase ক্লাউডে সংযোগ হচ্ছে...';
    }
    const fd = new FormData(e.target);
    const identifier = fd.get('identifier');
    const password = fd.get('password');

    try {
      const res = await window.AppUtils.login(identifier, password);
      if (res.success) {
        window.AppUtils.showToast(`স্বাগতম, ${res.user.name}! Firebase ক্লাউড থেকে ডাটা লোড হয়েছে।`);
        this.render();
      } else {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = origHtml;
        }
        alert(res.message);
      }
    } catch (err) {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origHtml;
      }
      alert('লগইন ত্রুটি: ' + (err.message || 'ব্যর্থ হয়েছে'));
    }
  },

  handleResetPassword(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const identifier = fd.get('identifier');
    const businessName = fd.get('businessName');
    const newPassword = fd.get('newPassword');
    const confirmPassword = fd.get('confirmPassword');

    if (newPassword !== confirmPassword) {
      alert('নতুন পিন এবং নিশ্চিতকরণ পিন দুটি মিলছে না! দয়া করে উভয় ফিল্ডে একই পিন দিন।');
      return;
    }

    const res = window.AppUtils.resetPassword(identifier, businessName, newPassword);
    if (res.success) {
      window.AppUtils.showToast(res.message);
      this.render();
    } else {
      alert(res.message);
    }
  },

  requestForgotOtp() {
    const input = document.getElementById('forgot-identifier-input');
    const val = input ? input.value.trim() : '';
    if (!val) {
      alert('দয়া করে আগে আপনার রেজিস্টার্ড মোবাইল নম্বর বা Gmail লিখুন।');
      if (input) input.focus();
      return;
    }
    const res = window.AppUtils.generateResetOtp(val);
    if (!res.success) {
      alert(res.message);
      return;
    }
    const banner = document.getElementById('forgot-otp-banner');
    if (banner) {
      banner.innerHTML = `
        <div class="flex items-center justify-between">
          <span><i class="fa-solid fa-circle-check text-emerald-400 mr-1.5"></i> <strong>ভেরিফিকেশন কোড:</strong> <span class="font-mono text-base font-black text-amber-300 ml-1 select-all tracking-widest">${res.otp}</span></span>
          <span class="text-[10px] text-slate-300">${res.businessName || res.accountName}</span>
        </div>
      `;
      banner.classList.remove('hidden');
    }
    const verifyInput = document.getElementById('forgot-verification-input');
    if (verifyInput) {
      verifyInput.value = res.otp;
    }
    window.AppUtils.showToast(`ভেরিফিকেশন কোড: ${res.otp} (কোড বসানো হয়েছে)`);
  },

  async handleRegister(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const origHtml = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> Firebase-এ একাউন্ট তৈরি ও ডেটাবেজে সংরক্ষণ হচ্ছে...';
    }
    const fd = new FormData(e.target);
    const accountData = {
      name: fd.get('name'),
      businessName: fd.get('businessName'),
      phone: fd.get('phone'),
      email: fd.get('email'),
      brilliantNumber: fd.get('brilliantNumber') || '',
      password: fd.get('password')
    };

    try {
      const res = await window.AppUtils.register(accountData);
      if (res.success) {
        window.AppUtils.showToast('ফায়ারবেসে নতুন একাউন্ট সফলভাবে তৈরি হয়েছে!');
        this.render();
      } else {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = origHtml;
        }
        alert(res.message);
      }
    } catch (err) {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origHtml;
      }
      alert('রেজিস্ট্রেশন ত্রুটি: ' + (err.message || 'ব্যর্থ হয়েছে'));
    }
  },

  async handleLogout() {
    await window.AppUtils.logout();
    this.closeModal();
    this.render();
    window.AppUtils.showToast('লগআউট সম্পন্ন হয়েছে');
  },

  handleDeleteAccount(accId) {
    window.AppUtils.deleteAccount(accId);
    this.closeModal();
    this.render();
    window.AppUtils.showToast('অ্যাকাউন্ট সফলভাবে মুছে ফেলা হয়েছে');
  },

  handleClearAllAccounts() {
    window.AppUtils.clearAllAccounts();
    this.closeModal();
    this.render();
    window.AppUtils.showToast('ডিভাইসে সংরক্ষিত সমস্ত অ্যাকাউন্ট মুছে ফেলা হয়েছে');
  },

  async switchAccount(accId) {
    const acc = window.appState.accounts.find(a => a.id === accId);
    if (!acc) return;
    const res = await window.AppUtils.login(acc.phone || acc.email, acc.password);
    if (res.success) {
      this.closeModal();
      this.render();
      window.AppUtils.showToast(`অ্যাকাউন্ট পরিবর্তিত: ${acc.name} এর ডাটা লোড হয়েছে`);
    } else {
      alert(res.message);
    }
  },

  showAddAccountPrompt() {
    this.closeModal();
    window.appState.authViewTab = 'register';
    window.AppUtils.logout();
    this.render();
  },

  handleImportFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const res = window.AppUtils.importAccountBackup(content);
      if (res.success) {
        this.closeModal();
        this.render();
        window.AppUtils.showToast(`ব্যাকআপ সফলভাবে রিস্টোর হয়েছে! ${res.user.name} এর সমস্ত ডাটা পুনরুদ্ধার করা হয়েছে।`);
      } else {
        alert(res.message);
      }
    };
    reader.readAsText(file);
  },

  handleSaveProfile(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const u = window.appState.currentUser;
    if (!u) return;

    u.name = fd.get('name');
    u.businessName = fd.get('businessName');
    u.phone = fd.get('phone');
    u.email = fd.get('email');
    u.brilliantNumber = fd.get('brilliantNumber') ? String(fd.get('brilliantNumber')).trim() : '';
    if (fd.get('password')) {
      u.password = fd.get('password');
    }

    // Sync in accounts list
    const accIndex = window.appState.accounts.findIndex(a => a.id === u.id);
    if (accIndex >= 0) {
      window.appState.accounts[accIndex] = { ...u };
    }

    window.AppUtils.saveData();
    window.AppUtils.showToast('প্রোফাইল তথ্য সফলভাবে সংরক্ষিত হয়েছে (Saved)');
    this.closeModal();
    this.render();
  },

  clearAllData() {
    if (!confirm('আপনি কি নিশ্চিত যে সমস্ত পণ্য, খরচ এবং বাকির ডাটা মুছে নতুন করে শুরু করতে চান?')) return;
    window.appState.products = [];
    window.appState.expenses = [];
    window.appState.dues = [];
    window.appState.miniKhata = [];
    window.AppUtils.saveData();
    window.AppUtils.purgeAllDemoData();
    this.closeModal();
    this.render();
    window.AppUtils.showToast('সমস্ত পরীক্ষামূলক ও ডেমো ডাটা মুছে ফ্রেশ শুরু করা হয়েছে!');
  }
};

// Initialize App
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.AppUI.init();
  });
} else {
  window.AppUI.init();
}
