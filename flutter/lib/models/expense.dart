import 'package:cloud_firestore/cloud_firestore.dart';

class Expense {
  final String id;
  final String title;
  final String category;
  final double amount;
  final String note;
  final DateTime date;

  Expense({
    required this.id,
    required this.title,
    this.category = 'সাধারণ খরচ',
    required this.amount,
    this.note = '',
    required this.date,
  });

  factory Expense.fromFirestore(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>? ?? {};
    return Expense(
      id: doc.id,
      title: data['title'] ?? '',
      category: data['category'] ?? 'সাধারণ খরচ',
      amount: (data['amount'] ?? 0.0).toDouble(),
      note: data['note'] ?? '',
      date: data['date'] != null
          ? (data['date'] as Timestamp).toDate()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'title': title,
      'category': category,
      'amount': amount,
      'note': note,
      'date': Timestamp.fromDate(date),
    };
  }
}
