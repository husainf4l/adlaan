"use client";

import React, { useState, useEffect, useCallback } from "react";
import { documentService } from "@/services/documentService";
import type {
  DocumentItem,
  DocumentFile,
  DocumentFolder,
  BreadcrumbItem,
  UploadProgress,
  BackendDocumentType,
} from "@/types/documents";

// Document item card component
function DocumentItemCard({
  item,
  onSelect,
  isSelected,
  onRename,
  onDelete,
  onMove,
  onStar,
}: {
  item: DocumentItem;
  onSelect: (item: DocumentItem) => void;
  isSelected: boolean;
  onRename: (item: DocumentItem) => void;
  onDelete: (item: DocumentItem) => void;
  onMove: (item: DocumentItem) => void;
  onStar: (item: DocumentItem) => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const fileTypeInfo = documentService.getFileTypeInfo(item.name);

  const handleDoubleClick = () => {
    if (item.type === "folder") {
      onSelect(item);
    } else {
      // Open document for viewing/editing
      window.open(`/dashboard/documents/view/${item.id}`, "_blank");
    }
  };

  return (
    <div
      className={`
        relative group p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer
        ${
          isSelected
            ? "border-primary bg-primary/5"
            : "border-gray-200 hover:border-gray-300 hover:shadow-md"
        }
      `}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Item content */}
      <div className="flex flex-col items-center text-center space-y-2">
        {/* Icon */}
        <div className={`text-4xl ${fileTypeInfo.color}`}>
          {item.type === "folder" ? "📁" : fileTypeInfo.icon}
        </div>

        {/* Name */}
        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate w-full">
          {item.name}
        </h3>

        {/* File details */}
        {item.type === "file" && (
          <div className="text-xs text-gray-500 space-y-1">
            <p>
              {documentService.formatFileSize((item as DocumentFile).size || 0)}
            </p>
            <p>{new Date(item.updatedAt).toLocaleDateString("ar-SA")}</p>
          </div>
        )}

        {/* Folder details */}
        {item.type === "folder" && (
          <div className="text-xs text-gray-500">
            <p>{(item as DocumentFolder).childrenCount || 0} عنصر</p>
          </div>
        )}
      </div>

      {/* Star indicator */}
      {item.isStarred && (
        <div className="absolute top-2 right-2">
          <span className="text-yellow-400">⭐</span>
        </div>
      )}

      {/* Actions menu */}
      {showActions && (
        <div className="absolute top-2 left-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-1 flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStar(item);
            }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xs"
            title={item.isStarred ? "إلغاء التمييز" : "تمييز"}
          >
            {item.isStarred ? "⭐" : "☆"}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onRename(item);
            }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xs"
            title="إعادة تسمية"
          >
            ✏️
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onMove(item);
            }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xs"
            title="نقل"
          >
            📋
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item);
            }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xs text-red-500"
            title="حذف"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
}

// Breadcrumb navigation component
function BreadcrumbNav({
  breadcrumbs,
  onNavigate,
}: {
  breadcrumbs: BreadcrumbItem[];
  onNavigate: (folderId: string | null) => void;
}) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
      <button onClick={() => onNavigate(null)} className="hover:text-primary">
        المجلد الرئيسي
      </button>

      {breadcrumbs.map((crumb) => (
        <React.Fragment key={crumb.id}>
          <span>/</span>
          <button
            onClick={() => onNavigate(crumb.id)}
            className="hover:text-primary"
          >
            {crumb.name}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
}

// Upload progress component
function UploadProgressBar({ uploads }: { uploads: UploadProgress[] }) {
  if (uploads.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-4 w-80 max-h-60 overflow-y-auto">
      <h3 className="font-medium mb-2">رفع الملفات</h3>

      {uploads.map((upload) => (
        <div key={upload.fileId} className="mb-3 last:mb-0">
          <div className="flex justify-between text-sm mb-1">
            <span className="truncate">{upload.fileName}</span>
            <span
              className={`
              ${upload.status === "completed" ? "text-green-600" : ""}
              ${upload.status === "error" ? "text-red-600" : ""}
              ${upload.status === "uploading" ? "text-blue-600" : ""}
            `}
            >
              {upload.status === "completed" && "✅"}
              {upload.status === "error" && "❌"}
              {upload.status === "uploading" && `${upload.progress}%`}
            </span>
          </div>

          {upload.status === "uploading" && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${upload.progress}%` }}
              />
            </div>
          )}

          {upload.status === "error" && (
            <p className="text-xs text-red-600">{upload.error}</p>
          )}
        </div>
      ))}
    </div>
  );
}

// Main Documents page component
export default function DocumentsPage() {
  // State management
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Load folder contents
  const loadFolderContents = useCallback(async (folderId: string | null) => {
    try {
      setIsLoading(true);
      setError("");

      const contents = folderId
        ? await documentService.getFolderContents(folderId)
        : await documentService.getRootItems();

      setItems(contents);
      setCurrentFolderId(folderId);

      // Update breadcrumbs
      if (folderId) {
        const path = await documentService.getFolderPath(folderId);
        setBreadcrumbs(path);
      } else {
        setBreadcrumbs([]);
      }

      setSelectedItems(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل في تحميل المحتوى");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadFolderContents(null);
  }, [loadFolderContents]);

  // File upload handling
  const handleFileUpload = useCallback(
    async (files: FileList) => {
      for (const file of Array.from(files)) {
        const fileId = "temp-" + Date.now() + Math.random();

        // Add to upload progress
        setUploads((prev) => [
          ...prev,
          {
            fileId,
            fileName: file.name,
            progress: 0,
            status: "uploading",
          },
        ]);

        try {
          await documentService.uploadFile(
            {
              file,
              documentType: "CONTRACT" as BackendDocumentType, // Default to CONTRACT
              parentId: currentFolderId || undefined,
              tags: [],
            },
            (progress) => {
              setUploads((prev) =>
                prev.map((upload) =>
                  upload.fileId === fileId ? progress : upload
                )
              );
            }
          );

          // Refresh folder contents
          await loadFolderContents(currentFolderId);

          // Remove from uploads after delay
          setTimeout(() => {
            setUploads((prev) =>
              prev.filter((upload) => upload.fileId !== fileId)
            );
          }, 2000);
        } catch {
          setUploads((prev) =>
            prev.map((upload) =>
              upload.fileId === fileId
                ? { ...upload, status: "error" as const, error: "فشل في الرفع" }
                : upload
            )
          );
        }
      }
    },
    [currentFolderId, loadFolderContents]
  );

  // Drag and drop handling
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileUpload(files);
      }
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Create new folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      await documentService.createFolder({
        name: newFolderName.trim(),
        parentId: currentFolderId || undefined,
      });

      setNewFolderName("");
      setShowNewFolderModal(false);
      await loadFolderContents(currentFolderId);
    } catch (err) {
      alert(
        "فشل في إنشاء المجلد: " +
          (err instanceof Error ? err.message : "خطأ غير معروف")
      );
    }
  };

  // Item operations
  const handleItemSelect = (item: DocumentItem) => {
    if (item.type === "folder") {
      loadFolderContents(item.id);
    }
  };

  const handleItemStar = async (item: DocumentItem) => {
    try {
      if (item.isStarred) {
        await documentService.unstarItem(item.id);
      } else {
        await documentService.starItem(item.id);
      }
      await loadFolderContents(currentFolderId);
    } catch {
      alert("فشل في تحديث التمييز");
    }
  };

  const handleItemRename = async (item: DocumentItem) => {
    const newName = prompt("الاسم الجديد:", item.name);
    if (newName && newName !== item.name) {
      try {
        await documentService.renameItem(item.id, { newName });
        await loadFolderContents(currentFolderId);
      } catch {
        alert("فشل في إعادة التسمية");
      }
    }
  };

  const handleItemDelete = async (item: DocumentItem) => {
    if (confirm(`هل أنت متأكد من حذف "${item.name}"؟`)) {
      try {
        await documentService.deleteItems([item.id]);
        await loadFolderContents(currentFolderId);
      } catch {
        alert("فشل في الحذف");
      }
    }
  };

  const handleItemMove = async () => {
    // This would open a folder picker modal
    alert("ميزة النقل ستكون متاحة قريباً");
  };

  // Render
  return (
    <div
      className="p-6 min-h-screen"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          إدارة المستندات
        </h1>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="البحث في المستندات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>

          {/* View mode toggle */}
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 ${
                viewMode === "grid"
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600"
              }`}
            >
              ⊞
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 ${
                viewMode === "list"
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600"
              }`}
            >
              ☰
            </button>
          </div>

          {/* Upload button */}
          <label className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 cursor-pointer">
            رفع ملف
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) =>
                e.target.files && handleFileUpload(e.target.files)
              }
            />
          </label>

          {/* New folder button */}
          <button
            onClick={() => setShowNewFolderModal(true)}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            مجلد جديد
          </button>
        </div>
      </div>

      {/* Breadcrumb navigation */}
      <BreadcrumbNav
        breadcrumbs={breadcrumbs}
        onNavigate={loadFolderContents}
      />

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Empty state */}
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                لا توجد مستندات
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                ابدأ برفع ملفاتك أو إنشاء مجلد جديد
              </p>
              <label className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 cursor-pointer">
                رفع أول ملف
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) =>
                    e.target.files && handleFileUpload(e.target.files)
                  }
                />
              </label>
            </div>
          ) : (
            /* Items grid */
            <div
              className={`
              ${
                viewMode === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
                  : "space-y-2"
              }
            `}
            >
              {items.map((item) => (
                <DocumentItemCard
                  key={item.id}
                  item={item}
                  onSelect={handleItemSelect}
                  isSelected={selectedItems.has(item.id)}
                  onRename={handleItemRename}
                  onDelete={handleItemDelete}
                  onMove={handleItemMove}
                  onStar={handleItemStar}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Upload progress */}
      <UploadProgressBar uploads={uploads} />

      {/* New folder modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h2 className="text-lg font-medium mb-4">إنشاء مجلد جديد</h2>

            <input
              type="text"
              placeholder="اسم المجلد"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent mb-4"
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
              autoFocus
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowNewFolderModal(false);
                  setNewFolderName("");
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                إلغاء
              </button>

              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                إنشاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
