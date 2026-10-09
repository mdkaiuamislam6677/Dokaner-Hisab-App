import 'package:cloud_firestore/cloud_firestore.dart';

class MiniKhataItem {
  final String id;
  final String customerName;
  final String phone;
  final double amount;
  final String note;
  final bool isPaid;
  final DateTime date;

  MiniKhataItem({
    required this.id,
    required this.customerName,
    this.phone = '',
    required this.amount,
    this.note = '',
    this.isPaid = false,
    required this.date,
  });

  factory MiniKhataItem.fromFirestore(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>? ?? {};
    return MiniKhataItem(
      id: doc.id,
      customerName: data['customerName'] ?? '',
      phone: data['phone'] ?? '',
      amount: (data['amount'] ?? 0.0).toDouble(),
      note: data['note'] ?? '',
      isPaid: data['isPaid'] ?? false,
      date: data['date'] != null
          ? (data['date'] as Timestamp).toDate()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'customerName': customerName,
      'phone': phone,
      'amount': amount,
      'note': note,
      'isPaid': isPaid,
      'date': Timestamp.fromDate(date),
    };
  }
}
