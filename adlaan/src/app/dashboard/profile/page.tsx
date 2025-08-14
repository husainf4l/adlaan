"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { profileApi, CompanyProfile, DocumentLayout, CreateCompanyProfileDto, CreateDocumentLayoutDto } from "../../../services/profileService";

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"company" | "layouts">("company");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Company Profile State
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    id: "",
    name: "",
    nameEn: "",
    email: "",
    phone: "",
    address: "",
    addressEn: "",
    website: "",
    taxNumber: "",
    commercialRegister: "",
    logo: "",
    createdAt: "",
    updatedAt: "",
  });

  // Document Layouts State
  const [documentLayouts, setDocumentLayouts] = useState<DocumentLayout[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<DocumentLayout | null>(
    null
  );
  const [isEditingLayout, setIsEditingLayout] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadProfile();
    loadDocumentLayouts();
  }, []);

  const loadProfile = () => {
    const stored = localStorage.getItem("companyProfile");
    if (stored) {
      setCompanyProfile(JSON.parse(stored));
    } else {
      // Initialize with default values
      const defaultProfile: CompanyProfile = {
        id: `profile-${Date.now()}`,
        name: "",
        nameEn: "",
        email: "",
        phone: "",
        address: "",
        addressEn: "",
        website: "",
        taxNumber: "",
        commercialRegister: "",
        logo: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCompanyProfile(defaultProfile);
    }
  };

  const loadDocumentLayouts = () => {
    const stored = localStorage.getItem("documentLayouts");
    if (stored) {
      setDocumentLayouts(JSON.parse(stored));
    } else {
      // Initialize with default layout
      const defaultLayout: DocumentLayout = {
        id: `layout-${Date.now()}`,
        name: "التخطيط الافتراضي",
        headerTemplate: `
          <div style="text-align: center; padding: 20px; border-bottom: 2px solid #3B82F6;">
            <img src="{{COMPANY_LOGO}}" alt="{{COMPANY_NAME}}" style="height: 60px; margin-bottom: 10px;" />
            <h2 style="margin: 0; color: #1F2937;">{{COMPANY_NAME}}</h2>
            <p style="margin: 5px 0; color: #6B7280;">{{COMPANY_EMAIL}} | {{COMPANY_PHONE}}</p>
          </div>
        `,
        footerTemplate: `
          <div style="text-align: center; padding: 15px; border-top: 1px solid #E5E7EB; margin-top: 30px; color: #6B7280; font-size: 12px;">
            <p style="margin: 0;">{{COMPANY_NAME}} - {{COMPANY_ADDRESS}}</p>
            <p style="margin: 5px 0;">الرقم الضريبي: {{TAX_NUMBER}} | السجل التجاري: {{COMMERCIAL_REGISTER}}</p>
            <p style="margin: 0;">{{COMPANY_WEBSITE}}</p>
          </div>
        `,
        margins: { top: 60, bottom: 80, left: 40, right: 40 },
        fontSize: 14,
        fontFamily: "Arial, sans-serif",
        isDefault: true,
      };
      setDocumentLayouts([defaultLayout]);
      localStorage.setItem("documentLayouts", JSON.stringify([defaultLayout]));
    }
  };

  const handleCompanyProfileChange = (
    field: keyof CompanyProfile,
    value: string
  ) => {
    setCompanyProfile((prev) => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoData = e.target?.result as string;
        handleCompanyProfileChange("logo", logoData);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveCompanyProfile = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem("companyProfile", JSON.stringify(companyProfile));
      // Here you would typically make an API call to save to backend

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("تم حفظ ملف الشركة بنجاح!");
    } catch (error) {
      alert("حدث خطأ أثناء حفظ ملف الشركة");
    } finally {
      setIsSaving(false);
    }
  };

  const createNewLayout = () => {
    const newLayout: DocumentLayout = {
      id: `layout-${Date.now()}`,
      name: "تخطيط جديد",
      headerTemplate: "",
      footerTemplate: "",
      margins: { top: 60, bottom: 80, left: 40, right: 40 },
      fontSize: 14,
      fontFamily: "Arial, sans-serif",
      isDefault: false,
    };
    setSelectedLayout(newLayout);
    setIsEditingLayout(true);
  };

  const saveLayout = () => {
    if (!selectedLayout) return;

    const updatedLayouts =
      selectedLayout.id.includes("new") ||
      !documentLayouts.find((l) => l.id === selectedLayout.id)
        ? [
            ...documentLayouts,
            { ...selectedLayout, id: `layout-${Date.now()}` },
          ]
        : documentLayouts.map((l) =>
            l.id === selectedLayout.id ? selectedLayout : l
          );

    setDocumentLayouts(updatedLayouts);
    localStorage.setItem("documentLayouts", JSON.stringify(updatedLayouts));
    setIsEditingLayout(false);
    setSelectedLayout(null);
  };

  const deleteLayout = (layoutId: string) => {
    const layout = documentLayouts.find((l) => l.id === layoutId);
    if (layout?.isDefault) {
      alert("لا يمكن حذف التخطيط الافتراضي");
      return;
    }

    if (confirm("هل أنت متأكد من حذف هذا التخطيط؟")) {
      const updatedLayouts = documentLayouts.filter((l) => l.id !== layoutId);
      setDocumentLayouts(updatedLayouts);
      localStorage.setItem("documentLayouts", JSON.stringify(updatedLayouts));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">ملف الشركة</h1>
              <p className="text-slate-600 mt-1">
                إدارة معلومات الشركة وتخطيط المستندات
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="flex items-center px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              <svg
                className="w-5 h-5 ml-2"
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
              العودة
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Tabs */}
        <div className="flex space-x-1 bg-white/50 backdrop-blur-sm rounded-2xl p-1 mb-8 border border-slate-200/50">
          <button
            onClick={() => setActiveTab("company")}
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === "company"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <svg
              className="w-5 h-5 inline-block ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            معلومات الشركة
          </button>
          <button
            onClick={() => setActiveTab("layouts")}
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === "layouts"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <svg
              className="w-5 h-5 inline-block ml-2"
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
            تخطيط المستندات
          </button>
        </div>

        {/* Company Profile Tab */}
        {activeTab === "company" && (
          <div className="space-y-8">
            {/* Logo Section */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-slate-200/50 p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                شعار الشركة
              </h2>
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  {companyProfile.logo ? (
                    <div className="w-32 h-32 bg-white rounded-2xl border-2 border-slate-200 flex items-center justify-center overflow-hidden">
                      <img
                        src={companyProfile.logo}
                        alt="Company Logo"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block">
                    <span className="block text-sm font-medium text-slate-700 mb-2">
                      رفع الشعار
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </label>
                  <p className="text-xs text-slate-500 mt-2">
                    يفضل استخدام صور بصيغة PNG أو JPG بحجم لا يزيد عن 2MB
                  </p>
                </div>
              </div>
            </div>

            {/* Company Information Form */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-slate-200/50 p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                معلومات الشركة
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    اسم الشركة (عربي) *
                  </label>
                  <input
                    type="text"
                    value={companyProfile.name}
                    onChange={(e) =>
                      handleCompanyProfileChange("name", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="مثال: شركة التطوير المتقدم"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    اسم الشركة (إنجليزي)
                  </label>
                  <input
                    type="text"
                    value={companyProfile.nameEn}
                    onChange={(e) =>
                      handleCompanyProfileChange("nameEn", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Advanced Development Company"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    value={companyProfile.email}
                    onChange={(e) =>
                      handleCompanyProfileChange("email", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="info@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    رقم الهاتف *
                  </label>
                  <input
                    type="tel"
                    value={companyProfile.phone}
                    onChange={(e) =>
                      handleCompanyProfileChange("phone", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="+966 50 123 4567"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    العنوان (عربي) *
                  </label>
                  <textarea
                    value={companyProfile.address}
                    onChange={(e) =>
                      handleCompanyProfileChange("address", e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="المملكة العربية السعودية، الرياض، حي الملز، شارع الأمير سلطان"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    العنوان (إنجليزي)
                  </label>
                  <textarea
                    value={companyProfile.addressEn}
                    onChange={(e) =>
                      handleCompanyProfileChange("addressEn", e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Kingdom of Saudi Arabia, Riyadh, Al-Malaz District, Prince Sultan Street"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    الموقع الإلكتروني
                  </label>
                  <input
                    type="url"
                    value={companyProfile.website}
                    onChange={(e) =>
                      handleCompanyProfileChange("website", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://www.company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    الرقم الضريبي
                  </label>
                  <input
                    type="text"
                    value={companyProfile.taxNumber}
                    onChange={(e) =>
                      handleCompanyProfileChange("taxNumber", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="123456789012345"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    رقم السجل التجاري
                  </label>
                  <input
                    type="text"
                    value={companyProfile.commercialRegister}
                    onChange={(e) =>
                      handleCompanyProfileChange(
                        "commercialRegister",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="1010123456"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={saveCompanyProfile}
                  disabled={isSaving}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {isSaving ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                      جاري الحفظ...
                    </div>
                  ) : (
                    "حفظ المعلومات"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Document Layouts Tab */}
        {activeTab === "layouts" && (
          <div className="space-y-8">
            {/* Layouts List */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-slate-200/50 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  تخطيطات المستندات
                </h2>
                <button
                  onClick={createNewLayout}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <svg
                    className="w-5 h-5 ml-2"
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
                  تخطيط جديد
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documentLayouts.map((layout) => (
                  <div
                    key={layout.id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {layout.name}
                        </h3>
                        {layout.isDefault && (
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full mt-1">
                            افتراضي
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedLayout(layout);
                            setIsEditingLayout(true);
                          }}
                          className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        {!layout.isDefault && (
                          <button
                            onClick={() => deleteLayout(layout.id)}
                            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
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
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-slate-600">
                      <div>الخط: {layout.fontFamily}</div>
                      <div>الحجم: {layout.fontSize}px</div>
                      <div>الهوامش: {layout.margins.top}px</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Layout Editor Modal */}
            {isEditingLayout && selectedLayout && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-slate-900">
                        تحرير التخطيط
                      </h3>
                      <button
                        onClick={() => {
                          setIsEditingLayout(false);
                          setSelectedLayout(null);
                        }}
                        className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <svg
                          className="w-6 h-6"
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
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Layout Name */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          اسم التخطيط
                        </label>
                        <input
                          type="text"
                          value={selectedLayout.name}
                          onChange={(e) =>
                            setSelectedLayout({
                              ...selectedLayout,
                              name: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      {/* Font Settings */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            نوع الخط
                          </label>
                          <select
                            value={selectedLayout.fontFamily}
                            onChange={(e) =>
                              setSelectedLayout({
                                ...selectedLayout,
                                fontFamily: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="Arial, sans-serif">Arial</option>
                            <option value="Times New Roman, serif">
                              Times New Roman
                            </option>
                            <option value="Helvetica, sans-serif">
                              Helvetica
                            </option>
                            <option value="Georgia, serif">Georgia</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            حجم الخط
                          </label>
                          <input
                            type="number"
                            min="10"
                            max="24"
                            value={selectedLayout.fontSize}
                            onChange={(e) =>
                              setSelectedLayout({
                                ...selectedLayout,
                                fontSize: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      {/* Margins */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          الهوامش (بكسل)
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">
                              أعلى
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={selectedLayout.margins.top}
                              onChange={(e) =>
                                setSelectedLayout({
                                  ...selectedLayout,
                                  margins: {
                                    ...selectedLayout.margins,
                                    top: parseInt(e.target.value),
                                  },
                                })
                              }
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">
                              أسفل
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={selectedLayout.margins.bottom}
                              onChange={(e) =>
                                setSelectedLayout({
                                  ...selectedLayout,
                                  margins: {
                                    ...selectedLayout.margins,
                                    bottom: parseInt(e.target.value),
                                  },
                                })
                              }
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">
                              يسار
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={selectedLayout.margins.left}
                              onChange={(e) =>
                                setSelectedLayout({
                                  ...selectedLayout,
                                  margins: {
                                    ...selectedLayout.margins,
                                    left: parseInt(e.target.value),
                                  },
                                })
                              }
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">
                              يمين
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={selectedLayout.margins.right}
                              onChange={(e) =>
                                setSelectedLayout({
                                  ...selectedLayout,
                                  margins: {
                                    ...selectedLayout.margins,
                                    right: parseInt(e.target.value),
                                  },
                                })
                              }
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Header Template */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          قالب الرأسية
                          <span className="text-xs text-slate-500 mr-2">
                            (يمكن استخدام المتغيرات: COMPANY_NAME, COMPANY_LOGO,
                            COMPANY_EMAIL, إلخ)
                          </span>
                        </label>
                        <textarea
                          value={selectedLayout.headerTemplate}
                          onChange={(e) =>
                            setSelectedLayout({
                              ...selectedLayout,
                              headerTemplate: e.target.value,
                            })
                          }
                          rows={8}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                          placeholder="<div>رأسية المستند هنا...</div>"
                        />
                      </div>

                      {/* Footer Template */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          قالب التذييل
                          <span className="text-xs text-slate-500 mr-2">
                            (يمكن استخدام المتغيرات: COMPANY_NAME,
                            COMPANY_ADDRESS, TAX_NUMBER, إلخ)
                          </span>
                        </label>
                        <textarea
                          value={selectedLayout.footerTemplate}
                          onChange={(e) =>
                            setSelectedLayout({
                              ...selectedLayout,
                              footerTemplate: e.target.value,
                            })
                          }
                          rows={6}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                          placeholder="<div>تذييل المستند هنا...</div>"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-slate-200">
                      <button
                        onClick={() => {
                          setIsEditingLayout(false);
                          setSelectedLayout(null);
                        }}
                        className="px-6 py-3 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={saveLayout}
                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        حفظ التخطيط
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
