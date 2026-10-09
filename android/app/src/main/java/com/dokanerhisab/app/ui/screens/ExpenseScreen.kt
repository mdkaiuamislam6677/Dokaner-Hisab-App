package com.dokanerhisab.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dokanerhisab.app.model.Expense
import com.dokanerhisab.app.theme.*
import com.dokanerhisab.app.ui.dialogs.ExpenseDialog
import com.dokanerhisab.app.viewmodel.DokanViewModel

@Composable
fun ExpenseScreen(viewModel: DokanViewModel) {
    val expenses by viewModel.rawExpenses.collectAsState()
    val totalExpense = expenses.sumOf { it.amount }

    var showAddDialog by remember { mutableStateOf(false) }
    var editingExpense by remember { mutableStateOf<Expense?>(null) }

    Scaffold(
        containerColor = DarkBg,
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddDialog = true },
                containerColor = Rose500,
                contentColor = Color.White,
                shape = CircleShape
            ) {
                Icon(imageVector = Icons.Default.Add, contentDescription = "নতুন খরচ যোগ")
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

            // Total Expense Banner
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
                        Text(text = "চলতি মোট খরচ", fontSize = 13.sp, color = TextSecondary)
                        Text(
                            text = "৳$totalExpense",
                            fontSize = 26.sp,
                            fontWeight = FontWeight.Bold,
                            color = Rose500
                        )
                    }
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(Rose500.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(imageVector = Icons.Default.ReceiptLong, contentDescription = null, tint = Rose500, modifier = Modifier.size(26.dp))
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            Text(
                text = "খরচের তালিকা (${expenses.size} টি এন্ট্রি):",
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp,
                color = TextPrimary
            )

            Spacer(modifier = Modifier.height(10.dp))

            if (expenses.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize().padding(bottom = 60.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = "কোনো খরচ অন্তর্ভুক্ত করা হয়নি", color = TextSecondary, fontSize = 14.sp)
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(expenses, key = { it.id }) { expense ->
                        ExpenseCard(
                            expense = expense,
                            onEditClick = { editingExpense = expense },
                            onDeleteClick = { viewModel.deleteExpense(expense) }
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
        ExpenseDialog(
            initialExpense = null,
            onDismiss = { showAddDialog = false },
            onSave = { viewModel.saveExpense(it) }
        )
    }

    editingExpense?.let { expense ->
        ExpenseDialog(
            initialExpense = expense,
            onDismiss = { editingExpense = null },
            onSave = { viewModel.saveExpense(it) }
        )
    }
}

@Composable
fun ExpenseCard(
    expense: Expense,
    onEditClick: () -> Unit,
    onDeleteClick: () -> Unit
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
                    text = expense.title,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.height(4.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(text = expense.category, fontSize = 12.sp, color = Amber500)
                    Text(text = "•", fontSize = 12.sp, color = TextMuted)
                    Text(text = expense.paymentMethod, fontSize = 12.sp, color = TextSecondary)
                }
                if (expense.date.isNotBlank()) {
                    Text(text = expense.date, fontSize = 11.sp, color = TextMuted)
                }
            }

            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = "-৳${expense.amount}",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    color = Rose500
                )
                Spacer(modifier = Modifier.height(4.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    IconButton(onClick = onEditClick, modifier = Modifier.size(28.dp)) {
                        Icon(imageVector = Icons.Default.Edit, contentDescription = "সম্পাদনা", tint = TextSecondary, modifier = Modifier.size(16.dp))
                    }
                    IconButton(onClick = onDeleteClick, modifier = Modifier.size(28.dp)) {
                        Icon(imageVector = Icons.Default.Delete, contentDescription = "মুছুন", tint = Rose500, modifier = Modifier.size(16.dp))
                    }
                }
            }
        }
    }
}
