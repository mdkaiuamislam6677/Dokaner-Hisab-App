import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/product.dart';
import '../models/due.dart';
import '../models/expense.dart';
import '../models/mini_khata.dart';

class FirestoreService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  String? get uid => _auth.currentUser?.uid;

  DocumentReference<Map<String, dynamic>>? get userDoc {
    final currentUid = uid;
    if (currentUid == null) return null;
    return _firestore.collection('users').doc(currentUid);
  }

  // --- PRODUCTS / INVENTORY ---
  Stream<List<Product>> getProductsStream() {
    final doc = userDoc;
    if (doc == null) return Stream.value([]);
    return doc
        .collection('products')
        .orderBy('updatedAt', descending: true)
        .snapshots()
        .map((snapshot) =>
            snapshot.docs.map((d) => Product.fromFirestore(d)).toList());
  }

  Future<void> addProduct(Product product) async {
    final doc = userDoc;
    if (doc == null) return;
    await doc.collection('products').add(product.toMap());
  }

  Future<void> updateProduct(Product product) async {
    final doc = userDoc;
    if (doc == null) return;
    await doc.collection('products').doc(product.id).update(product.toMap());
  }

  Future<void> deleteProduct(String productId) async {
    final doc = userDoc;
    if (doc == null) return;
    await doc.collection('products').doc(productId).delete();
  }

  // --- EXPENSES ---
  Stream<List<Expense>> getExpensesStream() {
    final doc = userDoc;
    if (doc == null) return Stream.value([]);
    return doc
        .collection('expenses')
        .orderBy('date', descending: true)
        .snapshots()
        .map((snapshot) =>
            snapshot.docs.map((d) => Expense.fromFirestore(d)).toList());
  }

  Future<void> addExpense(Expense expense) async {
    final doc = userDoc;
    if (doc == null) return;
    await doc.collection('expenses').add(expense.toMap());
  }

  Future<void> deleteExpense(String expenseId) async {
    final doc = userDoc;
    if (doc == null) return;
    await doc.collection('expenses').doc(expenseId).delete();
  }

  // --- DUES / BAKIR KHATA ---
  Stream<List<CustomerDue>> getDuesStream() {
    final doc = userDoc;
    if (doc == null) return Stream.value([]);
    return doc
        .collection('dues')
        .orderBy('updatedAt', descending: true)
        .snapshots()
        .map((snapshot) =>
            snapshot.docs.map((d) => CustomerDue.fromFirestore(d)).toList());
  }

  Future<void> addDue(CustomerDue due) async {
    final doc = userDoc;
    if (doc == null) return;
    await doc.collection('dues').add(due.toMap());
  }

  Future<void> collectDuePayment(String dueId, double currentPaid, double additionalPayment) async {
    final doc = userDoc;
    if (doc == null) return;
    await doc.collection('dues').doc(dueId).update({
      'paidAmount': currentPaid + additionalPayment,
      'updatedAt': Timestamp.now(),
    });
  }

  Future<void> deleteDue(String dueId) async {
    final doc = userDoc;
    if (doc == null) return;
    await doc.collection('dues').doc(dueId).delete();
  }

  // --- MINI KHATA ---
  Stream<List<MiniKhataItem>> getMiniKhataStream() {
    final doc = userDoc;
    if (doc == null) return Stream.value([]);
    return doc
        .collection('mini_khata')
        .orderBy('date', descending: true)
        .snapshots()
        .map((snapshot) =>
            snapshot.docs.map((d) => MiniKhataItem.fromFirestore(d)).toList());
  }

  Future<void> addMiniKhata(MiniKhataItem item) async {
    final doc = userDoc;
    if (doc == null) return;
    await doc.collection('mini_khata').add(item.toMap());
  }

  Future<void> toggleMiniKhataPaid(String id, bool currentStatus) async {
    final doc = userDoc;
    if (doc == null) return;
    await doc.collection('mini_khata').doc(id).update({
      'isPaid': !currentStatus,
    });
  }

  Future<void> deleteMiniKhata(String id) async {
    final doc = userDoc;
    if (doc == null) return;
    await doc.collection('mini_khata').doc(id).delete();
  }

  // --- USER PROFILE ---
  Stream<DocumentSnapshot<Map<String, dynamic>>?> getUserProfileStream() {
    final doc = userDoc;
    if (doc == null) return Stream.value(null);
    return doc.snapshots();
  }

  Future<void> updateUserProfile({
    required String name,
    required String businessName,
    String? brilliantNumber,
    String? phone,
  }) async {
    final doc = userDoc;
    if (doc == null) return;
    await doc.set({
      'name': name,
      'businessName': businessName,
      'brilliantNumber': brilliantNumber ?? '',
      'phone': phone ?? '',
      'updatedAt': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }
}
