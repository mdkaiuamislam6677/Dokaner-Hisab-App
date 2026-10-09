package com.dokanerhisab.app.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dokanerhisab.app.model.DueItem
import com.dokanerhisab.app.theme.*
import com.dokanerhisab.app.ui.dialogs.DueDialog
import com.dokanerhisab.app.ui.dialogs.DuePaymentDialog
import com.dokanerhisab.app.viewmodel.DokanViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DuesScreen(
    viewModel: DokanViewModel,
    onOpenVoiceSearch: () -> Unit
) {
    val dues by viewModel.filteredDues.collectAsState()
    val searchQuery by viewModel.dueSearchQuery.collectAsState()
    val statusFilter by viewModel.dueStatusFilter.collectAsState()
    val context = LocalContext.current

    var showAddDialog by remember { mutableStateOf(false) }
    var editingDue by remember { mutableStateOf<DueItem?>(null) }
    var payingDue by remember { mutableStateOf<DueItem?>(null) }

    val totalDueAmount = dues.filter { !it.isPaid }.sumOf { it.dueAmount }

    Scaffold(
        containerColor = DarkBg,
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddDialog = true },
                containerColor = Emerald500,
                contentColor = DarkBg,
                shape = CircleShape
            ) {
                Icon(imageVector = Icons.Default.Add, contentDescription = "নতুন বাকি এন্ট্রি")
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

            // Due Banner
            Surface(
                color = SurfaceCard,
                shape = RoundedCornerShape(16.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, Rose500.copy(alpha = 0.3f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(text = "মোট অনাদায়ী বকেয়া (Unpaid Dues)", fontSize = 13.sp, color = TextSecondary)
                        Text(
                            text = "৳$totalDueAmount",
                            fontSize = 26.sp,
                            fontWeight = FontWeight.Bold,
                            color = Rose500
                        )
                    }
                    Box(
                        modifier = Modifier
                            .size(46.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(Rose500.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(imageVector = Icons.Default.Receipt, contentDescription = null, tint = Rose500, modifier = Modifier.size(24.dp))
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Search Bar
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
                    Icon(imageVector = Icons.Default.Search, contentDescription = "সার্চ", tint = Cyan500, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    TextField(
                        value = searchQuery,
                        onValueChange = { viewModel.dueSearchQuery.value = it },
                        placeholder = {
                            Text(text = "গ্রাহকের নাম বা মোবাইল লিখে খুঁজুন...", fontSize = 13.sp, color = TextMuted)
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

                    // Microphone Button
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(Emerald600.copy(alpha = 0.25f))
                            .clickable(onClick = onOpenVoiceSearch),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(imageVector = Icons.Default.Mic, contentDescription = "ভয়েস", tint = Emerald500, modifier = Modifier.size(18.dp))
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Status Filter Chips
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                val filters = listOf(
                    "all" to "সকল বাকি",
                    "unpaid" to "বকেয়া আছে",
                    "paid" to "পরিশোধিত"
                )
                items(filters) { (key, label) ->
                    val isSelected = statusFilter == key
                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = if (isSelected) Emerald600 else SurfaceCard,
                        border = androidx.compose.foundation.BorderStroke(1.dp, if (isSelected) Emerald500 else BorderSubtle),
                        modifier = Modifier.clickable { viewModel.dueStatusFilter.value = key }
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

            // Dues List
            if (dues.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize().padding(bottom = 60.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = "কোনো বাকির খাতা পাওয়া যায়নি", color = TextSecondary, fontSize = 14.sp)
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(dues, key = { it.id }) { due ->
                        DueCard(
                            due = due,
                            onCallCustomer = { phone ->
                                val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:$phone"))
                                context.startActivity(intent)
                            },
                            onRecordPayment = { payingDue = due },
                            onEditClick = { editingDue = due },
                            onDeleteClick = { viewModel.deleteDue(due) }
                        )
                    }
                    item {
                        Spacer(modifier = Modifier.height(80.dp))
                    }
                }
            }
        }
    }

    if (showAddDialog) {
        DueDialog(
            initialDue = null,
            onDismiss = { showAddDialog = false },
            onSave = { viewModel.saveDue(it) }
        )
    }

    editingDue?.let { due ->
        DueDialog(
            initialDue = due,
            onDismiss = { editingDue = null },
            onSave = { viewModel.saveDue(it) }
        )
    }

    payingDue?.let { due ->
        DuePaymentDialog(
            dueItem = due,
            onDismiss = { payingDue = null },
            onConfirmPayment = { amt -> viewModel.recordDuePayment(due.id, amt) }
        )
    }
}

@Composable
fun DueCard(
    due: DueItem,
    onCallCustomer: (String) -> Unit,
    onRecordPayment: () -> Unit,
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
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = due.customerName,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = TextPrimary
                    )
                    if (due.phone.isNotBlank()) {
                        Text(text = "মোবাইল: ${due.phone}", fontSize = 12.sp, color = Cyan500)
                    }
                    if (due.brilliantNumber.isNotBlank()) {
                        Text(text = "ব্রিলিয়ান্ট: ${due.brilliantNumber}", fontSize = 12.sp, color = Emerald500)
                    }
                }

                // Status Chip
                val (badgeBg, badgeText, badgeColor) = if (due.isPaid) {
                    Triple(Emerald600.copy(alpha = 0.2f), "পরিশোধিত", Emerald500)
                } else {
                    Triple(Rose500.copy(alpha = 0.2f), "বাকি: ৳${due.dueAmount}", Rose500)
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(badgeBg)
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(text = badgeText, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = badgeColor)
                }
            }

            if (due.itemsDesc.isNotBlank()) {
                Spacer(modifier = Modifier.height(6.dp))
                Text(text = "পণ্য: ${due.itemsDesc}", fontSize = 13.sp, color = TextSecondary)
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Financial Summary
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(SurfaceCardElevated)
                    .padding(horizontal = 10.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(text = "মোট বিল", fontSize = 11.sp, color = TextMuted)
                    Text(text = "৳${due.totalAmount}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                }
                Column {
                    Text(text = "জমা হয়েছে", fontSize = 11.sp, color = TextMuted)
                    Text(text = "৳${due.paidAmount}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Emerald500)
                }
                Column {
                    Text(text = "বর্তমান বাকি", fontSize = 11.sp, color = TextMuted)
                    Text(text = "৳${due.dueAmount}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Rose500)
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    if (!due.isPaid) {
                        Button(
                            onClick = onRecordPayment,
                            colors = ButtonDefaults.buttonColors(containerColor = Emerald600),
                            shape = RoundedCornerShape(10.dp),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Text(text = "জমা নিন", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    if (due.phone.isNotBlank()) {
                        OutlinedButton(
                            onClick = { onCallCustomer(due.phone) },
                            shape = RoundedCornerShape(10.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Cyan500),
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Icon(imageVector = Icons.Default.Call, contentDescription = "কল", tint = Cyan500, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(text = "কল", fontSize = 12.sp, color = Cyan500)
                        }
                    }
                }

                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    IconButton(onClick = onEditClick, modifier = Modifier.size(32.dp)) {
                        Icon(imageVector = Icons.Default.Edit, contentDescription = "এডিট", tint = TextSecondary, modifier = Modifier.size(16.dp))
                    }
                    IconButton(onClick = onDeleteClick, modifier = Modifier.size(32.dp)) {
                        Icon(imageVector = Icons.Default.Delete, contentDescription = "মুছুন", tint = Rose500, modifier = Modifier.size(16.dp))
                    }
                }
            }
        }
    }
}
