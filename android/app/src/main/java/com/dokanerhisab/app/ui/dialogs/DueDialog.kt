package com.dokanerhisab.app.ui.dialogs

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.dokanerhisab.app.model.DueItem
import com.dokanerhisab.app.theme.*
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun DueDialog(
    initialDue: DueItem? = null,
    onDismiss: () -> Unit,
    onSave: (DueItem) -> Unit
) {
    var customerName by remember { mutableStateOf(initialDue?.customerName ?: "") }
    var phone by remember { mutableStateOf(initialDue?.phone ?: "") }
    var brilliantNumber by remember { mutableStateOf(initialDue?.brilliantNumber ?: "") }
    var address by remember { mutableStateOf(initialDue?.address ?: "") }
    var itemsDesc by remember { mutableStateOf(initialDue?.itemsDesc ?: "") }
    var totalAmountStr by remember { mutableStateOf(initialDue?.totalAmount?.toString() ?: "") }
    var paidAmountStr by remember { mutableStateOf(initialDue?.paidAmount?.toString() ?: "0") }
    var dueDate by remember { mutableStateOf(initialDue?.dueDate ?: "") }
    var notes by remember { mutableStateOf(initialDue?.notes ?: "") }

    val totalAmt = totalAmountStr.toDoubleOrNull() ?: 0.0
    val paidAmt = paidAmountStr.toDoubleOrNull() ?: 0.0
    val dueAmt = (totalAmt - paidAmt).coerceAtLeast(0.0)

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = SurfaceCard,
            tonalElevation = 6.dp,
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.85f)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(20.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (initialDue == null) "📝 নতুন বাকির খাতা এন্ট্রি" else "✏️ বাকি হিসাব সম্পাদনা",
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary,
                        fontSize = 17.sp
                    )
                    IconButton(onClick = onDismiss, modifier = Modifier.size(28.dp)) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "বন্ধ", tint = TextSecondary)
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedTextField(
                        value = customerName,
                        onValueChange = { customerName = it },
                        label = { Text("গ্রাহকের নাম (Customer Name) *") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = dokanTextFieldColors()
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        OutlinedTextField(
                            value = phone,
                            onValueChange = { phone = it },
                            label = { Text("মোবাইল নম্বর") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                            modifier = Modifier.weight(1f),
                            colors = dokanTextFieldColors()
                        )
                        OutlinedTextField(
                            value = brilliantNumber,
                            onValueChange = { brilliantNumber = it },
                            label = { Text("ব্রিলিয়ান্ট নম্বর") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                            modifier = Modifier.weight(1f),
                            colors = dokanTextFieldColors()
                        )
                    }

                    OutlinedTextField(
                        value = address,
                        onValueChange = { address = it },
                        label = { Text("ঠিকানা / বাসস্থান") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = dokanTextFieldColors()
                    )

                    OutlinedTextField(
                        value = itemsDesc,
                        onValueChange = { itemsDesc = it },
                        label = { Text("নেওয়া পণ্যের বিবরণ") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = dokanTextFieldColors()
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        OutlinedTextField(
                            value = totalAmountStr,
                            onValueChange = { totalAmountStr = it },
                            label = { Text("মোট টাকা (৳) *") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                            modifier = Modifier.weight(1f),
                            colors = dokanTextFieldColors()
                        )
                        OutlinedTextField(
                            value = paidAmountStr,
                            onValueChange = { paidAmountStr = it },
                            label = { Text("জমা দিয়েছে (৳)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                            modifier = Modifier.weight(1f),
                            colors = dokanTextFieldColors()
                        )
                    }

                    // Live Due Amount preview
                    Surface(
                        color = SurfaceCardElevated,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(text = "অবশিষ্ট বকেয়া:", fontSize = 13.sp, color = TextSecondary)
                            Text(text = "৳$dueAmt", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Rose500)
                        }
                    }

                    OutlinedTextField(
                        value = dueDate,
                        onValueChange = { dueDate = it },
                        label = { Text("পরিশোধের সম্ভাব্য তারিখ (যেমন: 2026-10-15)") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = dokanTextFieldColors()
                    )

                    OutlinedTextField(
                        value = notes,
                        onValueChange = { notes = it },
                        label = { Text("বিশেষ নোট বা প্রতিশ্রুতি") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = dokanTextFieldColors()
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                Button(
                    onClick = {
                        if (customerName.isNotBlank() && totalAmt > 0.0) {
                            val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
                            val due = DueItem(
                                id = initialDue?.id ?: ("due_" + System.currentTimeMillis()),
                                customerName = customerName.trim(),
                                phone = phone.trim(),
                                brilliantNumber = brilliantNumber.trim(),
                                address = address.trim(),
                                itemsDesc = itemsDesc.trim(),
                                totalAmount = totalAmt,
                                paidAmount = paidAmt,
                                dueAmount = dueAmt,
                                date = initialDue?.date ?: today,
                                dueDate = dueDate.trim(),
                                status = if (dueAmt <= 0.0) "paid" else if (paidAmt > 0.0) "partial" else "unpaid",
                                notes = notes.trim()
                            )
                            onSave(due)
                            onDismiss()
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = Emerald600),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = "বাকির খাতা সংরক্ষণ করুন",
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }
        }
    }
}
