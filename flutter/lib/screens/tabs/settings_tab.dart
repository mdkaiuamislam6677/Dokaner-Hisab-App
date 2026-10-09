import 'package:flutter/material.dart';
import '../../services/auth_service.dart';
import '../../services/firestore_service.dart';

class SettingsTab extends StatefulWidget {
  const SettingsTab({Key? key}) : super(key: key);

  @override
  State<SettingsTab> createState() => _SettingsTabState();
}

class _SettingsTabState extends State<SettingsTab> {
  final AuthService _authService = AuthService();
  final FirestoreService _firestoreService = FirestoreService();

  void _showEditProfileDialog(Map<String, dynamic>? data) {
    final nameCtrl = TextEditingController(text: data?['name'] ?? '');
    final shopCtrl = TextEditingController(text: data?['businessName'] ?? '');
    final brilliantCtrl = TextEditingController(text: data?['brilliantNumber'] ?? '');
    final phoneCtrl = TextEditingController(text: data?['phone'] ?? '');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF111827),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('দোকান ও প্রোফাইল তথ্য', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameCtrl,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'মালিকের নাম *', labelStyle: TextStyle(color: Colors.grey)),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: shopCtrl,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'দোকানের নাম *', labelStyle: TextStyle(color: Colors.grey)),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: phoneCtrl,
                keyboardType: TextInputType.phone,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'মোবাইল নম্বর', labelStyle: TextStyle(color: Colors.grey)),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: brilliantCtrl,
                keyboardType: TextInputType.phone,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(
                  labelText: 'ব্রিলিয়ান্ট নাম্বার (০৯৬৩৮... এসএমএসের জন্য)',
                  labelStyle: TextStyle(color: Color(0xFF06B6D4)),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('বাতিল', style: TextStyle(color: Colors.grey))),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
            onPressed: () async {
              await _firestoreService.updateUserProfile(
                name: nameCtrl.text.trim(),
                businessName: shopCtrl.text.trim(),
                brilliantNumber: brilliantCtrl.text.trim(),
                phone: phoneCtrl.text.trim(),
              );
              if (ctx.mounted) Navigator.pop(ctx);
            },
            child: const Text('সংরক্ষণ করুন', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<dynamic>(
      stream: _firestoreService.getUserProfileStream(),
      builder: (context, snapshot) {
        final profile = snapshot.data != null ? snapshot.data.data() as Map<String, dynamic>? : null;
        final name = profile?['name'] ?? 'দোকানদার';
        final shopName = profile?['businessName'] ?? 'দোকানের হিসাব';
        final brilliant = profile?['brilliantNumber'] ?? 'যুক্ত করা হয়নি';
        final email = _authService.currentUser?.email ?? '';

        return ListView(
          padding: const EdgeInsets.all(20),
          children: [
            // User Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF064E3B), Color(0xFF0F172A)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF10B981).withOpacity(0.3)),
              ),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 32,
                    backgroundColor: const Color(0xFF10B981),
                    child: Text(
                      name.isNotEmpty ? name[0] : 'U',
                      style: const TextStyle(fontSize: 28, color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    name,
                    style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    shopName,
                    style: const TextStyle(color: Color(0xFF6EE7B7), fontSize: 14),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    email,
                    style: TextStyle(color: Colors.grey.shade400, fontSize: 12),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: () => _showEditProfileDialog(profile),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981),
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    ),
                    icon: const Icon(Icons.edit, size: 16, color: Colors.white),
                    label: const Text('প্রোফাইল তথ্য পরিবর্তন', style: TextStyle(color: Colors.white)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Brilliant SMS Option Status Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF111827),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF06B6D4).withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: const Color(0xFF0E7490).withOpacity(0.3),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.cell_tower, color: Color(0xFF06B6D4)),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'ব্রিলিয়ান্ট এসএমএস ফিচার (সক্রিয়)',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'ব্রিলিয়ান্ট নাম্বার: $brilliant',
                          style: TextStyle(color: Colors.grey.shade400, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.edit, color: Color(0xFF06B6D4), size: 18),
                    onPressed: () => _showEditProfileDialog(profile),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Firebase Cloud Sync Status Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF111827),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withOpacity(0.06)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.cloud_done_rounded, color: Color(0xFF10B981), size: 28),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('Firebase Cloud Firestore', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                        SizedBox(height: 2),
                        Text('রিয়েল-টাইম ক্লাউড সিঙ্ক ও সম্পূর্ণ ডেমো-মুক্ত ক্লিন ডাটাবেজ', style: TextStyle(color: Colors.grey, fontSize: 12)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // Logout Button
            ElevatedButton.icon(
              onPressed: () async {
                final confirm = await showDialog<bool>(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    backgroundColor: const Color(0xFF111827),
                    title: const Text('লগআউট করতে চান?', style: TextStyle(color: Colors.white)),
                    actions: [
                      TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('না')),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                        onPressed: () => Navigator.pop(ctx, true),
                        child: const Text('হ্যাঁ, লগআউট'),
                      ),
                    ],
                  ),
                );
                if (confirm == true) {
                  await _authService.signOut();
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF881337),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: BorderRadius.circular(14),
              ),
              icon: const Icon(Icons.logout),
              label: const Text('লগআউট করুন', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }
}
