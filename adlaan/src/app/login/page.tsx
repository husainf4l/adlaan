"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface LoginResponse {
  requiresOtp?: boolean;
  phoneNumber?: string;
  message?: string;
}

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [otpCode, setOtpCode] = useState('');
  const [loginData, setLoginData] = useState<LoginResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:4007/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok && !data.requiresOtp) {
        // Login successful without OTP
        window.location.href = '/dashboard';
      } else if (data.requiresOtp) {
        // Show OTP verification form
        setLoginData(data);
        setStep('otp');
      } else {
        setError(data.message || 'فشل تسجيل الدخول');
      }
    } catch {
      setError('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!loginData?.phoneNumber) {
      setError('بيانات تسجيل الدخول غير مكتملة');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:4007/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          phoneNumber: loginData.phoneNumber,
          code: otpCode,
          type: 'LOGIN_VERIFICATION',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Verification successful
        window.location.href = '/dashboard';
      } else {
        setError(data.message || 'كود التحقق غير صحيح');
      }
    } catch {
      setError('حدث خطأ أثناء التحقق');
    } finally {
      setIsLoading(false);
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
              {step === 'login' ? 'تسجيل الدخول' : 'التحقق من الهوية'}
            </h1>
            <p className="text-white/60 text-sm">
              {step === 'login' 
                ? 'ادخل بياناتك للوصول إلى حسابك'
                : `تم إرسال رمز التحقق إلى ${loginData?.phoneNumber}`
              }
            </p>
          </div>

          {/* Login Form */}
          {step === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  id="email"
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-200"
                  placeholder="example@domain.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                  كلمة المرور
                </label>
                <input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black px-6 py-3 rounded-lg font-medium text-base hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-lg shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
              </button>
            </form>
          )}

          {/* OTP Verification Form */}
          {step === 'otp' && (
            <form onSubmit={handleOtpVerification} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-white/80 mb-2">
                  رمز التحقق
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-200 text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white text-black px-6 py-3 rounded-lg font-medium text-base hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-lg shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? 'جارٍ التحقق...' : 'تأكيد'}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="w-full text-white/60 hover:text-white px-6 py-3 text-sm font-medium transition-colors duration-200"
                >
                  العودة لتسجيل الدخول
                </button>
              </div>
            </form>
          )}

          {/* Additional options */}
          <div className="mt-8 text-center">
            <p className="text-white/40 text-sm mb-4">
              ليس لديك حساب؟
            </p>
            <button className="text-white/60 hover:text-white text-sm font-medium transition-colors duration-200 border-b border-white/20 hover:border-white/40">
              إنشاء حساب جديد
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
