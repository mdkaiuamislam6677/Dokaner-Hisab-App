package com.dokanerhisab.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dokanerhisab.app.model.Product
import com.dokanerhisab.app.theme.*
import com.dokanerhisab.app.ui.dialogs.ProductDialog
import com.dokanerhisab.app.ui.dialogs.SellDialog
import com.dokanerhisab.app.viewmodel.DokanViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InventoryScreen(
    viewModel: DokanViewModel,
    onOpenVoiceSearch: () -> Unit
) {
    val products by viewModel.filteredProducts.collectAsState()
    val searchQuery by viewModel.productSearchQuery.collectAsState()
    val stockFilter by viewModel.productStockFilter.collectAsState()

    var showAddDialog by remember { mutableStateOf(false) }
    var editingProduct by remember { mutableStateOf<Product?>(null) }
    var sellingProduct by remember { mutableStateOf<Product?>(null) }

    Scaffold(
        containerColor = DarkBg,
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddDialog = true },
                containerColor = Emerald500,
                contentColor = DarkBg,
                shape = CircleShape
            ) {
                Icon(imageVector = Icons.Default.Add, contentDescription = "নতুন পণ্য যোগ")
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp)
        ) {
            Spacer(modifier = Modifier.height(10.dp))

            // Search Bar with Voice Microphone
            Surface(
                color = SurfaceCardElevated,
                shape = RoundedCornerShape(14.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, BorderSubtle),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "সার্চ",
                        tint = Emerald500,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    TextField(
                        value = searchQuery,
                        onValueChange = { viewModel.productSearchQuery.value = it },
                        placeholder = {
                            Text(
                                text = "পণ্য বা ব্র্যান্ড লিখে বা মুখে বলুন...",
                                fontSize = 13.sp,
                                color = TextMuted
                            )
                        },
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = Color.Transparent,
                            unfocusedContainerColor = Color.Transparent,
                            focusedIndicatorColor = Color.Transparent,
                            unfocusedIndicatorColor = Color.Transparent,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        modifier = Modifier.weight(1f)
                    )

                    if (searchQuery.isNotEmpty()) {
                        IconButton(
                            onClick = { viewModel.productSearchQuery.value = "" },
                            modifier = Modifier.size(30.dp)
                        ) {
                            Icon(imageVector = Icons.Default.Clear, contentDescription = "মুছুন", tint = TextSecondary, modifier = Modifier.size(16.dp))
                        }
                    }

                    // Microphone Voice Search Button
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(Emerald600.copy(alpha = 0.25f))
                            .clickable(onClick = onOpenVoiceSearch),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Mic,
                            contentDescription = "ভয়েস সার্চ",
                            tint = Emerald500,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Stock Filter Chips
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                val filters = listOf(
                    "all" to "সকল পণ্য",
                    "inStock" to "পর্যাপ্ত স্টক",
                    "lowStock" to "কম স্টক (সতর্কতা)",
                    "outOfStock" to "স্টক শেষ"
                )
                items(filters) { (key, label) ->
                    val isSelected = stockFilter == key
                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = if (isSelected) Emerald600 else SurfaceCard,
                        border = androidx.compose.foundation.BorderStroke(1.dp, if (isSelected) Emerald500 else BorderSubtle),
                        modifier = Modifier.clickable { viewModel.productStockFilter.value = key }
                    ) {
                        Text(
                            text = label,
                            fontSize = 12.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                            color = if (isSelected) Color.White else TextSecondary,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Product List
            if (products.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize().padding(bottom = 60.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(imageVector = Icons.Default.Inventory2, contentDescription = null, tint = TextMuted, modifier = Modifier.size(48.dp))
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(text = "কোনো পণ্য পাওয়া যায়নি", color = TextSecondary, fontSize = 15.sp)
                    }
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(products, key = { it.id }) { product ->
                        ProductCard(
                            product = product,
                            onSellClick = { sellingProduct = product },
                            onEditClick = { editingProduct = product },
                            onDeleteClick = { viewModel.deleteProduct(product) }
                        )
                    }
                    item {
                        Spacer(modifier = Modifier.height(80.dp))
                    }
                }
            }
        }
    }

    // Add Product Dialog
    if (showAddDialog) {
        ProductDialog(
            initialProduct = null,
            onDismiss = { showAddDialog = false },
            onSave = { viewModel.saveProduct(it) }
        )
    }

    // Edit Product Dialog
    editingProduct?.let { product ->
        ProductDialog(
            initialProduct = product,
            onDismiss = { editingProduct = null },
            onSave = { viewModel.saveProduct(it) }
        )
    }

    // Quick Sell Dialog
    sellingProduct?.let { product ->
        SellDialog(
            product = product,
            onDismiss = { sellingProduct = null },
            onConfirmSell = { qty, priceType, customer ->
                viewModel.quickSellProduct(product, qty, priceType, customer)
            }
        )
    }
}

@Composable
fun ProductCard(
    product: Product,
    onSellClick: () -> Unit,
    onEditClick: () -> Unit,
    onDeleteClick: () -> Unit
) {
    Surface(
        color = SurfaceCard,
        shape = RoundedCornerShape(16.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, BorderSubtle),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            // Header Row: Name & Stock Badge
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = product.nameBn,
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = TextPrimary)
                    )
                    if (product.nameEn.isNotBlank()) {
                        Text(
                            text = product.nameEn,
                            fontSize = 12.sp,
                            color = TextMuted
                        )
                    }
                }

                // Stock Badge
                val (badgeBg, badgeText, badgeColor) = when {
                    product.isOutOfStock -> Triple(Rose500.copy(alpha = 0.2f), "স্টক শেষ", Rose500)
                    product.isLowStock -> Triple(Amber500.copy(alpha = 0.2f), "কম স্টক (${product.stock})", Amber500)
                    else -> Triple(Emerald600.copy(alpha = 0.2f), "${product.stock} ${product.unit}", Emerald500)
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(badgeBg)
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = badgeText,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = badgeColor
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Pricing Grid: Cost, Wholesale, Retail
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(SurfaceCardElevated)
                    .padding(horizontal = 10.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(text = "ক্রয়মূল্য", fontSize = 11.sp, color = TextMuted)
                    Text(text = "৳${product.costPrice}", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                }
                Column {
                    Text(text = "পাইকারি দর", fontSize = 11.sp, color = TextMuted)
                    Text(text = "৳${product.wholesalePrice}", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = Cyan500)
                }
                Column {
                    Text(text = "খুচরা দর", fontSize = 11.sp, color = TextMuted)
                    Text(text = "৳${product.retailPrice}", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = Emerald500)
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Actions: Quick Sell, Edit, Delete
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Button(
                    onClick = onSellClick,
                    enabled = !product.isOutOfStock,
                    colors = ButtonDefaults.buttonColors(containerColor = Emerald600),
                    shape = RoundedCornerShape(10.dp),
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                ) {
                    Icon(imageVector = Icons.Default.ShoppingCart, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(text = "বিক্রি করুন", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                }

                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    IconButton(onClick = onEditClick, modifier = Modifier.size(34.dp)) {
                        Icon(imageVector = Icons.Default.Edit, contentDescription = "এডিট", tint = TextSecondary, modifier = Modifier.size(18.dp))
                    }
                    IconButton(onClick = onDeleteClick, modifier = Modifier.size(34.dp)) {
                        Icon(imageVector = Icons.Default.Delete, contentDescription = "মুছুন", tint = Rose500, modifier = Modifier.size(18.dp))
                    }
                }
            }
        }
    }
}
