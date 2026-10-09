// StockFlow Pro - Dynamic Business Advice & Smart Expense Control Engine
window.AppTips = {
  generateTips() {
    const totals = window.AppUtils.getTotals();
    const tips = [];

    // 1. Profit vs Expense Ratio Analysis
    const ratio = Number(totals.expenseToProfitRatio);
    if (totals.totalPotentialProfit === 0 && totals.totalExpenses > 0) {
      tips.push({
        type: 'critical',
        badge: 'সংকটপূর্ণ / Critical Risk',
        icon: 'fa-triangle-exclamation',
        titleBn: 'কোন সম্ভাব্য গ্রস মুনাফা নেই অথচ ব্যয় অব্যাহত!',
        titleEn: 'Zero Profit Potential with Active Expenses',
        descBn: 'আপনার ইনভেন্টরিতে বিক্রয়যোগ্য লাভযুক্ত পণ্য নেই কিন্তু ব্যবসায় খরচ চলছে। অবিলম্বে নতুন পণ্য যুক্ত করুন।',
        descEn: 'Your inventory has no profit margin margin but expenses are running. Restock fast.',
        action: 'Add New Products / পণ্য যুক্ত করুন',
        tabTarget: 'inventory'
      });
    } else if (ratio > 70) {
      tips.push({
        type: 'warning',
        badge: 'উচ্চ ব্যয় ঝুঁকি / High Expense Alert',
        icon: 'fa-circle-exclamation',
        titleBn: `মোট সম্ভাব্য লাভের ${ratio}% খরচেই চলে যাচ্ছে!`,
        titleEn: `Operating expenses consume ${ratio}% of gross profit!`,
        descBn: 'আপনার বর্তমান খরচ সীমা অতিক্রম করছে। দোকান ভাড়া, অপ্রয়োজনীয় প্যাকেজিং বা বিদ্যুৎ খরচ কমিয়ে আনুন।',
        descEn: 'Expenses are eating away majority of your margins. Re-negotiate vendor rates or optimize electricity.',
        action: 'Audit Expenses / খরচ অডিট করুন',
        tabTarget: 'expenses'
      });
    } else if (ratio < 30) {
      tips.push({
        type: 'healthy',
        badge: 'উৎকৃষ্ট অনুপাত / Healthy Margins',
        icon: 'fa-shield-halved',
        titleBn: 'চমৎকার খরচ নিয়ন্ত্রণ! মুনাফার অনুপাত খুবই শক্তিশালী।',
        titleEn: 'Excellent Financial Health! Profit-to-expense ratio is optimal.',
        descBn: `আপনার খরচের অনুপাত মাত্র ${ratio}%, যা ব্যবসার জন্য অত্যন্ত স্বাস্থ্যকর ও নিরাপদ ক্যাশ-ফ্লো নির্দেশ করে।`,
        descEn: `Expenses account for only ${ratio}% of profit potential. Strong business buffer.`,
        action: 'Keep It Up / বজায় রাখুন',
        tabTarget: 'analytics'
      });
    } else {
      tips.push({
        type: 'info',
        badge: 'নিয়ন্ত্রণে আছে / Balanced',
        icon: 'fa-scale-balanced',
        titleBn: `খরচ ও মুনাফার ভারসাম্য স্বাভাবিক (${ratio}%)`,
        titleEn: `Balanced Expense to Profit Ratio (${ratio}%)`,
        descBn: 'আপনার দৈনন্দিন খরচ সন্তোষজনক সীমায় রয়েছে। পাইকারি বিক্রয়ে কিছু ছাড় দিয়ে ক্যাশ দ্রুত রোল করতে পারেন।',
        descEn: 'Your business operational costs are normal. Consider bulk discount to accelerate turnover.',
        action: 'View Analytics / অ্যানালিটিক্স দেখুন',
        tabTarget: 'analytics'
      });
    }

    // 2. Stock Health Alerts
    if (totals.outOfStockCount > 0) {
      tips.push({
        type: 'danger',
        badge: 'স্টক শেষ / Out of Stock',
        icon: 'fa-box-open',
        titleBn: `${totals.outOfStockCount} টি পণ্যের স্টক সম্পূর্ণ শূন্য!`,
        titleEn: `${totals.outOfStockCount} Items are Out of Stock`,
        descBn: 'স্টক শূন্য থাকার কারণে আপনি কাস্টমার হারাচ্ছেন। সবচেয়ে বিক্রিত পণ্যের দ্রুত অর্ডার দিন।',
        descEn: 'Customers are turning away due to zero inventory on key items. Restock immediately.',
        action: 'View Out of Stock / স্টক দেখুন',
        tabTarget: 'inventory'
      });
    }

    if (totals.lowStockCount > 0) {
      tips.push({
        type: 'warning',
        badge: 'স্বল্প স্টক সতর্কতা / Low Stock Alert',
        icon: 'fa-bell',
        titleBn: `${totals.lowStockCount} টি পণ্য দ্রুত শেষ হয়ে আসছে!`,
        titleEn: `${totals.lowStockCount} Items Below Threshold`,
        descBn: 'নির্ধারিত সতর্কতা সীমার নিচে থাকা পণ্যগুলোর সরবরাহকারীর সাথে কথা বলে ক্রয়মূল্যে দরদাম করুন।',
        descEn: 'Items below threshold. Contact suppliers early to secure better wholesale pricing.',
        action: 'Check Stock / স্টক পর্যবেক্ষণ',
        tabTarget: 'inventory'
      });
    }

    // 3. Profit Margin Optimization
    const lowMarginProducts = window.appState.products.filter(p => {
      const m = window.AppUtils.calculateProductMetrics(p);
      return Number(m.retailMargin) < 12;
    });

    if (lowMarginProducts.length > 0) {
      tips.push({
        type: 'strategy',
        badge: 'মূল্য নির্ধারণ কৌশল / Pricing Strategy',
        icon: 'fa-chart-line',
        titleBn: `${lowMarginProducts.length} টি পণ্যে খুচরা লাভ ১২% এর কম!`,
        titleEn: `${lowMarginProducts.length} Products Have Low Profit Margin (< 12%)`,
        descBn: `"${lowMarginProducts[0].nameBn}" সহ কিছু পণ্যে মার্জিন কম। খুচরা বিক্রয়মূল্য সামান্য বৃদ্ধি অথবা সাপ্লায়ার থেকে ডিসকাউন্ট নেওয়ার চেষ্টা করুন।`,
        descEn: 'Low markup on retail items. Negotiate volume rebate with distributor or adjust retail tag.',
        action: 'Adjust Pricing / দাম পরিবর্তন করুন',
        tabTarget: 'inventory'
      });
    }

    // 4. Smart Expense Category Tips
    const categoryTotals = {};
    window.appState.expenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount || 0);
    });
    let topCat = null;
    let maxExpense = 0;
    for (const [cat, amt] of Object.entries(categoryTotals)) {
      if (amt > maxExpense) {
        maxExpense = amt;
        topCat = cat;
      }
    }

    if (topCat && maxExpense > 0) {
      tips.push({
        type: 'optimization',
        badge: 'ব্যয় অপটিমাইজেশন / Expense Control',
        icon: 'fa-receipt',
        titleBn: `সর্বোচ্চ খরচের খাত: "${topCat}" (${window.AppUtils.formatMoney(maxExpense)})`,
        titleEn: `Highest Expense Category: ${topCat}`,
        descBn: 'এই নির্দিষ্ট খাতে খরচের পরিমাণ সবচেয়ে বেশি। ডিজিটাল পেমেন্ট বা সাবস্ক্রিপশন প্ল্যানের মাধ্যমে সাশ্রয়ী প্যাকেজ বেছে নিন।',
        descEn: 'Review invoices in this category to eliminate unneeded line items or seek periodic billing discounts.',
        action: 'Review Expenses / খরচ হিসাব দেখুন',
        tabTarget: 'expenses'
      });
    }

    return tips;
  }
};
