# Dokaner Hisab - Flutter + Firebase Mobile App
## (দোকানের হিসাব - ইনভেন্টরি, খরচ, বাকির খাতা ও ব্রিলিয়ান্ট এসএমএস)

এই Flutter মোবাইল প্রজেক্টটি সরাসরি আপনার দেওয়া রিকোয়ারমেন্ট অনুযায়ী প্রস্তুত করা হয়েছে:
```yaml
dependencies:
  flutter:
    sdk: flutter
  firebase_core: ^2.27.0
  firebase_auth: ^4.17.8
  cloud_firestore: ^4.15.8
```

---

### প্রধান বৈশিষ্ট্যসমূহ (Core Features):
1. **Firebase Authentication (`firebase_auth: ^4.17.8`)**:
   - ক্লিন ও সিকিউর লগইন এবং নতুন একাউন্ট রেজিস্ট্রেশন।
   - কোনো ডেমো বা অটোমেটিক একাউন্ট তৈরি হবে না (সম্পূর্ণ ক্লিন শুরু)।
   - **ফরগেট পাসওয়ার্ড (Password Reset)**: সরাসরি ইমেইলে পাসওয়ার্ড রিসেট লিংক পাঠানো।
2. **Cloud Firestore (`cloud_firestore: ^4.15.8`)**:
   - রিয়েল-টাইম ক্লাউড সিঙ্ক (`StreamBuilder`)।
   - ইনভেন্টরি / পণ্য স্টক ব্যবস্থাপনা (কেনা দাম, পাইকারি, খুচরা দাম ও স্টক অ্যালার্ট)।
   - বাকির খাতা (কাস্টমার বাকি, বাকি আদায় ও হিস্ট্রি)।
   - দৈনিক খরচের খাতা ও লাভ-ক্ষতির সমীকরণ।
   - ছোট খাতা (তাৎক্ষণিক ছোট বাকি ট্র্যাক)।
3. **ব্রিলিয়ান্ট এসএমএস সুবিধা (Brilliant SMS)**:
   - কাস্টমারের বাকির তাগাদার জন্য বাংলায় স্বয়ংক্রিয় এসএমএস ফরম্যাট।
   - ব্রিলিয়ান্ট নম্বর (০৯৬৩৮...) প্রেরক হিসেবে যুক্ত করার সুবিধা।
   - ১-ক্লিকে এসএমএস অ্যাপ ওপেন ও কাস্টমারকে পাঠানো।

---

### যেভাবে রান করবেন (How to Run):
1. **ডিপেন্ডেন্সি ইনস্টল করুন**:
   ```bash
   cd flutter
   flutter pub get
   ```

2. **Firebase সেটআপ**:
   - Firebase Console (https://console.firebase.google.com) থেকে একটি প্রজেক্ট তৈরি করুন।
   - Authentication (Email/Password) এবং Cloud Firestore এনাবল করুন।
   - প্রজেক্ট সেটিংস থেকে আপনার `google-services.json` ডাউনলোড করে `android/app/google-services.json` ফাইলে রিপ্লেস করুন।

3. **অ্যাপ রান করুন**:
   ```bash
   flutter run
   ```
   অথবা APK তৈরি করতে:
   ```bash
   flutter build apk --release
   ```
