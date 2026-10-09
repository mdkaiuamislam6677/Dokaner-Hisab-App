package com.dokanerhisab.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dokanerhisab.app.theme.*

data class ShopTip(
    val title: String,
    val description: String,
    val category: String,
    val icon: ImageVector,
    val accentColor: Color
)

@Composable
fun TipsScreen() {
    val tips = listOf(
        ShopTip(
            title = "বাকি সীমিত রাখুন ও সময়মতো আদায় করুন",
            description = "যেকোনো খুচরা বা পাইকারি ব্যবসায় মোট পুঁজির ১৫%-২০% এর বেশি বাকি দেওয়া ঝুঁকিপূর্ণ। বাকি দেওয়ার সময় পরিশোধের সুনির্দিষ্ট তারিখ ও ব্রিলিয়ান্ট/মোবাইল নম্বর সংরক্ষণ করুন।",
            category = "ক্যাশফ্লো ব্যবস্থাপনা",
            icon = Icons.Default.AccountBalanceWallet,
            accentColor = Emerald500
        ),
        ShopTip(
            title = "মিনিমাম স্টক লেভেল নিয়মিত পর্যবেক্ষণ করুন",
            description = "চাল, ডাল, তেল ও চিনির মতো দ্রুত বিক্রি হওয়া পণ্যের স্টক কখনো শূন্য হতে দেবেন না। হলুদ সতর্কতা দেখতেই নতুন অর্ডার নিশ্চিত করুন যাতে কাস্টমার খালি হাতে না ফেরে।",
            category = "স্টক নিয়ন্ত্রণ",
            icon = Icons.Default.Warning,
            accentColor = Amber500
        ),
        ShopTip(
            title = "পাইকারি বনাম খুচরা মূল্যের ব্যবধান পরিষ্কার রাখুন",
            description = "পাইকারিতে বেশি পরিমাণে কম লাভে বিক্রি হলেও নগদ আবর্তন দ্রুত হয়। কিন্তু খুচরা বিক্রয়ে ইউনিট প্রতি লাভ বেশি থাকে। দুটো রেট আলাদাভাবে ট্র্যাকিং করুন।",
            category = "মূল্য নির্ধারণ",
            icon = Icons.Default.TrendingUp,
            accentColor = Cyan500
        ),
        ShopTip(
            title = "প্রতিদিনের দোকান খরচ তাৎক্ষণিক এন্ট্রি করুন",
            description = "চা-নাস্তা, ভ্যান ভাড়া, বিদ্যুৎ বিল বা কর্মচারীর হাতখরচ তাৎক্ষণিক এন্ট্রি না করলে মাস শেষে লাভের আসল চিত্র পাওয়া যায় না।",
            category = "হিসাবরক্ষণ",
            icon = Icons.Default.ReceiptLong,
            accentColor = Rose500
        ),
        ShopTip(
            title = "নিয়মিত গ্রাহকদের সাথে মধুর সম্পর্ক বজায় রাখুন",
            description = "ভালো গ্রাহকদের বিশেষ সম্মান দিন এবং বাকির প্রতিশ্রুতি সময়মতো পূরণ করলে শুভেচ্ছা জানান। বিশ্বস্ত গ্রাহকই আপনার ব্যবসার মূল চালিকাশক্তি।",
            category = "গ্রাহক সন্তুষ্টি",
            icon = Icons.Default.Favorite,
            accentColor = Purple500
        ),
        ShopTip(
            title = "ছোট বাকির খাতা নিয়মিত ক্লিয়ার করুন",
            description = "প্রতিদিনের খুচরা ক্রেতাদের ২০-৫০ টাকার ছোট বাকি অনেক সময় ভুলে যাওয়া হয়। দৈনিক বা সাপ্তাহিক ভিত্তিতে এগুলি হিসাব করে আদায় করে নিন।",
            category = "খুচরা বাকি",
            icon = Icons.Default.BookmarkBorder,
            accentColor = Cyan500
        )
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBg)
            .padding(16.dp)
    ) {
        Text(
            text = "💡 দোকান পরিচালনার সেরা পরামর্শ ও টিপস",
            style = MaterialTheme.typography.titleMedium.copy(
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
        )
        Text(
            text = "ব্যবসায়িক প্রবৃদ্ধি এবং সঠিক লাভ নিয়ন্ত্রণের কৌশল",
            fontSize = 12.sp,
            color = TextSecondary
        )

        Spacer(modifier = Modifier.height(14.dp))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(tips) { tip ->
                TipCard(tip = tip)
            }
            item {
                Spacer(modifier = Modifier.height(80.dp))
            }
        }
    }
}

@Composable
fun TipCard(tip: ShopTip) {
    Surface(
        color = SurfaceCard,
        shape = RoundedCornerShape(16.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, BorderSubtle),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.Top
        ) {
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(tip.accentColor.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = tip.icon,
                    contentDescription = null,
                    tint = tip.accentColor,
                    modifier = Modifier.size(22.dp)
                )
            }

            Spacer(modifier = Modifier.width(14.dp))

            Column(modifier = Modifier.weight(1f)) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(tip.accentColor.copy(alpha = 0.15f))
                        .padding(horizontal = 8.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = tip.category,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = tip.accentColor
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = tip.title,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = TextPrimary
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = tip.description,
                    fontSize = 13.sp,
                    color = TextSecondary,
                    lineHeight = 18.sp
                )
            }
        }
    }
}
