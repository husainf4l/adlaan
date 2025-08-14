"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ContractHeader } from "../../../components/contracts";
import { useEnhancedChat } from "../../../hooks/useEnhancedChat";
import { ContractData } from "../../../types/contracts";
import { getStatusLabel, getStatusStyle } from "../../../lib/contractUtils";

export default function ContractsPage() {
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState<string>("");
  const router = useRouter();

  const enhancedChat = useEnhancedChat(currentThreadId);

  // Load contracts from localStorage
  useEffect(() => {
    const storedContracts = localStorage.getItem("contracts");
    if (storedContracts) {
      setContracts(JSON.parse(storedContracts));
    }
  }, []);

  // Predefined prompts for quick start
  const quickPrompts = [
    {
      id: "create_service",
      title: "عقد خدمات",
      description: "إنشاء عقد خدمات احترافي",
      prompt: "أريد إنشاء عقد خدمات بين شركتين لتطوير موقع إلكتروني",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"
          />
        </svg>
      ),
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "create_employment",
      title: "عقد عمل",
      description: "إنشاء عقد عمل شامل",
      prompt: "أريد إنشاء عقد عمل لموظف جديد في الشركة",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      color: "from-green-500 to-green-600",
    },
    {
      id: "create_rental",
      title: "عقد إيجار",
      description: "إنشاء عقد إيجار مفصل",
      prompt: "أريد إنشاء عقد إيجار لعقار سكني أو تجاري",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      color: "from-purple-500 to-purple-600",
    },
    {
      id: "review_contract",
      title: "مراجعة عقد",
      description: "مراجعة وتحليل عقد موجود",
      prompt: "أريد مراجعة عقد موجود والتأكد من سلامته القانونية",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
      color: "from-orange-500 to-orange-600",
    },
    {
      id: "legal_advice",
      title: "استشارة قانونية",
      description: "الحصول على استشارة قانونية",
      prompt: "أحتاج استشارة قانونية حول بنود معينة في العقود",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-3m-3 3l-3-3"
          />
        </svg>
      ),
      color: "from-red-500 to-red-600",
    },
    {
      id: "custom",
      title: "طلب مخصص",
      description: "اكتب طلبك بنفسك",
      prompt: "",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      ),
      color: "from-indigo-500 to-indigo-600",
    },
  ];

  const handleQuickPrompt = async (prompt: any) => {
    // Generate a new thread ID for when they do send
    const threadId = `thread-${Date.now()}`;
    setCurrentThreadId(threadId);

    if (prompt.id === "custom") {
      // For custom, just focus the input
      document.querySelector("input")?.focus();
      return;
    }

    // Just populate the input field with the template text - no auto-send
    enhancedChat.setNewMessage(prompt.prompt);

    // Focus the input so user can review and modify before sending
    setTimeout(() => {
      document.querySelector("input")?.focus();
    }, 100);
  };

  const handleSendCustomMessage = async () => {
    if (!enhancedChat.newMessage.trim()) return;

    const threadId = currentThreadId || `thread-${Date.now()}`;
    if (!currentThreadId) {
      setCurrentThreadId(threadId);
    }

    try {
      // Send message to LLM and wait for response
      await enhancedChat.handleSendMessage();

      // After successful LLM response, navigate to dynamic chat page
      router.push(`/dashboard/contracts/${threadId}`);
    } catch (error) {
      console.error("Error sending message to LLM:", error);
      // Could show an error toast here
    }
  };

  const handleContractClick = (contractId: string) => {
    router.push(`/dashboard/contracts/${contractId}`);
  };

  const deleteContract = (e: React.MouseEvent, contractId: string) => {
    e.stopPropagation();
    const updatedContracts = contracts.filter((c) => c.id !== contractId);
    setContracts(updatedContracts);
    localStorage.setItem("contracts", JSON.stringify(updatedContracts));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>

      <ContractHeader currentContract={null} onNewContract={() => {}} />

      <main className="relative container mx-auto px-6 py-12 max-w-7xl">
        {/* Hero Section with Chat Interface */}
        <section className="text-center mb-16">
          {/* Minimal Icon */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                />
              </svg>
            </div>
          </div>

          {/* Elegant Typography */}
          <div className="space-y-4 mb-10">
            <h1 className="text-3xl md:text-4xl font-semibold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              مساعد العقود الذكي
            </h1>

            <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              إنشاء ومراجعة العقود القانونية بدقة وسرعة باستخدام الذكاء
              الاصطناعي
            </p>
          </div>

          {/* Clean Chat Input */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-1">
                <input
                  type="text"
                  value={enhancedChat.newMessage}
                  onChange={(e) => enhancedChat.setNewMessage(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleSendCustomMessage()
                  }
                  placeholder="اكتب طلبك هنا..."
                  className="w-full px-4 py-3 text-sm bg-transparent border-0 focus:ring-0 focus:outline-none placeholder-slate-400 text-slate-900"
                  style={{ fontSize: "16px" }}
                />

                <button
                  onClick={handleSendCustomMessage}
                  disabled={
                    !enhancedChat.newMessage.trim() || enhancedChat.isGenerating
                  }
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2 rounded-xl hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
                >
                  {enhancedChat.isGenerating ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>جاري المعالجة</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>إرسال</span>
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Clean Quick Prompts Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              القوالب المتاحة
            </h2>
            <p className="text-sm text-slate-600">
              اختر من القوالب المُعدة مسبقاً أو ابدأ بطلب مخصص
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickPrompts.map((prompt, index) => (
              <button
                key={prompt.id}
                onClick={() => handleQuickPrompt(prompt)}
                className="group p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all duration-200 text-left"
              >
                {/* Icon and Content */}
                <div className="flex items-start space-x-3">
                  <div
                    className={`flex-shrink-0 w-8 h-8 bg-gradient-to-br ${prompt.color} rounded-lg flex items-center justify-center text-white`}
                  >
                    {prompt.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-slate-900 mb-1">
                      {prompt.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {prompt.description}
                    </p>
                  </div>

                  <svg
                    className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 5l5 7-5 7"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Clean Recent Contracts Section */}
        {contracts.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  العقود الحديثة
                </h2>
                <p className="text-sm text-slate-600">
                  آخر العقود التي تم إنشاؤها أو تعديلها
                </p>
              </div>

              <button
                onClick={() => router.push("/dashboard/contracts/all")}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                عرض الكل
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contracts.slice(0, 6).map((contract, index) => (
                <div
                  key={contract.id}
                  onClick={() => handleContractClick(contract.id)}
                  className="group bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-slate-900 line-clamp-2 mb-1">
                        {contract.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                        <span className="text-xs text-slate-500">نشط</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => deleteContract(e, contract.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all duration-200"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">النوع</span>
                      <span className="text-slate-900 font-medium">
                        {contract.type}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">التاريخ</span>
                      <span className="text-slate-900">
                        {contract.createdAt}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs items-center">
                      <span className="text-slate-500">الحالة</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(
                          contract.status
                        )}`}
                      >
                        {getStatusLabel(contract.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Premium Empty State */}
        {contracts.length === 0 && (
          <section className="text-center py-20">
            <div className="max-w-2xl mx-auto">
              {/* Premium Illustration */}
              <div className="relative mb-12">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-50 rounded-full blur-2xl opacity-60"></div>
                <div className="relative w-32 h-32 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center shadow-2xl">
                  <svg
                    className="w-16 h-16 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-slate-900">
                  ابدأ رحلتك مع العقود الذكية
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed max-w-lg mx-auto">
                  استخدم قوة الذكاء الاصطناعي لإنشاء عقود قانونية احترافية في
                  دقائق معدودة
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 pt-8">
                  <button
                    onClick={() => document.querySelector("input")?.focus()}
                    className="group flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-2xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <svg
                      className="w-5 h-5 ml-3"
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
                    ابدأ الآن
                  </button>

                  <button className="flex items-center px-6 py-3 text-slate-600 hover:text-slate-800 font-medium transition-colors">
                    <svg
                      className="w-5 h-5 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    تعرف على المزيد
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
