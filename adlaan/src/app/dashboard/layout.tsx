"use client";

import { useState } from "react";
import Image from "next/image";
import { UserProvider, useUser } from "./context/UserContext";

// Custom SVG Icons
const HomeIcon = () => (
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
);

const DocumentIcon = () => (
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
);

const ContractIcon = () => (
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
);

const ChartIcon = () => (
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
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

const UserIcon = () => (
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
);

const SettingsIcon = () => (
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
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const LogoutIcon = () => (
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
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);

const NotificationIcon = () => (
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
      d="M15 17h5l-5 5v-5a3 3 0 00-3-3z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 7h6a3 3 0 013 3v0a3 3 0 01-3 3h-6m0-6a3 3 0 00-3 3v0a3 3 0 003 3m0-6V4a3 3 0 013-3v0a3 3 0 013 3v3"
    />
  </svg>
);

const SearchIcon = () => (
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
      d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
    />
  </svg>
);

const MenuIcon = () => (
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
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

const CloseIcon = () => (
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
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

interface MenuItem {
  name: string;
  href: string;
  icon: () => React.ReactElement;
}

const menuItems: MenuItem[] = [
  { name: "الرئيسية", href: "/dashboard", icon: HomeIcon },
  { name: "المستندات", href: "/dashboard/documents", icon: DocumentIcon },
  { name: "العقود", href: "/dashboard/contracts", icon: ContractIcon },
  { name: "التقارير", href: "/dashboard/reports", icon: ChartIcon },
  { name: "الملف الشخصي", href: "/dashboard/profile", icon: UserIcon },
  { name: "الإعدادات", href: "/dashboard/settings", icon: SettingsIcon },
];

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    {
      id: 1,
      title: "عقد جديد يحتاج مراجعة",
      time: "منذ 5 دقائق",
      unread: true,
    },
    { id: 2, title: "تم تحديث النظام", time: "منذ ساعة", unread: false },
    { id: 3, title: "رسالة من العميل", time: "منذ ساعتين", unread: true },
  ]);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:4007/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/";
    } catch {
      console.error("Logout failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002764] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Enhanced Sidebar */}
      <div
        className={`${
          sidebarCollapsed ? "w-16" : "w-64"
        } transition-all duration-300 bg-white shadow-lg border-r border-gray-200 flex flex-col`}
      >
        {/* Logo Section with Collapse Button */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          {!sidebarCollapsed && (
            <Image
              src="/adlaan-darklogo.png"
              alt="Adlaan Logo"
              width={140}
              height={44}
              className="h-8 w-auto"
              priority
            />
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarCollapsed ? <MenuIcon /> : <CloseIcon />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    sidebarCollapsed ? "justify-center" : "text-right"
                  } text-gray-700 hover:bg-gray-50 hover:text-[#002764]`}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <item.icon />
                  {!sidebarCollapsed && item.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-100">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-[#002764] rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          )}

          {/* Search Bar in Sidebar */}
          {!sidebarCollapsed && (
            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder="البحث..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#002764]/20 focus:border-[#002764] transition-colors"
                />
              </div>
            </div>
          )}

          {/* Notifications in Sidebar */}
          {!sidebarCollapsed && (
            <div className="mb-4">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-full flex items-center justify-between p-2 text-gray-600 hover:text-[#002764] hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span className="flex items-center gap-2 text-sm">
                  <NotificationIcon />
                  الإشعارات
                </span>
                {notifications.some((n) => n.unread) && (
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Notifications Dropdown in Sidebar */}
              {showNotifications && (
                <div className="mt-2 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="p-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">الإشعارات</span>
                      <span className="text-xs bg-[#002764] text-white px-2 py-1 rounded-full">
                        {notifications.filter((n) => n.unread).length}
                      </span>
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-100 cursor-pointer ${
                          notification.unread ? "bg-blue-50/50" : ""
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div
                            className={`w-1.5 h-1.5 rounded-full mt-2 ${
                              notification.unread ? "bg-[#002764]" : "bg-gray-300"
                            }`}
                          ></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 line-clamp-2">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 ${
              sidebarCollapsed ? "justify-center" : ""
            }`}
            title={sidebarCollapsed ? "تسجيل الخروج" : undefined}
          >
            <LogoutIcon />
            {!sidebarCollapsed && "تسجيل الخروج"}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <DashboardContent>{children}</DashboardContent>
    </UserProvider>
  );
}
