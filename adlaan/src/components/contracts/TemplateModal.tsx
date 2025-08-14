import React, { useState } from "react";
import { ContractDetails } from "../../types/contracts";
import { contractTemplates } from "../../lib/contractConstants";
import { TemplateCard } from "./TemplateCard";
import { ContractForm } from "./ContractForm";

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (templateId: string, details: ContractDetails) => void;
  isGenerating: boolean;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  isGenerating,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [contractDetails, setContractDetails] = useState<ContractDetails>({});

  if (!isOpen) return null;

  const handleGenerate = () => {
    if (selectedTemplate) {
      onGenerate(selectedTemplate, contractDetails);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 w-full max-w-4xl mx-4 shadow-2xl border border-gray-200/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            اختر نوع العقد
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {contractTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplate === template.id}
              onSelect={setSelectedTemplate}
            />
          ))}
        </div>

        {selectedTemplate && (
          <ContractForm
            contractDetails={contractDetails}
            setContractDetails={setContractDetails}
          />
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleGenerate}
            disabled={!selectedTemplate || isGenerating}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>جاري الإنشاء...</span>
              </>
            ) : (
              <span>إنشاء العقد</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
