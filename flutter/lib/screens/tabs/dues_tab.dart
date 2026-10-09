import 'package:flutter/material.dart';
import '../../models/due.dart';
import '../../services/firestore_service.dart';
import '../../services/sms_service.dart';

class DuesTab extends StatefulWidget {
  const DuesTab({Key? key}) : super(key: key);

  @override
  State<DuesTab> createState() => _DuesTabState();
}

class _DuesTabState extends State<DuesTab> {
  final FirestoreService _firestoreService = FirestoreService();
  String _searchQuery = '';

  void _showAddDueDialog() {
    final nameCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final addressCtrl = TextEditingController();
    final dueCtrl = TextEditingController();
    final noteCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF111827),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('নতুন বাকির খাতা এন্ট্রি', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameCtrl,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'কাস্টমারের নাম *', labelStyle: TextStyle(color: Colors.grey)),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: phoneCtrl,
                keyboardType: TextInputType.phone,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'মোবাইল নম্বর * (এসএমএসের জন্য)', labelStyle: TextStyle(color: Colors.grey)),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: addressCtrl,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'ঠিকানা', labelStyle: TextStyle(color: Colors.grey)),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: dueCtrl,
                keyboardType: TextInputType.number,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'মোট বাকির পরিমাণ (৳) *', labelStyle: TextStyle(color: Colors.grey)),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: noteCtrl,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'বিবরণ / নোট', labelStyle: TextStyle(color: Colors.grey)),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('বাতিল', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
            onPressed: () async {
              final name = nameCtrl.text.trim();
              final phone = phoneCtrl.text.trim();
              final due = double.tryParse(dueCtrl.text.trim()) ?? 0.0;

              if (name.isEmpty || due <= 0) return;

              final item = CustomerDue(
                id: '',
                customerName: name,
                customerPhone: phone,
                customerAddress: addressCtrl.text.trim(),
                totalDue: due,
                paidAmount: 0.0,
                note: noteCtrl.text.trim(),
                createdAt: DateTime.now(),
                updatedAt: DateTime.now(),
              );

              await _firestoreService.addDue(item);
              if (ctx.mounted) Navigator.pop(ctx);
            },
            child: const Text('সংরক্ষণ করুন', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showCollectPaymentDialog(CustomerDue due) {
    final payCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF111827),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('${due.customerName} - বাকি আদায়', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('বর্তমান বাকি: ৳${due.remainingDue.toStringAsFixed(0)}', style: const TextStyle(color: Colors.amber, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            TextField(
              controller: payCtrl,
              keyboardType: TextInputType.number,
              autofocus: true,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'জমা টাকা (৳) *',
                labelStyle: TextStyle(color: Colors.grey),
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('বাতিল', style: TextStyle(color: Colors.grey))),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
            onPressed: () async {
              final pay = double.tryParse(payCtrl.text.trim()) ?? 0.0;
              if (pay <= 0) return;
              await _firestoreService.collectDuePayment(due.id, due.paidAmount, pay);
              if (ctx.mounted) Navigator.pop(ctx);
            },
            child: const Text('জমা নিশ্চিত করুন', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showBrilliantSmsDialog(CustomerDue due, Map<String, dynamic>? profileData) {
    final shopName = profileData?['businessName'] ?? 'দোকানের হিসাব';
    final brilliantNum = profileData?['brilliantNumber'] ?? '';

    final smsText = SmsService.formatDueReminderSms(
      customerName: due.customerName,
      dueAmount: due.remainingDue,
      shopName: shopName,
      brilliantNumber: brilliantNum,
    );

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF111827),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: const [
            Icon(Icons.cell_tower, color: Color(0xFF06B6D4)),
            SizedBox(width: 8),
            Text('ব্রিলিয়ান্ট এসএমএস তাগাদা', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('প্রাপক: ${due.customerName} (${due.customerPhone})', style: const TextStyle(color: Colors.cyanAccent, fontWeight: FontWeight.w600)),
            if (brilliantNum.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text('ব্রিলিয়ান্ট প্রেরক: $brilliantNum', style: const TextStyle(color: Colors.tealAccent, fontSize: 12)),
            ],
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.cyan.withOpacity(0.3)),
              ),
              child: Text(
                smsText,
                style: const TextStyle(color: Colors.white, fontSize: 13, height: 1.4),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('বন্ধ করুন', style: TextStyle(color: Colors.grey))),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF06B6D4)),
            icon: const Icon(Icons.send_rounded, color: Colors.white, size: 18),
            label: const Text('এসএমএস পাঠান', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            onPressed: () async {
              Navigator.pop(ctx);
              await SmsService.sendSms(
                phoneNumber: due.customerPhone,
                message: smsText,
              );
            },
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<dynamic>(
      stream: _firestoreService.getUserProfileStream(),
      builder: (context, profileSnap) {
        final profileData = profileSnap.data != null ? profileSnap.data.data() as Map<String, dynamic>? : null;

        return Column(
          children: [
            // Header Search & Add
            Container(
              padding: const EdgeInsets.all(16),
              color: const Color(0xFF0F172A),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      style: const TextStyle(color: Colors.white, fontSize: 14),
                      decoration: InputDecoration(
                        hintText: 'কাস্টমার বা মোবাইল নম্বর খুঁজুন...',
                        hintStyle: TextStyle(color: Colors.grey.shade500),
                        prefixIcon: const Icon(Icons.search, color: Color(0xFF10B981)),
                        filled: true,
                        fillColor: const Color(0xFF1E293B),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                      ),
                      onChanged: (val) {
                        setState(() {
                          _searchQuery = val.trim().toLowerCase();
                        });
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  ElevatedButton.icon(
                    onPressed: _showAddDueDialog,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      shape: BorderRadius.circular(12),
                    ),
                    icon: const Icon(Icons.person_add_alt_1, size: 20),
                    label: const Text('বাকি যোগ', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),

            // Due List
            Expanded(
              child: StreamBuilder<List<CustomerDue>>(
                stream: _firestoreService.getDuesStream(),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator(color: Color(0xFF10B981)));
                  }

                  final dues = snapshot.data ?? [];
                  final filtered = dues.where((d) {
                    if (_searchQuery.isEmpty) return true;
                    return d.customerName.toLowerCase().contains(_searchQuery) ||
                        d.customerPhone.contains(_searchQuery);
                  }).toList();

                  if (filtered.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.receipt_long_outlined, size: 64, color: Colors.grey.shade600),
                          const SizedBox(height: 16),
                          Text(
                            _searchQuery.isEmpty ? 'কোনো বাকির খাতা নেই! নতুন বাকি যোগ করুন।' : 'কোনো বাকি খুঁজে পাওয়া যায়নি।',
                            style: TextStyle(color: Colors.grey.shade400, fontSize: 16),
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton.icon(
                            onPressed: _showAddDueDialog,
                            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
                            icon: const Icon(Icons.add, color: Colors.white),
                            label: const Text('বাকি এন্ট্রি করুন', style: TextStyle(color: Colors.white)),
                          )
                        ],
                      ),
                    );
                  }

                  return ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: filtered.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final due = filtered[index];
                      final isPaid = due.isFullyPaid;

                      return Container(
                        decoration: BoxDecoration(
                          color: const Color(0xFF111827),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isPaid ? Colors.green.withOpacity(0.2) : Colors.amber.withOpacity(0.25),
                          ),
                        ),
                        padding: const EdgeInsets.all(14),
                        child: Row(
                          children: [
                            Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                color: isPaid ? const Color(0xFF064E3B) : const Color(0xFF78350F),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Icon(
                                isPaid ? Icons.check : Icons.account_balance_wallet_outlined,
                                color: isPaid ? const Color(0xFF10B981) : Colors.amber,
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    due.customerName,
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    due.customerPhone.isNotEmpty ? due.customerPhone : 'নম্বর নেই',
                                    style: TextStyle(color: Colors.grey.shade400, fontSize: 12),
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      Text(
                                        'বকেয়া: ৳${due.remainingDue.toStringAsFixed(0)}',
                                        style: TextStyle(
                                          color: isPaid ? Colors.greenAccent : Colors.amberAccent,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 13,
                                        ),
                                      ),
                                      if (due.paidAmount > 0) ...[
                                        const SizedBox(width: 8),
                                        Text(
                                          '(জমা: ৳${due.paidAmount.toStringAsFixed(0)})',
                                          style: TextStyle(color: Colors.grey.shade400, fontSize: 11),
                                        ),
                                      ],
                                    ],
                                  ),
                                ],
                              ),
                            ),

                            // Brilliant SMS reminder button
                            if (due.customerPhone.isNotEmpty && !isPaid) ...[
                              IconButton(
                                tooltip: 'ব্রিলিয়ান্ট এসএমএস পাঠান',
                                icon: const Icon(Icons.sms_outlined, color: Color(0xFF06B6D4)),
                                onPressed: () => _showBrilliantSmsDialog(due, profileData),
                              ),
                            ],

                            // Collect payment
                            if (!isPaid) ...[
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF10B981),
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                  minimumSize: Size.zero,
                                ),
                                onPressed: () => _showCollectPaymentDialog(due),
                                child: const Text('জমা নিন', style: TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.bold)),
                              ),
                            ],

                            IconButton(
                              icon: const Icon(Icons.delete_outline, color: Colors.roseAccent, size: 20),
                              onPressed: () async {
                                final confirm = await showDialog<bool>(
                                  context: context,
                                  builder: (ctx) => AlertDialog(
                                    backgroundColor: const Color(0xFF111827),
                                    title: const Text('বাকি হিসাব মুছে ফেলবেন?', style: TextStyle(color: Colors.white)),
                                    content: Text('${due.customerName} এর বাকির হিসাব মুছবেন?', style: const TextStyle(color: Colors.grey)),
                                    actions: [
                                      TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('না')),
                                      ElevatedButton(
                                        style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                                        onPressed: () => Navigator.pop(ctx, true),
                                        child: const Text('মুছুন'),
                                      ),
                                    ],
                                  ),
                                );
                                if (confirm == true) {
                                  await _firestoreService.deleteDue(due.id);
                                }
                              },
                            ),
                          ],
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        );
      },
    );
  }
}
