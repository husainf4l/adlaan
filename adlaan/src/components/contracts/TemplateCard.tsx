import React from "react";
import { ContractTemplate } from "../../types/contracts";

interface TemplateCardProps {
  template: ContractTemplate;
  isSelected: boolean;
  onSelect: (templateId: string) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isSelected,
  onSelect,
}) => {
  return (
    <button
      onClick={() => onSelect(template.id)}
      className={`p-6 rounded-2xl border-2 transition-all duration-200 text-left hover:scale-105 ${
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-lg"
          : "border-gray-200 hover:border-gray-300 hover:shadow-md"
      }`}
    >
      <div className="text-4xl mb-3">{template.icon}</div>
      <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
        {template.category}
      </span>
    </button>
  );
};
