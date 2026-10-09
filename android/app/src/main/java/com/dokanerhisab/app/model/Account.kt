package com.dokanerhisab.app.model

data class Account(
    val id: String = "",
    val name: String = "",
    val phone: String = "",
    val email: String = "",
    val businessName: String = "",
    val brilliantNumber: String = "",
    val pin: String = "",
    val role: String = "দোকানের মালিক",
    val isSetup: Boolean = false
) {
    val displayName: String get() = if (name.isNotBlank()) name else "নতুন দোকান"
    val displayBusiness: String get() = if (businessName.isNotBlank()) businessName else "দোকানের নাম সেট করুন"
}
