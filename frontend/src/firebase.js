import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  fetchMongoHistory,
  createMongoSession,
  updateMongoSession,
  deleteMongoSession,
} from './api';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);

const firebaseConfigHint =
  'Firebase config is missing or invalid. Make sure the values in frontend/.env match the same Firebase project and that Authentication is enabled in Firebase Console.';

export const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export { onAuthStateChanged };

const LOCAL_STORAGE_KEY_PREFIX = 'pdf_chat_history_';

export const getLocalHistory = (uid) => {
  if (!uid) return [];
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${uid}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read local chat history:', e);
    return [];
  }
};

export const saveLocalHistory = (uid, history) => {
  if (!uid) return;
  try {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${uid}`, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save local chat history:', e);
  }
};

const ensureFirebase = () => {
  if (!auth) {
    throw new Error(firebaseConfigHint);
  }
};

const getFirebaseUserError = (error) => {
  if (error?.code === 'auth/configuration-not-found') {
    return 'Firebase project is not configured correctly. Enable Authentication in Firebase Console and confirm the keys in frontend/.env belong to the same Firebase project.';
  }
  if (
    error?.code === 'auth/user-not-found' ||
    error?.code === 'auth/wrong-password' ||
    error?.code === 'auth/invalid-credential'
  ) {
    return 'Invalid email or password.';
  }
  if (error?.code === 'auth/email-already-in-use') {
    return 'An account with this email already exists.';
  }
  if (error?.code === 'auth/popup-closed-by-user') {
    return 'Sign-in popup was closed before completing.';
  }

  return error?.message || 'Firebase authentication failed.';
};

export const loginWithEmail = async (email, password) => {
  ensureFirebase();
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw new Error(getFirebaseUserError(error));
  }
};

export const createAccountWithEmail = async (email, password) => {
  ensureFirebase();
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw new Error(getFirebaseUserError(error));
  }
};

export const signInWithGoogle = async () => {
  ensureFirebase();
  try {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
  } catch (error) {
    throw new Error(getFirebaseUserError(error));
  }
};

export const signOutUser = async () => {
  if (!auth) return;
  return signOut(auth);
};

export const sanitizeMessages = (messages = []) => {
  if (!Array.isArray(messages)) return [];
  return messages.map((m) => {
    const item = {
      role: m?.role === 'user' ? 'user' : 'ai',
      content: String(m?.content ?? ''),
    };
    if (m?.sources && Array.isArray(m.sources) && m.sources.length > 0) {
      item.sources = m.sources.map((s) => ({
        fileName: String(s.fileName || ''),
        pageNumber: Number(s.pageNumber) || 1,
        chunkIndex: Number(s.chunkIndex) || 0,
        score: Number(s.score) || 0,
        snippet: String(s.snippet || '').slice(0, 300),
      }));
    }
    return item;
  });
};

export const createChatSession = async ({ uid, title, fileName, documentId, messages = [] }) => {
  if (!uid) return null;
  const localId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const nowSeconds = Math.floor(Date.now() / 1000);
  const cleanMessages = sanitizeMessages(messages);

  const sessionData = {
    uid,
    title: title || fileName || 'New Chat',
    fileName: fileName || '',
    documentId: documentId || null,
    messages: cleanMessages,
  };

  const currentLocal = getLocalHistory(uid);
  let finalId = localId;

  try {
    const res = await createMongoSession(sessionData);
    if (res?.session?.id) {
      finalId = res.session.id;
    }
  } catch (err) {
    console.warn('MongoDB createSession failed, storing in local fallback:', err.message);
  }

  const savedSession = {
    id: finalId,
    ...sessionData,
    createdAt: { seconds: nowSeconds },
    updatedAt: { seconds: nowSeconds },
  };

  const updatedLocal = [savedSession, ...currentLocal.filter((s) => s.id !== finalId && s.id !== localId)];
  saveLocalHistory(uid, updatedLocal);
  return finalId;
};

export const updateChatSession = async (sessionId, nextSession, uid) => {
  if (!sessionId || !uid) return;
  const nowSeconds = Math.floor(Date.now() / 1000);
  const cleanMessages = nextSession.messages ? sanitizeMessages(nextSession.messages) : undefined;

  const currentLocal = getLocalHistory(uid);
  const updatedLocal = currentLocal.map((item) => {
    if (item.id === sessionId) {
      return {
        ...item,
        ...nextSession,
        ...(cleanMessages ? { messages: cleanMessages } : {}),
        updatedAt: { seconds: nowSeconds },
      };
    }
    return item;
  });

  if (!updatedLocal.some((item) => item.id === sessionId)) {
    updatedLocal.unshift({
      id: sessionId,
      uid,
      title: nextSession.title || nextSession.fileName || 'New Chat',
      fileName: nextSession.fileName || '',
      documentId: nextSession.documentId || null,
      messages: cleanMessages || [],
      createdAt: { seconds: nowSeconds },
      updatedAt: { seconds: nowSeconds },
    });
  }

  saveLocalHistory(uid, updatedLocal);

  if (!sessionId.startsWith('session_')) {
    try {
      const updatePayload = {};
      if (nextSession.title !== undefined) updatePayload.title = nextSession.title;
      if (nextSession.fileName !== undefined) updatePayload.fileName = nextSession.fileName;
      if (nextSession.documentId !== undefined) updatePayload.documentId = nextSession.documentId;
      if (cleanMessages) updatePayload.messages = cleanMessages;

      await updateMongoSession(sessionId, updatePayload);
    } catch (err) {
      console.warn('MongoDB updateSession notice, kept in local storage:', err.message);
    }
  }
};

export const deleteChatSession = async (sessionId, uid) => {
  if (!sessionId) return;
  if (uid) {
    const local = getLocalHistory(uid);
    saveLocalHistory(uid, local.filter((item) => item.id !== sessionId));
  }

  if (!sessionId.startsWith('session_')) {
    try {
      await deleteMongoSession(sessionId);
    } catch (err) {
      console.warn('MongoDB deleteSession notice:', err.message);
    }
  }
};

export const loadChatHistory = async (uid) => {
  if (!uid) return [];
  const localList = getLocalHistory(uid);

  try {
    const res = await fetchMongoHistory(uid);
    const remoteDocs = (res?.history || []).map((document) => ({
      id: document.id,
      uid: document.uid,
      title: document.title,
      fileName: document.fileName,
      documentId: document.documentId,
      messages: sanitizeMessages(document.messages),
      createdAt: document.createdAt ? new Date(document.createdAt) : { seconds: Math.floor(Date.now() / 1000) },
      updatedAt: document.updatedAt ? new Date(document.updatedAt) : { seconds: Math.floor(Date.now() / 1000) },
    }));

    const sessionMap = new Map();
    for (const item of localList) {
      sessionMap.set(item.id, item);
    }
    for (const remote of remoteDocs) {
      const local = sessionMap.get(remote.id);
      if (!local) {
        sessionMap.set(remote.id, remote);
      } else {
        const localMsgCount = local.messages?.length || 0;
        const remoteMsgCount = remote.messages?.length || 0;
        if (remoteMsgCount >= localMsgCount) {
          sessionMap.set(remote.id, { ...local, ...remote });
        }
      }
    }

    const merged = Array.from(sessionMap.values()).sort((a, b) => {
      const aTime = a.updatedAt instanceof Date ? a.updatedAt.getTime() : (a.updatedAt?.seconds ?? 0) * 1000;
      const bTime = b.updatedAt instanceof Date ? b.updatedAt.getTime() : (b.updatedAt?.seconds ?? 0) * 1000;
      return bTime - aTime;
    });

    saveLocalHistory(uid, merged);
    return merged;
  } catch (error) {
    console.warn('MongoDB loadChatHistory notice, using local cache:', error.message);
    return localList;
  }
};
