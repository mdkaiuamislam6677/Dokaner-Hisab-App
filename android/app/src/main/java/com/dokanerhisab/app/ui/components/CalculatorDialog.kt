package com.dokanerhisab.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.dokanerhisab.app.theme.*
import com.dokanerhisab.app.viewmodel.DokanViewModel

@Composable
fun CalculatorDialog(
    viewModel: DokanViewModel,
    onDismiss: () -> Unit
) {
    val display by viewModel.calcDisplay.collectAsState()
    val formula by viewModel.calcFormula.collectAsState()
    val history by viewModel.calcHistory.collectAsState()

    val keys = listOf(
        listOf("7", "8", "9", "/"),
        listOf("4", "5", "6", "*"),
        listOf("1", "2", "3", "-"),
        listOf("C", "0", "=", "+")
    )

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = SurfaceCard,
            tonalElevation = 8.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(18.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "🧮 হিসাবের ক্যালকুলেটর",
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary,
                        fontSize = 16.sp
                    )
                    IconButton(onClick = onDismiss, modifier = Modifier.size(28.dp)) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "বন্ধ করুন",
                            tint = TextSecondary
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Screen
                Surface(
                    color = DarkBg,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 12.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalAlignment = Alignment.End
                    ) {
                        if (formula.isNotEmpty()) {
                            Text(
                                text = formula,
                                fontSize = 13.sp,
                                color = TextMuted,
                                textAlign = TextAlign.End
                            )
                        }
                        Text(
                            text = display,
                            fontSize = 28.sp,
                            fontWeight = FontWeight.Bold,
                            color = Emerald500,
                            textAlign = TextAlign.End
                        )
                    }
                }

                // Keys Grid
                Column(
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    keys.forEach { row ->
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            row.forEach { k ->
                                val isOp = k in listOf("+", "-", "*", "/", "=")
                                val isClear = k == "C"

                                val btnColor = when {
                                    isClear -> Rose500.copy(alpha = 0.2f)
                                    isOp -> Emerald600.copy(alpha = 0.25f)
                                    else -> SurfaceCardElevated
                                }

                                val textColor = when {
                                    isClear -> Rose500
                                    isOp -> Emerald500
                                    else -> TextPrimary
                                }

                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(48.dp)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(btnColor)
                                        .clickable { viewModel.onCalcInput(k) },
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = k,
                                        fontSize = 18.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = textColor
                                    )
                                }
                            }
                        }
                    }
                }

                // Recent History
                if (history.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(10.dp))
                    Text(
                        text = "পূর্ববর্তী হিসাব:",
                        fontSize = 11.sp,
                        color = TextMuted
                    )
                    history.take(3).forEach { hist ->
                        Text(
                            text = hist,
                            fontSize = 12.sp,
                            color = TextSecondary
                        )
                    }
                }
            }
        }
    }
}
