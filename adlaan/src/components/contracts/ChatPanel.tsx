import React from "react";
import { ChatMessage } from "./ChatMessage";
import { QuickActions } from "./QuickActions";
import { ChatMessage as ChatMessageType } from "../../types/contracts";

interface ChatPanelProps {
  chatMessages: ChatMessageType[];
  newMessage: string;
  setNewMessage: (message: string) => void;
  isGenerating: boolean;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  messageInputRef: React.RefObject<HTMLInputElement | null>;
  onSendMessage: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  chatMessages,
  newMessage,
  setNewMessage,
  isGenerating,
  chatEndRef,
  messageInputRef,
  onSendMessage,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-indigo-50/30 to-blue-50/50 border-r border-indigo-200/30">
      {/* Chat Header */}
      <header className="flex-shrink-0 px-4 lg:px-6 py-4 border-b border-indigo-200/30 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">مساعد العقود الذكي</h3>
            <p className="text-xs text-slate-500">
              جاهز لمساعدتك في تحسين العقد
            </p>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
        role="log"
        aria-label="رسائل المحادثة"
        aria-live="polite"
      >
        {chatMessages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-500 text-sm">ابدأ محادثة لتحسين عقدك</p>
          </div>
        )}

        {chatMessages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {isGenerating && (
          <div className="flex justify-start" aria-label="جاري الكتابة">
            <div className="bg-white border border-indigo-200/50 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
                <span className="text-xs text-slate-500">يكتب...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input */}
      <footer className="flex-shrink-0 p-4 border-t border-indigo-200/30 bg-white/80 backdrop-blur-sm">
        <div className="flex space-x-3">
          <input
            ref={messageInputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اطلب تعديلاً على العقد أو اسأل عن أي بند..."
            className="flex-1 px-4 py-3 border border-indigo-300/50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white text-slate-900 placeholder-slate-500 shadow-sm"
            aria-label="اكتب رسالتك هنا"
          />
          <button
            onClick={onSendMessage}
            disabled={!newMessage.trim() || isGenerating}
            className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-indigo-500/20"
            aria-label="إرسال الرسالة"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>

        {/* Quick Actions */}
        <QuickActions onActionClick={setNewMessage} />
      </footer>
    </div>
  );
};
