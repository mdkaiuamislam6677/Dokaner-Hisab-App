import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  Stream<User?> get authStateChanges => _auth.authStateChanges();
  User? get currentUser => _auth.currentUser;

  // ১. নতুন ইউজার রেজিস্ট্রেশন ও ফায়ারস্টোরে তথ্য সংরক্ষণ
  Future<String?> signUpUser({
    required String name,
    required String phone,
    required String email,
    required String password,
    String? businessName,
    String? brilliantNumber,
  }) async {
    try {
      // Firebase Auth-এ ইমেইল ও পাসওয়ার্ড দিয়ে একাউন্ট তৈরি
      UserCredential userCredential = await _auth.createUserWithEmailAndPassword(
        email: email.trim(),
        password: password.trim(),
      );

      String uid = userCredential.user!.uid;

      // Firestore অনলাইন ডেটাবেজে ইউজারের তথ্য সেভ করা
      await _firestore.collection('users').doc(uid).set({
        'uid': uid,
        'name': name.trim(),
        'phone': phone.trim(),
        'email': email.trim(),
        'businessName': (businessName != null && businessName.isNotEmpty) ? businessName.trim() : name.trim(),
        'brilliantNumber': (brilliantNumber != null && brilliantNumber.isNotEmpty) ? brilliantNumber.trim() : '',
        'createdAt': FieldValue.serverTimestamp(),
      });

      return "success";
    } on FirebaseAuthException catch (e) {
      return e.message;
    } catch (e) {
      return e.toString();
    }
  }

  // ২. অন্য যেকোনো ফোন থেকে ইমেইল ও পাসওয়ার্ড দিয়ে লগইন
  Future<String?> loginUser({
    required String email,
    required String password,
  }) async {
    try {
      await _auth.signInWithEmailAndPassword(
        email: email.trim(),
        password: password.trim(),
      );
      return "success";
    } on FirebaseAuthException catch (e) {
      return e.message;
    } catch (e) {
      return e.toString();
    }
  }

  // ৩. পাসওয়ার্ড রিসেট লিংক পাঠানো (Forgot Password)
  Future<void> sendPasswordReset(String email) async {
    String cleanEmail = email.trim();
    if (!cleanEmail.contains('@')) {
      cleanEmail = '$cleanEmail@dokanerhisab.app';
    }
    await _auth.sendPasswordResetEmail(email: cleanEmail);
  }

  // ৪. লগআউট
  Future<void> signOut() async {
    await _auth.signOut();
  }

  // Backward compatibility alias methods
  Future<String?> signIn({required String identifier, required String password}) async {
    String email = identifier.trim();
    if (!email.contains('@')) {
      email = '$email@dokanerhisab.app';
    }
    return await loginUser(email: email, password: password);
  }

  Future<String?> register({
    required String name,
    required String businessName,
    required String identifier,
    required String password,
    String? brilliantNumber,
  }) async {
    String email = identifier.trim();
    String phone = identifier.contains('@') ? '' : identifier.trim();
    if (!email.contains('@')) {
      email = '$email@dokanerhisab.app';
    }
    return await signUpUser(
      name: name,
      phone: phone,
      email: email,
      password: password,
      businessName: businessName,
      brilliantNumber: brilliantNumber,
    );
  }
}
