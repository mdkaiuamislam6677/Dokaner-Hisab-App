package com.dokanerhisab.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dokanerhisab.app.theme.*
import com.dokanerhisab.app.viewmodel.AppTab

@Composable
fun DokanBottomBar(
    currentTab: AppTab,
    onTabSelected: (AppTab) -> Unit
) {
    Surface(
        color = SurfaceCard,
        shadowElevation = 8.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .navigationBarsPadding()
                .padding(vertical = 6.dp),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically
        ) {
            BottomNavItem(
                title = "ইনভেন্টরি",
                icon = Icons.Default.Inventory2,
                selected = currentTab == AppTab.INVENTORY,
                onClick = { onTabSelected(AppTab.INVENTORY) }
            )
            BottomNavItem(
                title = "খরচ",
                icon = Icons.Default.ReceiptLong,
                selected = currentTab == AppTab.EXPENSES,
                onClick = { onTabSelected(AppTab.EXPENSES) }
            )
            BottomNavItem(
                title = "বাকির খাতা",
                icon = Icons.AutoMirrored.Filled.MenuBook,
                selected = currentTab == AppTab.DUES,
                onClick = { onTabSelected(AppTab.DUES) }
            )
            BottomNavItem(
                title = "ছোট বাকি",
                icon = Icons.Default.BookmarkBorder,
                selected = currentTab == AppTab.MINI_KHATA,
                onClick = { onTabSelected(AppTab.MINI_KHATA) }
            )
            BottomNavItem(
                title = "অ্যানালিটিক্স",
                icon = Icons.Default.BarChart,
                selected = currentTab == AppTab.ANALYTICS,
                onClick = { onTabSelected(AppTab.ANALYTICS) }
            )
            BottomNavItem(
                title = "টিপস",
                icon = Icons.Default.Lightbulb,
                selected = currentTab == AppTab.TIPS,
                onClick = { onTabSelected(AppTab.TIPS) }
            )
        }
    }
}

@Composable
private fun BottomNavItem(
    title: String,
    icon: ImageVector,
    selected: Boolean,
    onClick: () -> Unit
) {
    val activeColor = Emerald500
    val inactiveColor = TextSecondary

    Column(
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .clickable(onClick = onClick)
            .padding(horizontal = 6.dp, vertical = 4.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Box(
            modifier = Modifier
                .clip(RoundedCornerShape(12.dp))
                .background(if (selected) Emerald600.copy(alpha = 0.2f) else androidx.compose.ui.graphics.Color.Transparent)
                .padding(horizontal = 12.dp, vertical = 4.dp),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = if (selected) activeColor else inactiveColor,
                modifier = Modifier.size(20.dp)
            )
        }
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = title,
            fontSize = 11.sp,
            fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
            color = if (selected) activeColor else inactiveColor
        )
    }
}
