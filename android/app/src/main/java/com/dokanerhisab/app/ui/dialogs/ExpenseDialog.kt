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
import com.dokanerhisab.app.model.Expense
import com.dokanerhisab.app.theme.*
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun ExpenseDialog(
    initialExpense: Expense? = null,
    onDismiss: () -> Unit,
    onSave: (Expense) -> Unit
) {
    var title by remember { mutableStateOf(initialExpense?.title ?: "") }
    var category by remember { mutableStateOf(initialExpense?.category ?: "দোকান পরিচালনা") }
    var amountStr by remember { mutableStateOf(initialExpense?.amount?.toString() ?: "") }
    var paymentMethod by remember { mutableStateOf(initialExpense?.paymentMethod ?: "নগদ / Cash") }
    var description by remember { mutableStateOf(initialExpense?.description ?: "") }

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
                        text = if (initialExpense == null) "💸 নতুন খরচ যোগ করুন" else "✏️ খরচ সম্পাদনা",
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary,
                        fontSize = 17.sp
                    )
                    IconButton(onClick = onDismiss, modifier = Modifier.size(28.dp)) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "বন্ধ", tint = TextSecondary)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("খরচের বিবরণ / Title *") },
                    modifier = Modifier.fillMaxWidth(),
                    colors = dokanTextFieldColors()
                )

                Spacer(modifier = Modifier.height(10.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = category,
                        onValueChange = { category = it },
                        label = { Text("ক্যাটাগরি") },
                        modifier = Modifier.weight(1f),
                        colors = dokanTextFieldColors()
                    )
                    OutlinedTextField(
                        value = amountStr,
                        onValueChange = { amountStr = it },
                        label = { Text("পরিমাণ (৳) *") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.weight(1f),
                        colors = dokanTextFieldColors()
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = paymentMethod,
                    onValueChange = { paymentMethod = it },
                    label = { Text("পরিশোধের মাধ্যম (নগদ/বিকাশ/ব্যাংক)") },
                    modifier = Modifier.fillMaxWidth(),
                    colors = dokanTextFieldColors()
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("অতিরিক্ত মন্তব্য (ঐচ্ছিক)") },
                    modifier = Modifier.fillMaxWidth(),
                    colors = dokanTextFieldColors()
                )

                Spacer(modifier = Modifier.height(16.dp))

                Button(
                    onClick = {
                        if (title.isNotBlank() && (amountStr.toDoubleOrNull() ?: 0.0) > 0.0) {
                            val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
                            val exp = Expense(
                                id = initialExpense?.id ?: ("exp_" + System.currentTimeMillis()),
                                title = title.trim(),
                                category = category.trim(),
                                amount = amountStr.toDoubleOrNull() ?: 0.0,
                                date = initialExpense?.date ?: today,
                                paymentMethod = paymentMethod.trim(),
                                description = description.trim()
                            )
                            onSave(exp)
                            onDismiss()
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = Emerald600),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = "খরচ সংরক্ষণ করুন",
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }
        }
    }
}
