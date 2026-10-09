import 'package:flutter/material.dart';
import 'auth_service.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({Key? key}) : super(key: key);

  @override
  _SignUpScreenState createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  void _handleSignUp() async {
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("ইমেইল ও পাসওয়ার্ড দেওয়া আবশ্যক")),
      );
      return;
    }

    setState(() => _isLoading = true);

    String? res = await AuthService().signUpUser(
      name: _nameController.text,
      phone: _phoneController.text,
      email: _emailController.text,
      password: _passwordController.text,
    );

    setState(() => _isLoading = false);

    if (res == "success") {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("রেজিস্ট্রেশন সফল হয়েছে! ক্লাউডে ডেটা সেভ হয়েছে।")),
      );
      Navigator.pop(context); // সফল হলে লগইন স্ক্রিনে ফেরত যাবে
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("ভুল হয়েছে: $res")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1D),
      appBar: AppBar(
        title: const Text("একাউন্ট তৈরি করুন"),
        backgroundColor: const Color(0xFF111827),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Container(
            constraints: const BoxConstraints(maxWidth: 440),
            padding: const EdgeInsets.all(24.0),
            decoration: BoxDecoration(
              color: const Color(0xFF111827),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white.withOpacity(0.08)),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  "নতুন দোকানদার সাইন আপ",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 18),
                TextField(
                  controller: _nameController,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    labelText: "নাম",
                    labelStyle: TextStyle(color: Colors.grey),
                    prefixIcon: Icon(Icons.person_outline, color: Color(0xFF10B981)),
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    labelText: "ফোন নম্বর",
                    labelStyle: TextStyle(color: Colors.grey),
                    prefixIcon: Icon(Icons.phone_android_outlined, color: Color(0xFF10B981)),
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    labelText: "ইমেইল",
                    labelStyle: TextStyle(color: Colors.grey),
                    prefixIcon: Icon(Icons.email_outlined, color: Color(0xFF10B981)),
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: _passwordController,
                  obscureText: true,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    labelText: "পাসওয়ার্ড",
                    labelStyle: TextStyle(color: Colors.grey),
                    prefixIcon: Icon(Icons.lock_outline, color: Color(0xFF10B981)),
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 24),
                _isLoading
                    ? const Center(child: CircularProgressIndicator(color: Color(0xFF10B981)))
                    : ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF10B981),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: BorderRadius.circular(12),
                        ),
                        onPressed: _handleSignUp,
                        child: const Text(
                          "সাইন আপ করুন",
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                      ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
