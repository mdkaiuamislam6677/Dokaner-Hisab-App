package com.dokanerhisab.app.ui.dialogs

import androidx.compose.foundation.background
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
import com.dokanerhisab.app.model.Product
import com.dokanerhisab.app.theme.*
import java.util.UUID

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductDialog(
    initialProduct: Product? = null,
    onDismiss: () -> Unit,
    onSave: (Product) -> Unit
) {
    var nameBn by remember { mutableStateOf(initialProduct?.nameBn ?: "") }
    var nameEn by remember { mutableStateOf(initialProduct?.nameEn ?: "") }
    var category by remember { mutableStateOf(initialProduct?.category ?: "মুদি সামগ্রী") }
    var netWeight by remember { mutableStateOf(initialProduct?.netWeight ?: "") }
    var sku by remember { mutableStateOf(initialProduct?.sku ?: "") }
    var stockStr by remember { mutableStateOf(initialProduct?.stock?.toString() ?: "10") }
    var minStockStr by remember { mutableStateOf(initialProduct?.minStock?.toString() ?: "5") }
    var costPriceStr by remember { mutableStateOf(initialProduct?.costPrice?.toString() ?: "100") }
    var wholesalePriceStr by remember { mutableStateOf(initialProduct?.wholesalePrice?.toString() ?: "115") }
    var retailPriceStr by remember { mutableStateOf(initialProduct?.retailPrice?.toString() ?: "130") }
    var unit by remember { mutableStateOf(initialProduct?.unit ?: "প্যাকেট") }

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
                        text = if (initialProduct == null) "✨ নতুন পণ্য যোগ করুন" else "✏️ পণ্য সম্পাদনা",
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary,
                        fontSize = 18.sp
                    )
                    IconButton(onClick = onDismiss, modifier = Modifier.size(28.dp)) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "বন্ধ", tint = TextSecondary)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Scrollable Form
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedTextField(
                        value = nameBn,
                        onValueChange = { nameBn = it },
                        label = { Text("পণ্যের নাম (বাংলা) *") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = dokanTextFieldColors()
                    )

                    OutlinedTextField(
                        value = nameEn,
                        onValueChange = { nameEn = it },
                        label = { Text("Product Name (English)") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = dokanTextFieldColors()
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        OutlinedTextField(
                            value = category,
                            onValueChange = { category = it },
                            label = { Text("ক্যাটাগরি") },
                            modifier = Modifier.weight(1f),
                            colors = dokanTextFieldColors()
                        )
                        OutlinedTextField(
                            value = unit,
                            onValueChange = { unit = it },
                            label = { Text("একক (কেজি/বোতল)") },
                            modifier = Modifier.weight(1f),
                            colors = dokanTextFieldColors()
                        )
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        OutlinedTextField(
                            value = stockStr,
                            onValueChange = { stockStr = it },
                            label = { Text("বর্তমান স্টক *") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.weight(1f),
                            colors = dokanTextFieldColors()
                        )
                        OutlinedTextField(
                            value = minStockStr,
                            onValueChange = { minStockStr = it },
                            label = { Text("সতর্কতা স্টক (Min)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.weight(1f),
                            colors = dokanTextFieldColors()
                        )
                    }

                    OutlinedTextField(
                        value = costPriceStr,
                        onValueChange = { costPriceStr = it },
                        label = { Text("কেনা মূল্য / Cost (৳) *") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.fillMaxWidth(),
                        colors = dokanTextFieldColors()
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        OutlinedTextField(
                            value = wholesalePriceStr,
                            onValueChange = { wholesalePriceStr = it },
                            label = { Text("পাইকারি মূল্য (৳)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                            modifier = Modifier.weight(1f),
                            colors = dokanTextFieldColors()
                        )
                        OutlinedTextField(
                            value = retailPriceStr,
                            onValueChange = { retailPriceStr = it },
                            label = { Text("খুচরা মূল্য (৳) *") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                            modifier = Modifier.weight(1f),
                            colors = dokanTextFieldColors()
                        )
                    }

                    OutlinedTextField(
                        value = sku,
                        onValueChange = { sku = it },
                        label = { Text("বারকোড / SKU কোড") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = dokanTextFieldColors()
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                Button(
                    onClick = {
                        if (nameBn.isNotBlank()) {
                            val product = Product(
                                id = initialProduct?.id ?: ("prod_" + System.currentTimeMillis()),
                                nameBn = nameBn.trim(),
                                nameEn = nameEn.trim(),
                                sku = sku.trim(),
                                category = category.trim(),
                                netWeight = netWeight.trim(),
                                stock = stockStr.toIntOrNull() ?: 0,
                                minStock = minStockStr.toIntOrNull() ?: 5,
                                costPrice = costPriceStr.toDoubleOrNull() ?: 0.0,
                                wholesalePrice = wholesalePriceStr.toDoubleOrNull() ?: 0.0,
                                retailPrice = retailPriceStr.toDoubleOrNull() ?: 0.0,
                                unit = unit.trim()
                            )
                            onSave(product)
                            onDismiss()
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = Emerald600),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = if (initialProduct == null) "সংরক্ষণ করুন (Save)" else "আপডেট করুন (Update)",
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }
        }
    }
}

@Composable
fun dokanTextFieldColors() = OutlinedTextFieldDefaults.colors(
    focusedBorderColor = Emerald500,
    unfocusedBorderColor = BorderSubtle,
    focusedLabelColor = Emerald500,
    unfocusedLabelColor = TextSecondary,
    focusedTextColor = TextPrimary,
    unfocusedTextColor = TextPrimary,
    focusedContainerColor = SurfaceCardElevated,
    unfocusedContainerColor = SurfaceCardElevated
)
