import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/expense.dart';
import '../../services/firestore_service.dart';

class ExpensesTab extends StatefulWidget {
  const ExpensesTab({Key? key}) : super(key: key);

  @override
  State<ExpensesTab> createState() => _ExpensesTabState();
}

class _ExpensesTabState extends State<ExpensesTab> {
  final FirestoreService _firestoreService = FirestoreService();

  void _showAddExpenseDialog() {
    final titleCtrl = TextEditingController();
    final amountCtrl = TextEditingController();
    final categoryCtrl = TextEditingController(text: 'সাধারণ খরচ');
    final noteCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF111827),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('নতুন খরচ যোগ করুন', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: titleCtrl,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'খরচের নাম / বিবরণ *', labelStyle: TextStyle(color: Colors.grey)),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: amountCtrl,
                keyboardType: TextInputType.number,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'খরচের পরিমাণ (৳) *', labelStyle: TextStyle(color: Colors.grey)),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: categoryCtrl,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'ক্যাটাগরি (দোকান ভাড়া / বিদ্যুৎ / ইত্যাদি)', labelStyle: TextStyle(color: Colors.grey)),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: noteCtrl,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'অতিরিক্ত নোট', labelStyle: TextStyle(color: Colors.grey)),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('বাতিল', style: TextStyle(color: Colors.grey))),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
            onPressed: () async {
              final title = titleCtrl.text.trim();
              final amount = double.tryParse(amountCtrl.text.trim()) ?? 0.0;
              if (title.isEmpty || amount <= 0) return;

              final expense = Expense(
                id: '',
                title: title,
                amount: amount,
                category: categoryCtrl.text.trim().isEmpty ? 'সাধারণ খরচ' : categoryCtrl.text.trim(),
                note: noteCtrl.text.trim(),
                date: DateTime.now(),
              );

              await _firestoreService.addExpense(expense);
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
        // Add Bar
        Container(
          padding: const EdgeInsets.all(16),
          color: const Color(0xFF0F172A),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'প্রতিদিনের খরচের খাতা',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
              ),
              ElevatedButton.icon(
                onPressed: _showAddExpenseDialog,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  shape: BorderRadius.circular(12),
                ),
                icon: const Icon(Icons.add, size: 20),
                label: const Text('খরচ যোগ', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),

        // Expense Stream List
        Expanded(
          child: StreamBuilder<List<Expense>>(
            stream: _firestoreService.getExpensesStream(),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator(color: Color(0xFF10B981)));
              }

              final expenses = snapshot.data ?? [];
              final totalExpense = expenses.fold<double>(0.0, (sum, item) => sum + item.amount);

              if (expenses.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.account_balance_wallet_outlined, size: 64, color: Colors.grey.shade600),
                      const SizedBox(height: 16),
                      Text(
                        'কোনো খরচ এন্ট্রি নেই!',
                        style: TextStyle(color: Colors.grey.shade400, fontSize: 16),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: _showAddExpenseDialog,
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
                        icon: const Icon(Icons.add, color: Colors.white),
                        label: const Text('প্রথম খরচ যোগ করুন', style: TextStyle(color: Colors.white)),
                      )
                    ],
                  ),
                );
              }

              return Column(
                children: [
                  Container(
                    margin: const EdgeInsets.all(16),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF881337), Color(0xFF4C0519)],
                      ),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.rose.withOpacity(0.3)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('মোট খরচ:', style: TextStyle(color: Colors.white70, fontSize: 14)),
                        Text('৳${totalExpense.toStringAsFixed(0)}', style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                  Expanded(
                    child: ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: expenses.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 10),
                      itemBuilder: (context, index) {
                        final ex = expenses[index];
                        final dateStr = DateFormat('dd MMM, yyyy').format(ex.date);

                        return Container(
                          decoration: BoxDecoration(
                            color: const Color(0xFF111827),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.white.withOpacity(0.06)),
                          ),
                          padding: const EdgeInsets.all(14),
                          child: Row(
                            children: [
                              Container(
                                width: 44,
                                height: 44,
                                decoration: BoxDecoration(
                                  color: const Color(0xFF881337).withOpacity(0.5),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Icon(Icons.money_off, color: Color(0xFFFB7185)),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(ex.title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                                    const SizedBox(height: 4),
                                    Text('${ex.category} • $dateStr', style: TextStyle(color: Colors.grey.shade400, fontSize: 12)),
                                  ],
                                ),
                              ),
                              Text('৳${ex.amount.toStringAsFixed(0)}', style: const TextStyle(color: Color(0xFFFB7185), fontSize: 16, fontWeight: FontWeight.bold)),
                              IconButton(
                                icon: const Icon(Icons.delete_outline, color: Colors.grey, size: 20),
                                onPressed: () => _firestoreService.deleteExpense(ex.id),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ],
    );
  }
}
