import 'package:flutter/material.dart';
import '../../services/auth_service.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({Key? key}) : super(key: key);

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nameController = TextEditingController();
  final _businessNameController = TextEditingController();
  final _identifierController = TextEditingController();
  final _brilliantController = TextEditingController();
  final _passwordController = TextEditingController();
  final _authService = AuthService();
  bool _isLoading = false;
  String? _errorMessage;

  Future<void> _handleRegister() async {
    final name = _nameController.text.trim();
    final businessName = _businessNameController.text.trim();
    final identifier = _identifierController.text.trim();
    final brilliant = _brilliantController.text.trim();
    final password = _passwordController.text.trim();

    if (name.isEmpty || businessName.isEmpty || identifier.isEmpty || password.isEmpty) {
      setState(() {
        _errorMessage = 'দয়া করে নাম, দোকানের নাম, মোবাইল/ইমেইল এবং পাসওয়ার্ড পূরণ করুন';
      });
      return;
    }

    if (password.length < 6) {
      setState(() {
        _errorMessage = 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      String email = identifier.contains('@') ? identifier : '$identifier@dokanerhisab.app';
      String phone = identifier.contains('@') ? '' : identifier;

      final result = await _authService.signUpUser(
        name: name,
        phone: phone,
        email: email,
        password: password,
        businessName: businessName,
        brilliantNumber: brilliant.isNotEmpty ? brilliant : null,
      );

      if (result == "success") {
        if (mounted) {
          Navigator.pop(context); // Return or automatically navigate to Home
        }
      } else {
        setState(() {
          _errorMessage = result ?? 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'রেজিস্ট্রেশন ব্যর্থ হয়েছে: $e';
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1D),
      appBar: AppBar(
        title: const Text('নতুন দোকান একাউন্ট তৈরি'),
        backgroundColor: const Color(0xFF111827),
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Container(
              constraints: const BoxConstraints(maxWidth: 440),
              padding: const EdgeInsets.all(24.0),
              decoration: BoxDecoration(
                color: const Color(0xFF111827),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.white.withOpacity(0.08)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    'দোকানদার রেজিস্ট্রেশন',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'সম্পূর্ণ নতুন ও ফ্রেশ ডাটাবেজ তৈরি হবে (কোনো ডেমো ডাটা থাকবে না)',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.emerald.shade400,
                    ),
                  ),
                  const SizedBox(height: 20),

                  if (_errorMessage != null) ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF881337),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFF43F5E)),
                      ),
                      child: Text(
                        _errorMessage!,
                        style: const TextStyle(color: Color(0xFFFECDD3), fontSize: 13),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  TextField(
                    controller: _nameController,
                    style: const TextStyle(color: Colors.white),
                    decoration: _inputDecoration('আপনার পুরো নাম *', Icons.person_outline),
                  ),
                  const SizedBox(height: 14),

                  TextField(
                    controller: _businessNameController,
                    style: const TextStyle(color: Colors.white),
                    decoration: _inputDecoration('দোকান / ব্যবসার নাম *', Icons.store_outlined),
                  ),
                  const SizedBox(height: 14),

                  TextField(
                    controller: _identifierController,
                    style: const TextStyle(color: Colors.white),
                    decoration: _inputDecoration('মোবাইল নম্বর অথবা ইমেইল *', Icons.phone_android_outlined),
                  ),
                  const SizedBox(height: 14),

                  TextField(
                    controller: _brilliantController,
                    style: const TextStyle(color: Colors.white),
                    decoration: _inputDecoration('ব্রিলিয়ান্ট নাম্বার (০৯৬৩৮... এসএমএসের জন্য)', Icons.cell_tower_outlined),
                  ),
                  const SizedBox(height: 14),

                  TextField(
                    controller: _passwordController,
                    obscureText: true,
                    style: const TextStyle(color: Colors.white),
                    decoration: _inputDecoration('পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *', Icons.lock_outline),
                  ),
                  const SizedBox(height: 22),

                  ElevatedButton(
                    onPressed: _isLoading ? null : _handleRegister,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: BorderRadius.circular(14),
                    ),
                    child: _isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Text(
                            'একাউন্ট তৈরি করুন',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String label, IconData icon) {
    return InputDecoration(
      labelText: label,
      labelStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13),
      prefixIcon: Icon(icon, color: const Color(0xFF10B981)),
      filled: true,
      fillColor: const Color(0xFF0F172A),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(color: Colors.grey.shade800),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(color: Colors.grey.shade800),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Color(0xFF10B981)),
      ),
    );
  }
}
