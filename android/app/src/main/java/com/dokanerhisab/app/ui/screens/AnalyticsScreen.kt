package com.dokanerhisab.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dokanerhisab.app.theme.*
import com.dokanerhisab.app.viewmodel.DokanViewModel

@Composable
fun AnalyticsScreen(viewModel: DokanViewModel) {
    val summary by viewModel.analyticsSummary.collectAsState()
    val netMargin = summary.potentialProfit - summary.totalExpenses

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBg)
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        Text(
            text = "📊 ব্যবসায়িক লাভ-ক্ষতি ও অ্যানালিটিক্স",
            style = MaterialTheme.typography.titleMedium.copy(
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
        )
        Text(
            text = "আপনার দোকানের সামগ্রিক আর্থিক অবস্থা ও পণ্যের স্বাস্থ্য",
            fontSize = 12.sp,
            color = TextSecondary
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Net Margin Hero Card
        Surface(
            color = SurfaceCard,
            shape = RoundedCornerShape(18.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, Emerald500.copy(alpha = 0.4f)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Text(text = "সম্ভাব্য নেট ব্যালেন্স (লাভ - খরচ)", fontSize = 13.sp, color = TextSecondary)
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "৳$netMargin",
                    fontSize = 32.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (netMargin >= 0) Emerald500 else Rose500
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "সম্ভাব্য মোট খুচরা লাভ থেকে সকল দোকান খরচের হিসাব সমন্বয় করা হয়েছে।",
                    fontSize = 11.sp,
                    color = TextMuted
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // 2x2 Grid of Key Financials
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            MetricCard(
                title = "মোট ইনভেন্টরি ক্রয়মূল্য",
                amount = "৳${summary.totalCostValue}",
                subtitle = "কেনা বাবদ ব্যয়",
                color = Cyan500,
                modifier = Modifier.weight(1f)
            )
            MetricCard(
                title = "সম্ভাব্য মোট বিক্রয়মূল্য",
                amount = "৳${summary.totalRetailValue}",
                subtitle = "খুচরা বিক্রয় মূল্য",
                color = Emerald500,
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            MetricCard(
                title = "সম্ভাব্য মোট মুনাফা",
                amount = "৳${summary.potentialProfit}",
                subtitle = "বিক্রয় লাভ",
                color = Amber500,
                modifier = Modifier.weight(1f)
            )
            MetricCard(
                title = "চলতি মোট খরচ",
                amount = "৳${summary.totalExpenses}",
                subtitle = "দোকানের সকল খরচ",
                color = Rose500,
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Dues Analysis Card
        Surface(
            color = SurfaceCard,
            shape = RoundedCornerShape(16.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, BorderSubtle),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(text = "বাকি ও পাওনা বিশ্লেষণ (Dues Summary)", fontWeight = FontWeight.Bold, color = TextPrimary)
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(text = "অনাদায়ী খাতা বাকি", fontSize = 12.sp, color = TextSecondary)
                        Text(text = "৳${summary.totalDues}", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Rose500)
                    }
                    Column {
                        Text(text = "ছোট দৈনিক বাকি", fontSize = 12.sp, color = TextSecondary)
                        Text(text = "৳${summary.totalMiniKhataDue}", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Amber500)
                    }
                    Column {
                        Text(text = "মোট বকেয়া আদায়", fontSize = 12.sp, color = TextSecondary)
                        Text(text = "৳${summary.totalDuesCollected}", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Emerald500)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Stock Health Progress Card
        Surface(
            color = SurfaceCard,
            shape = RoundedCornerShape(16.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, BorderSubtle),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(text = "স্টক স্থিতি ও অ্যালার্ট", fontWeight = FontWeight.Bold, color = TextPrimary)
                Spacer(modifier = Modifier.height(12.dp))

                StockHealthRow(label = "পর্যাপ্ত মজুদ পণ্য", count = summary.inStockCount, color = Emerald500)
                Spacer(modifier = Modifier.height(8.dp))
                StockHealthRow(label = "সতর্কতামূলক কম স্টক", count = summary.lowStockCount, color = Amber500)
                Spacer(modifier = Modifier.height(8.dp))
                StockHealthRow(label = "স্টক শেষ (Out of Stock)", count = summary.outOfStockCount, color = Rose500)
            }
        }

        Spacer(modifier = Modifier.height(80.dp))
    }
}

@Composable
fun MetricCard(
    title: String,
    amount: String,
    subtitle: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    Surface(
        color = SurfaceCard,
        shape = RoundedCornerShape(14.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, BorderSubtle),
        modifier = modifier
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(text = title, fontSize = 11.sp, color = TextSecondary, maxLines = 1)
            Spacer(modifier = Modifier.height(6.dp))
            Text(text = amount, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = color)
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = subtitle, fontSize = 10.sp, color = TextMuted)
        }
    }
}

@Composable
fun StockHealthRow(label: String, count: Int, color: Color) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(10.dp)
                    .clip(RoundedCornerShape(3.dp))
                    .background(color)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(text = label, fontSize = 13.sp, color = TextPrimary)
        }
        Text(text = "$count টি পণ্য", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = color)
    }
}
