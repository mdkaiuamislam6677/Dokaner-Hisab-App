package com.dokanerhisab.app.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "expenses")
data class Expense(
    @PrimaryKey
    val id: String,
    val title: String,
    val category: String = "অন্যান্য",
    val amount: Double = 0.0,
    val date: String = "",
    val paymentMethod: String = "নগদ / Cash",
    val description: String = ""
)
