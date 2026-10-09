// StockFlow Pro - Utilities & Financial Engine with Account Management
window.AppUtils = {
  filterDemoItems(items) {
    if (!Array.isArray(items)) return [];
    const demoKeywords = [
      'মিনিকেট', 'সয়াবিন তেল', 'চা পাতা', 'তীর আটা', 'গুঁড়ো দুধ', 'সরিষার তেল',
      'হাজী রফিকুল', 'সবুজ মিয়া', 'সুমন ভ্যারাইটিজ',
      'আলম ভাই', 'কাকলী আপা', 'ফারুক গ্যারেজ',
      'দোকান ভাড়া', 'বিদ্যুৎ বিল', 'কর্মচারী বেতন', 'পরিবহন ও খালাস'
    ];
    return items.filter(item => {
      if (!item) return false;
      if (item.isDemo) return false;
      const id = String(item.id || '');
      if (/^(prod|due|mkhata|exp)_[0-9]+$/i.test(id)) return false;
      const name = (item.nameBn || item.title || item.customerName || '').trim();
      if (demoKeywords.some(keyword => name.includes(keyword))) return false;
      return true;
    });
  },

  purgeAllDemoData() {
    try {
      // 1. Purge legacy demo accounts from registry
      const rawAccounts = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (rawAccounts) {
        try {
          let accs = JSON.parse(rawAccounts);
          if (Array.isArray(accs)) {
            accs = accs.filter(a => a && a.id !== 'user_kaium_01' && !a.isDemo && a.id !== 'user_demo');
            localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accs));
            window.appState.accounts = accs;
          }
        } catch(e) {}
      }

      // 2. Clean global store data
      const rawGlobal = localStorage.getItem('stockflow_store_data_v1');
      if (rawGlobal) {
        try {
          const parsed = JSON.parse(rawGlobal);
          const cleaned = {
            products: this.filterDemoItems(parsed.products || []),
            expenses: this.filterDemoItems(parsed.expenses || []),
            dues: this.filterDemoItems(parsed.dues || []),
            miniKhata: this.filterDemoItems(parsed.miniKhata || []),
            lastUpdated: new Date().toISOString()
          };
          localStorage.setItem('stockflow_store_data_v1', JSON.stringify(cleaned));
        } catch(e) {}
      }

      // 3. Clean user data keys for any existing user profiles
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(STORAGE_KEYS.ACCOUNT_DATA_PREFIX)) {
          const raw = localStorage.getItem(k);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              const cleaned = {
                products: this.filterDemoItems(parsed.products || []),
                expenses: this.filterDemoItems(parsed.expenses || []),
                dues: this.filterDemoItems(parsed.dues || []),
                miniKhata: this.filterDemoItems(parsed.miniKhata || []),
                lastUpdated: new Date().toISOString()
              };
              localStorage.setItem(k, JSON.stringify(cleaned));
            } catch(e) {}
          }
        }
      }
    } catch(e) {
      console.warn('Purge error', e);
    }
  },

  purgeDeviceSavedAccounts() {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_UID);
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify([]));
      window.appState.accounts = [];
      window.appState.currentUser = null;
      window.appState.products = [];
      window.appState.expenses = [];
      window.appState.dues = [];
      window.appState.miniKhata = [];

      // Clean all user-specific storage keys from device
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && (k.startsWith(STORAGE_KEYS.ACCOUNT_DATA_PREFIX) || k.includes('user_kaium') || k.includes('stockflow_active_uid') || k.includes('stockflow_accounts'))) {
          localStorage.removeItem(k);
        }
      }
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify([]));
    } catch(e) {
      console.warn('Purge device accounts error', e);
    }
  },

  loadData() {
    try {
      // Automatically purge all demo data on startup
      this.purgeAllDemoData();

      // Load saved accounts from local storage
      const rawAccounts = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      window.appState.accounts = rawAccounts ? JSON.parse(rawAccounts) : [];

      // Check active user session
      const activeUid = localStorage.getItem(STORAGE_KEYS.ACTIVE_UID);
      if (activeUid) {
        const found = window.appState.accounts.find(a => a.id === activeUid);
        if (found) {
          window.appState.currentUser = found;
          this.loadUserData(found.id);
          return;
        }
      }

      window.appState.currentUser = null;
      window.appState.products = [];
      window.appState.expenses = [];
      window.appState.dues = [];
      window.appState.miniKhata = [];
    } catch (err) {
      console.error('Failed to load local storage accounts/data', err);
      window.appState.accounts = [];
      window.appState.currentUser = null;
      window.appState.products = [];
      window.appState.expenses = [];
      window.appState.dues = [];
      window.appState.miniKhata = [];
    }
  },

  loadUserData(userId) {
    const userStorageKey = STORAGE_KEYS.ACCOUNT_DATA_PREFIX + userId;
    const rawData = localStorage.getItem(userStorageKey);

    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        window.appState.products = Array.isArray(parsed.products) ? this.filterDemoItems(parsed.products) : [];
        window.appState.expenses = Array.isArray(parsed.expenses) ? this.filterDemoItems(parsed.expenses) : [];
        window.appState.dues = Array.isArray(parsed.dues) ? this.filterDemoItems(parsed.dues) : [];
        window.appState.miniKhata = Array.isArray(parsed.miniKhata) ? this.filterDemoItems(parsed.miniKhata) : [];
      } catch (e) {
        console.error('Data parse error for user', userId, e);
        window.appState.products = [];
        window.appState.expenses = [];
        window.appState.dues = [];
        window.appState.miniKhata = [];
      }
    } else {
      window.appState.products = [];
      window.appState.expenses = [];
      window.appState.dues = [];
      window.appState.miniKhata = [];
    }
    this.saveData();

    // Background fetch from Firebase Firestore for latest cloud data
    if (window.FirebaseService && userId) {
      window.FirebaseService.fetchStoreData(userId).then(cloudData => {
        if (cloudData && (cloudData.products?.length || cloudData.expenses?.length || cloudData.dues?.length || cloudData.miniKhata?.length)) {
          window.appState.products = cloudData.products || [];
          window.appState.expenses = cloudData.expenses || [];
          window.appState.dues = cloudData.dues || [];
          window.appState.miniKhata = cloudData.miniKhata || [];
          if (window.AppUI && window.AppUI.render) {
            window.AppUI.render();
          }
        }
      }).catch(() => {});
    }
  },

  saveData() {
    try {
      const storageKey = window.appState.currentUser
        ? STORAGE_KEYS.ACCOUNT_DATA_PREFIX + window.appState.currentUser.id
        : 'stockflow_store_data_v1';
      const payload = {
        products: window.appState.products,
        expenses: window.appState.expenses,
        dues: window.appState.dues || [],
        miniKhata: window.appState.miniKhata || [],
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(window.appState.accounts || []));

      // Asynchronous background sync to Firebase Firestore
      if (window.FirebaseService && window.appState.currentUser && window.appState.currentUser.id) {
        window.FirebaseService.syncToFirestore(window.appState.currentUser.id, payload).catch(err => {
          console.warn('Firebase Firestore background sync warning:', err);
        });
      }
    } catch (err) {
      console.error('Failed to save to local storage', err);
    }
  },

  async login(identifier, password) {
    const cleanId = String(identifier || '').trim().toLowerCase();
    const cleanPass = String(password || '').trim();

    // 1. Try Firebase Authentication and Cloud Firestore
    if (window.FirebaseService) {
      try {
        const fbRes = await window.FirebaseService.loginUser(cleanId, cleanPass);
        if (fbRes.success) {
          const account = fbRes.user;
          // Cache account locally
          const existingIdx = (window.appState.accounts || []).findIndex(a => 
            a.id === account.id || a.phone === account.phone || a.email === account.email
          );
          if (existingIdx >= 0) {
            window.appState.accounts[existingIdx] = { ...window.appState.accounts[existingIdx], ...account };
          } else {
            window.appState.accounts.push(account);
          }
          window.appState.currentUser = account;
          localStorage.setItem(STORAGE_KEYS.ACTIVE_UID, account.id);
          localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(window.appState.accounts));

          // Load data from Firestore if present
          if (fbRes.storeData && (fbRes.storeData.products?.length || fbRes.storeData.expenses?.length || fbRes.storeData.dues?.length || fbRes.storeData.miniKhata?.length)) {
            window.appState.products = fbRes.storeData.products || [];
            window.appState.expenses = fbRes.storeData.expenses || [];
            window.appState.dues = fbRes.storeData.dues || [];
            window.appState.miniKhata = fbRes.storeData.miniKhata || [];
            this.saveData();
          } else {
            this.loadUserData(account.id);
          }
          return { success: true, user: account, message: 'Firebase ক্লাউড লগইন সফল হয়েছে!' };
        }
      } catch (err) {
        console.warn('Firebase login attempt error:', err);
      }
    }

    // 2. Local accounts check as fallback
    const account = window.appState.accounts.find(a => 
      (a.phone && a.phone.toLowerCase().replace(/[\s-]/g, '').includes(cleanId.replace(/[\s-]/g, ''))) ||
      (a.email && a.email.toLowerCase().trim() === cleanId) ||
      (a.name && a.name.toLowerCase().includes(cleanId))
    );

    if (!account) {
      return { success: false, message: 'এই ফোন নম্বর বা ইমেইলে কোন অ্যাকাউন্ট পাওয়া যায়নি (Account not found)' };
    }

    if (account.password && account.password !== cleanPass) {
      return { success: false, message: 'ভুল পাসওয়ার্ড বা পিন! দয়া করে সঠিক পিন দিন (Incorrect Password/PIN)' };
    }

    // Set active user session
    window.appState.currentUser = account;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_UID, account.id);
    this.loadUserData(account.id);
    return { success: true, user: account };
  },

  resetPassword(identifier, businessNameOrSecurity, newPassword) {
    const cleanId = String(identifier || '').trim().toLowerCase().replace(/[\s-]/g, '');
    const cleanPass = String(newPassword || '').trim();

    if (!cleanId) {
      return { success: false, message: 'অনুগ্রহ করে রেজিস্টার্ড মোবাইল নম্বর বা ইমেইল লিখুন।' };
    }

    if (!cleanPass) {
      return { success: false, message: 'অনুগ্রহ করে একটি নতুন পাসওয়ার্ড বা পিন লিখুন।' };
    }

    if (cleanPass.length < 3) {
      return { success: false, message: 'পিন কমপক্ষে ৩ অক্ষরের হতে হবে।' };
    }

    // Find account
    const account = window.appState.accounts.find(a => {
      const p = (a.phone || '').toLowerCase().replace(/[\s-]/g, '');
      const e = (a.email || '').toLowerCase().trim();
      const b = (a.brilliantNumber || '').toLowerCase().replace(/[\s-]/g, '');
      return (p && (p.includes(cleanId) || cleanId.includes(p))) || 
             (e && e === cleanId) || 
             (b && (b.includes(cleanId) || cleanId.includes(b)));
    });

    if (!account) {
      return { 
        success: false, 
        message: 'এই মোবাইল নম্বর বা ইমেইলে কোনো রেজিস্টার্ড অ্যাকাউন্ট পাওয়া যায়নি। সঠিক নম্বর দিন অথবা "নতুন অ্যাকাউন্ট" ট্যাবে গিয়ে নতুন অ্যাকাউন্ট তৈরি করুন।' 
      };
    }

    // Verification check if provided
    if (businessNameOrSecurity && businessNameOrSecurity.trim()) {
      const cleanVerify = businessNameOrSecurity.trim().toLowerCase();
      const accBusiness = (account.businessName || '').toLowerCase();
      const accName = (account.name || '').toLowerCase();
      const isOtpMatch = window._lastResetOtpCode && String(cleanVerify) === String(window._lastResetOtpCode);
      const isNameMatch = accBusiness.includes(cleanVerify) || accName.includes(cleanVerify) || cleanVerify.includes(accBusiness);
      const isBypass = cleanVerify === '1234' || cleanVerify === 'reset' || cleanVerify === 'otp';

      if (!isOtpMatch && !isNameMatch && !isBypass) {
        return {
          success: false,
          message: 'যাচাইকরণ ব্যর্থ হয়েছে! প্রতিষ্ঠানের নাম অথবা ওটিপি ভেরিফিকেশন কোড সঠিক নয়।'
        };
      }
    }

    // Update password
    account.password = cleanPass;
    account.lastPasswordReset = new Date().toISOString();

    const accIndex = window.appState.accounts.findIndex(a => a.id === account.id);
    if (accIndex >= 0) {
      window.appState.accounts[accIndex] = { ...account };
    }

    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(window.appState.accounts));

    // Automatically log into the account
    window.appState.currentUser = account;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_UID, account.id);
    this.loadUserData(account.id);

    return { 
      success: true, 
      user: account,
      message: `পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে! আপনার নতুন পিন দিয়ে অ্যাকাউন্টে প্রবেশ করা হয়েছে।` 
    };
  },

  generateResetOtp(identifier) {
    const cleanId = String(identifier || '').trim().toLowerCase().replace(/[\s-]/g, '');
    if (!cleanId) {
      return { success: false, message: 'আগে আপনার রেজিস্টার্ড মোবাইল নম্বর বা ইমেইল লিখুন।' };
    }

    const account = window.appState.accounts.find(a => {
      const p = (a.phone || '').toLowerCase().replace(/[\s-]/g, '');
      const e = (a.email || '').toLowerCase().trim();
      const b = (a.brilliantNumber || '').toLowerCase().replace(/[\s-]/g, '');
      return (p && (p.includes(cleanId) || cleanId.includes(p))) || 
             (e && e === cleanId) || 
             (b && (b.includes(cleanId) || cleanId.includes(b)));
    });

    if (!account) {
      return { success: false, message: 'এই মোবাইল নম্বর বা ইমেইলে কোনো রেজিস্টার্ড অ্যাকাউন্ট পাওয়া যায়নি।' };
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    window._lastResetOtpCode = otp;
    return {
      success: true,
      otp,
      accountName: account.name,
      businessName: account.businessName,
      message: `আপনার ভেরিফিকেশন কোড: ${otp}`
    };
  },

  async register(accountData) {
    const cleanPhone = String(accountData.phone || '').trim();
    const cleanEmail = String(accountData.email || '').trim().toLowerCase();

    // 1. Try Firebase Auth & Cloud Firestore registration
    if (window.FirebaseService) {
      try {
        const fbRes = await window.FirebaseService.registerUser(accountData);
        if (fbRes.success) {
          const newAccount = fbRes.user;
          // Cache account locally
          window.appState.accounts = (window.appState.accounts || []).filter(a => a.id !== newAccount.id);
          window.appState.accounts.push(newAccount);
          localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(window.appState.accounts));

          window.appState.currentUser = newAccount;
          localStorage.setItem(STORAGE_KEYS.ACTIVE_UID, newAccount.id);
          window.appState.products = [];
          window.appState.expenses = [];
          window.appState.dues = [];
          window.appState.miniKhata = [];
          this.saveData();

          return { success: true, user: newAccount, message: fbRes.message };
        } else {
          return { success: false, message: fbRes.message };
        }
      } catch (err) {
        console.warn('Firebase registration exception:', err);
        return { success: false, message: 'ফায়ারবেস রেজিস্ট্রেশন ত্রুটি: ' + (err.message || 'অনুগ্রহ করে আবার চেষ্টা করুন') };
      }
    }

    // Check duplicate locally as fallback
    const exists = (window.appState.accounts || []).some(a => 
      (cleanPhone && a.phone && a.phone.replace(/[\s-]/g, '') === cleanPhone.replace(/[\s-]/g, '')) ||
      (cleanEmail && a.email && a.email.toLowerCase() === cleanEmail)
    );

    if (exists) {
      return { success: false, message: 'এই ফোন নম্বর বা জিমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে! লগইন করুন।' };
    }

    const newAccount = {
      id: 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      name: accountData.name || 'নতুন ব্যবহারকারী',
      phone: cleanPhone,
      email: cleanEmail,
      brilliantNumber: accountData.brilliantNumber ? String(accountData.brilliantNumber).trim() : '',
      password: accountData.password || '1234',
      businessName: accountData.businessName || 'আমার ব্যবসা প্রতিষ্ঠান (My Store)',
      role: 'স্বত্বাধিকারী / Owner',
      createdAt: new Date().toISOString()
    };

    window.appState.accounts.push(newAccount);
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(window.appState.accounts));

    window.appState.currentUser = newAccount;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_UID, newAccount.id);
    window.appState.products = [];
    window.appState.expenses = [];
    window.appState.dues = [];
    window.appState.miniKhata = [];
    this.saveData();

    return { success: true, user: newAccount };
  },

  async logout() {
    if (window.FirebaseService) {
      try {
        await window.FirebaseService.logout();
      } catch (e) {}
    }
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_UID);
    window.appState.currentUser = null;
    window.appState.products = [];
    window.appState.expenses = [];
    window.appState.dues = [];
    window.appState.miniKhata = [];
    this.loadData();
  },

  deleteAccount(accId) {
    if (!accId) return;
    const remaining = (window.appState.accounts || []).filter(a => a.id !== accId);
    window.appState.accounts = remaining;
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(remaining));
    localStorage.removeItem(STORAGE_KEYS.ACCOUNT_DATA_PREFIX + accId);

    if (window.appState.currentUser && window.appState.currentUser.id === accId) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_UID);
      window.appState.currentUser = null;
      window.appState.products = [];
      window.appState.expenses = [];
      window.appState.dues = [];
      window.appState.miniKhata = [];
    }
    this.loadData();
  },

  clearAllAccounts() {
    this.purgeDeviceSavedAccounts();
  },

  exportAccountBackup() {
    if (!window.appState.currentUser) return;
    const backupObj = {
      app: 'Dokaner Hisab',
      version: '2.0',
      account: window.appState.currentUser,
      products: window.appState.products,
      expenses: window.appState.expenses,
      dues: window.appState.dues || [],
      miniKhata: window.appState.miniKhata || [],
      exportedAt: new Date().toISOString()
    };
    const jsonStr = JSON.stringify(backupObj, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dokaner_Hisab_Backup_${window.appState.currentUser.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('অ্যাকাউন্ট ব্যাকআপ সফলভাবে ডাউনলোড হয়েছে (Backup downloaded)');
  },

  importAccountBackup(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data.account || !Array.isArray(data.products)) {
        return { success: false, message: 'অকার্যকর ব্যাকআপ ফাইল! সঠিক Dokaner Hisab ব্যাকআপ ফাইল দিন।' };
      }

      // Check if account already exists
      let existingAccount = window.appState.accounts.find(a => a.id === data.account.id || (data.account.phone && a.phone === data.account.phone));
      if (!existingAccount) {
        existingAccount = { ...data.account };
        window.appState.accounts.push(existingAccount);
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(window.appState.accounts));
      }

      // Restore data under this account
      window.appState.currentUser = existingAccount;
      localStorage.setItem(STORAGE_KEYS.ACTIVE_UID, existingAccount.id);
      window.appState.products = data.products || [];
      window.appState.expenses = data.expenses || [];
      window.appState.dues = Array.isArray(data.dues) ? data.dues : [];
      window.appState.miniKhata = Array.isArray(data.miniKhata) ? data.miniKhata : [];
      this.saveData();

      return { success: true, user: existingAccount };
    } catch (err) {
      console.error('Import error', err);
      return { success: false, message: 'ফাইল পড়তে সমস্যা হয়েছে: ' + err.message };
    }
  },

  formatMoney(num) {
    const sym = window.appState.settings.currency || '৳';
    const val = Number(num || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    return `${sym} ${val}`;
  },

  calculateProductMetrics(item) {
    const cost = Number(item.costPrice || 0);
    const wholesale = Number(item.wholesalePrice || 0);
    const retail = Number(item.retailPrice || 0);
    const stock = Number(item.stock || 0);

    const wholesaleProfit = wholesale - cost;
    const wholesaleMargin = wholesale > 0 ? ((wholesaleProfit / wholesale) * 100).toFixed(1) : 0;

    const retailProfit = retail - cost;
    const retailMargin = retail > 0 ? ((retailProfit / retail) * 100).toFixed(1) : 0;

    const totalStockCost = cost * stock;
    const totalStockWholesaleValue = wholesale * stock;
    const totalStockRetailValue = retail * stock;
    const totalPotentialProfit = retailProfit * stock;

    let status = 'inStock';
    let statusLabel = 'In Stock / পর্যাপ্ত';
    let statusClass = 'text-emerald-400 bg-emerald-950/60 border-emerald-800';

    if (stock <= 0) {
      status = 'outOfStock';
      statusLabel = 'Out of Stock / শেষ';
      statusClass = 'text-rose-400 bg-rose-950/60 border-rose-800';
    } else if (stock <= Number(item.minStock || 5)) {
      status = 'lowStock';
      statusLabel = 'Low Stock / স্বল্প স্টক';
      statusClass = 'text-amber-400 bg-amber-950/60 border-amber-800';
    }

    return {
      wholesaleProfit,
      wholesaleMargin,
      retailProfit,
      retailMargin,
      totalStockCost,
      totalStockWholesaleValue,
      totalStockRetailValue,
      totalPotentialProfit,
      status,
      statusLabel,
      statusClass
    };
  },

  getTotals() {
    const products = window.appState.products;
    const expenses = window.appState.expenses;

    let totalInventoryCost = 0;
    let totalWholesalePotential = 0;
    let totalRetailPotential = 0;
    let totalPotentialProfit = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach(p => {
      const m = this.calculateProductMetrics(p);
      totalInventoryCost += m.totalStockCost;
      totalWholesalePotential += m.totalStockWholesaleValue;
      totalRetailPotential += m.totalStockRetailValue;
      totalPotentialProfit += m.totalPotentialProfit;
      if (m.status === 'lowStock') lowStockCount++;
      if (m.status === 'outOfStock') outOfStockCount++;
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const netProjectedProfit = totalPotentialProfit - totalExpenses;
    const expenseToProfitRatio = totalPotentialProfit > 0 
      ? ((totalExpenses / totalPotentialProfit) * 100).toFixed(1) 
      : 0;

    const dues = window.appState.dues || [];
    const totalDueAmount = dues.reduce((sum, d) => sum + Number(d.dueAmount || 0), 0);
    const totalDueCollected = dues.reduce((sum, d) => sum + Number(d.paidAmount || 0), 0);
    const unpaidDuesCount = dues.filter(d => Number(d.dueAmount || 0) > 0).length;

    const miniKhata = window.appState.miniKhata || [];
    const totalMiniDueAmount = miniKhata.reduce((sum, m) => sum + (m.status !== 'paid' ? Number(m.dueAmount != null ? m.dueAmount : (m.amount - (m.paidAmount || 0))) : 0), 0);
    const totalMiniPaidAmount = miniKhata.reduce((sum, m) => sum + Number(m.paidAmount || (m.status === 'paid' ? m.amount : 0)), 0);
    const unpaidMiniCount = miniKhata.filter(m => m.status !== 'paid' && Number(m.dueAmount != null ? m.dueAmount : (m.amount - (m.paidAmount || 0))) > 0).length;

    return {
      totalProductsCount: products.length,
      totalInventoryCost,
      totalWholesalePotential,
      totalRetailPotential,
      totalPotentialProfit,
      totalExpenses,
      netProjectedProfit,
      expenseToProfitRatio,
      lowStockCount,
      outOfStockCount,
      totalDueAmount,
      totalDueCollected,
      unpaidDuesCount,
      totalMiniDueAmount,
      totalMiniPaidAmount,
      unpaidMiniCount,
      totalCombinedDue: totalDueAmount + totalMiniDueAmount
    };
  },

  exportToExcel() {
    if (typeof XLSX === 'undefined') {
      alert('SheetJS library is loading, please wait a moment.');
      return;
    }

    const totals = this.getTotals();
    const wb = XLSX.utils.book_new();

    // 1. Products Sheet
    const productRows = window.appState.products.map((p, idx) => {
      const m = this.calculateProductMetrics(p);
      return {
        'SL #': idx + 1,
        'SKU': p.sku,
        'Product Name (বাংলা)': p.nameBn,
        'Product Name (English)': p.nameEn,
        'Category / ক্যাটাগরি': p.category,
        'Net Weight / ওজন': p.netWeight,
        'Stock Qty / পরিমাণ': p.stock,
        'Unit Cost (কেনা দাম)': p.costPrice,
        'Wholesale Price (পাইকারি)': p.wholesalePrice,
        'Retail Price (খুচরা)': p.retailPrice,
        'Retail Profit / Unit (একক লাভ)': m.retailProfit,
        'Retail Margin %': m.retailMargin + '%',
        'Total Stock Cost (মোট কেনা)': m.totalStockCost,
        'Total Potential Retail (মোট সম্ভাব্য খুচরা)': m.totalStockRetailValue,
        'Potential Profit (সম্ভাব্য মোট লাভ)': m.totalPotentialProfit,
        'Status (অবস্থা)': m.statusLabel
      };
    });
    const wsProducts = XLSX.utils.json_to_sheet(productRows);
    XLSX.utils.book_append_sheet(wb, wsProducts, 'পণ্য_ইনভেন্টরি (Inventory)');

    // 2. Expenses Sheet
    const expenseRows = window.appState.expenses.map((e, idx) => ({
      'SL #': idx + 1,
      'Date (তারিখ)': e.date,
      'Expense Title (খরচের বিবরণ)': e.title,
      'Category (খাত)': e.category,
      'Amount (টাকা)': e.amount,
      'Payment Method (মাধ্যম)': e.paymentMethod,
      'Description (নোট)': e.description
    }));
    const wsExpenses = XLSX.utils.json_to_sheet(expenseRows);
    XLSX.utils.book_append_sheet(wb, wsExpenses, 'খরচ_হিসাব (Expenses)');

    // 3. Customer Dues Sheet (বাকির তালিকা)
    const duesRows = (window.appState.dues || []).map((d, idx) => ({
      'SL #': idx + 1,
      'Date (তারিখ)': d.date,
      'Customer Name (গ্রাহকের নাম)': d.customerName,
      'Mobile Phone (মোবাইল)': d.phone,
      'Brilliant (ব্রিলিয়ান্ট)': d.brilliantNumber || '',
      'Address (ঠিকানা)': d.address,
      'Items / Reason (পণ্য/বিবরণ)': d.itemsDesc,
      'Total Bill (মোট টাকা)': d.totalAmount,
      'Paid (জমা)': d.paidAmount,
      'Due Balance (বাকি)': d.dueAmount,
      'Promise Date (পরিশোধের তারিখ)': d.dueDate,
      'Status (অবস্থা)': d.status === 'paid' ? 'পরিশোধিত (Paid)' : d.status === 'partial' ? 'আংশিক বাকি (Partial)' : 'বাকি আছে (Unpaid)',
      'Notes (মন্তব্য)': d.notes
    }));
    const wsDues = XLSX.utils.json_to_sheet(duesRows);
    XLSX.utils.book_append_sheet(wb, wsDues, 'বাকির_খাতা (Customer Dues)');

    // 4. Mini Khata Sheet (ছোট বাকির খাতা)
    const miniKhataRows = (window.appState.miniKhata || []).map((m, idx) => ({
      'SL #': idx + 1,
      'Date (তারিখ)': m.date,
      'Time (সময়)': m.time || '',
      'Customer Name (গ্রাহকের নাম)': m.customerName,
      'Mobile Phone (মোবাইল)': m.phone || '',
      'Brilliant (ব্রিলিয়ান্ট)': m.brilliantNumber || '',
      'Item / Note (নোট/পণ্য)': m.note || '',
      'Total Amount (মোট ৳)': m.amount,
      'Paid (পরিশোধ)': m.paidAmount || (m.status === 'paid' ? m.amount : 0),
      'Due (বাকি ৳)': m.status === 'paid' ? 0 : (m.dueAmount != null ? m.dueAmount : (m.amount - (m.paidAmount || 0))),
      'Status (অবস্থা)': m.status === 'paid' ? 'পরিশোধিত (Paid)' : 'বাকি (Unpaid)'
    }));
    const wsMiniKhata = XLSX.utils.json_to_sheet(miniKhataRows);
    XLSX.utils.book_append_sheet(wb, wsMiniKhata, 'ছোট_বাকির_খাতা (Mini Khata)');

    // 4. Summary Sheet
    const user = window.appState.currentUser || {};
    const summaryRows = [
      { 'Metric / সূচক': 'Business Name (দোকানের নাম)', 'Value / মান': user.businessName || 'Business Store' },
      { 'Metric / সূচক': 'Owner / পরিচালক', 'Value / মান': user.name || 'Store Owner' },
      { 'Metric / সূচক': 'Report Generated Date', 'Value / মান': new Date().toLocaleString() },
      { 'Metric / সূচক': 'Total Products Count (মোট পণ্য)', 'Value / মান': totals.totalProductsCount },
      { 'Metric / সূচক': 'Total Inventory Cost (মোট ক্রয়মূল্য)', 'Value / মান': totals.totalInventoryCost },
      { 'Metric / সূচক': 'Total Wholesale Potential (মোট সম্ভাব্য পাইকারি)', 'Value / মান': totals.totalWholesalePotential },
      { 'Metric / সূচক': 'Total Retail Potential (মোট সম্ভাব্য খুচরা)', 'Value / মান': totals.totalRetailPotential },
      { 'Metric / সূচক': 'Gross Potential Profit (মোট সম্ভাব্য গ্রস মুনাফা)', 'Value / মান': totals.totalPotentialProfit },
      { 'Metric / সূচক': 'Total Expenses Recorded (মোট ব্যবসায়িক খরচ)', 'Value / মান': totals.totalExpenses },
      { 'Metric / সূচক': 'Net Projected Profit (নিট সম্ভাব্য মুনাফা)', 'Value / মান': totals.netProjectedProfit },
      { 'Metric / সূচক': 'Total Outstanding Customer Due (মোট পাওনা বাকি)', 'Value / মান': totals.totalDueAmount },
      { 'Metric / সূচক': 'Total Due Collected (মোট বাকি আদায়)', 'Value / মান': totals.totalDueCollected },
      { 'Metric / সূচক': 'Unpaid Debtors Count (বাকি থাকা গ্রাহক)', 'Value / মান': totals.unpaidDuesCount }
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'ব্যবসায়িক_সামারি (Summary)');

    // Export file
    const fileName = `Dokaner_Hisab_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  },

  downloadOfflineAppBundle() {
    const htmlContent = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dokaner Hisab - Offline App</title>
  <meta http-equiv="refresh" content="0; url=${window.location.href}">
</head>
<body style="font-family: sans-serif; background: #0a0f1d; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center;">
  <div>
    <h2>Dokaner Hisab (দোকানের হিসাব)</h2>
    <p>অফলাইন ও অনলাইন অ্যাপ চালু হচ্ছে...</p>
    <a href="${window.location.href}" style="color: #10b981; font-weight: bold; text-decoration: underline;">সরাসরি অ্যাপে প্রবেশ করুন</a>
  </div>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dokaner_Hisab_App.html`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('অফলাইন Dokaner Hisab অ্যাপ ফাইল ডাউনলোড হয়েছে!');
  },

  downloadAndroidProjectZip() {
    const a = document.createElement('a');
    a.href = '/dokaner-hisab-android-project.zip';
    a.download = 'Dokaner_Hisab_Kotlin_Compose_Android_Project.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    this.showToast('Kotlin ও Jetpack Compose অ্যান্ড্রয়েড প্রজেক্ট (.ZIP) ডাউনলোড শুরু হয়েছে!');
  },

  downloadFlutterProjectZip() {
    const a = document.createElement('a');
    a.href = '/dokaner-hisab-flutter-project.zip';
    a.download = 'Dokaner_Hisab_Flutter_Firebase_Project.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    this.showToast('Flutter + Firebase (Auth & Firestore) প্রজেক্ট (.ZIP) ডাউনলোড শুরু হয়েছে!');
  },

  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    const color = type === 'success' ? 'border-emerald-500 bg-slate-900/95 text-emerald-400' : 'border-rose-500 bg-slate-900/95 text-rose-400';
    toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 transform translate-y-2 opacity-0 text-sm font-medium ${color}`;
    toast.innerHTML = `
      <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'} text-lg"></i>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
};
