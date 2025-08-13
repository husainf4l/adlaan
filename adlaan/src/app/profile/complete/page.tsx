"use client";

import { useState, useEffect, useCallback } from "react";
import { authService } from "@/services/authService";
import { useNavigation } from "@/hooks/useNavigation";
import { useForm } from "@/hooks/useForm";
import { FormField, SelectField } from "@/components/ui/FormField";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { COMPANY_SIZES, INDUSTRIES, API_CONFIG } from "@/lib/constants";
import {
  validateProfileForm,
  type ProfileFormData,
} from "@/lib/profileValidation";
import { handleAsync, logError } from "@/lib/errorHandling";
import { AuthDebug } from "@/lib/authDebug";
import type { User } from "@/types";

export default function ProfileCompletePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [generalError, setGeneralError] = useState<string>("");
  const [hasPrefilledForm, setHasPrefilledForm] = useState(false);

  const { goToDashboard, goToLogin } = useNavigation();

  // Define the form submission handler
  async function handleProfileSubmit(formValues: ProfileFormData) {
    setGeneralError("");
    console.log("🚀 Starting profile submission with data:", formValues);

    const [result, error] = await handleAsync(async () => {
      console.log(
        "📡 Calling authService.completeProfile() with Bearer token..."
      );

      // Check if we have a token
      const token = localStorage.getItem("access_token");
      console.log("🔐 Access token available:", !!token);
      if (!token) {
        throw new Error("No access token found. Please login again.");
      }

      const response = await authService.completeProfile({
        companyName: formValues.companyName,
        companySize: formValues.companySize,
        industry: formValues.industry,
        phoneNumber: formValues.phoneNumber,
      });

      console.log("✅ Profile completion response:", response);
      return response;
    }, "Profile completion");

    if (error) {
      console.error("❌ Profile submission failed:", error);
      setGeneralError(error.message);
      throw new Error(error.message);
    }

    console.log("🎉 Profile submission successful:", result);
    // Navigate to dashboard on success
    goToDashboard();
  }

  // Use our custom form hook with validation
  const form = useForm<ProfileFormData>({
    initialValues: {
      companyName: "",
      companySize: "",
      industry: "",
      phoneNumber: "",
    },
    validate: validateProfileForm,
    onSubmit: handleProfileSubmit,
  });

  const loadUserProfile = useCallback(async (retryCount = 0) => {
    console.log(`🔄 Loading user profile... (attempt ${retryCount + 1})`);

    const [profile, error] = await handleAsync(async () => {
      console.log("📡 Calling authService.getProfile() with Bearer token...");
      console.log("🌐 Current API_CONFIG.BASE_URL:", API_CONFIG.BASE_URL);

      // Check if we have a token
      const token = localStorage.getItem("access_token");
      console.log("🔐 Access token available:", !!token);
      if (token) {
        console.log("🔐 Token preview:", token.substring(0, 20) + "...");
      }

      const result = await authService.getProfile();
      console.log("✅ Profile loaded successfully:", result);
      return result;
    }, "Loading user profile");

    if (error) {
      console.error("❌ Failed to load user profile:", error);
      console.error("❌ Error type:", error.constructor.name);
      console.error("❌ Error message:", error.message);
      console.error("❌ Error details:", error);
      logError(error, "Failed to load user profile");

      // Retry up to 3 times for network issues
      if (
        retryCount < 2 &&
        (error.message.includes("fetch") || error.message.includes("Network"))
      ) {
        console.log(
          `🔄 Retrying profile load in 2 seconds... (${retryCount + 1}/3)`
        );
        setTimeout(() => loadUserProfile(retryCount + 1), 2000);
        return;
      }

      // Don't immediately redirect to login - let's see what the error is first
      console.log(
        "⚠️ Profile loading failed, but not redirecting yet for debugging"
      );
      setGeneralError(`Failed to load profile: ${error.message}`);
      setIsLoading(false);
      return;
    }

    if (profile) {
      console.log("👤 Setting user profile:", profile);
      setUser(profile);
    }

    setIsLoading(false);
  }, []);

  // Separate effect to handle form pre-filling when user data changes
  useEffect(() => {
    if (user && !isLoading && !hasPrefilledForm) {
      console.log("🔧 Pre-filling form with user data...");
      console.log("👤 User object:", user);
      console.log("🏢 Company object:", user.company);

      // Pre-fill form with existing data using setValue
      if (user.company?.name) {
        console.log("🏢 Pre-filling company name:", user.company.name);
        form.setValue("companyName", user.company.name);
      } else {
        console.log("⚠️ No company name found in user data");
      }

      // Note: Backend company object doesn't include size and industry yet
      // These fields will be filled when user completes the profile
      if (user.company?.size) {
        console.log("📏 Pre-filling company size:", user.company.size);
        form.setValue("companySize", user.company.size);
      } else {
        console.log("📏 No company size found - user needs to select one");
      }

      if (user.company?.industry) {
        console.log("🏭 Pre-filling industry:", user.company.industry);
        form.setValue("industry", user.company.industry);
      } else {
        console.log("🏭 No industry found - user needs to select one");
      }

      if (user.phoneNumber) {
        console.log("📞 Pre-filling phone number:", user.phoneNumber);
        form.setValue("phoneNumber", user.phoneNumber);
      } else {
        console.log("📞 No phone number found in user data");
      }

      setHasPrefilledForm(true);
    }
  }, [user, isLoading, hasPrefilledForm]);
  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">جارٍ التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            أكمل ملفك الشخصي
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            مرحباً {user?.name}، يرجى إكمال بيانات شركتك للمتابعة
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={form.handleSubmit}>
          {generalError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
              {generalError}
            </div>
          )}

          <div className="space-y-4">
            <FormField
              label="اسم الشركة"
              required
              placeholder="أدخل اسم شركتك"
              {...form.getFieldProps("companyName")}
            />

            <SelectField
              label="حجم الشركة"
              required
              options={COMPANY_SIZES.map((size) => ({
                value: size.value,
                label: size.label,
              }))}
              placeholder="اختر حجم الشركة"
              {...form.getFieldProps("companySize")}
            />

            <SelectField
              label="القطاع"
              required
              options={INDUSTRIES.map((industry) => ({
                value: industry.value,
                label: industry.label,
              }))}
              placeholder="اختر القطاع"
              {...form.getFieldProps("industry")}
            />

            <FormField
              label="رقم الهاتف"
              type="tel"
              placeholder="مثال: +966501234567، +971501234567، +20101234567"
              {...form.getFieldProps("phoneNumber")}
            />
          </div>

          <LoadingButton
            type="submit"
            loading={form.isSubmitting}
            loadingText="جاري الحفظ..."
            disabled={!form.isValid}
          >
            إكمال الملف الشخصي
          </LoadingButton>
        </form>
      </div>
    </div>
  );
}
