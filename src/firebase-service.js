// Firebase Service layer connecting UI and state to Firebase Auth and Cloud Firestore
import { 
  auth, 
  db, 
  firebaseConfig,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from './firebase.js';

function normalizePhone(p) {
  return String(p || '').replace(/[\s-]/g, '').trim();
}

function getAuthEmail(email, phone) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (cleanEmail && cleanEmail.includes('@')) {
    return cleanEmail;
  }
  const digits = normalizePhone(phone).replace(/[^0-9]/g, '');
  return `${digits || 'user' + Date.now()}@dokanerhisab.com`;
}

function getAuthPassword(pwd) {
  const str = String(pwd || '').trim();
  if (str.length >= 6) return str;
  // Firebase Auth requires min 6 chars
  return (str + '000000').slice(0, 6);
}

export const FirebaseService = {
  config: firebaseConfig,
  auth,
  db,
  isOnline: true,

  // 1. নতুন ইউজার রেজিস্ট্রেশন ও ফায়ারস্টোরে তথ্য সংরক্ষণ
  async registerUser({ name, businessName, phone, email, password, brilliantNumber }) {
    const cleanName = String(name || '').trim();
    const cleanBusiness = String(businessName || '').trim();
    const cleanPhone = normalizePhone(phone);
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanBrilliant = String(brilliantNumber || '').trim();
    const rawPassword = String(password || '').trim();

    if (!cleanPhone && !cleanEmail) {
      return { success: false, message: 'মোবাইল নম্বর অথবা ইমেইল দেওয়া আবশ্যক।' };
    }
    if (!rawPassword) {
      return { success: false, message: 'পাসওয়ার্ড বা পিন দেওয়া আবশ্যক।' };
    }

    const authEmail = getAuthEmail(cleanEmail, cleanPhone);
    const authPassword = getAuthPassword(rawPassword);

    try {
      // Firebase Auth-এ একাউন্ট তৈরি
      const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      const uid = userCredential.user.uid;

      const profileData = {
        uid: uid,
        name: cleanName,
        businessName: cleanBusiness || 'আমার দোকান (My Store)',
        phone: cleanPhone,
        email: cleanEmail,
        authEmail: authEmail,
        brilliantNumber: cleanBrilliant,
        role: 'স্বত্বাধিকারী / Owner',
        passwordPin: rawPassword, // easy recall for local pin check
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      };

      // Firestore অনলাইন ডেটাবেজের 'users' কালেকশনে ইউজারের প্রোফাইল তথ্য সেভ করা
      await setDoc(doc(db, 'users', uid), profileData);

      // Firestore-এ স্টোরের প্রাথমিক খালি ডেটা ডক তৈরি করা
      await setDoc(doc(db, 'storeData', uid), {
        uid: uid,
        products: [],
        expenses: [],
        dues: [],
        miniKhata: [],
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });

      const userObj = {
        id: uid,
        uid: uid,
        name: cleanName,
        businessName: profileData.businessName,
        phone: cleanPhone,
        email: cleanEmail || authEmail,
        authEmail: authEmail,
        brilliantNumber: cleanBrilliant,
        password: rawPassword,
        role: profileData.role,
        createdAt: new Date().toISOString()
      };

      return { 
        success: true, 
        user: userObj,
        message: 'ফায়ারবেসে রেজিস্ট্রেশন সফল হয়েছে! ক্লাউডে ডেটা সেভ হয়েছে।' 
      };
    } catch (err) {
      console.error('Firebase signUp error:', err);
      let errorMsg = err.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।';
      if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'এই মোবাইল নম্বর বা ইমেইল দিয়ে ইতিমধ্যে Firebase-এ অ্যাকাউন্ট খোলা আছে! অনুগ্রহ করে লগইন করুন।';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'সঠিক ইমেইল ফরম্যাট দিন।';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।';
      }
      return { success: false, message: errorMsg, error: err };
    }
  },

  // ২. ইমেইল বা ফোন ও পাসওয়ার্ড দিয়ে লগইন
  async loginUser(identifier, password) {
    const rawId = String(identifier || '').trim();
    const rawPassword = String(password || '').trim();

    if (!rawId || !rawPassword) {
      return { success: false, message: 'মোবাইল নম্বর/ইমেইল এবং পাসওয়ার্ড দিন।' };
    }

    const cleanEmailCandidate = rawId.toLowerCase();
    const isEmail = cleanEmailCandidate.includes('@');
    const authEmail = isEmail ? cleanEmailCandidate : getAuthEmail('', rawId);
    const authPassword = getAuthPassword(rawPassword);

    try {
      let userCredential = null;
      let usedEmail = authEmail;

      try {
        userCredential = await signInWithEmailAndPassword(auth, authEmail, authPassword);
      } catch (err1) {
        // If password is raw or formatted differently, retry with rawPassword
        if (authPassword !== rawPassword) {
          try {
            userCredential = await signInWithEmailAndPassword(auth, authEmail, rawPassword);
          } catch (err2) {
            // If identifier was phone number, search Firestore for user doc with matching phone
            if (!isEmail) {
              const q = query(collection(db, 'users'), where('phone', '==', normalizePhone(rawId)));
              const snap = await getDocs(q);
              if (!snap.empty) {
                const foundDoc = snap.docs[0].data();
                if (foundDoc.authEmail) {
                  usedEmail = foundDoc.authEmail;
                  userCredential = await signInWithEmailAndPassword(auth, foundDoc.authEmail, authPassword);
                }
              }
            }
            if (!userCredential) throw err1;
          }
        } else {
          // Try lookup by phone if phone format differed
          if (!isEmail) {
            const q = query(collection(db, 'users'), where('phone', '==', normalizePhone(rawId)));
            const snap = await getDocs(q);
            if (!snap.empty) {
              const foundDoc = snap.docs[0].data();
              if (foundDoc.authEmail) {
                userCredential = await signInWithEmailAndPassword(auth, foundDoc.authEmail, authPassword);
              }
            }
          }
          if (!userCredential) throw err1;
        }
      }

      const uid = userCredential.user.uid;

      // Firestore থেকে ইউজারের প্রোফাইল ও স্টোর ডেটা আনা
      let profile = {};
      try {
        const userDocSnap = await getDoc(doc(db, 'users', uid));
        if (userDocSnap.exists()) {
          profile = userDocSnap.data();
        }
      } catch (e) {
        console.warn('Could not fetch user profile from firestore:', e);
      }

      let storeData = { products: [], expenses: [], dues: [], miniKhata: [] };
      try {
        const storeDocSnap = await getDoc(doc(db, 'storeData', uid));
        if (storeDocSnap.exists()) {
          storeData = storeDocSnap.data();
        }
      } catch (e) {
        console.warn('Could not fetch storeData from firestore:', e);
      }

      const userObj = {
        id: uid,
        uid: uid,
        name: profile.name || userCredential.user.displayName || 'দোকানদার',
        businessName: profile.businessName || 'আমার দোকান (My Store)',
        phone: profile.phone || (isEmail ? '' : rawId),
        email: profile.email || userCredential.user.email,
        authEmail: usedEmail,
        brilliantNumber: profile.brilliantNumber || '',
        password: rawPassword,
        role: profile.role || 'স্বত্বাধিকারী / Owner',
        createdAt: profile.createdAt || new Date().toISOString()
      };

      return {
        success: true,
        user: userObj,
        storeData: {
          products: storeData.products || [],
          expenses: storeData.expenses || [],
          dues: storeData.dues || [],
          miniKhata: storeData.miniKhata || []
        },
        message: 'Firebase ক্লাউডে লগইন সফল হয়েছে!'
      };
    } catch (err) {
      console.error('Firebase login error:', err);
      let errorMsg = 'লগইন ব্যর্থ হয়েছে: ';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        errorMsg += 'ব্যবহারকারী পাওয়া যায়নি অথবা পাসওয়ার্ড ভুল।';
      } else if (err.code === 'auth/wrong-password') {
        errorMsg += 'ভুল পাসওয়ার্ড বা পিন দিয়েছেন।';
      } else if (err.code === 'auth/too-many-requests') {
        errorMsg += 'অতিরিক্ত ভুল চেষ্টার কারণে সাময়িকভাবে ব্লক হয়েছে, কিছুক্ষণ পর আবার চেষ্টা করুন।';
      } else {
        errorMsg += (err.message || 'অনুগ্রহ করে তথ্য চেক করুন');
      }
      return { success: false, message: errorMsg, error: err };
    }
  },

  // ৩. ফায়ারস্টোরে ইনভেন্টরি, খরচ, বাকি ও মিনি খাতা ক্লাউড সিঙ্ক
  async syncToFirestore(uid, data) {
    if (!uid) return;
    try {
      const payload = {
        uid: uid,
        products: data.products || [],
        expenses: data.expenses || [],
        dues: data.dues || [],
        miniKhata: data.miniKhata || [],
        lastUpdated: serverTimestamp()
      };
      await setDoc(doc(db, 'storeData', uid), payload, { merge: true });
      return { success: true };
    } catch (err) {
      console.warn('Firestore sync failed (offline or permissions):', err);
      return { success: false, error: err };
    }
  },

  // ৪. ফায়ারস্টোর থেকে সম্পূর্ণ ডেটা রিলোড
  async fetchStoreData(uid) {
    if (!uid) return null;
    try {
      const snap = await getDoc(doc(db, 'storeData', uid));
      if (snap.exists()) {
        return snap.data();
      }
    } catch (err) {
      console.warn('Firestore fetch failed:', err);
    }
    return null;
  },

  // ৫. পাসওয়ার্ড রিসেট লিংক পাঠানো (যদি ইমেইল থাকে)
  async sendPasswordReset(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'আপনার ইমেইলে পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে।' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // ৬. সাইন আউট
  async logout() {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out error:', e);
    }
  },

  // ৭. অথেন্টিকেশন লিসেনার (স্বয়ংক্রিয় সেশন পর্যবেক্ষণ)
  initAuthListener(callback) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const uid = firebaseUser.uid;
          let profile = {};
          const userDocSnap = await getDoc(doc(db, 'users', uid));
          if (userDocSnap.exists()) {
            profile = userDocSnap.data();
          }
          const userObj = {
            id: uid,
            uid: uid,
            name: profile.name || firebaseUser.displayName || 'দোকানদার',
            businessName: profile.businessName || 'আমার দোকান (My Store)',
            phone: profile.phone || '',
            email: profile.email || firebaseUser.email,
            authEmail: firebaseUser.email,
            brilliantNumber: profile.brilliantNumber || '',
            role: profile.role || 'স্বত্বাধিকারী / Owner'
          };
          if (callback) callback(userObj);
        } catch (e) {
          console.warn('Auth listener doc fetch error:', e);
        }
      } else {
        if (callback) callback(null);
      }
    });
  }
};

window.FirebaseService = FirebaseService;
