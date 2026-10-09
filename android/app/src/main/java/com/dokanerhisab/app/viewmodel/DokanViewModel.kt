package com.dokanerhisab.app.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.dokanerhisab.app.DokanApp
import com.dokanerhisab.app.data.DefaultSeedData
import com.dokanerhisab.app.model.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

enum class AppTab(val titleBn: String) {
    INVENTORY("ইনভেন্টরি"),
    EXPENSES("খরচ"),
    DUES("বাকির খাতা"),
    MINI_KHATA("ছোট বাকি"),
    ANALYTICS("অ্যানালিটিক্স"),
    TIPS("টিপস")
}

class DokanViewModel(application: Application) : AndroidViewModel(application) {
    private val db = (application as DokanApp).database
    private val productDao = db.productDao()
    private val expenseDao = db.expenseDao()
    private val dueDao = db.dueDao()
    private val miniKhataDao = db.miniKhataDao()

    // Current Tab
    private val _currentTab = MutableStateFlow(AppTab.INVENTORY)
    val currentTab: StateFlow<AppTab> = _currentTab.asStateFlow()

    fun setTab(tab: AppTab) {
        _currentTab.value = tab
    }

    // Current User Profile (No hardcoded automatic account - defaults to empty/unconfigured)
    private val prefs = application.getSharedPreferences("dokan_prefs", android.content.Context.MODE_PRIVATE)

    private val _userAccount = MutableStateFlow(loadAccountFromPrefs())
    val userAccount: StateFlow<Account> = _userAccount.asStateFlow()

    private fun loadAccountFromPrefs(): Account {
        val bName = prefs.getString("businessName", "") ?: ""
        val oName = prefs.getString("ownerName", "") ?: ""
        val phone = prefs.getString("phone", "") ?: ""
        val brilliant = prefs.getString("brilliantNumber", "") ?: ""
        val pin = prefs.getString("pin", "") ?: ""
        val isSetup = prefs.getBoolean("isSetup", false)
        return Account(
            id = if (isSetup) "user_local" else "",
            name = oName,
            phone = phone,
            businessName = bName,
            brilliantNumber = brilliant,
            pin = pin,
            isSetup = isSetup
        )
    }

    fun saveUserAccount(name: String, businessName: String, phone: String, brilliantNumber: String, pin: String = "") {
        prefs.edit()
            .putString("ownerName", name)
            .putString("businessName", businessName)
            .putString("phone", phone)
            .putString("brilliantNumber", brilliantNumber)
            .putString("pin", pin)
            .putBoolean("isSetup", true)
            .apply()
        _userAccount.value = Account(
            id = "user_local",
            name = name,
            phone = phone,
            businessName = businessName,
            brilliantNumber = brilliantNumber,
            pin = pin,
            isSetup = true
        )
    }

    fun resetPin(newPin: String): Boolean {
        prefs.edit().putString("pin", newPin).apply()
        _userAccount.value = _userAccount.value.copy(pin = newPin)
        return true
    }

    fun clearUserAccount() {
        prefs.edit().clear().apply()
        _userAccount.value = Account()
    }

    // Database raw flows
    val rawProducts: StateFlow<List<Product>> = productDao.getAllProducts()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val rawExpenses: StateFlow<List<Expense>> = expenseDao.getAllExpenses()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val rawDues: StateFlow<List<DueItem>> = dueDao.getAllDues()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val rawMiniKhata: StateFlow<List<MiniKhataItem>> = miniKhataDao.getAllMiniKhata()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    init {
        // Clean start: Purge any legacy demo data and ensure empty fresh database
        viewModelScope.launch {
            productDao.clearDemoProducts()
            expenseDao.clearDemoExpenses()
            dueDao.clearDemoDues()
            miniKhataDao.clearDemoMiniKhata()
        }
    }

    // --- Search & Filters ---
    val productSearchQuery = MutableStateFlow("")
    val productStockFilter = MutableStateFlow("all") // "all", "inStock", "lowStock", "outOfStock"
    val productCategoryFilter = MutableStateFlow("all")

    val dueSearchQuery = MutableStateFlow("")
    val dueStatusFilter = MutableStateFlow("all") // "all", "unpaid", "paid"

    val miniKhataSearchQuery = MutableStateFlow("")
    val miniKhataStatusFilter = MutableStateFlow("all") // "all", "unpaid", "paid"

    // Filtered Products
    val filteredProducts: StateFlow<List<Product>> = combine(
        rawProducts,
        productSearchQuery,
        productStockFilter,
        productCategoryFilter
    ) { products, query, stockFilter, catFilter ->
        products.filter { p ->
            val matchesQuery = query.isBlank() ||
                p.nameBn.contains(query, ignoreCase = true) ||
                p.nameEn.contains(query, ignoreCase = true) ||
                p.sku.contains(query, ignoreCase = true) ||
                p.category.contains(query, ignoreCase = true)

            val matchesStock = when (stockFilter) {
                "inStock" -> p.stock > p.minStock
                "lowStock" -> p.isLowStock
                "outOfStock" -> p.isOutOfStock
                else -> true
            }

            val matchesCat = catFilter == "all" || p.category == catFilter

            matchesQuery && matchesStock && matchesCat
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Filtered Dues
    val filteredDues: StateFlow<List<DueItem>> = combine(
        rawDues,
        dueSearchQuery,
        dueStatusFilter
    ) { dues, query, filter ->
        dues.filter { d ->
            val matchesQuery = query.isBlank() ||
                d.customerName.contains(query, ignoreCase = true) ||
                d.phone.contains(query, ignoreCase = true) ||
                d.brilliantNumber.contains(query, ignoreCase = true) ||
                d.itemsDesc.contains(query, ignoreCase = true)

            val matchesStatus = when (filter) {
                "unpaid" -> !d.isPaid
                "paid" -> d.isPaid
                else -> true
            }

            matchesQuery && matchesStatus
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Filtered Mini Khata
    val filteredMiniKhata: StateFlow<List<MiniKhataItem>> = combine(
        rawMiniKhata,
        miniKhataSearchQuery,
        miniKhataStatusFilter
    ) { items, query, filter ->
        items.filter { item ->
            val matchesQuery = query.isBlank() ||
                item.customerName.contains(query, ignoreCase = true) ||
                item.phone.contains(query, ignoreCase = true) ||
                item.note.contains(query, ignoreCase = true)

            val matchesStatus = when (filter) {
                "unpaid" -> !item.isPaid
                "paid" -> item.isPaid
                else -> true
            }

            matchesQuery && matchesStatus
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Analytics Summary
    val analyticsSummary: StateFlow<AnalyticsSummary> = combine(
        rawProducts,
        rawExpenses,
        rawDues,
        rawMiniKhata
    ) { products, expenses, dues, miniKhataList ->
        val totalCost = products.sumOf { it.totalCostValue }
        val totalRetail = products.sumOf { it.totalRetailValue }
        val potentialProfit = totalRetail - totalCost
        val totalExp = expenses.sumOf { it.amount }
        val totalDuesAmt = dues.filter { !it.isPaid }.sumOf { it.dueAmount }
        val totalDuesCollected = dues.sumOf { it.paidAmount }
        val totalMiniDueAmt = miniKhataList.filter { !it.isPaid }.sumOf { it.dueAmount }

        AnalyticsSummary(
            totalProductsCount = products.size,
            totalCostValue = totalCost,
            totalRetailValue = totalRetail,
            potentialProfit = potentialProfit,
            totalExpenses = totalExp,
            totalDues = totalDuesAmt,
            totalDuesCollected = totalDuesCollected,
            totalMiniKhataDue = totalMiniDueAmt,
            inStockCount = products.count { it.stock > it.minStock },
            lowStockCount = products.count { it.isLowStock },
            outOfStockCount = products.count { it.isOutOfStock }
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), AnalyticsSummary())

    // --- Product CRUD Actions ---
    fun saveProduct(product: Product) {
        viewModelScope.launch {
            productDao.insertOrUpdate(product)
        }
    }

    fun deleteProduct(product: Product) {
        viewModelScope.launch {
            productDao.delete(product)
        }
    }

    fun quickSellProduct(product: Product, quantity: Int, priceType: String, customerName: String) {
        viewModelScope.launch {
            if (product.stock >= quantity) {
                val newStock = product.stock - quantity
                productDao.insertOrUpdate(product.copy(stock = newStock))
            }
        }
    }

    // --- Expense Actions ---
    fun saveExpense(expense: Expense) {
        viewModelScope.launch {
            expenseDao.insertOrUpdate(expense)
        }
    }

    fun deleteExpense(expense: Expense) {
        viewModelScope.launch {
            expenseDao.delete(expense)
        }
    }

    // --- Due Actions ---
    fun saveDue(due: DueItem) {
        viewModelScope.launch {
            dueDao.insertOrUpdate(due)
        }
    }

    fun recordDuePayment(dueId: String, amount: Double) {
        viewModelScope.launch {
            dueDao.recordPayment(dueId, amount)
        }
    }

    fun deleteDue(due: DueItem) {
        viewModelScope.launch {
            dueDao.delete(due)
        }
    }

    // --- Mini Khata Actions ---
    fun saveMiniKhata(item: MiniKhataItem) {
        viewModelScope.launch {
            miniKhataDao.insertOrUpdate(item)
        }
    }

    fun markMiniKhataPaid(id: String) {
        viewModelScope.launch {
            miniKhataDao.markAsPaid(id)
        }
    }

    fun deleteMiniKhata(item: MiniKhataItem) {
        viewModelScope.launch {
            miniKhataDao.delete(item)
        }
    }

    // --- Calculator State ---
    val calcDisplay = MutableStateFlow("0")
    val calcFormula = MutableStateFlow("")
    val calcHistory = MutableStateFlow<List<String>>(emptyList())

    fun onCalcInput(key: String) {
        when (key) {
            "C" -> {
                calcDisplay.value = "0"
                calcFormula.value = ""
            }
            "=" -> {
                try {
                    val expr = calcFormula.value + calcDisplay.value
                    val res = evaluateSimpleMath(expr)
                    val historyEntry = "$expr = $res"
                    calcHistory.value = listOf(historyEntry) + calcHistory.value.take(4)
                    calcDisplay.value = res.toString()
                    calcFormula.value = ""
                } catch (e: Exception) {
                    calcDisplay.value = "Error"
                }
            }
            "+", "-", "*", "/" -> {
                calcFormula.value = calcDisplay.value + " " + key + " "
                calcDisplay.value = "0"
            }
            else -> {
                if (calcDisplay.value == "0") {
                    calcDisplay.value = key
                } else {
                    calcDisplay.value += key
                }
            }
        }
    }

    private fun evaluateSimpleMath(expr: String): Double {
        val parts = expr.split(" ")
        if (parts.size == 3) {
            val a = parts[0].toDoubleOrNull() ?: 0.0
            val op = parts[1]
            val b = parts[2].toDoubleOrNull() ?: 0.0
            return when (op) {
                "+" -> a + b
                "-" -> a - b
                "*" -> a * b
                "/" -> if (b != 0.0) a / b else 0.0
                else -> a
            }
        }
        return expr.toDoubleOrNull() ?: 0.0
    }

    fun applyVoiceTranscript(target: String, transcript: String) {
        when (target) {
            "inventory" -> productSearchQuery.value = transcript
            "dues" -> dueSearchQuery.value = transcript
            "miniKhata" -> miniKhataSearchQuery.value = transcript
            else -> {
                productSearchQuery.value = transcript
                _currentTab.value = AppTab.INVENTORY
            }
        }
    }
}
