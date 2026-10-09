package com.dokanerhisab.app.model

data class AnalyticsSummary(
    val totalProductsCount: Int = 0,
    val totalCostValue: Double = 0.0,
    val totalRetailValue: Double = 0.0,
    val potentialProfit: Double = 0.0,
    val totalExpenses: Double = 0.0,
    val totalDues: Double = 0.0,
    val totalDuesCollected: Double = 0.0,
    val totalMiniKhataDue: Double = 0.0,
    val inStockCount: Int = 0,
    val lowStockCount: Int = 0,
    val outOfStockCount: Int = 0
)
