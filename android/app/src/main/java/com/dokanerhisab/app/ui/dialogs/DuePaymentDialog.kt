package com.dokanerhisab.app.ui.dialogs

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
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

@Composable
fun DuePaymentDialog(
    dueItem: DueItem,
    onDismiss: () -> Unit,
    onConfirmPayment: (amount: Double) -> Unit
) {
    var paymentAmountStr by remember { mutableStateOf(dueItem.dueAmount.toString()) }
    val payAmount = paymentAmountStr.toDoubleOrNull() ?: 0.0

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = SurfaceCard,
            tonalElevation = 6.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(20.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "💰 বকেয়া টাকা জমা নিন",
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary,
                        fontSize = 17.sp
                    )
                    IconButton(onClick = onDismiss, modifier = Modifier.size(28.dp)) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "বন্ধ", tint = TextSecondary)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Surface(
                    color = SurfaceCardElevated,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text(
                            text = dueItem.customerName,
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp,
                            color = TextPrimary
                        )
                        if (dueItem.phone.isNotBlank()) {
                            Text(text = "মোবাইল: ${dueItem.phone}", fontSize = 12.sp, color = TextSecondary)
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Row(
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(text = "বর্তমান বাকি:", fontSize = 13.sp, color = TextSecondary)
                            Text(text = "৳${dueItem.dueAmount}", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Rose500)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                OutlinedTextField(
                    value = paymentAmountStr,
                    onValueChange = { paymentAmountStr = it },
                    label = { Text("জমা গ্রহণের পরিমাণ (৳) *") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    modifier = Modifier.fillMaxWidth(),
                    colors = dokanTextFieldColors()
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Remaining Preview
                val remaining = (dueItem.dueAmount - payAmount).coerceAtLeast(0.0)
                Surface(
                    color = DarkBg,
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "জমা পরবর্তী অবশিষ্ট বাকি:", fontSize = 12.sp, color = TextSecondary)
                        Text(
                            text = if (remaining <= 0.0) "পরিশোধিত (০ ৳)" else "৳$remaining",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (remaining <= 0.0) Emerald500 else Amber500
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Button(
                    onClick = {
                        if (payAmount > 0.0) {
                            onConfirmPayment(payAmount)
                            onDismiss()
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = Emerald600),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = "জমা নিশ্চিত করুন (Confirm Payment)",
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }
        }
    }
}
