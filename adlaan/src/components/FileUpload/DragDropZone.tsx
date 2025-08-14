"use client";

import React, { useState, useCallback } from "react";

interface DragDropZoneProps {
  onFileDrop: (files: FileList) => void;
  children: React.ReactNode;
  className?: string;
}

export function DragDropZone({
  onFileDrop,
  children,
  className = "",
}: DragDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if this is an internal document move (has our JSON data)
    const hasInternalData = Array.from(e.dataTransfer.types).includes(
      "application/json"
    );
    if (hasInternalData) {
      return; // Don't interfere with internal document moves
    }

    setDragCounter((prev) => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if this is an internal document move (has our JSON data)
    const hasInternalData = Array.from(e.dataTransfer.types).includes(
      "application/json"
    );
    if (hasInternalData) {
      return; // Don't interfere with internal document moves
    }

    setDragCounter((prev) => {
      const newCounter = prev - 1;
      if (newCounter === 0) {
        setIsDragOver(false);
      }
      return newCounter;
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if this is an internal document move (has our JSON data)
    const hasInternalData = Array.from(e.dataTransfer.types).includes(
      "application/json"
    );
    if (hasInternalData) {
      return; // Don't interfere with internal document moves
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Check if this is an internal document move (has our JSON data)
      const hasInternalData = Array.from(e.dataTransfer.types).includes(
        "application/json"
      );
      if (hasInternalData) {
        return; // Don't interfere with internal document moves
      }

      setIsDragOver(false);
      setDragCounter(0);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFileDrop(e.dataTransfer.files);
      }
    },
    [onFileDrop]
  );

  return (
    <div
      className={`relative ${className}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}

      {/* Drag overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-gray-100/80 border-2 border-dashed border-gray-400 rounded-lg z-50 flex items-center justify-center">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-8 text-center border border-gray-300 shadow-lg">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-600"
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
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              أفلت الملفات هنا
            </h3>
            <p className="text-gray-600">سيتم رفع الملفات إلى المجلد الحالي</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DragDropZone;
