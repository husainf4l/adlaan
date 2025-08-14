"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { documentService } from "@/services/documentService";
import type { DocumentFile } from "@/types/documents";

export default function DocumentViewPage() {
  const params = useParams();
  const documentId = params.id as string;

  const [document, setDocument] = useState<DocumentFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadDocument = async () => {
      if (!documentId) {
        setError("معرف المستند مفقود");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");
        console.log(`🔍 Loading document with ID: ${documentId}`);

        const doc = await documentService.getDocument(documentId);
        console.log(`📄 Document loaded:`, doc);

        // Ensure we cast it properly since API returns DocumentFile | DocumentFolder
        if (doc.type === "file") {
          setDocument(doc as DocumentFile);
        } else {
          setError("هذا العنصر مجلد وليس ملف");
        }
      } catch (err) {
        console.error(`❌ Error loading document:`, err);
        setError(err instanceof Error ? err.message : "فشل في تحميل المستند");
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [documentId]);

  const handleDownload = async () => {
    try {
      // Use the downloadUrl from the API response if available
      if (document?.downloadUrl) {
        const a = window.document.createElement("a");
        a.href = document.downloadUrl;
        a.download = document.name || "document";
        a.target = "_blank"; // Open in new tab to trigger download
        window.document.body.appendChild(a);
        a.click();
        window.document.body.removeChild(a);
      } else {
        // Fallback to documentService download method
        const blob = await documentService.downloadDocument(documentId);
        const url = URL.createObjectURL(blob);
        const a = window.document.createElement("a");
        a.href = url;
        a.download = document?.name || "document";
        window.document.body.appendChild(a);
        a.click();
        window.document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch {
      alert("فشل في تحميل الملف");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            المستند غير موجود
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {document.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>{documentService.formatFileSize(document.size || 0)}</span>
            <span>•</span>
            <span>
              {new Date(document.updatedAt).toLocaleDateString("ar-SA")}
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                {document.mimeType === "application/pdf"
                  ? "PDF"
                  : document.extension?.toUpperCase()}
              </span>
            </span>
            {document.isLocked && (
              <>
                <span>•</span>
                <span className="flex items-center space-x-1 text-orange-600">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>مؤمن</span>
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => window.history.back()}
            className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>رجوع</span>
          </button>

          {document.mimeType === "application/pdf" && (
            <button
              onClick={() => window.print()}
              className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
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
              <span>طباعة</span>
            </button>
          )}

          <button
            onClick={handleDownload}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
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
            <span>تحميل</span>
          </button>
        </div>
      </div>

      {/* Document preview/content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {document.mimeType?.startsWith("image/") ? (
          <div className="text-center">
            <Image
              src={
                document.previewUrl ||
                document.downloadUrl ||
                "/placeholder-image.png"
              }
              alt={document.name}
              width={800}
              height={600}
              className="max-w-full h-auto mx-auto"
            />
          </div>
        ) : document.mimeType === "application/pdf" ? (
          <div className="w-full">
            {/* PDF Preview with multiple fallback options */}
            <div className="space-y-4">
              {/* Option 1: PDF.js viewer (most reliable) */}
              <div className="w-full h-[600px] border border-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(
                    document.previewUrl || document.downloadUrl || ""
                  )}`}
                  className="w-full h-full border-0"
                  title={document.name}
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>

              {/* Fallback options */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Direct PDF download */}
                <button
                  onClick={() =>
                    window.open(
                      document.previewUrl || document.downloadUrl,
                      "_blank"
                    )
                  }
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
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
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>تحميل مباشر</span>
                </button>

                {/* Google Docs viewer */}
                <button
                  onClick={() =>
                    window.open(
                      `https://docs.google.com/viewer?url=${encodeURIComponent(
                        document.previewUrl || document.downloadUrl || ""
                      )}&embedded=true`,
                      "_blank"
                    )
                  }
                  className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>عرض بـ Google</span>
                </button>
              </div>

              {/* Document info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">الحجم:</span>
                    <span className="font-medium mr-2">
                      {documentService.formatFileSize(document.size || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">النوع:</span>
                    <span className="font-medium mr-2">PDF</span>
                  </div>
                  <div>
                    <span className="text-gray-600">الإصدار:</span>
                    <span className="font-medium mr-2">{document.version}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">مؤمن:</span>
                    <span className="font-medium mr-2">
                      {document.isLocked ? "نعم" : "لا"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              معاينة غير متاحة
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              لا يمكن معاينة هذا النوع من الملفات
            </p>
            <button
              onClick={handleDownload}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90"
            >
              تحميل الملف
            </button>
          </div>
        )}
      </div>

      {/* Document metadata */}
      {document.tags && document.tags.length > 0 && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-medium mb-2">العلامات</h3>
          <div className="flex flex-wrap gap-2">
            {document.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
