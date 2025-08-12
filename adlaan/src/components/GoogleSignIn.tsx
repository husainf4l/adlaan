"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { authService } from "@/services/authService";
import type { AuthResponse } from "@/types";

interface GoogleSignInProps {
  onSuccess: (token: string, authResponse: AuthResponse) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  shape?: "rectangular" | "pill" | "circle" | "square";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  logo_alignment?: "left" | "center";
}

export default function GoogleSignIn({
  onSuccess,
  onError,
  disabled = false,
  theme = "outline",
  size = "large",
  shape = "rectangular",
  text = "signin_with",
  logo_alignment = "left",
}: GoogleSignInProps) {
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  const handleCredentialResponse = useCallback(
    async (response: { credential: string }) => {
      if (!response.credential) {
        onError("لم يتم الحصول على بيانات المصادقة من Google");
        return;
      }

      setIsLoading(true);

      try {
        console.log("✅ Google credential received, sending to backend...");

        // Send the real Google JWT credential to backend
        const result = await authService.googleSignIn({
          credential: response.credential,
        });

        console.log("✅ Backend authentication successful:", result);
        console.log("👤 User info:", result.user);
        console.log("🍪 HTTP-only cookies should be set by backend");

        // Test if session is properly established with HTTP-only cookies
        try {
          const profileTest = await authService.getProfile();
          console.log(
            "✅ Profile accessible with HTTP-only cookies:",
            profileTest
          );
          onSuccess(result.accessToken, result);
        } catch (profileError) {
          console.error("❌ Session validation failed:", profileError);
          onError("تم تسجيل الدخول ولكن هناك مشكلة في الجلسة");
        }
      } catch (error) {
        console.error("❌ Google Sign-In error:", error);
        onError(
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء تسجيل الدخول بواسطة Google"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError]
  );

  useEffect(() => {
    // Debug: Check if environment variable is loaded correctly
    console.log(
      "🔍 NEXT_PUBLIC_GOOGLE_CLIENT_ID:",
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    );
    console.log("🌐 Current origin:", window.location.origin);

    const initializeGoogleSignIn = () => {
      const google = (
        window as unknown as {
          google?: {
            accounts?: {
              id?: {
                initialize: (...args: unknown[]) => void;
                renderButton: (...args: unknown[]) => void;
              };
            };
          };
        }
      ).google;
      if (google?.accounts?.id) {
        // Initialize Google Sign-In with error handling
        try {
          const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
          console.log(
            "🚀 Initializing Google Sign-In with Client ID:",
            clientId
          );

          google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Render the official Google button
          if (googleButtonRef.current) {
            google.accounts.id.renderButton(googleButtonRef.current, {
              theme,
              size,
              shape,
              text,
              logo_alignment,
              width: 320,
            });
          }

          setIsGoogleLoaded(true);
          console.log("✅ Google Sign-In initialized successfully");
        } catch (error) {
          console.error("❌ Google Sign-In initialization error:", error);
          onError(
            "خطأ في إعداد Google Sign-In. تأكد من إعدادات النطاق في Google Cloud Console"
          );
        }
      } else {
        console.log("⏳ Waiting for Google Identity Services...");
      }
    };

    // Load Google Identity Services script if not already loaded
    if (!(window as unknown as { google?: unknown }).google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      script.onerror = () => {
        onError("فشل في تحميل خدمات Google");
      };
      document.head.appendChild(script);
    } else {
      initializeGoogleSignIn();
    }
  }, [
    theme,
    size,
    shape,
    text,
    logo_alignment,
    onError,
    handleCredentialResponse,
  ]);

  return (
    <div className="w-full">
      {/* Official Google Sign-In Button */}
      <div
        ref={googleButtonRef}
        className={`w-full ${
          disabled || isLoading ? "opacity-50 pointer-events-none" : ""
        }`}
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
        }}
      />

      {isLoading && (
        <div className="text-center mt-2 text-sm text-gray-500">
          جاري تسجيل الدخول...
        </div>
      )}

      {!isGoogleLoaded && (
        <div className="text-center text-sm text-gray-500">
          تحميل Google Sign-In...
        </div>
      )}
    </div>
  );
}
