import 'package:flutter/material.dart';
import '../../services/auth_service.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({Key? key}) : super(key: key);

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _identifierController = TextEditingController();
  final _authService = AuthService();
  bool _isLoading = false;
  String? _message;
  String? _errorMessage;

  Future<void> _handleReset() async {
    final text = _identifierController.text.trim();
    if (text.isEmpty) {
      setState(() {
        _errorMessage = 'অনুগ্রহ করে আপনার ইমেইল বা ফোন নম্বর দিন';
        _message = null;
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _message = null;
    });

    try {
      await _authService.sendPasswordReset(text);
      setState(() {
        _message = 'পাসওয়ার্ড রিসেট লিঙ্ক আপনার ইমেইলে সফলভাবে পাঠানো হয়েছে! ইনবক্স অথবা স্প্যাম ফোল্ডার চেক করুন।';
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'রিসেট করতে ব্যর্থ হয়েছে। সঠিক ইমেইল বা একাউন্ট আইডি দিন। ($e)';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1D),
      appBar: AppBar(
        title: const Text('পাসওয়ার্ড রিসেট (Forgot Password)'),
        backgroundColor: const Color(0xFF111827),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Container(
            constraints: const BoxConstraints(maxWidth: 420),
            padding: const EdgeInsets.all(24.0),
            decoration: BoxDecoration(
              color: const Color(0xFF111827),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white.withOpacity(0.08)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Icon(
                  Icons.lock_reset,
                  color: Color(0xFF10B981),
                  size: 56,
                ),
                const SizedBox(height: 16),
                const Text(
                  'পাসওয়ার্ড পুনরুদ্ধার করুন',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'আপনার রেজিস্টার্ড ইমেইল বা একাউন্ট আইডি দিন। Firebase Auth থেকে আপনার ঠিকানায় পাসওয়ার্ড রিসেট লিংক পাঠানো হবে।',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.grey.shade400,
                  ),
                ),
                const SizedBox(height: 24),
                if (_message != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF064E3B),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF10B981)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.check_circle, color: Color(0xFF10B981), size: 20),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _message!,
                            style: const TextStyle(color: Color(0xFFA7F3D0), fontSize: 13),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
                if (_errorMessage != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF881337),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFFF43F5E)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline, color: Color(0xFFF43F5E), size: 20),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _errorMessage!,
                            style: const TextStyle(color: Color(0xFFFECDD3), fontSize: 13),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
                TextField(
                  controller: _identifierController,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    labelText: 'ইমেইল বা মোবাইল নম্বর',
                    labelStyle: TextStyle(color: Colors.grey.shade400),
                    prefixIcon: const Icon(Icons.email_outlined, color: Color(0xFF10B981)),
                    filled: true,
                    fillColor: const Color(0xFF0F172A),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.grey.shade800),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.grey.shade800),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFF10B981)),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: _isLoading ? null : _handleReset,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: BorderRadius.circular(12),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Text(
                          'রিসেট লিংক পাঠান',
                          style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                        ),
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text(
                    'লগইন পেজে ফিরে যান',
                    style: TextStyle(color: Color(0xFF10B981)),
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
