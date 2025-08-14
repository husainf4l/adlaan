import React from "react";
import { FeatureCard } from "./FeatureCard";
import { features } from "../../lib/contractConstants";

interface EmptyStateProps {
  onNewContract: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onNewContract }) => {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-indigo-100 via-blue-100 to-purple-100 rounded-3xl flex items-center justify-center shadow-lg">
          <svg
            className="w-16 h-16 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>

        <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-4">
          مرحباً بك في مولد العقود الذكي
        </h3>
        <p className="text-slate-600 mb-8 leading-relaxed">
          أنشئ عقود احترافية بالذكاء الاصطناعي. اختر نوع العقد وقم بتخصيصه
          باستخدام المساعد الذكي.
        </p>

        <button
          onClick={onNewContract}
          className="inline-flex items-center space-x-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-8 py-4 rounded-2xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:scale-105"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <span>إنشاء عقد جديد</span>
        </button>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
