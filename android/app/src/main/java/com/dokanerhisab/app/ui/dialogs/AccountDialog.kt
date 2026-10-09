package com.dokanerhisab.app.ui.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Key
import androidx.compose.material.icons.filled.Store
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.dokanerhisab.app.model.Account
import com.dokanerhisab.app.theme.*

@Composable
fun AccountDialog(
    currentAccount: Account,
    onDismiss: () -> Unit,
    onSave: (name: String, businessName: String, phone: String, brilliantNumber: String, pin: String) -> Unit,
    onResetPin: (newPin: String) -> Unit,
    onClear: () -> Unit
) {
    var isForgotMode by remember { mutableStateOf(false) }

    var businessName by remember { mutableStateOf(currentAccount.businessName) }
    var ownerName by remember { mutableStateOf(currentAccount.name) }
    var phone by remember { mutableStateOf(currentAccount.phone) }
    var brilliantNumber by remember { mutableStateOf(currentAccount.brilliantNumber) }
    var pin by remember { mutableStateOf(currentAccount.pin) }

    // Forgot password fields
    var verifyPhone by remember { mutableStateOf("") }
    var newPin by remember { mutableStateOf("") }
    var confirmNewPin by remember { mutableStateOf("") }
    var resetError by remember { mutableStateOf("") }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = SurfaceCard,
            tonalElevation = 6.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = if (isForgotMode) Icons.Default.Key else Icons.Default.Store,
                            contentDescription = null,
                            tint = if (isForgotMode) Amber500 else Emerald500,
                            modifier = Modifier.size(22.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (isForgotMode) "ফরগেট পাসওয়ার্ড / পিন রিসেট" else (if (currentAccount.isSetup) "দোকানের প্রোফাইল" else "দোকান প্রোফাইল সেটআপ"),
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary,
                            fontSize = 16.sp
                        )
                    }
                    IconButton(onClick = onDismiss, modifier = Modifier.size(28.dp)) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "বন্ধ", tint = TextSecondary)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                if (isForgotMode) {
                    // Forgot PIN Recovery Screen
                    Surface(
                        color = Amber500.copy(alpha = 0.12f),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp)
                    ) {
                        Text(
                            text = "আপনার রেজিস্টার্ড মোবাইল নম্বর এবং নতুন পিন দিয়ে পাসওয়ার্ড পরিবর্তন করুন।",
                            fontSize = 12.sp,
                            color = Amber500,
                            modifier = Modifier.padding(10.dp)
                        )
                    }

                    OutlinedTextField(
                        value = verifyPhone,
                        onValueChange = { verifyPhone = it; resetError = "" },
                        label = { Text("রেজিস্টার্ড মোবাইল নম্বর *") },
                        placeholder = { Text("017XXXXXXXX") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                        modifier = Modifier.fillMaxWidth(),
                        colors = dokanTextFieldColors()
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedTextField(
                        value = newPin,
                        onValueChange = { newPin = it; resetError = "" },
                        label = { Text("নতুন পিন / পাসওয়ার্ড *") },
                        placeholder = { Text("যেমন: 1234") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                        visualTransformation = PasswordVisualTransformation(),
                        modifier = Modifier.fillMaxWidth(),
                        colors = dokanTextFieldColors()
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedTextField(
                        value = confirmNewPin,
                        onValueChange = { confirmNewPin = it; resetError = "" },
                        label = { Text("নতুন পিন নিশ্চিত করুন *") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                        visualTransformation = PasswordVisualTransformation(),
                        modifier = Modifier.fillMaxWidth(),
                        colors = dokanTextFieldColors()
                    )

                    if (resetError.isNotBlank()) {
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(text = resetError, color = Rose500, fontSize = 12.sp)
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Button(
                        onClick = {
                            if (newPin.isBlank() || newPin.length < 3) {
                                resetError = "পিন কমপক্ষে ৩ অক্ষরের হতে হবে।"
                            } else if (newPin != confirmNewPin) {
                                resetError = "উভয় পিন মিলছে না!"
                            } else {
                                onResetPin(newPin.trim())
                                onDismiss()
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = Amber500),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text(text = "পিন পরিবর্তন সম্পন্ন করুন", fontWeight = FontWeight.Bold, color = DarkBg)
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    TextButton(
                        onClick = { isForgotMode = false },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(text = "প্রোফাইল সেটিংসে ফিরে যান", color = TextSecondary, fontSize = 12.sp)
                    }
                } else {
                    // Profile Setup & Edit Form
                    OutlinedTextField(
                        value = businessName,
                        onValueChange = { businessName = it },
                        label = { Text("ব্যবসা প্রতিষ্ঠানের নাম (দোকানের নাম) *") },
                        placeholder = { Text("যেমন: মেসার্স রহিম স্টোর") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = dokanTextFieldColors()
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedTextField(
                        value = ownerName,
                        onValueChange = { ownerName = it },
                        label = { Text("দোকানের মালিকের নাম (স্বত্বাধিকারী)") },
                        placeholder = { Text("যেমন: মো: রহিম উদ্দিন") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = dokanTextFieldColors()
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedTextField(
                        value = phone,
                        onValueChange = { phone = it },
                        label = { Text("মোবাইল নম্বর") },
                        placeholder = { Text("017XXXXXXXX") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                        modifier = Modifier.fillMaxWidth(),
                        colors = dokanTextFieldColors()
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedTextField(
                        value = pin,
                        onValueChange = { pin = it },
                        label = { Text("লগইন পিন / পাসওয়ার্ড") },
                        placeholder = { Text("যেমন: 1234") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                        modifier = Modifier.fillMaxWidth(),
                        colors = dokanTextFieldColors()
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    // Forgot Password Trigger Button
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End
                    ) {
                        Text(
                            text = "ফরগেট পাসওয়ার্ড / পিন রিসেট?",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Amber500,
                            modifier = Modifier
                                .clickable { isForgotMode = true }
                                .padding(vertical = 4.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Button(
                        onClick = {
                            if (businessName.isNotBlank() || ownerName.isNotBlank()) {
                                onSave(ownerName.trim(), businessName.trim(), phone.trim(), brilliantNumber.trim(), pin.trim())
                                onDismiss()
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = Emerald600),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text(text = "সংরক্ষণ করুন (Save Profile)", fontWeight = FontWeight.Bold, color = Color.White)
                    }

                    if (currentAccount.isSetup) {
                        Spacer(modifier = Modifier.height(8.dp))
                        TextButton(
                            onClick = {
                                onClear()
                                onDismiss()
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(text = "প্রোফাইল রিসেট / পরিষ্কার করুন", color = Rose500, fontSize = 12.sp)
                        }
                    }
                }
            }
        }
    }
}
