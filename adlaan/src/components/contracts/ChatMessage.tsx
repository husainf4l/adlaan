import React from "react";
import { ChatMessage as ChatMessageType } from "../../types/contracts";
import { formatTime } from "../../lib/contractUtils";

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = React.memo(
  ({ message }) => {
    return (
      <div
        className={`flex ${
          message.type === "user" ? "justify-end" : "justify-start"
        }`}
        role="article"
        aria-label={`رسالة من ${
          message.type === "user" ? "المستخدم" : "المساعد"
        }`}
      >
        <div
          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl transition-all duration-200 ${
            message.type === "user"
              ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg hover:shadow-xl"
              : "bg-white text-slate-800 border border-indigo-200/50 shadow-sm hover:shadow-md"
          }`}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
          <p
            className={`text-xs mt-1 ${
              message.type === "user" ? "text-indigo-200" : "text-slate-500"
            }`}
          >
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>
    );
  }
);
