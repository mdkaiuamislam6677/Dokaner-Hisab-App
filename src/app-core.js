// StockFlow Pro - Single Page Application Core
// LocalStorage Keys for Multi-Account Isolation
const STORAGE_KEYS = {
  ACCOUNTS: 'stockflow_accounts_registry_v2',
  ACTIVE_UID: 'stockflow_active_uid_v2',
  ACCOUNT_DATA_PREFIX: 'stockflow_data_user_',
  LEGACY_PRODUCTS: 'stockflow_products_v1',
  LEGACY_EXPENSES: 'stockflow_expenses_v1',
};

// Clean initial state - No demo/sample products, expenses or dues
const DEFAULT_PRODUCTS = [];
const DEFAULT_EXPENSES = [];
const DEFAULT_DUES = [];
const DEFAULT_MINI_KHATA = [];
const DEFAULT_ACCOUNTS = [];

const DEFAULT_SETTINGS = {
  currency: '৳',
  theme: 'dark', // 'dark' | 'light'
  lang: 'dual'   // 'dual' | 'bn' | 'en'
};

// Application State
window.appState = {
  accounts: [],
  currentUser: null,
  products: [],
  expenses: [],
  dues: [],
  miniKhata: [],
  settings: { ...DEFAULT_SETTINGS },
  currentTab: 'inventory', // 'inventory' | 'expenses' | 'dues' | 'miniKhata' | 'analytics' | 'tips'
  searchQuery: '',
  stockFilter: 'all', // 'all' | 'inStock' | 'lowStock' | 'outOfStock'
  categoryFilter: 'all',
  dueFilter: 'all', // 'all' | 'unpaid' | 'paid'
  dueSearchQuery: '',
  miniKhataFilter: 'all', // 'all' | 'unpaid' | 'paid'
  miniKhataSearchQuery: '',
  miniCalc: {
    display: '0',
    formula: '',
    history: []
  },
  voiceSearch: {
    isListening: false,
    activeTarget: null, // 'inventory' | 'dues' | 'miniKhata'
    lang: 'bn-BD', // 'bn-BD' | 'en-US'
    lastTranscript: ''
  },
  activeModal: null, // 'auth' | 'productForm' | 'expenseForm' | 'sellForm' | 'dueForm' | 'duePaymentModal' | 'viewSummary' | 'miniPayModal'
  authViewTab: 'login', // 'login' | 'register' | 'forgot' | 'restore'
  editingItem: null,
  charts: {
    comparisonChart: null,
    expenseBreakdownChart: null
  }
};

window.STORAGE_KEYS = STORAGE_KEYS;
window.DEFAULT_PRODUCTS = DEFAULT_PRODUCTS;
window.DEFAULT_EXPENSES = DEFAULT_EXPENSES;
window.DEFAULT_DUES = DEFAULT_DUES;
window.DEFAULT_MINI_KHATA = DEFAULT_MINI_KHATA;
window.DEFAULT_ACCOUNTS = DEFAULT_ACCOUNTS;
window.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
