import {
  collection, query, where, orderBy, limit as firestoreLimit,
  getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc,
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, GoogleAuthProvider, signOut,
  sendPasswordResetEmail, confirmPasswordReset,
  sendEmailVerification,
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, firestore, storage } from '@/lib/firebase';

// Set by AuthContext after loading user profile
let currentFamilyId = null;
export const setFamilyId = (id) => { currentFamilyId = id; };
export const getFamilyId = () => currentFamilyId;

const toCollectionName = (name) =>
  name.charAt(0).toLowerCase() + name.slice(1) + 's';

const parseSortField = (sortField) => {
  if (!sortField) return null;
  const desc = sortField.startsWith('-');
  return { field: desc ? sortField.slice(1) : sortField, direction: desc ? 'desc' : 'asc' };
};

const docToObj = (docSnap) => {
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
};

const createEntityApi = (entityName) => {
  const collectionName = toCollectionName(entityName);
  return {
    async list(sortField, limitCount) {
      const sort = parseSortField(sortField);
      const constraints = [];
      if (currentFamilyId) constraints.push(where('familyId', '==', currentFamilyId));
      if (sort) constraints.push(orderBy(sort.field, sort.direction));
      if (limitCount) constraints.push(firestoreLimit(limitCount));
      const q = query(collection(firestore, collectionName), ...constraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(docToObj);
    },
    async filter(filters, sortField, limitCount) {
      const sort = parseSortField(sortField);
      const constraints = [];
      if (currentFamilyId) constraints.push(where('familyId', '==', currentFamilyId));
      for (const [key, value] of Object.entries(filters)) {
        constraints.push(where(key, '==', value));
      }
      if (sort) constraints.push(orderBy(sort.field, sort.direction));
      if (limitCount) constraints.push(firestoreLimit(limitCount));
      const q = query(collection(firestore, collectionName), ...constraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(docToObj);
    },
    async get(id) {
      const docSnap = await getDoc(doc(firestore, collectionName, id));
      return docToObj(docSnap);
    },
    async create(data) {
      const payload = {
        ...data,
        familyId: currentFamilyId || null,
        created_date: new Date().toISOString(),
        created_by_id: auth.currentUser?.uid || null,
      };
      const docRef = await addDoc(collection(firestore, collectionName), payload);
      return { id: docRef.id, ...payload };
    },
    async update(id, data) {
      await updateDoc(doc(firestore, collectionName, id), data);
      return { id, ...data };
    },
    async delete(id) {
      await deleteDoc(doc(firestore, collectionName, id));
      return { id };
    },
  };
};

const googleProvider = new GoogleAuthProvider();

const authApi = {
  async me() {
    const user = auth.currentUser;
    if (!user) return null;
    return {
      id: user.uid,
      full_name: user.displayName || user.email?.split('@')[0] || 'User',
      email: user.email,
    };
  },
  async loginViaEmailPassword(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  },
  async loginWithProvider(provider, redirectUrl) {
    if (provider === 'google') {
      await signInWithPopup(auth, googleProvider);
      if (redirectUrl) window.location.href = redirectUrl;
    }
  },
  async logout(redirectUrl) {
    await signOut(auth);
    window.location.href = redirectUrl || '/login';
  },
  redirectToLogin() {
    window.location.href = '/login';
  },
  async register({ email, password }) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(credential.user);
    return credential;
  },
  async verifyOtp() {
    // Firebase uses email verification links, not OTP. User is already signed in.
    return {};
  },
  async resendOtp() {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  },
  setToken() {},
  async resetPasswordRequest(email) {
    return sendPasswordResetEmail(auth, email);
  },
  async resetPassword({ resetToken, newPassword }) {
    return confirmPasswordReset(auth, resetToken, newPassword);
  },
};

const integrationsApi = {
  Core: {
    async UploadFile({ file }) {
      const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const file_url = await getDownloadURL(storageRef);
      return { file_url };
    },
  },
};

const entities = new Proxy({}, {
  get(_, entityName) {
    return createEntityApi(entityName);
  },
});

const db = { auth: authApi, entities, integrations: integrationsApi };
export default db;
