package com.dokanerhisab.app.ui.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.dokanerhisab.app.model.Product
import com.dokanerhisab.app.theme.*

@Composable
fun SellDialog(
    product: Product,
    onDismiss: () -> Unit,
    onConfirmSell: (quantity: Int, priceType: String, customer: String) -> Unit
) {
    var quantityStr by remember { mutableStateOf("1") }
    var priceType by remember { mutableStateOf("retail") } // "retail" or "wholesale"
    var customerName by remember { mutableStateOf("") }

    val qty = quantityStr.toIntOrNull() ?: 1
    val unitPrice = if (priceType == "retail") product.retailPrice else product.wholesalePrice
    val totalBill = qty * unitPrice
    val profit = (unitPrice - product.costPrice) * qty

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
                        text = "🛒 দ্রুত বিক্রয় (Quick Sell)",
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary,
                        fontSize = 17.sp
                    )
                    IconButton(onClick = onDismiss, modifier = Modifier.size(28.dp)) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "বন্ধ", tint = TextSecondary)
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Product Preview Card
                Surface(
                    color = SurfaceCardElevated,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(
                            text = product.nameBn,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary,
                            fontSize = 15.sp
                        )
                        Row(
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth().padding(top = 4.dp)
                        ) {
                            Text(text = "মজুদ: ${product.stock} ${product.unit}", fontSize = 12.sp, color = Emerald500)
                            Text(text = "কেনা: ৳${product.costPrice}", fontSize = 12.sp, color = TextSecondary)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Rate Type Selector
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Retail Rate Button
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (priceType == "retail") Emerald600 else SurfaceCardElevated)
                            .clickable { priceType = "retail" }
                            .padding(vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = "খুচরা দর",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (priceType == "retail") Color.White else TextSecondary
                            )
                            Text(
                                text = "৳${product.retailPrice}",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (priceType == "retail") Color.White else Emerald500
                            )
                        }
                    }

                    // Wholesale Rate Button
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (priceType == "wholesale") Cyan500 else SurfaceCardElevated)
                            .clickable { priceType = "wholesale" }
                            .padding(vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = "পাইকারি দর",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (priceType == "wholesale") DarkBg else TextSecondary
                            )
                            Text(
                                text = "৳${product.wholesalePrice}",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (priceType == "wholesale") DarkBg else Cyan500
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Quantity Input
                OutlinedTextField(
                    value = quantityStr,
                    onValueChange = { quantityStr = it },
                    label = { Text("বিক্রয়ের পরিমাণ (${product.unit})") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth(),
                    colors = dokanTextFieldColors()
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = customerName,
                    onValueChange = { customerName = it },
                    label = { Text("ক্রেতার নাম (ঐচ্ছিক)") },
                    modifier = Modifier.fillMaxWidth(),
                    colors = dokanTextFieldColors()
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Summary
                Surface(
                    color = DarkBg,
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(text = "মোট মূল্য:", fontSize = 12.sp, color = TextSecondary)
                            Text(text = "৳$totalBill", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Emerald500)
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text(text = "লাভ হবে:", fontSize = 12.sp, color = TextSecondary)
                            Text(text = "+৳$profit", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Cyan500)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Button(
                    onClick = {
                        if (qty > 0 && product.stock >= qty) {
                            onConfirmSell(qty, priceType, customerName.trim())
                            onDismiss()
                        }
                    },
                    enabled = qty > 0 && product.stock >= qty,
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = Emerald600),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = if (product.stock >= qty) "বিক্রয় নিশ্চিত করুন" else "পর্যাপ্ত স্টক নেই",
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }
        }
    }
}
