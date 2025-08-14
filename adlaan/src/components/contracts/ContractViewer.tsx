import React, { useState } from "react";
import { ContractData } from "../../types/contracts";

interface ContractViewerProps {
  contract: ContractData;
}

export const ContractViewer: React.FC<ContractViewerProps> = ({ contract }) => {
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fontSizeClasses = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
  };

  const increaseFontSize = () => {
    if (fontSize === "sm") setFontSize("base");
    else if (fontSize === "base") setFontSize("lg");
  };

  const decreaseFontSize = () => {
    if (fontSize === "lg") setFontSize("base");
    else if (fontSize === "base") setFontSize("sm");
  };

  return (
    <div className="h-full flex flex-col bg-white shadow-sm">
      {/* Contract Header */}
      <header className="flex-shrink-0 px-4 lg:px-6 py-4 border-b border-indigo-100/50 bg-gradient-to-r from-slate-50 to-indigo-50/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-slate-800">معاينة العقد</h1>
            <p className="text-sm text-slate-500 mt-1">{contract.title}</p>
          </div>
          <div className="flex items-center space-x-2">
            {/* Font Size Controls */}
            <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1">
              <button
                onClick={decreaseFontSize}
                disabled={fontSize === "sm"}
                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                aria-label="تصغير الخط"
                title="تصغير الخط"
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
                    d="M20 12H4"
                  />
                </svg>
              </button>
              <span className="px-2 text-xs text-slate-600 font-medium">
                حجم الخط
              </span>
              <button
                onClick={increaseFontSize}
                disabled={fontSize === "lg"}
                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                aria-label="تكبير الخط"
                title="تكبير الخط"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
              aria-label="طباعة العقد"
              title="طباعة العقد"
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
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
            </button>

            {/* Download Button */}
            <button
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
              aria-label="تنزيل العقد"
              title="تنزيل العقد"
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Contract Content */}
      <main
        className="flex-1 overflow-y-auto scroll-smooth"
        role="document"
        aria-label="محتوى العقد"
      >
        <div className="p-4 lg:p-6 bg-gradient-to-b from-white to-slate-50/50">
          <article className="max-w-none prose prose-slate prose-headings:text-slate-800 prose-p:text-slate-700">
            <div
              className={`whitespace-pre-wrap font-sans leading-relaxed text-slate-800 bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-slate-200/50 ${fontSizeClasses[fontSize]}`}
              style={{
                lineHeight:
                  fontSize === "lg"
                    ? "1.8"
                    : fontSize === "base"
                    ? "1.6"
                    : "1.5",
                fontFamily: '"Inter", "system-ui", sans-serif',
              }}
            >
              {contract.content}
            </div>
          </article>
        </div>
      </main>
    </div>
  );
};
