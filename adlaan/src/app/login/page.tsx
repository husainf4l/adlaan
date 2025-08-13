"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Script from "next/script";
import GoogleSignIn from "@/components/GoogleSignIn";
import { authService } from "@/services/authService";
import { useNavigation } from "@/hooks/useNavigation";
import { API_CONFIG, ERROR_MESSAGES, FORM_VALIDATION } from "@/lib/constants";
import type { LoginResponse, FormState } from "@/types";

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<"login" | "otp">("login");
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [otpCode, setOtpCode] = useState("");
  const [loginData, setLoginData] = useState<LoginResponse | null>(null);
  const [formState, setFormState] = useState<FormState>({
    isLoading: false,
    isSubmitting: false,
    error: "",
  });

  const { goToDashboard } = useNavigation();

  useEffect(() => {
    setMounted(true);
  }, []);

  const validateCredentials = (): boolean => {
    if (!credentials.email.trim()) {
      setFormState((prev) => ({ ...prev, error: "البريد الإلكتروني مطلوب" }));
      return false;
    }

    if (!FORM_VALIDATION.EMAIL_REGEX.test(credentials.email)) {
      setFormState((prev) => ({
        ...prev,
        error: ERROR_MESSAGES.INVALID_EMAIL,
      }));
      return false;
    }

    if (!credentials.password.trim()) {
      setFormState((prev) => ({ ...prev, error: "كلمة المرور مطلوبة" }));
      return false;
    }

    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCredentials()) return;

    setFormState((prev) => ({
      ...prev,
      isSubmitting: true,
      error: "",
    }));

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok && !data.requiresOtp) {
        // Login successful without OTP
        goToDashboard();
      } else if (data.requiresOtp) {
        // Show OTP verification form
        setLoginData(data);
        setStep("otp");
      } else {
        setFormState((prev) => ({
          ...prev,
          error: data.message || ERROR_MESSAGES.INVALID_CREDENTIALS,
        }));
      }
    } catch (error) {
      console.error("Login error:", error);
      setFormState((prev) => ({
        ...prev,
        error: ERROR_MESSAGES.NETWORK_ERROR,
      }));
    } finally {
      setFormState((prev) => ({
        ...prev,
        isSubmitting: false,
      }));
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginData?.phoneNumber) {
      setFormState((prev) => ({
        ...prev,
        error: "بيانات تسجيل الدخول غير مكتملة",
      }));
      return;
    }

    setFormState((prev) => ({
      ...prev,
      isSubmitting: true,
      error: "",
    }));

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
            phoneNumber: loginData.phoneNumber,
            code: otpCode,
            type: "LOGIN_VERIFICATION",
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Verification successful
        goToDashboard();
      } else {
        setFormState((prev) => ({
          ...prev,
          error: data.message || "كود التحقق غير صحيح",
        }));
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setFormState((prev) => ({
        ...prev,
        error: "حدث خطأ أثناء التحقق",
      }));
    } finally {
      setFormState((prev) => ({
        ...prev,
        isSubmitting: false,
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "email" || name === "password") {
      setCredentials((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (name === "otpCode") {
      setOtpCode(value);
    }

    // Clear error when user starts typing
    if (formState.error) {
      setFormState((prev) => ({ ...prev, error: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background with same design language as Hero */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950/40 to-black"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_top,_transparent_0%,_rgba(0,0,0,0.8)_70%)]"></div>

      {/* Subtle animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white/20 rounded-full animate-pulse delay-75"></div>
        <div className="absolute top-3/4 right-1/3 w-0.5 h-0.5 bg-white/30 rounded-full animate-pulse delay-300"></div>
        <div className="absolute top-1/2 right-1/4 w-0.5 h-0.5 bg-white/25 rounded-full animate-pulse delay-700"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen px-6 lg:px-8 pt-20">
        <div
          className={`w-full max-w-md transition-all duration-1200 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Logo */}
          <div className="text-center mb-10">
            <Image
              src="/adlaan-darklogo.png"
              alt="Adlaan Logo"
              width={180}
              height={56}
              className="h-12 w-auto brightness-0 invert mx-auto mb-6"
              priority
            />
            <h1 className="font-cairo text-3xl font-light text-white mb-2">
              {step === "login" ? "تسجيل الدخول" : "التحقق من الهوية"}
            </h1>
            <p className="text-white/60 text-sm">
              {step === "login"
                ? "ادخل بياناتك للوصول إلى حسابك"
                : `تم إرسال رمز التحقق إلى ${loginData?.phoneNumber}`}
            </p>
          </div>

          {/* Google Sign-In Component - Only show on login step */}
          {step === "login" && (
            <div className="mb-8">
              <GoogleSignIn
                onSuccess={async (token, result) => {
                  console.log("Google Sign-In successful:", result);

                  // Wait a moment for session to be fully established
                  await new Promise((resolve) => setTimeout(resolve, 500));

                  // Test if we can access profile before redirecting
                  try {
                    const profileCheck = await authService.getProfile();
                    console.log("Profile accessible:", profileCheck);

                    // Check if user profile is complete
                    const user = result.user;
                    console.log("🔍 Checking user profile completeness:", user);

                    if (!user.companyId || !user.company) {
                      console.log(
                        "👤 Profile incomplete - redirecting to profile completion"
                      );
                      // User needs to complete their profile (add company info)
                      window.location.href = "/profile/complete";
                    } else {
                      console.log(
                        "✅ Profile complete - redirecting to dashboard"
                      );
                      // User has complete profile, go to dashboard
                      goToDashboard();
                    }
                  } catch (error) {
                    console.error("Session not established properly:", error);
                    setFormState((prev) => ({
                      ...prev,
                      error:
                        "تم تسجيل الدخول ولكن هناك مشكلة في الجلسة. يرجى المحاولة مرة أخرى.",
                    }));
                  }
                }}
                onError={(error) => {
                  console.error("Google Sign-In error:", error);
                  setFormState((prev) => ({ ...prev, error: error }));
                }}
                disabled={formState.isSubmitting}
              />

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-900/40 text-gray-400">أو</span>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          {step === "login" && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-white/80 mb-2"
                >
                  البريد الإلكتروني
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={credentials.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-200"
                  placeholder="example@domain.com"
                  required
                  disabled={formState.isSubmitting}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-white/80 mb-2"
                >
                  كلمة المرور
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-200"
                  placeholder="••••••••"
                  required
                  disabled={formState.isSubmitting}
                />
              </div>

              {formState.error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm text-center">
                    {formState.error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={formState.isSubmitting}
                className="w-full bg-white text-black px-6 py-3 rounded-lg font-medium text-base hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-lg shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {formState.isSubmitting
                  ? "جارٍ تسجيل الدخول..."
                  : "تسجيل الدخول"}
              </button>
            </form>
          )}

          {/* OTP Verification Form */}
          {step === "otp" && (
            <form onSubmit={handleOtpVerification} className="space-y-6">
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-white/80 mb-2"
                >
                  رمز التحقق
                </label>
                <input
                  id="otp"
                  name="otpCode"
                  type="text"
                  value={otpCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-200 text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                  disabled={formState.isSubmitting}
                />
              </div>

              {formState.error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm text-center">
                    {formState.error}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={formState.isSubmitting}
                  className="w-full bg-white text-black px-6 py-3 rounded-lg font-medium text-base hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-lg shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {formState.isSubmitting ? "جارٍ التحقق..." : "تأكيد"}
                </button>

                <button
                  type="button"
                  onClick={() => setStep("login")}
                  className="w-full text-white/60 hover:text-white px-6 py-3 text-sm font-medium transition-colors duration-200"
                >
                  العودة لتسجيل الدخول
                </button>
              </div>
            </form>
          )}

          {/* Additional options */}
          <div className="mt-8 text-center">
            <p className="text-white/40 text-sm mb-4">ليس لديك حساب؟</p>
            <button className="text-white/60 hover:text-white text-sm font-medium transition-colors duration-200 border-b border-white/20 hover:border-white/40">
              إنشاء حساب جديد
            </button>
          </div>
        </div>
      </div>

      {/* Google Identity Services Script */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("Google Identity Services loaded for login");
        }}
      />
    </div>
  );
}
