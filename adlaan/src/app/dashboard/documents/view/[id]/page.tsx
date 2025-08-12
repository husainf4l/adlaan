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
      try {
        setIsLoading(true);
        const doc = await documentService.getDocument(documentId);
        setDocument(doc);
      } catch (err) {
        setError(err instanceof Error ? err.message : "فشل في تحميل المستند");
      } finally {
        setIsLoading(false);
      }
    };

    if (documentId) {
      loadDocument();
    }
  }, [documentId]);

  const handleDownload = async () => {
    try {
      const blob = await documentService.downloadDocument(documentId);
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = document?.name || "document";
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {document.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {documentService.formatFileSize(document.size || 0)} •
            {new Date(document.updatedAt).toLocaleDateString("ar-SA")}
          </p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => window.history.back()}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            رجوع
          </button>

          <button
            onClick={handleDownload}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            تحميل
          </button>
        </div>
      </div>

      {/* Document preview/content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {document.mimeType?.startsWith("image/") ? (
          <div className="text-center">
            <Image
              src={`/api/documents/${document.id}/preview`}
              alt={document.name}
              width={800}
              height={600}
              className="max-w-full h-auto mx-auto"
            />
          </div>
        ) : document.mimeType === "application/pdf" ? (
          <div className="w-full h-96">
            <iframe
              src={`/api/documents/${document.id}/preview`}
              className="w-full h-full border-0"
              title={document.name}
            />
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
