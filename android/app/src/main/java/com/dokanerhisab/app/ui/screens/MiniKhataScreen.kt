package com.dokanerhisab.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.window.Dialog
import com.dokanerhisab.app.model.MiniKhataItem
import com.dokanerhisab.app.theme.*
import com.dokanerhisab.app.ui.dialogs.dokanTextFieldColors
import com.dokanerhisab.app.viewmodel.DokanViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MiniKhataScreen(
    viewModel: DokanViewModel,
    onOpenVoiceSearch: () -> Unit
) {
    val items by viewModel.filteredMiniKhata.collectAsState()
    val searchQuery by viewModel.miniKhataSearchQuery.collectAsState()
    var showAddDialog by remember { mutableStateOf(false) }

    val totalMiniDue = items.filter { !it.isPaid }.sumOf { it.dueAmount }

    Scaffold(
        containerColor = DarkBg,
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddDialog = true },
                containerColor = Cyan500,
                contentColor = DarkBg,
                shape = CircleShape
            ) {
                Icon(imageVector = Icons.Default.Add, contentDescription = "নতুন ছোট বাকি")
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

            // Banner
            Surface(
                color = SurfaceCard,
                shape = RoundedCornerShape(16.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, Cyan500.copy(alpha = 0.3f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(text = "ছোট বাকি হিসাব (দৈনিক খুচরা বাকি)", fontSize = 13.sp, color = TextSecondary)
                        Text(
                            text = "৳$totalMiniDue",
                            fontSize = 26.sp,
                            fontWeight = FontWeight.Bold,
                            color = Cyan500
                        )
                    }
                    Box(
                        modifier = Modifier
                            .size(46.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(Cyan500.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(imageVector = Icons.Default.BookmarkBorder, contentDescription = null, tint = Cyan500, modifier = Modifier.size(24.dp))
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
                        onValueChange = { viewModel.miniKhataSearchQuery.value = it },
                        placeholder = {
                            Text(text = "ছোট বাকি গ্রাহকের নাম বা নোট...", fontSize = 13.sp, color = TextMuted)
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

            Spacer(modifier = Modifier.height(14.dp))

            // List
            if (items.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize().padding(bottom = 60.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = "কোনো ছোট বাকি এন্ট্রি পাওয়া যায়নি", color = TextSecondary, fontSize = 14.sp)
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(items, key = { it.id }) { item ->
                        MiniKhataCard(
                            item = item,
                            onMarkPaid = { viewModel.markMiniKhataPaid(item.id) },
                            onDelete = { viewModel.deleteMiniKhata(item) }
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
        AddMiniKhataDialog(
            onDismiss = { showAddDialog = false },
            onSave = { viewModel.saveMiniKhata(it) }
        )
    }
}

@Composable
fun MiniKhataCard(
    item: MiniKhataItem,
    onMarkPaid: () -> Unit,
    onDelete: () -> Unit
) {
    Surface(
        color = SurfaceCard,
        shape = RoundedCornerShape(14.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, BorderSubtle),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = item.customerName,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = TextPrimary
                )
                if (item.note.isNotBlank()) {
                    Text(text = item.note, fontSize = 13.sp, color = TextSecondary)
                }
                Spacer(modifier = Modifier.height(4.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    if (item.phone.isNotBlank()) {
                        Text(text = item.phone, fontSize = 11.sp, color = Cyan500)
                    }
                    if (item.time.isNotBlank()) {
                        Text(text = "• ${item.time}", fontSize = 11.sp, color = TextMuted)
                    }
                }
            }

            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = if (item.isPaid) "পরিশোধিত" else "৳${item.dueAmount}",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = if (item.isPaid) Emerald500 else Rose500
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    if (!item.isPaid) {
                        Button(
                            onClick = onMarkPaid,
                            colors = ButtonDefaults.buttonColors(containerColor = Emerald600),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                        ) {
                            Text(text = "আদায়", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                    IconButton(onClick = onDelete, modifier = Modifier.size(28.dp)) {
                        Icon(imageVector = Icons.Default.Delete, contentDescription = "মুছুন", tint = Rose500, modifier = Modifier.size(16.dp))
                    }
                }
            }
        }
    }
}

@Composable
fun AddMiniKhataDialog(
    onDismiss: () -> Unit,
    onSave: (MiniKhataItem) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var note by remember { mutableStateOf("") }
    var amountStr by remember { mutableStateOf("") }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = SurfaceCard,
            tonalElevation = 6.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text(
                    text = "📝 দ্রুত ছোট বাকি যোগ করুন",
                    fontWeight = FontWeight.Bold,
                    fontSize = 17.sp,
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.height(14.dp))
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("গ্রাহকের নাম *") },
                    modifier = Modifier.fillMaxWidth(),
                    colors = dokanTextFieldColors()
                )
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = amountStr,
                    onValueChange = { amountStr = it },
                    label = { Text("বাকির পরিমাণ (৳) *") },
                    modifier = Modifier.fillMaxWidth(),
                    colors = dokanTextFieldColors()
                )
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = note,
                    onValueChange = { note = it },
                    label = { Text("কী নিয়েছে (নোট)") },
                    modifier = Modifier.fillMaxWidth(),
                    colors = dokanTextFieldColors()
                )
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = phone,
                    onValueChange = { phone = it },
                    label = { Text("মোবাইল নম্বর (ঐচ্ছিক)") },
                    modifier = Modifier.fillMaxWidth(),
                    colors = dokanTextFieldColors()
                )
                Spacer(modifier = Modifier.height(16.dp))
                Button(
                    onClick = {
                        val amt = amountStr.toDoubleOrNull() ?: 0.0
                        if (name.isNotBlank() && amt > 0.0) {
                            val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
                            val timeStr = SimpleDateFormat("hh:mm a", Locale.getDefault()).format(Date())
                            val item = MiniKhataItem(
                                id = "mkhata_" + System.currentTimeMillis(),
                                customerName = name.trim(),
                                phone = phone.trim(),
                                note = note.trim(),
                                amount = amt,
                                paidAmount = 0.0,
                                dueAmount = amt,
                                status = "unpaid",
                                date = today,
                                time = timeStr
                            )
                            onSave(item)
                            onDismiss()
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = Cyan500),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(text = "সংরক্ষণ করুন", fontWeight = FontWeight.Bold, color = DarkBg)
                }
            }
        }
    }
}
