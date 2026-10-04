import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { uploadPdf, sendChatMessage } from './api';
import {
  auth,
  createAccountWithEmail,
  createChatSession,
  deleteChatSession,
  isFirebaseConfigured,
  loadChatHistory,
  loginWithEmail,
  onAuthStateChanged,
  signInWithGoogle,
  signOutUser,
  updateChatSession,
} from './firebase';

import Sidebar from './components/Sidebar';
import ChatHeader from './components/ChatHeader';
import ChatInput from './components/ChatInput';
import MessageList from './components/MessageList';
import UploadBanner from './components/UploadBanner';
import EmptyHero from './components/EmptyHero';
import QuickPrompts from './components/QuickPrompts';
import AuthScreen from './components/AuthScreen';
import LoadingScreen from './components/LoadingScreen';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const WELCOME_MESSAGE = {
  role: 'ai',
  content: 'Hello! Upload a PDF document to start chatting with it, or select an existing chat from your history.',
};

const DEFAULT_AUTH_FORM = { email: '', password: '' };

const QUICK_PROMPTS = [
  'Summarize this entire document in 5 key takeaways.',
  'What are the most important conclusions or findings?',
  'List any action items, dates, or next steps mentioned.',
  'What are the main topics and sections covered?',
];

const validatePdf = (file) => {
  if (!file) return 'No file selected.';
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return 'Please select a valid PDF file.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum allowed is 10MB.`;
  }
  return '';
};

export default function App() {
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [fileName, setFileName] = useState('');
  const [documentId, setDocumentId] = useState(null);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(() => Boolean(auth));
  const [authMode, setAuthMode] = useState('login');
  const [authData, setAuthData] = useState(DEFAULT_AUTH_FORM);
  const [authError, setAuthError] = useState('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const activeSessionIdRef = useRef(activeSessionId);
  const isUploading = uploadStatus === 'uploading';

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  const activateSession = useCallback((session, updateHash = true) => {
    setActiveSessionId(session.id);
    const sessionMessages =
      Array.isArray(session.messages) && session.messages.length ? session.messages : [WELCOME_MESSAGE];
    setMessages(sessionMessages);
    setDocumentId(session.documentId || null);
    setFileName(session.fileName || session.title || '');
    setUploadStatus(session.documentId ? 'success' : 'idle');
    setUploadError('');
    setInputValue('');
    setIsMobileMenuOpen(false);

    if (updateHash && window.location.hash !== `#/chat/${session.id}`) {
      window.location.hash = `#/chat/${session.id}`;
    }
  }, []);

  const startFreshChat = useCallback((updateHash = true) => {
    setActiveSessionId(null);
    setMessages([WELCOME_MESSAGE]);
    setDocumentId(null);
    setFileName('');
    setUploadStatus('idle');
    setUploadProgress(0);
    setUploadStage('');
    setUploadError('');
    setInputValue('');
    setIsTyping(false);
    setIsMobileMenuOpen(false);

    if (updateHash && window.location.hash !== '#/new') {
      window.location.hash = '#/new';
    }
  }, []);

  // Listen to Auth State
  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync with URL hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '';
      if (hash.startsWith('#/chat/')) {
        const id = hash.replace('#/chat/', '').trim();
        if (id && id !== activeSessionIdRef.current) {
          const match = sessionHistory.find((s) => s.id === id);
          if (match) {
            activateSession(match, false);
          }
        }
      } else if (hash === '#/new') {
        startFreshChat(false);
      } else if (hash === '#/signup') {
        setAuthMode('signup');
      } else if (hash === '#/login') {
        setAuthMode('login');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [sessionHistory, activateSession, startFreshChat]);

  // Load chat history when user changes
  useEffect(() => {
    if (!user) {
      return;
    }

    let isCurrent = true;

    const fetchHistory = async () => {
      try {
        const history = await loadChatHistory(user.uid);
        if (!isCurrent) return;
        setSessionHistory(history);

        const hash = window.location.hash || '';
        let targetSession = null;

        if (hash.startsWith('#/chat/')) {
          const id = hash.replace('#/chat/', '').trim();
          targetSession = history.find((s) => s.id === id);
        }

        if (hash === '#/new') {
          startFreshChat(false);
          return;
        }

        if (!targetSession && history.length > 0) {
          targetSession = history[0];
        }

        if (targetSession) {
          activateSession(targetSession, true);
        } else {
          startFreshChat(false);
        }
      } catch (err) {
        console.error('Error fetching chat history:', err);
        if (isCurrent) setAuthError(err.message || 'Failed to load history');
      }
    };

    fetchHistory();

    return () => {
      isCurrent = false;
    };
  }, [user, activateSession, startFreshChat]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    if (!user) return;

    try {
      await deleteChatSession(sessionId, user.uid);
      const updatedHistory = sessionHistory.filter((s) => s.id !== sessionId);
      setSessionHistory(updatedHistory);

      if (activeSessionId === sessionId) {
        if (updatedHistory.length > 0) {
          activateSession(updatedHistory[0], true);
        } else {
          startFreshChat(true);
        }
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!isFirebaseConfigured) {
      setAuthError('Configure Firebase to enable login.');
      return;
    }

    try {
      setIsSubmittingAuth(true);
      setAuthError('');

      if (authMode === 'login') {
        await loginWithEmail(authData.email, authData.password);
      } else {
        await createAccountWithEmail(authData.email, authData.password);
      }

      setAuthData(DEFAULT_AUTH_FORM);
      window.location.hash = '#/chat';
    } catch (error) {
      setAuthError(error.message || 'Authentication failed.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isFirebaseConfigured) {
      setAuthError('Configure Firebase to enable Google sign in.');
      return;
    }

    try {
      setAuthError('');
      await signInWithGoogle();
      window.location.hash = '#/chat';
    } catch (error) {
      setAuthError(error.message || 'Google sign-in failed.');
    }
  };

  const handleLogout = async () => {
    await signOutUser();
    setSessionHistory([]);
    setActiveSessionId(null);
    setMessages([WELCOME_MESSAGE]);
    window.location.hash = '#/login';
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !user) return;

    const validationError = validatePdf(file);
    if (validationError) {
      setUploadStatus('error');
      setUploadError(validationError);
      return;
    }

    setFileName(file.name);
    setUploadStatus('uploading');
    setUploadProgress(15);
    setUploadStage('Uploading document to server...');
    setUploadError('');
    setIsTyping(false);
    setIsMobileMenuOpen(false);

    const progressTimer1 = setTimeout(() => {
      setUploadProgress(45);
      setUploadStage('Extracting text and analyzing pages...');
    }, 1200);

    const progressTimer2 = setTimeout(() => {
      setUploadProgress(75);
      setUploadStage('Generating AI embeddings & vector indexing...');
    }, 3000);

    try {
      const data = await uploadPdf(file);
      clearTimeout(progressTimer1);
      clearTimeout(progressTimer2);
      setUploadProgress(100);
      setUploadStage('Ready!');

      const starterMessage = {
        role: 'ai',
        content: `**"${file.name}"** processed successfully!\n\n- **Pages:** ${data.totalPages}\n- **Chunks Indexed:** ${data.totalChunks}\n\nYou can now ask any question about this document or click one of the suggested prompts below.`,
      };

      setDocumentId(data.documentId);
      setFileName(file.name);
      setUploadStatus('success');
      setMessages([starterMessage]);

      const nextSession = {
        title: file.name,
        fileName: file.name,
        documentId: data.documentId,
        messages: [starterMessage],
      };

      let newSessionId;
      if (activeSessionId && !documentId) {
        await updateChatSession(activeSessionId, nextSession, user.uid);
        newSessionId = activeSessionId;
      } else {
        newSessionId = await createChatSession({ uid: user.uid, ...nextSession });
      }

      setActiveSessionId(newSessionId);
      window.location.hash = `#/chat/${newSessionId}`;

      setSessionHistory((prev) => [
        { id: newSessionId, ...nextSession, updatedAt: { seconds: Math.floor(Date.now() / 1000) } },
        ...prev.filter((session) => session.id !== newSessionId),
      ]);
    } catch (error) {
      clearTimeout(progressTimer1);
      clearTimeout(progressTimer2);
      setUploadStatus('error');
      setUploadError(error.message || 'Failed to process PDF.');
      console.error('Upload error:', error);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const question = (typeof textToSend === 'string' ? textToSend : inputValue).trim();
    if (!question || !documentId || !user || isUploading || isTyping) return;

    const userMessage = { role: 'user', content: question };
    const nextMessages = [...messages, userMessage];
    setInputValue('');
    setMessages(nextMessages);
    setIsTyping(true);

    try {
      const { answer, sources } = await sendChatMessage(question, documentId);
      const completeMessages = [...nextMessages, { role: 'ai', content: answer, sources }];
      setMessages(completeMessages);

      let currentId = activeSessionId;
      if (!currentId) {
        currentId = await createChatSession({
          uid: user.uid,
          title: fileName || 'PDF Chat',
          fileName,
          documentId,
          messages: completeMessages,
        });
        setActiveSessionId(currentId);
        window.location.hash = `#/chat/${currentId}`;
      } else {
        await updateChatSession(
          currentId,
          {
            title: fileName || 'PDF Chat',
            fileName,
            documentId,
            messages: completeMessages,
          },
          user.uid
        );
      }

      setSessionHistory((prev) => {
        const existing = prev.find((item) => item.id === currentId);
        const updatedItem = {
          ...(existing || {}),
          id: currentId,
          title: fileName || 'PDF Chat',
          fileName,
          documentId,
          messages: completeMessages,
          updatedAt: { seconds: Math.floor(Date.now() / 1000) },
        };
        return [updatedItem, ...prev.filter((item) => item.id !== currentId)];
      });
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: `**Error:** ${error.message || 'Failed to get answer. Please check if backend is running.'}`,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return sessionHistory;
    const q = searchQuery.toLowerCase();
    return sessionHistory.filter(
      (s) =>
        s.title?.toLowerCase().includes(q) ||
        s.fileName?.toLowerCase().includes(q)
    );
  }, [sessionHistory, searchQuery]);

  const canChat = Boolean(documentId) && !isUploading && !!user;

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <AuthScreen
        mode={authMode}
        form={authData}
        setForm={setAuthData}
        authError={authError}
        isSubmitting={isSubmittingAuth}
        onSubmit={handleAuthSubmit}
        onGoogleSignIn={handleGoogleLogin}
        toggleMode={() => {
          const next = authMode === 'login' ? 'signup' : 'login';
          setAuthMode(next);
          window.location.hash = `#/${next}`;
          setAuthError('');
        }}
      />
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f8f9fa] p-2 sm:p-3 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Modular Sidebar */}
      <Sidebar
        user={user}
        sessionHistory={filteredHistory}
        activeSessionId={activeSessionId}
        searchQuery={searchQuery}
        onChangeSearch={setSearchQuery}
        onSelectSession={(session) => activateSession(session, true)}
        onDeleteSession={handleDeleteSession}
        onStartNewChat={() => startFreshChat(true)}
        onLogout={handleLogout}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        isMobileMenuOpen={isMobileMenuOpen}
        uploadStatus={uploadStatus}
        fileName={fileName}
        uploadProgress={uploadProgress}
        uploadStage={uploadStage}
        uploadError={uploadError}
        onFileSelect={handleFileChange}
      />

      {/* Main Chat Area */}
      <main className="ml-0 flex min-w-0 flex-1 flex-col overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm lg:ml-3">
        <ChatHeader
          fileName={fileName}
          documentId={documentId}
          isUploading={isUploading}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onUploadClick={handleFileChange}
          onNewChat={() => startFreshChat(true)}
        />

        <UploadBanner
          status={uploadStatus}
          fileName={fileName}
          stage={uploadStage}
          progress={uploadProgress}
          error={uploadError}
          onRetry={() => fileInputRef.current?.click()}
        />

        {/* Viewport for messages or empty state hero */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {!documentId && uploadStatus === 'idle' && messages.length <= 1 ? (
            <EmptyHero
              onSelectFile={handleFileChange}
              isUploading={isUploading}
              uploadStage={uploadStage}
              uploadProgress={uploadProgress}
              uploadError={uploadError}
            />
          ) : (
            <MessageList
              messages={messages}
              isTyping={isTyping}
              messagesEndRef={messagesEndRef}
            />
          )}
        </div>

        {/* Quick Suggestion Pills */}
        {documentId && messages.length <= 2 && !isTyping && !isUploading && (
          <QuickPrompts
            prompts={QUICK_PROMPTS}
            onSelectPrompt={handleSendMessage}
          />
        )}

        {/* Chat Input Bar */}
        <ChatInput
          inputValue={inputValue}
          onChangeInput={setInputValue}
          onSubmit={handleSendMessage}
          isUploading={isUploading}
          isTyping={isTyping}
          canChat={canChat}
          documentId={documentId}
        />
      </main>
    </div>
  );
}
