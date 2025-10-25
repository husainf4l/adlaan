"use client";

import { useRouter } from 'next/navigation';
import { DashboardLayout } from "../../../components/DashboardLayout";
import { DocumentAnalyzer } from '../../../components/ai/DocumentAnalyzer';

export default function AnalyzeDocumentPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard');
  };

  return (
    <DashboardLayout>
      <DocumentAnalyzer onBack={handleBack} />
    </DashboardLayout>
  );
}