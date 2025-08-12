"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SetupCompanyPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to profile complete page
    router.push("/profile/complete");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white text-lg">جاري التوجيه...</div>
    </div>
  );
}
