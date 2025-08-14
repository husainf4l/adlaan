"use client";

import React from "react";
import type { BreadcrumbItem } from "@/types/documents";

export function ModernBreadcrumbNav({
  breadcrumbs,
  onNavigate,
}: {
  breadcrumbs: BreadcrumbItem[];
  onNavigate: (folderId: string | null) => void;
}) {
  return (
    <nav className="flex items-center space-x-1 text-sm">
      <button
        onClick={() => onNavigate(null)}
        className="text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
      >
        الرئيسية
      </button>

      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.id}>
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <button
            onClick={() => onNavigate(crumb.id)}
            className={`text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors ${
              index === breadcrumbs.length - 1
                ? "font-medium text-gray-900"
                : ""
            }`}
          >
            {crumb.name}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
}

export default ModernBreadcrumbNav;
