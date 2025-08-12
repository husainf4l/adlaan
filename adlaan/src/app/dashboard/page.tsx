"use client";

import { useUser } from "./context/UserContext";

// Custom SVG Icons for content
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

export default function DashboardPage() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002764] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#002764] to-black rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-cairo text-3xl font-light mb-2">
              مرحباً، {user?.name}
            </h2>
            <p className="text-white/80 text-lg">
              ابدأ رحلتك مع الذكاء الاصطناعي القانوني
            </p>
          </div>
          {/* User Avatar in Welcome Section */}
          <div className="relative">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {user?.name?.charAt(0)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
        </div>
      </div>

      {/* Quick Stats with Enhanced Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">المستندات</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
              <p className="text-xs text-green-600 mt-1">+12% هذا الشهر</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
              <DocumentIcon />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">العقود</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-xs text-green-600 mt-1">+5% هذا الشهر</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
              <ContractIcon />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">التقارير</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
              <p className="text-xs text-blue-600 mt-1">+2 هذا الأسبوع</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
              <ChartIcon />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                المشاريع النشطة
              </p>
              <p className="text-2xl font-bold text-gray-900">5</p>
              <p className="text-xs text-orange-600 mt-1">3 قيد المراجعة</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
              <HomeIcon />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Recent Activity & Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              النشاط الأخير
            </h3>
            <button className="text-sm text-[#002764] hover:underline">
              عرض الكل
            </button>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-2 h-2 bg-[#002764] rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    تم إنشاء مستند جديد - &quot;عقد الشراكة التجارية&quot;
                  </p>
                  <p className="text-xs text-gray-500">منذ ساعتين</p>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  جديد
                </span>
              </div>
              <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    تم توقيع العقد رقم #123 من قبل العميل
                  </p>
                  <p className="text-xs text-gray-500">منذ 4 ساعات</p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  مكتمل
                </span>
              </div>
              <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    تم إنشاء تقرير شهري للإحصائيات
                  </p>
                  <p className="text-xs text-gray-500">أمس</p>
                </div>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  تقرير
                </span>
              </div>
              <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    تحديث إعدادات الأمان للحساب
                  </p>
                  <p className="text-xs text-gray-500">منذ يومين</p>
                </div>
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                  أمان
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              إجراءات سريعة
            </h3>
          </div>
          <div className="p-6 space-y-3">
            <button className="w-full text-right px-4 py-3 bg-[#002764] text-white rounded-lg hover:bg-[#001f4d] transition-colors flex items-center gap-3">
              <DocumentIcon />
              إنشاء مستند جديد
            </button>
            <button className="w-full text-right px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-3">
              <ContractIcon />
              إضافة عقد
            </button>
            <button className="w-full text-right px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-3">
              <ChartIcon />
              إنشاء تقرير
            </button>
            <button className="w-full text-right px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-3">
              <UserIcon />
              إدارة العملاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
