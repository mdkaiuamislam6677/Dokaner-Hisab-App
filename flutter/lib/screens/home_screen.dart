import 'package:flutter/material.dart';
import '../services/firestore_service.dart';
import 'tabs/inventory_tab.dart';
import 'tabs/dues_tab.dart';
import 'tabs/expenses_tab.dart';
import 'tabs/mini_khata_tab.dart';
import 'tabs/settings_tab.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  final FirestoreService _firestoreService = FirestoreService();

  final List<Widget> _tabs = const [
    InventoryTab(),
    DuesTab(),
    ExpensesTab(),
    MiniKhataTab(),
    SettingsTab(),
  ];

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<dynamic>(
      stream: _firestoreService.getUserProfileStream(),
      builder: (context, snapshot) {
        final profile = snapshot.data != null ? snapshot.data.data() as Map<String, dynamic>? : null;
        final shopName = profile?['businessName'] ?? 'দোকানের হিসাব';

        return Scaffold(
          backgroundColor: const Color(0xFF0A0F1D),
          appBar: AppBar(
            backgroundColor: const Color(0xFF111827),
            elevation: 0,
            title: Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF10B981), Color(0xFF06B6D4)],
                    ),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.store, color: Colors.white, size: 20),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        shopName,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                      const Text(
                        'Dokaner Hisab (Firebase Cloud)',
                        style: TextStyle(
                          color: Color(0xFF10B981),
                          fontSize: 10,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          body: _tabs[_currentIndex],
          bottomNavigationBar: BottomNavigationBar(
            currentIndex: _currentIndex,
            onTap: (index) {
              setState(() {
                _currentIndex = index;
              });
            },
            type: BottomNavigationBarType.fixed,
            backgroundColor: const Color(0xFF111827),
            selectedItemColor: const Color(0xFF10B981),
            unselectedItemColor: Colors.grey.shade400,
            selectedFontSize: 11,
            unselectedFontSize: 10,
            elevation: 8,
            items: const [
              BottomNavigationBarItem(
                icon: Icon(Icons.inventory_2_outlined),
                activeIcon: Icon(Icons.inventory_2),
                label: 'ইনভেন্টরি',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.receipt_long_outlined),
                activeIcon: Icon(Icons.receipt_long),
                label: 'বাকির খাতা',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.account_balance_wallet_outlined),
                activeIcon: Icon(Icons.account_balance_wallet),
                label: 'দৈনিক খরচ',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.edit_note_outlined),
                activeIcon: Icon(Icons.edit_note),
                label: 'ছোট খাতা',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.person_outline),
                activeIcon: Icon(Icons.person),
                label: 'প্রোফাইল',
              ),
            ],
          ),
        );
      },
    );
  }
}
