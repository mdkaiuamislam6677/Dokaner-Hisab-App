package com.dokanerhisab.app

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.speech.RecognizerIntent
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.dokanerhisab.app.theme.DarkBg
import com.dokanerhisab.app.theme.DokanerHisabTheme
import com.dokanerhisab.app.ui.components.CalculatorDialog
import com.dokanerhisab.app.ui.components.DokanBottomBar
import com.dokanerhisab.app.ui.components.DokanTopAppBar
import com.dokanerhisab.app.ui.components.VoiceSearchDialog
import com.dokanerhisab.app.ui.dialogs.AccountDialog
import com.dokanerhisab.app.ui.screens.*
import com.dokanerhisab.app.viewmodel.AppTab
import com.dokanerhisab.app.viewmodel.DokanViewModel
import java.util.Locale

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            DokanerHisabTheme {
                val viewModel: DokanViewModel = viewModel()
                val currentTab by viewModel.currentTab.collectAsState()
                val userAccount by viewModel.userAccount.collectAsState()

                var showCalculator by remember { mutableStateOf(false) }
                var showVoiceDialog by remember { mutableStateOf(false) }
                var showAccountDialog by remember { mutableStateOf(false) }

                // Android Speech Recognizer Launcher
                val speechLauncher = rememberLauncherForActivityResult(
                    contract = ActivityResultContracts.StartActivityForResult()
                ) { result ->
                    if (result.resultCode == Activity.RESULT_OK && result.data != null) {
                        val spokenText = result.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)?.firstOrNull()
                        if (!spokenText.isNullOrBlank()) {
                            viewModel.applyVoiceTranscript("inventory", spokenText)
                            Toast.makeText(this, "সার্চ করা হয়েছে: $spokenText", Toast.LENGTH_SHORT).show()
                        }
                    }
                }

                fun launchSpeechRecognizer() {
                    try {
                        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "bn-BD")
                            putExtra(RecognizerIntent.EXTRA_PROMPT, "দোকানের হিসাব: পণ্যের নাম বা বাকি মুখে বলুন...")
                        }
                        speechLauncher.launch(intent)
                    } catch (e: Exception) {
                        Toast.makeText(this, "ভয়েস রিকগনিশন ডিভাইস সাপোর্ট করছে না", Toast.LENGTH_SHORT).show()
                    }
                }

                Scaffold(
                    containerColor = DarkBg,
                    topBar = {
                        DokanTopAppBar(
                            viewModel = viewModel,
                            onOpenCalculator = { showCalculator = true },
                            onOpenVoiceSearch = { showVoiceDialog = true },
                            onOpenAccount = { showAccountDialog = true }
                        )
                    },
                    bottomBar = {
                        DokanBottomBar(
                            currentTab = currentTab,
                            onTabSelected = { viewModel.setTab(it) }
                        )
                    }
                ) { innerPadding ->
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding)
                    ) {
                        when (currentTab) {
                            AppTab.INVENTORY -> InventoryScreen(
                                viewModel = viewModel,
                                onOpenVoiceSearch = { showVoiceDialog = true }
                            )
                            AppTab.EXPENSES -> ExpenseScreen(viewModel = viewModel)
                            AppTab.DUES -> DuesScreen(
                                viewModel = viewModel,
                                onOpenVoiceSearch = { showVoiceDialog = true }
                            )
                            AppTab.MINI_KHATA -> MiniKhataScreen(
                                viewModel = viewModel,
                                onOpenVoiceSearch = { showVoiceDialog = true }
                            )
                            AppTab.ANALYTICS -> AnalyticsScreen(viewModel = viewModel)
                            AppTab.TIPS -> TipsScreen()
                        }
                    }
                }

                if (showCalculator) {
                    CalculatorDialog(
                        viewModel = viewModel,
                        onDismiss = { showCalculator = false }
                    )
                }

                if (showVoiceDialog) {
                    VoiceSearchDialog(
                        onDismiss = { showVoiceDialog = false },
                        onStartSpeechRecognizer = {
                            showVoiceDialog = false
                            launchSpeechRecognizer()
                        },
                        onSelectKeyword = { word ->
                            viewModel.applyVoiceTranscript("inventory", word)
                        }
                    )
                }

                if (showAccountDialog) {
                    AccountDialog(
                        currentAccount = userAccount,
                        onDismiss = { showAccountDialog = false },
                        onSave = { name, businessName, phone, brilliantNumber, pin ->
                            viewModel.saveUserAccount(name, businessName, phone, brilliantNumber, pin)
                            Toast.makeText(this, "দোকানের প্রোফাইল সংরক্ষিত হয়েছে", Toast.LENGTH_SHORT).show()
                        },
                        onResetPin = { newPin ->
                            viewModel.resetPin(newPin)
                            Toast.makeText(this, "নতুন পিন সফলভাবে সংরক্ষিত হয়েছে", Toast.LENGTH_SHORT).show()
                        },
                        onClear = {
                            viewModel.clearUserAccount()
                            Toast.makeText(this, "অ্যাকাউন্ট রিসেট করা হয়েছে", Toast.LENGTH_SHORT).show()
                        }
                    )
                }
            }
        }
    }
}
