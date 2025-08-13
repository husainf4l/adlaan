"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { triggerGoogleSignIn, resetGoogleSignIn } from "@/lib/googleAuth";
import { API_CONFIG } from "@/lib/constants";

interface RegisterData {
  // User data
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;

  // Company data
  companyName: string;
  industry: string;
  companySize: string;
  companyDescription: string;

  // Subscription
  planId: string;

  // Settings
  twoFactorEnabled: boolean;
}

interface RegisterResponse {
  requiresOtp?: boolean;
  phoneNumber?: string;
  message?: string;
}

export default function RegisterPage() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<"user" | "company" | "subscription" | "otp">(
    "user"
  );
  const [formData, setFormData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    companyName: "",
    industry: "",
    companySize: "",
    companyDescription: "",
    planId: "professional",
    twoFactorEnabled: false,
  });
  const [otpCode, setOtpCode] = useState("");
  const [registerData, setRegisterData] = useState<RegisterResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const industries = [
    "القانونية والاستشارات",
    "التكنولوجيا والبرمجيات",
    "التجارة الإلكترونية",
    "الصحة والطب",
    "التعليم",
    "العقارات",
    "البناء والمقاولات",
    "الخدمات المالية",
    "التصنيع",
    "أخرى",
  ];

  const companySizes = [
    "1-10 موظفين",
    "11-50 موظف",
    "51-200 موظف",
    "201-1000 موظف",
    "أكثر من 1000 موظف",
  ];

  const plans = [
    {
      id: "starter",
      name: "المبتدئ",
      price: "99 ر.س/شهر",
      features: [
        "حتى 50 مستند شهرياً",
        "قوالب أساسية",
        "دعم عبر البريد الإلكتروني",
      ],
    },
    {
      id: "professional",
      name: "المحترف",
      price: "299 ر.س/شهر",
      features: ["حتى 200 مستند شهرياً", "جميع القوالب المتقدمة", "دعم أولوية"],
      popular: true,
    },
    {
      id: "enterprise",
      name: "المؤسسي",
      price: "999 ر.س/شهر",
      features: ["مستندات غير محدودة", "قوالب مخصصة", "دعم مخصص 24/7"],
    },
  ];

  useEffect(() => {
    setMounted(true);

    // Cleanup function to cancel Google Sign-In when component unmounts
    return () => {
      resetGoogleSignIn();
    };
  }, []);

  const handleGoogleResponse = useCallback(
    async (response: { credential: string }) => {
      setIsLoading(true);
      setError("");

      try {
        console.log("Google credential received:", response.credential);

        const res = await fetch(
          `${API_CONFIG.BASE_URL}/api/auth/google/token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ credential: response.credential }),
          }
        );

        const data = await res.json();

        if (res.ok) {
          // Check if user needs to complete company setup
          if (data.needsCompanySetup) {
            // Pre-fill user data from Google
            if (data.user) {
              setFormData((prev) => ({
                ...prev,
                name: data.user.name || "",
                email: data.user.email || "",
                phoneNumber: data.user.phoneNumber || "",
              }));
            }
            setStep("company");
          } else {
            // User is fully registered, redirect to dashboard
            window.location.href = "/dashboard";
          }
        } else {
          setError(data.message || "فشل في تسجيل الدخول بواسطة Google");
        }
      } catch (error) {
        console.error("Google sign-in error:", error);
        setError("حدث خطأ أثناء تسجيل الدخول بواسطة Google");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleGoogleSignIn = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      await triggerGoogleSignIn({
        clientId:
          process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
          "535659420325-h288l3jogkshr2f8e0b9fa5lgcekso8k.apps.googleusercontent.com",
        onSuccess: handleGoogleResponse,
        onError: (error: string) => {
          console.error("Google Sign-In error:", error);
          // Don't show error for aborted operations (user cancelled)
          if (!error.includes("abort") && !error.includes("cancel")) {
            setError(error);
          }
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error("Google Sign-In trigger error:", error);
      setError("فشل في بدء التسجيل بواسطة Google");
      setIsLoading(false);
    }
  }, [handleGoogleResponse]);

  const handleNext = () => {
    setError("");

    if (step === "user") {
      // Validate user data
      if (
        !formData.name ||
        !formData.email ||
        !formData.password ||
        !formData.phoneNumber
      ) {
        setError("جميع الحقول مطلوبة");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("كلمة المرور وتأكيد كلمة المرور غير متطابقين");
        return;
      }
      if (formData.password.length < 8) {
        setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
        return;
      }
      setStep("company");
    } else if (step === "company") {
      // Validate company data
      if (
        !formData.companyName ||
        !formData.industry ||
        !formData.companySize
      ) {
        setError("جميع الحقول المطلوبة يجب ملؤها");
        return;
      }
      setStep("subscription");
    }
  };

  const handleBack = () => {
    setError("");
    if (step === "company") {
      setStep("user");
    } else if (step === "subscription") {
      setStep("company");
    }
  };

  const handleRegister = async () => {
    if (!formData.planId) {
      setError("يرجى اختيار خطة الاشتراك");
      return;
    }

    // Additional validation before sending to backend
    if (!formData.companyName.trim()) {
      setError("اسم الشركة مطلوب");
      return;
    }

    if (!formData.industry) {
      setError("نوع الصناعة مطلوب");
      return;
    }

    if (!formData.companySize) {
      setError("حجم الشركة مطلوب");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("يرجى إدخال بريد إلكتروني صحيح");
      return;
    }

    // Validate phone number format (basic validation)
    if (!formData.phoneNumber.match(/^\+?[0-9]{10,15}$/)) {
      setError("يرجى إدخال رقم هاتف صحيح");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const requestData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phoneNumber: formData.phoneNumber.trim(),
        companyName: formData.companyName.trim(),
        industry: formData.industry,
        companySize: formData.companySize,
        companyDescription: formData.companyDescription.trim(),
        planId: formData.planId,
        twoFactorEnabled: formData.twoFactorEnabled,
      };

      console.log("Sending registration data:", {
        ...requestData,
        password: "[HIDDEN]",
      });

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/auth/signup-complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(requestData),
        }
      );

      const data = await response.json();

      if (response.ok && !data.requiresOtp) {
        // Registration successful without OTP
        window.location.href = "/dashboard";
      } else if (data.requiresOtp) {
        // Show OTP verification
        setRegisterData(data);
        setStep("otp");
      } else {
        // Handle specific error cases
        let errorMessage = data.message || "فشل في إنشاء الحساب";

        if (data.message && data.message.includes("Company")) {
          errorMessage =
            "حدث خطأ في إنشاء بيانات الشركة. يرجى المحاولة مرة أخرى.";
        } else if (data.message && data.message.includes("Subscription")) {
          errorMessage = "حدث خطأ في إعداد الاشتراك. يرجى المحاولة مرة أخرى.";
        } else if (data.message && data.message.includes("email")) {
          errorMessage =
            "البريد الإلكتروني مستخدم بالفعل. يرجى استخدام بريد إلكتروني آخر.";
        }

        setError(errorMessage);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError(
        "حدث خطأ أثناء الاتصال بالخادم. يرجى التحقق من الاتصال والمحاولة مرة أخرى."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!registerData?.phoneNumber) {
      setError("بيانات التسجيل غير مكتملة");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/auth/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            phoneNumber: registerData.phoneNumber,
            code: otpCode,
            type: "SIGNUP_VERIFICATION",
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Verification successful
        window.location.href = "/dashboard";
      } else {
        setError(data.message || "كود التحقق غير صحيح");
      }
    } catch {
      setError("حدث خطأ أثناء التحقق");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      {/* Simple, clean background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-black"></div>

      {/* Card container */}
      <div className="relative z-10 w-full max-w-4xl">
        <div
          className={`bg-gray-900/40 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-8 shadow-2xl transition-all duration-700 ease-out ${
            mounted
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-4 scale-95"
          }`}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <Image
                src="/adlaan-darklogo.png"
                alt="Adlaan Logo"
                width={120}
                height={40}
                className="h-8 w-auto brightness-0 invert hover:scale-105 transition-transform duration-200"
                priority
              />
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-cairo text-2xl font-semibold text-white mb-2">
              {step === "user" && "إنشاء حساب جديد"}
              {step === "company" && "معلومات الشركة"}
              {step === "subscription" && "اختر خطة الاشتراك"}
              {step === "otp" && "التحقق من الهوية"}
            </h1>
            <p className="text-gray-400 text-sm">
              {step === "user" && "انضم إلى منصة أدلان"}
              {step === "company" && "أخبرنا عن شركتك"}
              {step === "subscription" && "اختر الخطة المناسبة لاحتياجاتك"}
              {step === "otp" &&
                `تم إرسال رمز التحقق إلى ${registerData?.phoneNumber}`}
            </p>
          </div>

          {/* Progress Bar */}
          {step !== "otp" && (
            <div className="flex items-center justify-center gap-2 mb-8">
              <div
                className={`h-2 w-16 rounded-full transition-colors ${
                  step === "user" ? "bg-blue-500" : "bg-gray-700"
                }`}
              ></div>
              <div
                className={`h-2 w-16 rounded-full transition-colors ${
                  step === "company" ? "bg-blue-500" : "bg-gray-700"
                }`}
              ></div>
              <div
                className={`h-2 w-16 rounded-full transition-colors ${
                  step === "subscription" ? "bg-blue-500" : "bg-gray-700"
                }`}
              ></div>
            </div>
          )}

          {/* Google Sign-In Button - Only show on user step */}
          {step === "user" && (
            <div className="mb-8">
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-white text-gray-800 px-6 py-3.5 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-3 mb-6"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {isLoading ? "جارٍ التحميل..." : "التسجيل بواسطة Google"}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-900/40 text-gray-400">أو</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: User Information */}
          {step === "user" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    placeholder="الاسم الكامل"
                    required
                  />
                </div>

                <div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    placeholder="البريد الإلكتروني"
                    required
                  />
                </div>

                <div>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phoneNumber: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    placeholder="رقم الهاتف (+966XXXXXXXXX)"
                    required
                  />
                </div>

                <div>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    placeholder="كلمة المرور"
                    required
                    minLength={8}
                  />
                </div>

                <div className="md:col-span-1">
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    placeholder="تأكيد كلمة المرور"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              {/* Two-Factor Authentication Option */}
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={formData.twoFactorEnabled}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      twoFactorEnabled: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-blue-500 bg-gray-800/50 border-gray-700/50 rounded focus:ring-blue-500/50 focus:ring-2"
                />
                <label className="text-sm text-gray-300">
                  تفعيل المصادقة الثنائية
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Company Information */}
          {step === "company" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        companyName: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    placeholder="اسم الشركة"
                    required
                  />
                </div>

                <div>
                  <select
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        industry: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    required
                  >
                    <option value="">اختر نوع الصناعة</option>
                    {industries.map((industry) => (
                      <option
                        key={industry}
                        value={industry}
                        className="bg-gray-800 text-white"
                      >
                        {industry}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={formData.companySize}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        companySize: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    required
                  >
                    <option value="">اختر حجم الشركة</option>
                    {companySizes.map((size) => (
                      <option
                        key={size}
                        value={size}
                        className="bg-gray-800 text-white"
                      >
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <textarea
                    value={formData.companyDescription}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        companyDescription: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 resize-none"
                    placeholder="وصف مختصر عن الشركة (اختياري)"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Subscription Plans */}
          {step === "subscription" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                      formData.planId === plan.id
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-gray-700/50 hover:border-gray-600/50"
                    } ${plan.popular ? "ring-2 ring-blue-500/30" : ""}`}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, planId: plan.id }))
                    }
                  >
                    {plan.popular && (
                      <div className="text-center mb-2">
                        <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                          الأكثر شعبية
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-3">
                      <h3 className="font-semibold text-white mb-2">
                        {plan.name}
                      </h3>
                      <span className="text-lg font-bold text-blue-400">
                        {plan.price}
                      </span>
                    </div>

                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li
                          key={index}
                          className="text-sm text-gray-300 flex items-start gap-2"
                        >
                          <svg
                            className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="flex-1">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {formData.planId === plan.id && (
                      <div className="mt-4 flex justify-center">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-900/30 border border-red-800/50 rounded-xl mt-6">
              <p className="text-red-300 text-sm text-center mb-3">{error}</p>
              {step === "subscription" && (
                <div className="text-center">
                  <button
                    onClick={() => setError("")}
                    className="text-xs text-red-200 hover:text-white underline"
                  >
                    إخفاء الخطأ وإعادة المحاولة
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          {step !== "otp" && (
            <div className="flex items-center justify-between mt-8">
              {step !== "user" && (
                <button
                  onClick={handleBack}
                  className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                >
                  السابق
                </button>
              )}

              <div className="mr-auto">
                {step !== "subscription" ? (
                  <button
                    onClick={handleNext}
                    className="px-8 py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-100 transition-colors"
                  >
                    التالي
                  </button>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={isLoading}
                    className="px-8 py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "جارٍ إنشاء الحساب..." : "إنشاء الحساب"}
                  </button>
                )}
              </div>
            </div>
          )}
          {/* OTP Verification Form */}
          {step === "otp" && (
            <form onSubmit={handleOtpVerification} className="space-y-6">
              <div>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-center text-xl tracking-wider"
                  placeholder="رمز التحقق"
                  maxLength={6}
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-900/30 border border-red-800/50 rounded-xl">
                  <p className="text-red-300 text-sm text-center">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white text-black px-6 py-3.5 rounded-xl font-medium hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isLoading ? "جارٍ التحقق..." : "تأكيد"}
                </button>

                <button
                  type="button"
                  onClick={() => setStep("user")}
                  className="w-full text-gray-400 hover:text-white px-6 py-2 text-sm transition-colors duration-200"
                >
                  العودة لإنشاء الحساب
                </button>
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              لديك حساب بالفعل؟{" "}
              <Link
                href="/login"
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
              >
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Google Identity Services Script */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("Google Identity Services loaded");
        }}
      />
    </div>
  );
}
