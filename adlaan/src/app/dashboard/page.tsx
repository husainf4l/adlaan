"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  twoFactorEnabled: boolean;
  companyId?: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:4007/auth/profile', {
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // User not authenticated, redirect to login
        window.location.href = '/login';
      }
    } catch {
      console.error('Auth check failed');
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:4007/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      window.location.href = '/';
    } catch {
      console.error('Logout failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image
                src="/adlaan-darklogo.png"
                alt="Adlaan Logo"
                width={140}
                height={44}
                className="h-8 w-auto brightness-0 invert"
                priority
              />
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-white/80 text-sm">
                مرحباً، {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="font-cairo text-4xl font-light text-white mb-4">
            لوحة التحكم
          </h1>
          <p className="text-white/60">
            مرحباً بك في منصة أدلان للذكاء الاصطناعي القانوني
          </p>
        </div>

        {/* Dashboard cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="text-white font-medium text-lg mb-2">المستندات</h3>
            <p className="text-white/60 text-sm mb-4">إدارة المستندات القانونية</p>
            <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors duration-200">
              عرض المستندات
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="text-white font-medium text-lg mb-2">العقود</h3>
            <p className="text-white/60 text-sm mb-4">إنشاء وإدارة العقود</p>
            <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors duration-200">
              إنشاء عقد جديد
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="text-white font-medium text-lg mb-2">التقارير</h3>
            <p className="text-white/60 text-sm mb-4">تقارير وإحصائيات مفصلة</p>
            <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors duration-200">
              عرض التقارير
            </button>
          </div>
        </div>

        {/* User profile section */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h2 className="text-white font-medium text-xl mb-6">معلومات الحساب</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 text-sm mb-2">الاسم</label>
              <p className="text-white bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                {user?.name}
              </p>
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-2">البريد الإلكتروني</label>
              <p className="text-white bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                {user?.email}
              </p>
            </div>
            {user?.phoneNumber && (
              <div>
                <label className="block text-white/80 text-sm mb-2">رقم الهاتف</label>
                <p className="text-white bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                  {user.phoneNumber}
                </p>
              </div>
            )}
            <div>
              <label className="block text-white/80 text-sm mb-2">المصادقة الثنائية</label>
              <p className="text-white bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                {user?.twoFactorEnabled ? 'مفعلة' : 'غير مفعلة'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
