"use client";

import { useRouter } from 'next/navigation';
import { DashboardLayout } from "../../../components/DashboardLayout";
import { DocumentGenerator } from '../../../components/ai/DocumentGenerator';

export default function GenerateContractPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard');
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)]">
        <DocumentGenerator onBack={handleBack} />
      </div>
    </DashboardLayout>
  );
}