package com.dokanerhisab.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Store
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dokanerhisab.app.theme.*
import com.dokanerhisab.app.viewmodel.DokanViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DokanTopAppBar(
    viewModel: DokanViewModel,
    onOpenCalculator: () -> Unit,
    onOpenVoiceSearch: () -> Unit,
    onOpenAccount: () -> Unit
) {
    val account by viewModel.userAccount.collectAsState()

    Surface(
        color = SurfaceCard,
        shadowElevation = 4.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            // Store & User Info (Clickable to set up or edit account)
            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(12.dp))
                    .clickable(onClick = onOpenAccount)
                    .padding(4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(42.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(if (account.isSetup) Emerald600 else SurfaceCardElevated),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = if (account.isSetup) Icons.Default.Store else Icons.Default.Person,
                        contentDescription = "দোকানের হিসাব",
                        tint = if (account.isSetup) Color.White else Emerald500,
                        modifier = Modifier.size(24.dp)
                    )
                }
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = if (account.isSetup && account.name.isNotBlank()) account.name else "দোকানের হিসাব",
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(Emerald500.copy(alpha = 0.2f))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "PRO",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = Emerald500
                            )
                        }
                    }
                    Text(
                        text = if (account.isSetup) account.businessName else "দোকান প্রোফাইল সেট করুন ⚙️",
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = if (account.isSetup) TextSecondary else Cyan500,
                            fontSize = 12.sp,
                            fontWeight = if (account.isSetup) FontWeight.Normal else FontWeight.Medium
                        )
                    )
                }
            }

            // Quick Actions: Calculator & Voice Assistant
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                // Calculator Button
                IconButton(
                    onClick = onOpenCalculator,
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(SurfaceCardElevated)
                ) {
                    Icon(
                        imageVector = Icons.Default.Calculate,
                        contentDescription = "হিসাবের ক্যালকুলেটর",
                        tint = Cyan500,
                        modifier = Modifier.size(20.dp)
                    )
                }

                // Voice Search Button
                IconButton(
                    onClick = onOpenVoiceSearch,
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(Emerald600.copy(alpha = 0.2f))
                ) {
                    Icon(
                        imageVector = Icons.Default.Mic,
                        contentDescription = "মাইক্রোফোন ভয়েস সার্চ",
                        tint = Emerald500,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }
    }
}
