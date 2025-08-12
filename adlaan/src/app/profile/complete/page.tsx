"use client";

import { useState, useEffect, useCallback } from "react";
import { authService } from "@/services/authService";
import { useNavigation } from "@/hooks/useNavigation";
import { useForm } from "@/hooks/useForm";
import { FormField, SelectField } from "@/components/ui/FormField";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { COMPANY_SIZES, INDUSTRIES } from "@/lib/constants";
import {
  validateProfileForm,
  type ProfileFormData,
} from "@/lib/profileValidation";
import { handleAsync, logError } from "@/lib/errorHandling";
import type { User } from "@/types";

export default function ProfileCompletePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [generalError, setGeneralError] = useState<string>("");

  const { goToDashboard, goToLogin } = useNavigation();

  // Define the form submission handler
  async function handleProfileSubmit(formValues: ProfileFormData) {
    setGeneralError("");

    const [, error] = await handleAsync(async () => {
      // Call API directly since authService.completeProfile doesn't exist yet
      const response = await fetch("/api/profile/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          companyName: formValues.companyName,
          companySize: formValues.companySize,
          industry: formValues.industry,
          phoneNumber: formValues.phoneNumber,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update profile");
      }

      return response.json();
    }, "Profile completion");

    if (error) {
      setGeneralError(error.message);
      throw new Error(error.message);
    }

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

  const loadUserProfile = useCallback(async () => {
    const [profile, error] = await handleAsync(async () => {
      return await authService.getProfile();
    }, "Loading user profile");

    if (error) {
      logError(error, "Failed to load user profile");
      goToLogin();
      return;
    }

    if (profile) {
      setUser(profile);

      // Pre-fill form with existing data using setValue
      if (profile.company?.name) {
        form.setValue("companyName", profile.company.name);
      }
      if (profile.company?.size) {
        form.setValue("companySize", profile.company.size);
      }
      if (profile.company?.industry) {
        form.setValue("industry", profile.company.industry);
      }
      if (profile.phoneNumber) {
        form.setValue("phoneNumber", profile.phoneNumber);
      }
    }

    setIsLoading(false);
  }, [goToLogin, form]);

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
              placeholder="أدخل رقم هاتفك"
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
