"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { documentService } from "@/services/documentService";
import { DragDropZone } from "@/components/FileUpload/DragDropZone";
import ModernBreadcrumbNav from "@/components/documents/ModernBreadcrumbNav";
import ModernDocumentCard from "@/components/documents/ModernDocumentCard";
import type {
  DocumentItem,
  DocumentFile,
  DocumentFolder,
  BreadcrumbItem,
  UploadProgress,
  BackendDocumentType,
} from "@/types/documents";

// Test functions
function testDragDropFunctionality() {
  console.log("🎯 Drag and Drop & Delete Test Instructions:");
  console.log("1. Create a folder using 'مجلد جديد'");
  console.log("2. Upload some documents");
  console.log("3. Drag documents to folders - see blue drop zones");
  console.log(
    "4. Delete items: hover for quick delete or use checkboxes + bulk delete"
  );
  console.log("5. Keyboard shortcuts: Delete key, Escape, Ctrl+A");

  (window as any).testDragDrop = testDragDropFunctionality;
  (window as any).testDelete = () =>
    console.log("🗑️ Delete: Hover items or use bulk selection");
}

// Modern components are extracted into /src/components/documents

// Modern Upload Progress
function ModernUploadProgress({ uploads }: { uploads: UploadProgress[] }) {
  if (uploads.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 p-6 w-96 max-h-80 overflow-hidden z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">رفع الملفات</h3>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {uploads.length}
        </span>
      </div>

      <div className="space-y-3 max-h-60 overflow-y-auto">
        {uploads.map((upload) => (
          <div key={upload.fileId} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {upload.status === "completed" && (
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                  {upload.status === "error" && (
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                  )}
                  {upload.status === "uploading" && (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {upload.fileName}
                  </p>
                  <span
                    className={`text-xs ${
                      upload.status === "completed" ? "text-green-600" : ""
                    } ${upload.status === "error" ? "text-red-600" : ""} ${
                      upload.status === "uploading" ? "text-blue-600" : ""
                    }`}
                  >
                    {upload.status === "completed" && "اكتمل"}
                    {upload.status === "error" && "فشل"}
                    {upload.status === "uploading" && `${upload.progress}%`}
                  </span>
                </div>
              </div>
            </div>

            {upload.status === "uploading" && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
            )}

            {upload.status === "error" && upload.error && (
              <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">
                {upload.error}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Documents Page Component
export default function ModernDocumentsPage() {
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
  const [sortBy, setSortBy] = useState<"name" | "updatedAt" | "size" | "type">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterType, setFilterType] = useState<"all" | "file" | "folder">("all");
  const [filterDocumentType, setFilterDocumentType] = useState<string>("all");

  // Refs for maintaining focus
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter and sort items based on search query and filters
  const displayItems = React.useMemo(() => {
    let filteredItems = [...items];

    // Apply search filter
    if (searchQuery.trim()) {
      filteredItems = filteredItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== "all") {
      filteredItems = filteredItems.filter((item) => item.type === filterType);
    }

    // Apply document type filter for files
    if (filterDocumentType !== "all") {
      filteredItems = filteredItems.filter((item) => {
        if (item.type === "file") {
          const file = item as DocumentFile;
          return file.documentType === filterDocumentType;
        }
        return filterDocumentType === "all";
      });
    }

    // Apply sorting
    filteredItems.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name, "ar");
          break;
        case "updatedAt":
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case "size":
          const sizeA = a.type === "file" ? (a as DocumentFile).size || 0 : 0;
          const sizeB = b.type === "file" ? (b as DocumentFile).size || 0 : 0;
          comparison = sizeA - sizeB;
          break;
        case "type":
          comparison = a.type.localeCompare(b.type);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filteredItems;
  }, [items, searchQuery, filterType, filterDocumentType, sortBy, sortOrder]);

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
    testDragDropFunctionality();
  }, [loadFolderContents]);

  // Selection functions
  const handleToggleSelection = useCallback((itemId: string) => {
    setSelectedItems((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(itemId)) {
        newSelection.delete(itemId);
      } else {
        newSelection.add(itemId);
      }
      return newSelection;
    });
  }, []);

  const handleSingleSelection = useCallback((itemId: string) => {
    setSelectedItems(new Set([itemId]));
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  // File operations
  const handleFileUpload = useCallback(
    async (files: FileList) => {
      for (const file of Array.from(files)) {
        const fileId = "temp-" + Date.now() + Math.random();

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
              documentType: "CONTRACT" as BackendDocumentType,
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

          await loadFolderContents(currentFolderId);

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
    const confirmMessage =
      item.type === "folder"
        ? `هل أنت متأكد من حذف المجلد "${item.name}"؟\nسيتم حذف جميع محتوياته أيضاً.`
        : `هل أنت متأكد من حذف "${item.name}"؟`;

    if (confirm(confirmMessage)) {
      try {
        await documentService.deleteItems([item.id]);
        await loadFolderContents(currentFolderId);

        if (selectedItems.has(item.id)) {
          setSelectedItems((prev) => {
            const newSelection = new Set(prev);
            newSelection.delete(item.id);
            return newSelection;
          });
        }
      } catch (error) {
        console.error("Delete error:", error);
        alert("فشل في الحذف. قد يكون العنصر غير موجود أو لا تملك الصلاحيات.");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;

    const itemNames = items
      .filter((item) => selectedItems.has(item.id))
      .map((item) => item.name)
      .join("، ");

    if (confirm(`هل أنت متأكد من حذف هذه العناصر؟\n${itemNames}`)) {
      try {
        await documentService.deleteItems(Array.from(selectedItems));
        await loadFolderContents(currentFolderId);
        setSelectedItems(new Set());
      } catch (error) {
        console.error("Delete error:", error);
        alert("فشل في حذف بعض العناصر");
      }
    }
  };

  const handleItemMove = async () => {
    alert("ميزة النقل ستكون متاحة قريباً");
  };

  const handleItemDrop = async (
    draggedItemId: string,
    targetFolderId: string
  ) => {
    try {
      console.log(
        `🎯 Moving item ${draggedItemId} to folder ${targetFolderId}`
      );
      await documentService.moveItems({
        itemIds: [draggedItemId],
        targetParentId: targetFolderId,
      });
      await loadFolderContents(currentFolderId);
      console.log("✅ Item moved successfully!");
    } catch (error) {
      console.error("❌ Error moving item:", error);
      alert("فشل في نقل العنصر");
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" && selectedItems.size > 0) {
        e.preventDefault();
        handleBulkDelete();
      }

      if (e.key === "Escape") {
        handleClearSelection();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        const allItemIds = items.map((item) => item.id);
        setSelectedItems(new Set(allItemIds));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItems, items, handleBulkDelete, handleClearSelection]);

  // Render
  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col overflow-hidden">
      {/* Modern Header with Glass Effect */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                المستندات
              </h1>
              <div className="h-6 w-px bg-gray-300"></div>
              <ModernBreadcrumbNav
                breadcrumbs={breadcrumbs}
                onNavigate={loadFolderContents}
              />
            </div>

            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="البحث في المستندات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80 h-9 pl-9 pr-4 text-sm bg-gray-100/80 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 placeholder-gray-500 text-gray-900"
                />
                <svg
                  className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-2">
                {/* Type Filter */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-3 py-1.5 text-sm bg-gray-100 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                >
                  <option value="all">جميع الأنواع</option>
                  <option value="file">ملفات</option>
                  <option value="folder">مجلدات</option>
                </select>

                {/* Document Type Filter (for files) */}
                {filterType !== "folder" && (
                  <select
                    value={filterDocumentType}
                    onChange={(e) => setFilterDocumentType(e.target.value)}
                    className="px-3 py-1.5 text-sm bg-gray-100 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  >
                    <option value="all">جميع أنواع المستندات</option>
                    <option value="CONTRACT">عقد</option>
                    <option value="BRIEF">مذكرة قانونية</option>
                    <option value="INVOICE">فاتورة</option>
                    <option value="OTHER">أخرى</option>
                  </select>
                )}

                {/* Sort */}
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split("-");
                    setSortBy(newSortBy as any);
                    setSortOrder(newSortOrder as any);
                  }}
                  className="px-3 py-1.5 text-sm bg-gray-100 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                >
                  <option value="name-asc">الاسم: أ-ي</option>
                  <option value="name-desc">الاسم: ي-أ</option>
                  <option value="updatedAt-desc">الأحدث</option>
                  <option value="updatedAt-asc">الأقدم</option>
                  <option value="size-desc">الحجم: كبير-صغير</option>
                  <option value="size-asc">الحجم: صغير-كبير</option>
                  <option value="type-asc">النوع</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Results Summary */}
              {(searchQuery || filterType !== "all" || filterDocumentType !== "all") && (
                <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
                  {displayItems.length} من {items.length} عنصر
                  {searchQuery && ` • البحث: "${searchQuery}"`}
                  {filterType !== "all" && ` • النوع: ${filterType === "file" ? "ملفات" : "مجلدات"}`}
                  {filterDocumentType !== "all" && ` • نوع المستند: ${filterDocumentType}`}
                </div>
              )}

              {/* Selection Info */}
              {selectedItems.size > 0 ? (
                <div className="flex items-center space-x-3 bg-blue-50/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-blue-200/50">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedItems.size} عنصر محدد
                  </span>
                  <button
                    onClick={handleClearSelection}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    إلغاء التحديد
                  </button>
                  <div className="h-4 w-px bg-blue-300"></div>
                  <button
                    onClick={handleBulkDelete}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    حذف
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  {displayItems.length > 0 && (
                    <button
                      onClick={() => {
                        if (selectedItems.size === displayItems.length) {
                          handleClearSelection();
                        } else {
                          const allItemIds = displayItems.map(
                            (item) => item.id
                          );
                          setSelectedItems(new Set(allItemIds));
                        }
                      }}
                      className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      {selectedItems.size === displayItems.length
                        ? "إلغاء تحديد الكل"
                        : "تحديد الكل"}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Upload Button */}
              <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all duration-200 shadow-sm">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
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

              {/* New Folder Button */}
              <button
                onClick={() => setShowNewFolderModal(true)}
                className="inline-flex items-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-xl border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500/20 transition-all duration-200 shadow-sm"
              >
                <svg
                  className="w-4 h-4 mr-2"
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
                مجلد جديد
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area with Drag & Drop */}
      <DragDropZone
        onFileDrop={handleFileUpload}
        className="flex-1 overflow-hidden"
      >
        <div className="h-full flex flex-col">
          {/* Error Display */}
          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">جاري التحميل...</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto px-6 py-4">
              {/* Empty State */}
              {displayItems.length === 0 ? (
                <div className="text-center py-20">
                  <div className="max-w-md mx-auto">
                    {searchQuery.trim() ? (
                      // Search no results
                      <>
                        <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
                          <svg
                            className="w-16 h-16 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          لا توجد نتائج للبحث
                        </h3>
                        <p className="text-gray-600 mb-8">
                          لم نجد أي مستندات تحتوي على "{searchQuery}"
                        </p>
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            searchInputRef.current?.focus();
                          }}
                          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
                        >
                          مسح البحث
                        </button>
                      </>
                    ) : (
                      // No items at all
                      <>
                        <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
                          <svg
                            className="w-16 h-16 text-gray-400"
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

                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          ابدأ بإضافة ملفاتك
                        </h3>
                        <p className="text-gray-600 mb-8">
                          قم برفع المستندات أو إنشاء مجلدات لتنظيم ملفاتك بسهولة
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <label className="inline-flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 cursor-pointer transition-colors font-medium shadow-sm">
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
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                            <span>رفع ملفات</span>
                            <input
                              type="file"
                              multiple
                              className="hidden"
                              onChange={(e) =>
                                e.target.files &&
                                handleFileUpload(e.target.files)
                              }
                            />
                          </label>

                          <button
                            onClick={() => setShowNewFolderModal(true)}
                            className="inline-flex items-center justify-center space-x-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors font-medium shadow-sm"
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
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                            <span>إنشاء مجلد</span>
                          </button>
                        </div>

                        <div className="mt-8 p-6 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50/50">
                          <p className="text-sm text-gray-500">
                            أو اسحب وأفلت الملفات هنا
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                /* Items Grid/List */
                <div
                  className={`
                  ${
                    viewMode === "grid"
                      ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4"
                      : "space-y-1"
                  }
                `}
                >
                  {displayItems.map((item) => (
                    <ModernDocumentCard
                      key={item.id}
                      item={item}
                      onSelect={handleItemSelect}
                      isSelected={selectedItems.has(item.id)}
                      onRename={handleItemRename}
                      onDelete={handleItemDelete}
                      onMove={handleItemMove}
                      onStar={handleItemStar}
                      onItemDrop={handleItemDrop}
                      onToggleSelection={handleToggleSelection}
                      onSingleSelection={handleSingleSelection}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DragDropZone>

      {/* Upload Progress */}
      <ModernUploadProgress uploads={uploads} />

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              إنشاء مجلد جديد
            </h2>

            <input
              type="text"
              placeholder="اسم المجلد"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 transition-all"
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
              autoFocus
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowNewFolderModal(false);
                  setNewFolderName("");
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                إلغاء
              </button>

              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
