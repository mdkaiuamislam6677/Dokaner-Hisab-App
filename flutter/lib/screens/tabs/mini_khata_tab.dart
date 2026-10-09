import 'package:flutter/material.dart';
import '../../models/mini_khata.dart';
import '../../services/firestore_service.dart';

class MiniKhataTab extends StatefulWidget {
  const MiniKhataTab({Key? key}) : super(key: key);

  @override
  State<MiniKhataTab> createState() => _MiniKhataTabState();
}

class _MiniKhataTabState extends State<MiniKhataTab> {
  final FirestoreService _firestoreService = FirestoreService();

  void _showAddMiniKhataDialog() {
    final nameCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final amountCtrl = TextEditingController();
    final noteCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF111827),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('ছোট বাকি যোগ করুন', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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
                controller: amountCtrl,
                keyboardType: TextInputType.number,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'টাকার পরিমাণ (৳) *', labelStyle: TextStyle(color: Colors.grey)),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: phoneCtrl,
                keyboardType: TextInputType.phone,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'মোবাইল (ঐচ্ছিক)', labelStyle: TextStyle(color: Colors.grey)),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: noteCtrl,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'বিবরণ', labelStyle: TextStyle(color: Colors.grey)),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('বাতিল', style: TextStyle(color: Colors.grey))),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
            onPressed: () async {
              final name = nameCtrl.text.trim();
              final amount = double.tryParse(amountCtrl.text.trim()) ?? 0.0;
              if (name.isEmpty || amount <= 0) return;

              final item = MiniKhataItem(
                id: '',
                customerName: name,
                phone: phoneCtrl.text.trim(),
                amount: amount,
                note: noteCtrl.text.trim(),
                isPaid: false,
                date: DateTime.now(),
              );

              await _firestoreService.addMiniKhata(item);
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
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          color: const Color(0xFF0F172A),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'ছোট খাতা (তাৎক্ষণিক বাকি)',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
              ),
              ElevatedButton.icon(
                onPressed: _showAddMiniKhataDialog,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  shape: BorderRadius.circular(12),
                ),
                icon: const Icon(Icons.add, size: 20),
                label: const Text('বাকি যোগ', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
        Expanded(
          child: StreamBuilder<List<MiniKhataItem>>(
            stream: _firestoreService.getMiniKhataStream(),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator(color: Color(0xFF10B981)));
              }

              final items = snapshot.data ?? [];
              if (items.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.edit_note, size: 64, color: Colors.grey.shade600),
                      const SizedBox(height: 16),
                      Text('কোনো ছোট বাকি নেই!', style: TextStyle(color: Colors.grey.shade400, fontSize: 16)),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: _showAddMiniKhataDialog,
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
                        icon: const Icon(Icons.add, color: Colors.white),
                        label: const Text('যোগ করুন', style: TextStyle(color: Colors.white)),
                      )
                    ],
                  ),
                );
              }

              return ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: items.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (context, index) {
                  final item = items[index];
                  return Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFF111827),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: item.isPaid ? Colors.green.withOpacity(0.2) : Colors.amber.withOpacity(0.25)),
                    ),
                    padding: const EdgeInsets.all(14),
                    child: Row(
                      children: [
                        Checkbox(
                          value: item.isPaid,
                          activeColor: const Color(0xFF10B981),
                          onChanged: (_) => _firestoreService.toggleMiniKhataPaid(item.id, item.isPaid),
                        ),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                item.customerName,
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15,
                                  decoration: item.isPaid ? TextDecoration.lineThrough : null,
                                ),
                              ),
                              if (item.note.isNotEmpty)
                                Text(item.note, style: TextStyle(color: Colors.grey.shade400, fontSize: 12)),
                            ],
                          ),
                        ),
                        Text(
                          '৳${item.amount.toStringAsFixed(0)}',
                          style: TextStyle(
                            color: item.isPaid ? Colors.greenAccent : Colors.amberAccent,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete_outline, color: Colors.grey, size: 20),
                          onPressed: () => _firestoreService.deleteMiniKhata(item.id),
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
  }
}
