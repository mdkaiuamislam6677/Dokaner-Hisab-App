package com.dokanerhisab.app.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "mini_khata")
data class MiniKhataItem(
    @PrimaryKey
    val id: String,
    val customerName: String,
    val phone: String = "",
    val brilliantNumber: String = "",
    val note: String = "",
    val amount: Double = 0.0,
    val paidAmount: Double = 0.0,
    val dueAmount: Double = 0.0,
    val status: String = "unpaid", // "unpaid", "paid"
    val date: String = "",
    val time: String = ""
) {
    val isPaid: Boolean get() = dueAmount <= 0.0 || status == "paid"
}
