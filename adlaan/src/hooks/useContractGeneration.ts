import { useState } from "react";
import { ContractData, ContractDetails } from "../types/contracts";
import { generateContractContent } from "../lib/contractUtils";
import { contractTemplates } from "../lib/contractConstants";

export const useContractGeneration = () => {
  const [currentContract, setCurrentContract] = useState<ContractData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateContract = (
    templateId: string,
    details: ContractDetails,
    onComplete?: (contract: ContractData) => void
  ) => {
    setIsGenerating(true);

    setTimeout(() => {
      const newContract: ContractData = {
        id: `contract-${Date.now()}`,
        title: `${
          contractTemplates.find((t) => t.id === templateId)?.name
        } - ${new Date().toLocaleDateString("ar-SA")}`,
        content: generateContractContent(templateId, details),
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        status: "draft",
        type: templateId as any,
      };

      setCurrentContract(newContract);
      setIsGenerating(false);
      onComplete?.(newContract);
    }, 2000);
  };

  return {
    currentContract,
    isGenerating,
    generateContract,
  };
};
