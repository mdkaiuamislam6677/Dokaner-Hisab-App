import 'package:cloud_firestore/cloud_firestore.dart';

class Product {
  final String id;
  final String name;
  final String category;
  final double buyPrice;
  final double wholesalePrice;
  final double retailPrice;
  final int stockQuantity;
  final String unit;
  final int minStockAlert;
  final DateTime updatedAt;

  Product({
    required this.id,
    required this.name,
    this.category = 'সাধারণ',
    required this.buyPrice,
    required this.wholesalePrice,
    required this.retailPrice,
    required this.stockQuantity,
    this.unit = 'পিস',
    this.minStockAlert = 5,
    required this.updatedAt,
  });

  factory Product.fromFirestore(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>? ?? {};
    return Product(
      id: doc.id,
      name: data['name'] ?? '',
      category: data['category'] ?? 'সাধারণ',
      buyPrice: (data['buyPrice'] ?? 0.0).toDouble(),
      wholesalePrice: (data['wholesalePrice'] ?? 0.0).toDouble(),
      retailPrice: (data['retailPrice'] ?? 0.0).toDouble(),
      stockQuantity: (data['stockQuantity'] ?? 0).toInt(),
      unit: data['unit'] ?? 'পিস',
      minStockAlert: (data['minStockAlert'] ?? 5).toInt(),
      updatedAt: data['updatedAt'] != null
          ? (data['updatedAt'] as Timestamp).toDate()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'category': category,
      'buyPrice': buyPrice,
      'wholesalePrice': wholesalePrice,
      'retailPrice': retailPrice,
      'stockQuantity': stockQuantity,
      'unit': unit,
      'minStockAlert': minStockAlert,
      'updatedAt': Timestamp.fromDate(updatedAt),
    };
  }
}
