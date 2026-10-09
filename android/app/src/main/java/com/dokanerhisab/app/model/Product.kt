package com.dokanerhisab.app.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "products")
data class Product(
    @PrimaryKey
    val id: String,
    val nameBn: String,
    val nameEn: String = "",
    val sku: String = "",
    val category: String = "মুদি সামগ্রী",
    val netWeight: String = "",
    val stock: Int = 0,
    val minStock: Int = 5,
    val costPrice: Double = 0.0,
    val wholesalePrice: Double = 0.0,
    val retailPrice: Double = 0.0,
    val unit: String = "প্যাকেট"
) {
    val totalCostValue: Double get() = stock * costPrice
    val totalRetailValue: Double get() = stock * retailPrice
    val potentialProfit: Double get() = totalRetailValue - totalCostValue
    val isOutOfStock: Boolean get() = stock <= 0
    val isLowStock: Boolean get() = stock > 0 && stock <= minStock
}
