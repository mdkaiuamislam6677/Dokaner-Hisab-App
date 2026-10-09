// StockFlow Pro - Interactive Chart.js Visualizations
window.AppCharts = {
  renderCharts() {
    this.renderPriceComparisonChart();
    this.renderExpenseBreakdownChart();
  },

  renderPriceComparisonChart() {
    const canvas = document.getElementById('priceComparisonChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (window.appState.charts.comparisonChart) {
      window.appState.charts.comparisonChart.destroy();
    }

    // Take top 7 products
    const displayProducts = window.appState.products.slice(0, 7);
    const labels = displayProducts.map(p => p.nameBn.length > 18 ? p.nameBn.substring(0, 18) + '...' : p.nameBn);
    const costPrices = displayProducts.map(p => p.costPrice);
    const wholesalePrices = displayProducts.map(p => p.wholesalePrice);
    const retailPrices = displayProducts.map(p => p.retailPrice);

    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#94a3b8' : '#475569';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

    const ctx = canvas.getContext('2d');
    window.appState.charts.comparisonChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Cost Price (কেনা দাম)',
            data: costPrices,
            backgroundColor: 'rgba(239, 68, 68, 0.75)',
            borderColor: '#ef4444',
            borderWidth: 1.5,
            borderRadius: 6
          },
          {
            label: 'Wholesale Price (পাইকারি দাম)',
            data: wholesalePrices,
            backgroundColor: 'rgba(59, 130, 246, 0.75)',
            borderColor: '#3b82f6',
            borderWidth: 1.5,
            borderRadius: 6
          },
          {
            label: 'Retail Price (খুচরা দাম)',
            data: retailPrices,
            backgroundColor: 'rgba(16, 185, 129, 0.75)',
            borderColor: '#10b981',
            borderWidth: 1.5,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: textColor,
              font: { family: "'Plus Jakarta Sans', 'Hind Siliguri'", size: 12 }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            padding: 12,
            titleFont: { family: "'Plus Jakarta Sans', 'Hind Siliguri'", size: 13 },
            bodyFont: { family: "'Plus Jakarta Sans'", size: 12 },
            callbacks: {
              label: function(context) {
                const sym = window.appState.settings.currency || '৳';
                return ` ${context.dataset.label}: ${sym} ${context.parsed.y.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: textColor, font: { family: "'Plus Jakarta Sans', 'Hind Siliguri'", size: 11 } },
            grid: { display: false }
          },
          y: {
            ticks: {
              color: textColor,
              callback: function(val) {
                const sym = window.appState.settings.currency || '৳';
                return `${sym} ${val}`;
              }
            },
            grid: { color: gridColor }
          }
        }
      }
    });
  },

  renderExpenseBreakdownChart() {
    const canvas = document.getElementById('expenseBreakdownChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (window.appState.charts.expenseBreakdownChart) {
      window.appState.charts.expenseBreakdownChart.destroy();
    }

    // Aggregate expenses by category
    const categoryTotals = {};
    window.appState.expenses.forEach(e => {
      const cat = e.category || 'Other / অন্যান্য';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(e.amount || 0);
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#94a3b8' : '#475569';

    // Modern vibrant palette
    const bgColors = [
      'rgba(244, 63, 94, 0.8)',
      'rgba(168, 85, 247, 0.8)',
      'rgba(14, 165, 233, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(99, 102, 241, 0.8)',
      'rgba(236, 72, 153, 0.8)'
    ];

    const ctx = canvas.getContext('2d');
    window.appState.charts.expenseBreakdownChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels.length ? labels : ['কোন খরচ রেকর্ড করা হয়নি'],
        datasets: [{
          data: data.length ? data : [1],
          backgroundColor: bgColors,
          borderWidth: 2,
          borderColor: isDark ? '#111827' : '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: textColor,
              boxWidth: 12,
              font: { family: "'Plus Jakarta Sans', 'Hind Siliguri'", size: 11 }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            padding: 12,
            callbacks: {
              label: function(context) {
                const sym = window.appState.settings.currency || '৳';
                const val = context.parsed;
                return ` ${context.label}: ${sym} ${val.toLocaleString()}`;
              }
            }
          }
        }
      }
    });
  }
};
