# Dokaner Hisab (দোকানের হিসাব) - Native Android App

Native Android Application built with **Kotlin** and **Jetpack Compose**.

## Features Included
1. **ইনভেন্টরি ও পণ্য স্টক ব্যবস্থাপনা (Inventory & Products)**:
   - খুচরা ও পাইকারি দর ট্র্যাকিং (Cost, Wholesale, Retail).
   - স্টক এলার্ট ও ফিল্টার (সব পণ্য, পর্যাপ্ত স্টক, সতর্কতামূলক কম স্টক, স্টক শেষ).
   - দ্রুত বিক্রয় পিওএস (Quick Sell POS) - স্বয়ংক্রিয় স্টক হ্রাস ও তাৎক্ষণিক লাভ হিসাব।
2. **দোকানের খরচ ট্র্যাকিং (Expenses Manager)**:
   - দোকান ভাড়া, বিদ্যুৎ বিল, কর্মচারীর বেতন, পরিবহন খরচ ইত্যাদি।
3. **বাকির খাতা (Customer Due Ledger)**:
   - কাস্টমার নাম, মোবাইল, ব্রিলিয়ান্ট নম্বর, মালামালের বিবরণ, বাকি ও জমার পরিমাণ।
   - ১-ক্লিক মোবাইল কল ডায়ালার (`Intent.ACTION_DIAL`).
   - বকেয়া কিস্তি জমা নেওয়ার ডায়ালগ।
4. **ছোট বাকির খাতা (Mini Khata)**:
   - দৈনিক খুচরা বাকি হিসাব। ১-ট্যাপে আদায় ও পরিশোধ মার্কিং।
5. **লাভ-ক্ষতি ও আর্থিক অ্যানালিটিক্স (Analytics)**:
   - মোট ইনভেন্টরি ক্রয়মূল্য, বিক্রয়মূল্য, সম্ভাব্য নিট মুনাফা ও ব্যালেন্স।
6. **ব্যবসা পরিচালনার সেরা পরামর্শ ও টিপস (Business Tips)**.
7. **হিসাবের ক্যালকুলেটর (Mini Calculator)**: দ্রুত হিসাব ও হিস্ট্রি ট্র্যাকিং।
8. **মাইক্রোফোন ভয়েস সার্চ (Voice Speech Search)**:
   - Android SpeechRecognizer দিয়ে মুখে বলে সার্চ করার সুবিধা (বাংলা `bn-BD` সাপোর্ট সহ)।

---

## How to Build the APK

### Method 1: Using Android Studio
1. Open **Android Studio** (Hedgehog, Iguana, Koala, Ladybug or newer).
2. Select **Open** and choose the `android` folder.
3. Allow Gradle sync to complete.
4. Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
5. Once built, click **locate** to find `app-debug.apk` and transfer to your Android phone.

### Method 2: Command Line (CLI)
```bash
cd android
./gradlew assembleDebug
```
The APK will be located at:
`android/app/build/outputs/apk/debug/app-debug.apk`

For release APK:
```bash
./gradlew assembleRelease
```
The release APK will be generated at:
`android/app/build/outputs/apk/release/app-release-unsigned.apk`
