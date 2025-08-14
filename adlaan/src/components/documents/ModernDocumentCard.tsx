"use client";

import React, { useState } from "react";
import { documentService } from "@/services/documentService";
import { DOCUMENT_TYPE_LABELS } from "@/types/documents";
import type {
  DocumentItem,
  DocumentFile,
  DocumentFolder,
} from "@/types/documents";

export function ModernDocumentCard({
  item,
  onSelect,
  isSelected,
  onRename,
  onDelete,
  onMove,
  onStar,
  viewMode,
  onItemDrop,
  onToggleSelection,
  onSingleSelection,
}: {
  item: DocumentItem;
  onSelect: (item: DocumentItem) => void;
  isSelected: boolean;
  onRename: (item: DocumentItem) => void;
  onDelete: (item: DocumentItem) => void;
  onMove: (item: DocumentItem) => void;
  onStar: (item: DocumentItem) => void;
  viewMode: "grid" | "list";
  onItemDrop?: (draggedItemId: string, targetFolderId: string) => void;
  onToggleSelection?: (itemId: string) => void;
  onSingleSelection?: (itemId: string) => void;
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileTypeInfo = documentService.getFileTypeInfo(item.name);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        id: item.id,
        type: item.type,
        name: item.name,
      })
    );
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
  };

  const handleDragEnd = () => setIsDragging(false);

  const handleDragOver = (e: React.DragEvent) => {
    if (item.type === "folder") {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (item.type === "folder" && onItemDrop) {
      try {
        const draggedData = JSON.parse(
          e.dataTransfer.getData("application/json")
        );
        if (draggedData.id !== item.id) {
          onItemDrop(draggedData.id, item.id);
        }
      } catch (error) {
        console.error("Error parsing drag data:", error);
      }
    }
  };

  const handleDoubleClick = () => {
    if (item.type === "folder") {
      onSelect(item);
    } else {
      // Handle file preview/download based on file type
      const file = item as DocumentFile;
      if (file.previewUrl && fileTypeInfo.canPreview) {
        window.open(file.previewUrl, "_blank");
      } else if (file.downloadUrl) {
        window.open(file.downloadUrl, "_blank");
      } else {
        window.open(`/dashboard/documents/view/${item.id}`, "_blank");
      }
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const file = item as DocumentFile;
    if (file.downloadUrl) {
      const link = document.createElement('a');
      link.href = file.downloadUrl;
      link.download = item.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    const file = item as DocumentFile;
    if (file.previewUrl) {
      window.open(file.previewUrl, "_blank");
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement share modal
    alert("مشاركة الملف - قريباً");
  };

  const getDocumentTypeLabel = (documentType?: string): string => {
    if (!documentType) return "";
    return DOCUMENT_TYPE_LABELS[documentType as keyof typeof DOCUMENT_TYPE_LABELS] || documentType;
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
      onToggleSelection?.(item.id);
    } else if (e.shiftKey) {
      onToggleSelection?.(item.id);
    } else {
      onSingleSelection?.(item.id);
    }
  };

  if (viewMode === "list") {
    return (
      <div
        className={`
          group flex items-center px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer
          ${isSelected ? "bg-blue-50 ring-2 ring-blue-200" : "hover:bg-gray-50"}
          ${
            isDragOver && item.type === "folder"
              ? "bg-blue-100 ring-2 ring-blue-400"
              : ""
          }
          ${isDragging ? "opacity-60 scale-98" : ""}
        `}
        onDoubleClick={handleDoubleClick}
        onClick={handleClick}
        draggable={true}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onToggleSelection?.(item.id);
          }}
          className="mr-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />

        {/* Icon */}
        <div className={`text-2xl mr-4 ${fileTypeInfo.color} relative`}>
          {item.type === "folder" ? "📁" : fileTypeInfo.icon}

          {isDragOver && item.type === "folder" && (
            <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-lg border-2 border-blue-400 border-dashed flex items-center justify-center">
              <div className="text-blue-700 text-xs font-bold bg-white px-2 py-1 rounded shadow">
                إسقاط هنا
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {item.name}
            </h3>
            {item.isStarred && <span className="text-yellow-500 ml-2">⭐</span>}
            {item.type === "file" && (item as DocumentFile).documentType && (
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {getDocumentTypeLabel((item as DocumentFile).documentType)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
            {item.type === "file" && (
              <>
                <span>{documentService.formatFileSize((item as DocumentFile).size || 0)}</span>
                <span>•</span>
              </>
            )}
            <span>{new Date(item.updatedAt).toLocaleDateString("ar-SA")}</span>
            {item.type === "folder" && (
              <>
                <span>•</span>
                <span>{(item as DocumentFolder).childrenCount || 0} عنصر</span>
              </>
            )}
            {item.isShared && (
              <>
                <span>•</span>
                <span className="text-blue-600 font-medium">مشارك</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* File-specific actions */}
          {item.type === "file" && (
            <>
              {(item as DocumentFile).previewUrl && fileTypeInfo.canPreview && (
                <button
                  onClick={handlePreview}
                  className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  title="معاينة"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              )}
              {(item as DocumentFile).downloadUrl && (
                <button
                  onClick={handleDownload}
                  className="p-1.5 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                  title="تحميل"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              )}
              <button
                onClick={handleShare}
                className="p-1.5 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                title="مشاركة"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onStar(item);
            }}
            className="p-1.5 text-gray-400 hover:text-yellow-500 rounded-lg hover:bg-yellow-50 transition-colors"
            title={item.isStarred ? "إلغاء التمييز" : "تمييز"}
          >
            {item.isStarred ? "⭐" : "☆"}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item);
            }}
            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            title="حذف"
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
      </div>
    );
  }

  // Grid view
  return (
    <div
      className={`
        group relative bg-white rounded-2xl p-4 transition-all duration-200 cursor-pointer
        ${
          isSelected
            ? "ring-2 ring-blue-500 bg-blue-50"
            : "hover:shadow-lg hover:scale-105"
        }
        ${
          isDragOver && item.type === "folder"
            ? "ring-2 ring-blue-400 bg-blue-100 shadow-xl"
            : ""
        }
        ${isDragging ? "opacity-60 scale-95" : ""}
        border border-gray-200/50
      `}
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onToggleSelection?.(item.id);
          }}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </div>

      {/* Star */}
      {item.isStarred && (
        <div className="absolute top-3 right-3 z-10">
          <span className="text-yellow-500 text-lg">⭐</span>
        </div>
      )}

      {/* Icon Area */}
      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
        {item.type === "folder" ? (
          <div className="text-5xl">📁</div>
        ) : (
          <div className={`text-5xl ${fileTypeInfo.color}`}>
            {fileTypeInfo.icon}
          </div>
        )}

        {/* Drop Indicator */}
        {isDragOver && item.type === "folder" && (
          <div className="absolute inset-0 bg-blue-500 bg-opacity-30 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white text-blue-700 font-bold text-sm px-4 py-2 rounded-lg shadow-lg border-2 border-blue-400">
              📂 إسقاط هنا
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 truncate mb-2">
          {item.name}
        </h3>

        {item.type === "file" && (
          <div className="space-y-1">
            {(item as DocumentFile).documentType && (
              <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {getDocumentTypeLabel((item as DocumentFile).documentType)}
              </span>
            )}
            <div className="text-xs text-gray-500 space-y-0.5">
              <p>{documentService.formatFileSize((item as DocumentFile).size || 0)}</p>
              <p>{new Date(item.updatedAt).toLocaleDateString("ar-SA")}</p>
              {item.isShared && (
                <p className="text-blue-600 font-medium">مشارك</p>
              )}
            </div>
          </div>
        )}

        {item.type === "folder" && (
          <div className="text-xs text-gray-500 space-y-0.5">
            <p>{(item as DocumentFolder).childrenCount || 0} عنصر</p>
            <p>{new Date(item.updatedAt).toLocaleDateString("ar-SA")}</p>
            {item.isShared && (
              <p className="text-blue-600 font-medium">مشارك</p>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="absolute top-3 right-10 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
        {/* File-specific actions */}
        {item.type === "file" && (
          <>
            {(item as DocumentFile).previewUrl && fileTypeInfo.canPreview && (
              <button
                onClick={handlePreview}
                className="p-1.5 bg-white/90 backdrop-blur text-gray-600 hover:text-blue-600 rounded-lg shadow-sm hover:shadow transition-all"
                title="معاينة"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            )}
            {(item as DocumentFile).downloadUrl && (
              <button
                onClick={handleDownload}
                className="p-1.5 bg-white/90 backdrop-blur text-gray-600 hover:text-green-600 rounded-lg shadow-sm hover:shadow transition-all"
                title="تحميل"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            )}
          </>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onStar(item);
          }}
          className="p-1.5 bg-white/90 backdrop-blur text-gray-600 hover:text-yellow-500 rounded-lg shadow-sm hover:shadow transition-all"
          title={item.isStarred ? "إلغاء التمييز" : "تمييز"}
        >
          {item.isStarred ? "⭐" : "☆"}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item);
          }}
          className="p-1.5 bg-white/90 backdrop-blur text-gray-600 hover:text-red-600 rounded-lg shadow-sm hover:shadow transition-all"
          title="حذف"
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
    </div>
  );
}

export default ModernDocumentCard;
