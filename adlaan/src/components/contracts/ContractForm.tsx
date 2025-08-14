import React from "react";
import { ContractDetails } from "../../types/contracts";

interface ContractFormProps {
  contractDetails: ContractDetails;
  setContractDetails: (details: ContractDetails) => void;
}

export const ContractForm: React.FC<ContractFormProps> = ({
  contractDetails,
  setContractDetails,
}) => {
  const updateDetail = (key: keyof ContractDetails, value: string) => {
    setContractDetails({
      ...contractDetails,
      [key]: value,
    });
  };

  return (
    <div className="bg-gray-50/80 backdrop-blur-sm rounded-2xl p-6 mb-6">
      <h3 className="font-semibold text-gray-900 mb-4">
        تفاصيل العقد الأساسية
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="اسم الطرف الأول"
          value={contractDetails.party1 || ""}
          onChange={(e) => updateDetail("party1", e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-gray-900 placeholder-gray-500"
        />
        <input
          type="text"
          placeholder="اسم الطرف الثاني"
          value={contractDetails.party2 || ""}
          onChange={(e) => updateDetail("party2", e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-gray-900 placeholder-gray-500"
        />
        <input
          type="text"
          placeholder="المبلغ (ريال سعودي)"
          value={contractDetails.amount || ""}
          onChange={(e) => updateDetail("amount", e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-gray-900 placeholder-gray-500"
        />
        <input
          type="date"
          placeholder="تاريخ البداية"
          value={contractDetails.startDate || ""}
          onChange={(e) => updateDetail("startDate", e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-gray-900 placeholder-gray-500"
        />
      </div>
    </div>
  );
};
