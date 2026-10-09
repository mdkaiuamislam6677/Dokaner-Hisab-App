import 'package:url_launcher/url_launcher.dart';

class SmsService {
  // Generate friendly Bengali due reminder SMS
  static String formatDueReminderSms({
    required String customerName,
    required double dueAmount,
    required String shopName,
    String? brilliantNumber,
  }) {
    String senderInfo = brilliantNumber != null && brilliantNumber.isNotEmpty
        ? '\nপ্রেরক: $shopName (ব্রিলিয়ান্ট: $brilliantNumber)'
        : '\nপ্রেরক: $shopName';

    return 'আসসালামু আলাইকুম $customerName ভাই/ম্যাডাম, $shopName এ আপনার মোট বকেয়া বাকি রয়েছে ৳${dueAmount.toStringAsFixed(0)} টাকা। সুযোগমতো পরিশোধ করার অনুরোধ রইল। ধন্যবাদ।$senderInfo';
  }

  // Open default SMS app
  static Future<bool> sendSms({
    required String phoneNumber,
    required String message,
  }) async {
    final cleanPhone = phoneNumber.replaceAll(RegExp(r'[^0-9+]'), '');
    final Uri smsUri = Uri(
      scheme: 'sms',
      path: cleanPhone,
      queryParameters: <String, String>{
        'body': message,
      },
    );

    if (await canLaunchUrl(smsUri)) {
      return await launchUrl(smsUri);
    } else {
      // Fallback
      final Uri simpleUri = Uri.parse('sms:$cleanPhone?body=${Uri.encodeComponent(message)}');
      return await launchUrl(simpleUri);
    }
  }
}
