"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_CONFIG } from "@/lib/constants";
import {
  profileApi,
  CompanyProfile,
  DocumentLayout,
  CreateCompanyProfileDto,
  CreateDocumentLayoutDto,
} from "../../../services/profileService";

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"company" | "layouts">("company");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Company Profile State
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    id: "",
    name: "",
    nameEn: null,
    email: null,
    phone: null,
    address: null,
    addressEn: null,
    website: null,
    taxNumber: null,
    commercialRegister: null,
    logo: null,
    description: null,
    isActive: true,
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
    // Check if user is authenticated before loading data
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.error("❌ No authentication token found");
      router.push("/login");
      return;
    }

    console.log("✅ Authentication token found, loading profile data");
    loadProfile();
    loadDocumentLayouts();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      console.log("🔄 Loading company profile...");
      const profile = await profileApi.getCompanyProfile();
      console.log("✅ Profile loaded successfully:", profile);
      if (profile) {
        setCompanyProfile(profile);
      } else {
        console.log("ℹ️ No profile found, creating default");
        // Initialize with default values if no profile exists
        const defaultProfile: CompanyProfile = {
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
          isActive: true,
          createdAt: "",
          updatedAt: "",
        };
        setCompanyProfile(defaultProfile);
      }
    } catch (error) {
      console.error("❌ Error loading profile:", error);
      // Fallback to default profile on error
      const defaultProfile: CompanyProfile = {
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
        isActive: true,
        createdAt: "",
        updatedAt: "",
      };
      setCompanyProfile(defaultProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDocumentLayouts = async () => {
    try {
      setIsLoading(true);
      const layouts = await profileApi.getDocumentLayouts();
      if (layouts && layouts.length > 0) {
        setDocumentLayouts(layouts);
      } else {
        // Initialize with default layout if none exist
        const defaultLayout: DocumentLayout = {
          id: "",
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
          isActive: true,
          companyProfileId: "",
          createdAt: "",
          updatedAt: "",
        };
        setDocumentLayouts([defaultLayout]);
      }
    } catch (error) {
      console.error("Error loading document layouts:", error);
      // Fallback to empty array on error
      setDocumentLayouts([]);
    } finally {
      setIsLoading(false);
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

  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert("حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت");
      return;
    }

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
      alert("نوع الملف غير مدعوم. يرجى اختيار صورة (JPG, PNG, GIF, WebP)");
      return;
    }

    setIsSaving(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("logo", file);

      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/profile/upload-logo`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `خطأ في الخادم: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("Upload response:", result);

      if (result.success) {
        // Backend returns the complete updated profile in result.data
        if (result.data.logo) {
          // Update the entire profile with the response data
          setCompanyProfile(result.data);

          // Clear the file input
          const fileInput = event.target;
          if (fileInput) {
            fileInput.value = "";
          }

          // Show success message with logo URL
          console.log("✅ Logo uploaded successfully:", result.data.logo);
          alert(
            `تم رفع شعار الشركة بنجاح!\n${
              result.message || "تم تحديث الملف الشخصي."
            }`
          );
        } else {
          throw new Error("لم يتم العثور على رابط الصورة في الاستجابة");
        }
      } else {
        throw new Error("فشل في رفع الصورة");
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("حدث خطأ أثناء رفع الصورة. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSaving(false);
    }
  };

  const saveCompanyProfile = async () => {
    setIsSaving(true);
    try {
      if (companyProfile.id) {
        // Update existing profile
        await profileApi.updateCompanyProfile(companyProfile.id, {
          name: companyProfile.name,
          nameEn: companyProfile.nameEn,
          email: companyProfile.email,
          phone: companyProfile.phone,
          address: companyProfile.address,
          addressEn: companyProfile.addressEn,
          website: companyProfile.website,
          taxNumber: companyProfile.taxNumber,
          commercialRegister: companyProfile.commercialRegister,
          logo: companyProfile.logo,
          description: companyProfile.description,
        });
      } else {
        // Create new profile
        const newProfile = await profileApi.createCompanyProfile({
          name: companyProfile.name,
          nameEn: companyProfile.nameEn,
          email: companyProfile.email,
          phone: companyProfile.phone,
          address: companyProfile.address,
          addressEn: companyProfile.addressEn,
          website: companyProfile.website,
          taxNumber: companyProfile.taxNumber,
          commercialRegister: companyProfile.commercialRegister,
          logo: companyProfile.logo,
          description: companyProfile.description,
        });
        setCompanyProfile(newProfile);
      }

      alert("تم حفظ ملف الشركة بنجاح!");
    } catch (error) {
      console.error("Error saving company profile:", error);
      alert("حدث خطأ أثناء حفظ ملف الشركة");
    } finally {
      setIsSaving(false);
    }
  };

  const createNewLayout = () => {
    const newLayout: DocumentLayout = {
      id: "",
      name: "تخطيط جديد",
      headerTemplate: "",
      footerTemplate: "",
      margins: { top: 60, bottom: 80, left: 40, right: 40 },
      fontSize: 14,
      fontFamily: "Arial, sans-serif",
      isDefault: false,
      isActive: true,
      companyProfileId: companyProfile.id || "",
      createdAt: "",
      updatedAt: "",
    };
    setSelectedLayout(newLayout);
    setIsEditingLayout(true);
  };

  const saveLayout = async () => {
    if (!selectedLayout) return;

    setIsSaving(true);
    try {
      if (selectedLayout.id && !selectedLayout.id.includes("new")) {
        // Update existing layout
        const updatedLayout = await profileApi.updateDocumentLayout(
          selectedLayout.id,
          {
            name: selectedLayout.name,
            headerTemplate: selectedLayout.headerTemplate,
            footerTemplate: selectedLayout.footerTemplate,
            margins: selectedLayout.margins,
            fontSize: selectedLayout.fontSize,
            fontFamily: selectedLayout.fontFamily,
            isDefault: selectedLayout.isDefault,
          }
        );

        setDocumentLayouts((prev) =>
          prev.map((l) => (l.id === selectedLayout.id ? updatedLayout : l))
        );
      } else {
        // Create new layout
        const newLayout = await profileApi.createDocumentLayout({
          name: selectedLayout.name,
          headerTemplate: selectedLayout.headerTemplate,
          footerTemplate: selectedLayout.footerTemplate,
          margins: selectedLayout.margins,
          fontSize: selectedLayout.fontSize,
          fontFamily: selectedLayout.fontFamily,
          isDefault: selectedLayout.isDefault,
          companyProfileId: companyProfile.id,
        });

        setDocumentLayouts((prev) => [...prev, newLayout]);
      }

      setIsEditingLayout(false);
      alert("تم حفظ التخطيط بنجاح!");
    } catch (error) {
      console.error("Error saving document layout:", error);
      alert("حدث خطأ أثناء حفظ التخطيط");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteLayout = async (layoutId: string) => {
    const layout = documentLayouts.find(
      (l: DocumentLayout) => l.id === layoutId
    );
    if (layout?.isDefault) {
      alert("لا يمكن حذف التخطيط الافتراضي");
      return;
    }

    if (confirm("هل أنت متأكد من حذف هذا التخطيط؟")) {
      try {
        setIsSaving(true);
        await profileApi.deleteDocumentLayout(layoutId);
        setDocumentLayouts((prev) =>
          prev.filter((l: DocumentLayout) => l.id !== layoutId)
        );
        alert("تم حذف التخطيط بنجاح!");
      } catch (error) {
        console.error("Error deleting document layout:", error);
        alert("حدث خطأ أثناء حذف التخطيط");
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100/80 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ملف الشركة</h1>
              <p className="text-gray-700 mt-1 font-medium">
                إدارة معلومات الشركة وتخطيط المستندات
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-300"
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
        <div className="flex space-x-1 bg-white rounded-2xl p-2 mb-8 border border-gray-300 shadow-sm">
          <button
            onClick={() => setActiveTab("company")}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === "company"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
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
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === "layouts"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
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
            <div className="bg-white rounded-3xl border border-gray-300 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                شعار الشركة
              </h2>
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 relative">
                  {companyProfile.logo ? (
                    <div className="w-32 h-32 bg-white rounded-2xl border-2 border-gray-300 flex items-center justify-center overflow-hidden shadow-sm">
                      <img
                        src={companyProfile.logo}
                        alt="Company Logo"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-400 flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-gray-500"
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

                  {/* Loading overlay for logo upload */}
                  {isSaving && (
                    <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <p className="text-sm text-indigo-600 mt-2">
                          جاري الرفع...
                        </p>
                      </div>
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
                      disabled={isSaving}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {isSaving && (
                      <p className="text-sm text-indigo-600 mt-2">
                        جاري رفع الصورة...
                      </p>
                    )}
                  </label>
                  <p className="text-xs text-slate-500 mt-2">
                    يفضل استخدام صور بصيغة PNG أو JPG بحجم لا يزيد عن 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Company Information Form */}
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-slate-300/60 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                معلومات الشركة
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    اسم الشركة (عربي) *
                  </label>
                  <input
                    type="text"
                    value={companyProfile.name}
                    onChange={(e) =>
                      handleCompanyProfileChange("name", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                    placeholder="مثال: شركة التطوير المتقدم"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    اسم الشركة (إنجليزي)
                  </label>
                  <input
                    type="text"
                    value={companyProfile.nameEn || ""}
                    onChange={(e) =>
                      handleCompanyProfileChange("nameEn", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                    placeholder="Example: Advanced Development Company"
                  />
                </div>{" "}
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    value={companyProfile.email || ""}
                    onChange={(e) =>
                      handleCompanyProfileChange("email", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                    placeholder="info@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    رقم الهاتف *
                  </label>
                  <input
                    type="tel"
                    value={companyProfile.phone || ""}
                    onChange={(e) =>
                      handleCompanyProfileChange("phone", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                    placeholder="+966501234567"
                  />
                </div>{" "}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    العنوان (عربي) *
                  </label>
                  <textarea
                    value={companyProfile.address || ""}
                    onChange={(e) =>
                      handleCompanyProfileChange("address", e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200 resize-none"
                    placeholder="المملكة العربية السعودية، الرياض، حي الملز، شارع الأمير سلطان"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    العنوان (إنجليزي)
                  </label>
                  <textarea
                    value={companyProfile.addressEn || ""}
                    onChange={(e) =>
                      handleCompanyProfileChange("addressEn", e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200 resize-none"
                    placeholder="Kingdom of Saudi Arabia, Riyadh, Al-Malaz District, Prince Sultan Street"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    الموقع الإلكتروني
                  </label>
                  <input
                    type="url"
                    value={companyProfile.website || ""}
                    onChange={(e) =>
                      handleCompanyProfileChange("website", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                    placeholder="https://www.company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    الرقم الضريبي
                  </label>
                  <input
                    type="text"
                    value={companyProfile.taxNumber || ""}
                    onChange={(e) =>
                      handleCompanyProfileChange("taxNumber", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                    placeholder="123456789012345"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    رقم السجل التجاري
                  </label>
                  <input
                    type="text"
                    value={companyProfile.commercialRegister || ""}
                    onChange={(e) =>
                      handleCompanyProfileChange(
                        "commercialRegister",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                    placeholder="1010123456"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  وصف الشركة
                </label>
                <textarea
                  value={companyProfile.description || ""}
                  onChange={(e) =>
                    handleCompanyProfileChange("description", e.target.value)
                  }
                  rows={3}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200 resize-none"
                  placeholder="وصف مختصر عن الشركة وأنشطتها..."
                />
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
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-slate-300/60 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  تخطيطات المستندات
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      router.push("/dashboard/profile/editor-demo")
                    }
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
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
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                      />
                    </svg>
                    محرر متقدم
                  </button>
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

                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <button
                        onClick={() =>
                          router.push(`/dashboard/profile/${layout.id}`)
                        }
                        className="w-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        🎨 تحرير متقدم
                      </button>
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
                        <label className="block text-sm font-semibold text-slate-800 mb-2">
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
                          className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                        />
                      </div>

                      {/* Font Settings */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-800 mb-2">
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
                            className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200"
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
                          <label className="block text-sm font-semibold text-slate-800 mb-2">
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
                            className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                          />
                        </div>
                      </div>

                      {/* Margins */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-2">
                          الهوامش (بكسل)
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
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
                              className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
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
                              className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
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
                              className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
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
                              className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Header Template */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-2">
                          قالب الرأسية
                          <span className="text-xs text-slate-600 mr-2">
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
                          className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200 font-mono text-sm resize-none"
                          placeholder="<div>رأسية المستند هنا...</div>"
                        />
                      </div>

                      {/* Footer Template */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-2">
                          قالب التذييل
                          <span className="text-xs text-slate-600 mr-2">
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
                          className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200 font-mono text-sm resize-none"
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
                        disabled={isSaving}
                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                      >
                        {isSaving ? "جاري الحفظ..." : "حفظ التخطيط"}
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
