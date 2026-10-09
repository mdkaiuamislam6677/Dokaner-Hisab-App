package com.dokanerhisab.app.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "dues")
data class DueItem(
    @PrimaryKey
    val id: String,
    val customerName: String,
    val phone: String = "",
    val brilliantNumber: String = "",
    val address: String = "",
    val itemsDesc: String = "",
    val totalAmount: Double = 0.0,
    val paidAmount: Double = 0.0,
    val dueAmount: Double = 0.0,
    val date: String = "",
    val dueDate: String = "",
    val status: String = "unpaid", // "unpaid", "partial", "paid"
    val notes: String = ""
) {
    val isPaid: Boolean get() = dueAmount <= 0.0 || status == "paid"
}
