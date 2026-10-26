import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FileText, FileUp, ShieldCheck, ArrowRight, Loader2, AlertCircle, X } from 'lucide-react';
import { uploadPdf, sendChatMessage } from './services/api';
import {
  auth,
  onAuthStateChanged,
  signOutUser,
  loginWithEmail,
  createAccountWithEmail,
  signInWithGoogle,
  createChatSession,
  updateChatSession,
  deleteChatSession,
  loadChatHistory,
} from './services/firebase';
import Sidebar from './components/Sidebar';
import ChatHeader from './components/ChatHeader';
import ChatInput from './components/ChatInput';
import MessageList from './components/MessageList';
import DocViewer from './components/DocViewer';
import LoadingScreen from './components/LoadingScreen';
import AuthScreen from './components/AuthScreen';

const MAX_FILE_SIZE = 25 * 1024 * 1024;

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [activeDocId, setActiveDocId] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatError, setChatError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authData, setAuthData] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('rag_chat_sidebar_open');
      if (saved !== null) return saved === 'true';
    } catch {}
    return true;
  });
  const [mobileView, setMobileView] = useState('chat');
  const [isDragging, setIsDragging] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      if (localStorage.getItem('rag_chat_logged_out') === 'true') {
        return null;
      }
      if (auth?.currentUser) {
        return {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          displayName: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'User',
          photoURL: auth.currentUser.photoURL,
        };
      }
      const saved = localStorage.getItem('rag_chat_user');
      if (saved) return JSON.parse(saved);
    } catch { /* Use the local preview identity. */ }
    return { uid: 'guest_user', email: 'user@docanalyzer.com', displayName: 'User' };
  });
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('rag_chat_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch { /* Default to light. */ }
    return 'light';
  });

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const isTypingRef = useRef(false);

  const handleToggleTheme = useCallback(() => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen((current) => {
      const next = !current;
      try { localStorage.setItem('rag_chat_sidebar_open', String(next)); } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    try { localStorage.setItem('rag_chat_theme', theme); } catch { /* Storage is optional. */ }
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    if (!auth) return undefined;
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      if (nextUser) {
        const userData = {
          uid: nextUser.uid,
          email: nextUser.email,
          displayName: nextUser.displayName || nextUser.email?.split('@')[0] || 'User',
          photoURL: nextUser.photoURL,
        };
        setUser(userData);
        try {
          localStorage.setItem('rag_chat_user', JSON.stringify(userData));
          localStorage.removeItem('rag_chat_logged_out');
        } catch { /* Optional. */ }
      } else {
        if (localStorage.getItem('rag_chat_logged_out') === 'true') {
          setUser(null);
        }
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleAuthSubmit = async (event) => {
    event?.preventDefault();
    setAuthError('');
    setIsSubmittingAuth(true);

    try {
      if (authMode === 'login') {
        const userCredential = await loginWithEmail(authData.email, authData.password);
        const loggedUser = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'User',
          photoURL: userCredential.user.photoURL,
        };
        setUser(loggedUser);
        try {
          localStorage.setItem('rag_chat_user', JSON.stringify(loggedUser));
          localStorage.removeItem('rag_chat_logged_out');
        } catch {}
      } else {
        const userCredential = await createAccountWithEmail(authData.email, authData.password);
        const loggedUser = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'User',
          photoURL: userCredential.user.photoURL,
        };
        setUser(loggedUser);
        try {
          localStorage.setItem('rag_chat_user', JSON.stringify(loggedUser));
          localStorage.removeItem('rag_chat_logged_out');
        } catch {}
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    setIsSubmittingAuth(true);
    try {
      const userCredential = await signInWithGoogle();
      const loggedUser = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'User',
        photoURL: userCredential.user.photoURL,
      };
      setUser(loggedUser);
      try {
        localStorage.setItem('rag_chat_user', JSON.stringify(loggedUser));
        localStorage.removeItem('rag_chat_logged_out');
      } catch {}
    } catch (err) {
      setAuthError(err.message || 'Google sign-in failed.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleGuestLogin = () => {
    const guestUser = {
      uid: 'guest_user',
      email: 'user@docanalyzer.com',
      displayName: 'Guest User',
    };
    setUser(guestUser);
    try {
      localStorage.setItem('rag_chat_user', JSON.stringify(guestUser));
      localStorage.removeItem('rag_chat_logged_out');
    } catch {}
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.warn('Logout notice:', err);
    }
    try {
      localStorage.removeItem('rag_chat_user');
      localStorage.setItem('rag_chat_logged_out', 'true');
    } catch {}
    setUser(null);
    setDocuments([]);
    setActiveDocId(null);
  };

  useEffect(() => {
    const uid = user?.uid || user?.email || 'guest_user';
    let isCancelled = false;

    const fetchHistory = async () => {
      try {
        const historyDocs = await loadChatHistory(uid);
        if (isCancelled) return;
        if (Array.isArray(historyDocs) && historyDocs.length > 0) {
          const mappedDocs = historyDocs.map((session) => ({
            id: session.id,
            sessionId: session.id,
            title: session.title || session.fileName || 'Untitled Document',
            fileName: session.fileName || session.title || 'document.pdf',
            documentId: session.documentId,
            totalPages: Number(session.totalPages) || 0,
            currentPage: Number(session.currentPage) || 1,
            isFavourite: Boolean(session.isFavourite),
            previewUrl: null,
            messages: Array.isArray(session.messages) && session.messages.length > 0
              ? session.messages
              : [{
                  role: 'ai',
                  content: `**${session.fileName || session.title}** is ready.\n\nAsk a question or request a summary.`,
                }],
          }));

          setDocuments((current) => {
            const currentMap = new Map(current.map((d) => [d.id, d]));
            for (const hDoc of mappedDocs) {
              if (!currentMap.has(hDoc.id)) {
                currentMap.set(hDoc.id, hDoc);
              }
            }
            const combined = Array.from(currentMap.values());
            setActiveDocId((currentId) => currentId || combined[0]?.id || null);
            return combined;
          });
        }
      } catch (err) {
        console.warn('Could not load chat history:', err);
      }
    };

    fetchHistory();
    return () => { isCancelled = true; };
  }, [user?.uid, user?.email]);

  const activeDoc = useMemo(
    () => documents.find((doc) => doc.id === activeDocId) || null,
    [documents, activeDocId],
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeDoc?.messages, isTyping, scrollToBottom]);

  const handleSelectDoc = useCallback((doc) => {
    setActiveDocId(doc.id);
    setChatError('');
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
    setMobileView('chat');
  }, []);

  const handleCloseDocTab = useCallback((docId) => {
    setDocuments((current) => {
      const nextDocs = current.filter((doc) => doc.id !== docId);
      setActiveDocId((currentId) => currentId === docId ? nextDocs[0]?.id || null : currentId);
      return nextDocs;
    });
  }, []);

  const handleDeleteDoc = useCallback((docId) => {
    const uid = user?.uid || user?.email || 'guest_user';
    setDocuments((current) => {
      const deletedDoc = current.find((doc) => doc.id === docId);
      if (deletedDoc?.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(deletedDoc.previewUrl);
      deleteChatSession(deletedDoc?.sessionId || docId, uid).catch(console.warn);
      const nextDocs = current.filter((doc) => doc.id !== docId);
      setActiveDocId((currentId) => currentId === docId ? nextDocs[0]?.id || null : currentId);
      return nextDocs;
    });
  }, [user?.uid, user?.email]);

  const handleToggleFavourite = useCallback((docId) => {
    const uid = user?.uid || user?.email || 'guest_user';
    setDocuments((current) => current.map((doc) => {
      if (doc.id === docId) {
        const nextFav = !doc.isFavourite;
        updateChatSession(doc.sessionId || doc.id, { isFavourite: nextFav }, uid).catch(console.warn);
        return { ...doc, isFavourite: nextFav };
      }
      return doc;
    }));
  }, [user?.uid, user?.email]);

  const handleTriggerUpload = useCallback(() => {
    if (uploadStatus !== 'uploading') fileInputRef.current?.click();
  }, [uploadStatus]);

  const processFile = useCallback(async (file) => {
    if (!file || uploadStatus === 'uploading') return;
    setUploadError('');
    setChatError('');

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Please choose a valid PDF file.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('This PDF is too large. Please choose a file smaller than 25 MB.');
      return;
    }

    const localBlobUrl = URL.createObjectURL(file);
    setUploadStatus('uploading');
    setUploadProgress(20);

    try {
      const response = await uploadPdf(file);
      if (!response?.documentId) throw new Error('The server did not return a document ID. Please try again.');
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
      const initialMessages = [{
        role: 'ai',
        content: `**${file.name}** is ready.\n\nI’ve indexed “${cleanTitle}”. Ask a question, request a summary, or explore one of the suggested prompts below.`,
        suggestions: [
          'What is the main theme of this document?',
          'Summarize the key points in bullet form.',
          'What are the most important conclusions?',
        ],
      }];

      const uid = user?.uid || user?.email || 'guest_user';
      let createdSessionId = null;
      try {
        createdSessionId = await createChatSession({
          uid,
          title: cleanTitle,
          fileName: file.name,
          documentId: response.documentId,
          totalPages: response.totalPages || 0,
          currentPage: 1,
          isFavourite: false,
          messages: initialMessages,
        });
      } catch (err) {
        console.warn('Session persistence notice:', err.message);
      }

      const docId = createdSessionId || `document-${response.documentId}`;
      const newDoc = {
        id: docId,
        sessionId: createdSessionId || docId,
        title: cleanTitle,
        fileName: file.name,
        totalPages: response.totalPages || 0,
        currentPage: 1,
        isFavourite: false,
        documentId: response.documentId,
        previewUrl: localBlobUrl,
        messages: initialMessages,
      };

      setUploadProgress(100);
      setDocuments((current) => [newDoc, ...current.filter((doc) => doc.id !== newDoc.id)]);
      setActiveDocId(newDoc.id);
      setMobileView('chat');
      setUploadStatus('success');
    } catch (error) {
      URL.revokeObjectURL(localBlobUrl);
      setUploadStatus('idle');
      setUploadError(error.message || 'PDF upload failed. Please try again.');
    } finally {
      window.setTimeout(() => {
        setUploadStatus((current) => current === 'success' ? 'idle' : current);
        setUploadProgress(0);
      }, 1200);
    }
  }, [uploadStatus, user?.uid, user?.email]);

  const handleFileChange = (event) => {
    processFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    processFile(event.dataTransfer.files?.[0]);
  };

  const handleSendMessage = async (customPrompt) => {
    const question = (typeof customPrompt === 'string' ? customPrompt : inputValue).trim();
    if (!question || isTypingRef.current) return;
    if (!activeDoc?.documentId) {
      setChatError('Upload and index a PDF before asking questions.');
      return;
    }

    const targetDocId = activeDoc.id;
    const targetSessionId = activeDoc.sessionId || activeDoc.id;
    const targetDocumentId = activeDoc.documentId;
    const uid = user?.uid || user?.email || 'guest_user';
    isTypingRef.current = true;
    setIsTyping(true);
    setChatError('');

    const updatedWithUser = [...activeDoc.messages, { role: 'user', content: question }];
    setDocuments((current) => current.map((doc) => doc.id === targetDocId
      ? { ...doc, messages: updatedWithUser }
      : doc));
    setInputValue('');

    updateChatSession(targetSessionId, { messages: updatedWithUser }, uid).catch(console.warn);

    try {
      const result = await sendChatMessage(question, targetDocumentId);
      if (typeof result?.answer !== 'string' && typeof result?.reply !== 'string') {
        throw new Error('The server returned no answer. Please try again.');
      }
      const answer = result.answer || result.reply;
      const aiMessage = {
        role: 'ai',
        content: answer,
        sources: Array.isArray(result.sources) ? result.sources : [],
      };
      const updatedWithAi = [...updatedWithUser, aiMessage];
      setDocuments((current) => current.map((doc) => doc.id === targetDocId
        ? { ...doc, messages: updatedWithAi }
        : doc));

      updateChatSession(targetSessionId, { messages: updatedWithAi }, uid).catch(console.warn);
    } catch (error) {
      setChatError(error.message || 'Could not get an answer from the document service.');
    } finally {
      isTypingRef.current = false;
      setIsTyping(false);
    }
  };

  if (authLoading) return <LoadingScreen />;

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
        onGuestLogin={handleGuestLogin}
        toggleMode={() => {
          setAuthMode((current) => (current === 'login' ? 'signup' : 'login'));
          setAuthError('');
        }}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  return (
    <div
      className="h-dvh min-h-[540px] w-full overflow-hidden bg-[var(--workspace)] text-[var(--text)]"
      onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
      onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setIsDragging(false); }}
      onDrop={handleDrop}
    >
      <div className="flex h-full w-full overflow-hidden lg:p-3">
        <Sidebar
          user={user}
          onUpdateUser={setUser}
          documents={documents}
          activeDocId={activeDocId}
          onSelectDoc={handleSelectDoc}
          isOpen={isSidebarOpen}
          onToggleOpen={handleToggleSidebar}
          onClose={() => {
            setIsSidebarOpen(false);
            try { localStorage.setItem('rag_chat_sidebar_open', 'false'); } catch {}
          }}
          onCloseMobileMenu={() => setIsSidebarOpen(false)}
          isMobileMenuOpen={isSidebarOpen}
          onStartNewUpload={handleTriggerUpload}
          onDeleteDoc={handleDeleteDoc}
          onToggleFavourite={handleToggleFavourite}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onLogout={handleLogout}
        />

        <main className={`relative flex min-w-0 flex-1 flex-col overflow-hidden border-[var(--border)] bg-[var(--surface)] transition-all duration-200 lg:rounded-xl lg:border ${isSidebarOpen ? 'lg:rounded-l-none lg:border-l-0' : ''}`}>
          <ChatHeader
            documents={documents}
            activeDocId={activeDocId}
            activeDoc={activeDoc}
            onSelectDoc={handleSelectDoc}
            onCloseDocTab={handleCloseDocTab}
            onNewDocTab={handleTriggerUpload}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={handleToggleSidebar}
            onOpenMobileMenu={handleToggleSidebar}
            mobileView={mobileView}
            onChangeMobileView={setMobileView}
          />

          {!activeDoc ? (
            <EmptyWorkspace
              onSelectFile={processFile}
              uploadStatus={uploadStatus}
              uploadProgress={uploadProgress}
              uploadError={uploadError}
              onDismissError={() => setUploadError('')}
            />
          ) : (
            <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden">
              <section
                aria-label="Document conversation"
                className={`min-h-0 min-w-0 flex-col overflow-hidden border-[var(--border)] bg-[var(--surface)] lg:flex lg:w-[43%] lg:max-w-[600px] lg:shrink-0 lg:border-r xl:w-[42%] ${mobileView === 'chat' ? 'flex w-full' : 'hidden'}`}
              >
                {(uploadError || chatError) && (
                  <div className="shrink-0 px-4 pt-4 sm:px-6">
                    <AlertMessage message={uploadError || chatError} onDismiss={() => { setUploadError(''); setChatError(''); }} />
                  </div>
                )}
                <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-7">
                  <MessageList
                    messages={activeDoc.messages || []}
                    isTyping={isTyping}
                    messagesEndRef={messagesEndRef}
                    onSelectQuestion={handleSendMessage}
                    user={user}
                    theme={theme}
                  />
                </div>
                <div className="shrink-0 border-t border-[var(--border)] bg-[var(--surface)] px-4 pb-4 pt-3 sm:px-6 lg:px-7">
                  <ChatInput
                    inputValue={inputValue}
                    onChangeInput={setInputValue}
                    onSubmit={() => handleSendMessage()}
                    isUploading={uploadStatus === 'uploading'}
                    isTyping={isTyping}
                    canChat={Boolean(activeDoc.documentId)}
                    documentId={activeDoc.documentId}
                    fileName={activeDoc.fileName}
                  />
                </div>
              </section>

              <section
                aria-label="Document preview"
                className={`min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--workspace)] lg:flex ${mobileView === 'doc' ? 'flex w-full' : 'hidden'}`}
              >
                <DocViewer activeDoc={activeDoc} pdfPreviewUrl={activeDoc.previewUrl} theme={theme} />
              </section>
            </div>
          )}
        </main>
      </div>

      <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={handleFileChange} />

      {isDragging && (
        <div className="pointer-events-none fixed inset-3 z-[70] flex items-center justify-center rounded-2xl border-2 border-dashed border-[var(--accent)] bg-[var(--surface)]/95 shadow-[var(--shadow-soft)]">
          <div className="text-center">
            <FileUp className="mx-auto text-[var(--accent)]" size={34} />
            <p className="mt-4 text-xl font-semibold">Drop your PDF to begin</p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">We’ll prepare it for questions and citations.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function AlertMessage({ message, onDismiss }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-lg border border-[var(--danger)]/25 bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
      <AlertCircle size={17} className="mt-0.5 shrink-0" />
      <span className="min-w-0 flex-1 leading-6">{message}</span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss error" className="-mr-2 -mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-md hover:bg-[var(--danger)]/10">
        <X size={15} />
      </button>
    </div>
  );
}

function EmptyWorkspace({ onSelectFile, uploadStatus, uploadProgress, uploadError, onDismissError }) {
  const isUploading = uploadStatus === 'uploading';
  return (
    <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
      <section className="mx-auto grid min-h-full w-full max-w-[1240px] items-center gap-10 px-5 py-8 sm:px-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14 lg:px-14 lg:py-12">
        <div className="max-w-[540px]">
          <div className="mb-5 flex items-center gap-2 text-[var(--accent-ink)]">
            <ShieldCheck size={16} />
            <span className="ui-label">Grounded document intelligence</span>
          </div>
          <h1 className="max-w-[480px] text-[2.25rem] font-semibold leading-[1.12] tracking-[-0.045em] sm:text-[2.8rem]">
            Your documents,<br />ready to answer.
          </h1>
          <p className="mt-5 max-w-[460px] text-base leading-7 text-[var(--text-secondary)]">
            Upload a PDF and ask questions in plain language. Get clear answers with citations that lead back to the original pages.
          </p>

          <label className={`group mt-8 flex min-h-[156px] w-full flex-col items-center justify-center rounded-xl border border-dashed px-6 py-6 text-center transition-colors duration-200 ${isUploading ? 'cursor-wait border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border-strong)] bg-[var(--surface-raised)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]/45'}`}>
            <input type="file" accept=".pdf,application/pdf" className="hidden" disabled={isUploading} onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (file) onSelectFile(file);
            }} />
            {isUploading ? (
              <>
                <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
                <p className="mt-3 text-sm font-semibold">Preparing your document…</p>
                <div className="mt-3 h-1.5 w-full max-w-[240px] overflow-hidden rounded-full bg-[var(--border)]" role="progressbar" aria-label="Document upload progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={uploadProgress}>
                  <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
                <span className="mt-2 font-ui-mono text-[11px] text-[var(--text-muted)]">{uploadProgress}%</span>
              </>
            ) : (
              <>
                <FileUp size={25} strokeWidth={1.6} className="text-[var(--accent)] transition-transform duration-200 group-hover:-translate-y-1" />
                <p className="mt-3 text-sm font-semibold">Drop a PDF here, or <span className="underline decoration-[var(--accent)]/40 underline-offset-4">browse files</span></p>
                <p className="mt-1.5 text-xs text-[var(--text-muted)]">PDF only · Up to 25 MB</p>
              </>
            )}
          </label>

          {uploadError && <div className="mt-4"><AlertMessage message={uploadError} onDismiss={onDismissError} /></div>}

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--text-muted)]">
            <span>Semantic search</span><span aria-hidden="true">·</span><span>Page-level sources</span><span aria-hidden="true">·</span><span>Scanned PDF support</span>
          </div>
        </div>

        <DocumentIllustration />
      </section>
    </div>
  );
}

function DocumentIllustration() {
  return (
    <div className="relative mx-auto hidden w-full max-w-[570px] sm:block" aria-hidden="true">
      <div className="absolute inset-x-8 bottom-[-16px] top-8 rotate-2 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)]" />
      <div className="relative overflow-hidden rounded-lg border border-[var(--border-strong)] bg-[var(--surface-raised)] shadow-[var(--shadow-soft)]">
        <div className="flex h-12 items-center justify-between border-b border-[var(--border)] px-5">
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]"><FileText size={14} className="text-[var(--accent)]" /> Research briefing.pdf</div>
          <span className="font-ui-mono text-[10px] text-[var(--text-muted)]">12 PAGES</span>
        </div>
        <div className="grid grid-cols-[1fr_142px] gap-7 p-7 sm:p-9">
          <div>
            <div className="h-2.5 w-16 rounded-sm bg-[var(--accent)]/65" />
            <div className="mt-5 h-5 w-4/5 rounded-sm bg-[var(--text)]/80" />
            <div className="mt-2 h-5 w-3/5 rounded-sm bg-[var(--text)]/80" />
            <div className="mt-7 space-y-2.5">
              {[100, 94, 98, 82, 96, 68].map((width, index) => <div key={index} className="h-1.5 rounded-full bg-[var(--border-strong)]" style={{ width: `${width}%` }} />)}
            </div>
            <div className="mt-7 border-l-2 border-[var(--accent)] bg-[var(--accent-soft)]/65 px-4 py-3">
              <div className="h-1.5 w-full rounded-full bg-[var(--accent)]/30" />
              <div className="mt-2 h-1.5 w-3/4 rounded-full bg-[var(--accent)]/30" />
            </div>
          </div>
          <div className="border-l border-[var(--border)] pl-5">
            <span className="ui-label text-[var(--text-muted)]">Ask document</span>
            <p className="mt-4 text-xs font-medium leading-5 text-[var(--text-secondary)]">What are the key findings?</p>
            <div className="mt-5 border-t border-[var(--border)] pt-4">
              <div className="space-y-2">
                <div className="h-1.5 w-full rounded-full bg-[var(--border-strong)]" />
                <div className="h-1.5 w-5/6 rounded-full bg-[var(--border-strong)]" />
                <div className="h-1.5 w-4/6 rounded-full bg-[var(--border-strong)]" />
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--accent-ink)]">Page 4 <ArrowRight size={10} /></span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-[var(--border)] px-5 py-3 text-[10px] text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> Answers linked to evidence</span>
          <span className="font-ui-mono">01 / 12</span>
        </div>
      </div>
    </div>
  );
}

export { App as DocAnalyzer };
