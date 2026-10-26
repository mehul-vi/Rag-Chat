import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles } from 'lucide-react';

export default function ChatView({
    messages = [],
    onSendMessage,
    isTyping = false,
    theme,
    _activeDoc,
}) {
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef(null);
    const isDark = theme === 'dark';

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputText.trim() && onSendMessage) {
            onSendMessage(inputText.trim());
            setInputText('');
        }
    };

    return (
        <div className={`flex flex-col h-full ${isDark ? 'bg-[#0c121d] text-slate-200' : 'bg-white text-slate-700'}`}>
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                        <div className={`flex h-16 w-16 items-center justify-center rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            <Sparkles size={32} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">How can I help you today?</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                            Ask me anything about your document, or start a new conversation.
                        </p>
                    </div>
                )}

                {messages.map((msg, index) => {
                    const isUser = msg.role === 'user';
                    return (
                        <div
                            key={index}
                            className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                        >
                            {!isUser && (
                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                    <Bot size={18} className="text-blue-600 dark:text-blue-400" />
                                </div>
                            )}
                            <div
                                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isUser
                                        ? isDark
                                            ? 'bg-blue-600 text-white rounded-br-sm'
                                            : 'bg-blue-600 text-white rounded-br-sm'
                                        : isDark
                                            ? 'bg-slate-800 text-slate-200 rounded-bl-sm'
                                            : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                                    }`}
                            >
                                {msg.content}
                            </div>
                            {isUser && (
                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                    <User size={18} className="text-slate-600 dark:text-slate-400" />
                                </div>
                            )}
                        </div>
                    );
                })}

                {isTyping && (
                    <div className="flex gap-3 justify-start">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            <Bot size={18} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className={`rounded-2xl rounded-bl-sm px-4 py-3 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            <div className="flex gap-1.5">
                                <span className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-slate-500' : 'bg-slate-400'}`} style={{ animationDelay: '0ms' }} />
                                <span className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-slate-500' : 'bg-slate-400'}`} style={{ animationDelay: '150ms' }} />
                                <span className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-slate-500' : 'bg-slate-400'}`} style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`p-4 border-t ${isDark ? 'border-slate-800 bg-[#0c121d]' : 'border-slate-200 bg-white'}`}>
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type your message..."
                        className={`flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none transition ${isDark
                                ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-blue-600'
                                : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-600'
                            }`}
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim()}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl transition cursor-pointer ${inputText.trim()
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : isDark
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}