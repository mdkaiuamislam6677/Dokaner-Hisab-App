import 'package:cloud_firestore/cloud_firestore.dart';

class CustomerDue {
  final String id;
  final String customerName;
  final String customerPhone;
  final String customerAddress;
  final double totalDue;
  final double paidAmount;
  final String note;
  final DateTime createdAt;
  final DateTime updatedAt;

  CustomerDue({
    required this.id,
    required this.customerName,
    required this.customerPhone,
    this.customerAddress = '',
    required this.totalDue,
    this.paidAmount = 0.0,
    this.note = '',
    required this.createdAt,
    required this.updatedAt,
  });

  double get remainingDue => totalDue - paidAmount;
  bool get isFullyPaid => remainingDue <= 0.01;

  factory CustomerDue.fromFirestore(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>? ?? {};
    return CustomerDue(
      id: doc.id,
      customerName: data['customerName'] ?? '',
      customerPhone: data['customerPhone'] ?? '',
      customerAddress: data['customerAddress'] ?? '',
      totalDue: (data['totalDue'] ?? 0.0).toDouble(),
      paidAmount: (data['paidAmount'] ?? 0.0).toDouble(),
      note: data['note'] ?? '',
      createdAt: data['createdAt'] != null
          ? (data['createdAt'] as Timestamp).toDate()
          : DateTime.now(),
      updatedAt: data['updatedAt'] != null
          ? (data['updatedAt'] as Timestamp).toDate()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'customerName': customerName,
      'customerPhone': customerPhone,
      'customerAddress': customerAddress,
      'totalDue': totalDue,
      'paidAmount': paidAmount,
      'note': note,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(updatedAt),
    };
  }
}
