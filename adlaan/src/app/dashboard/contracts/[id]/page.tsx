"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ContractHeader,
  ContractViewer,
  ChatPanel,
  TemplateModal,
} from "../../../../components/contracts";
import { useEnhancedChat } from "../../../../hooks/useEnhancedChat";
import { useContractGeneration } from "../../../../hooks/useContractGeneration";
import { ContractData, ContractDetails } from "../../../../types/contracts";

export default function ContractPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = params.id as string;

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [contract, setContract] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);

  // Always call the enhanced chat hook - it will handle null contract internally
  const enhancedChat = useEnhancedChat(contractId);

  const { isGenerating: isContractGenerating, generateContract } =
    useContractGeneration();

  // Load contract data
  useEffect(() => {
    const loadContract = () => {
      // Try to get contract from localStorage or API
      const storedContracts = localStorage.getItem("contracts");
      if (storedContracts) {
        const contracts = JSON.parse(storedContracts);
        const foundContract = contracts.find(
          (c: ContractData) => c.id === contractId
        );
        if (foundContract) {
          setContract(foundContract);
        } else {
          // Contract not found, redirect to contracts list
          router.push("/dashboard/contracts");
          return;
        }
      } else {
        // No contracts found, redirect to contracts list
        router.push("/dashboard/contracts");
        return;
      }
      setLoading(false);
    };

    if (contractId) {
      loadContract();
    }
  }, [contractId, router]);

  // Add welcome message when contract loads
  useEffect(() => {
    if (contract) {
      enhancedChat.addWelcomeMessage();
    }
  }, [contract, enhancedChat.addWelcomeMessage]);

  const handleGenerateContract = (
    templateId: string,
    details: ContractDetails
  ) => {
    generateContract(templateId, details, (newContract) => {
      setContract(newContract);
      setShowTemplateModal(false);

      // Update URL with new contract ID
      router.replace(`/dashboard/contracts/${newContract.id}`);

      // Save to localStorage
      const storedContracts = localStorage.getItem("contracts");
      const contracts = storedContracts ? JSON.parse(storedContracts) : [];
      const updatedContracts = [...contracts, newContract];
      localStorage.setItem("contracts", JSON.stringify(updatedContracts));
    });
  };

  const handleNewContract = () => {
    setShowTemplateModal(true);
  };

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">جارٍ تحميل العقد...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">
            العقد غير موجود
          </h3>
          <button
            onClick={() => router.push("/dashboard/contracts")}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200"
          >
            العودة إلى قائمة العقود
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <ContractHeader
        currentContract={contract}
        onNewContract={handleNewContract}
      />

      <main
        className="flex flex-col lg:flex-row"
        style={{ height: "calc(100vh - 80px)" }}
      >
        {/* Chat Panel */}
        <aside
          className="w-full lg:w-96 order-2 lg:order-1"
          role="complementary"
          aria-label="مساعد العقود الذكي"
        >
          <ChatPanel
            chatMessages={enhancedChat.chatMessages}
            newMessage={enhancedChat.newMessage}
            setNewMessage={enhancedChat.setNewMessage}
            isGenerating={enhancedChat.isGenerating}
            chatEndRef={enhancedChat.chatEndRef}
            messageInputRef={enhancedChat.messageInputRef}
            onSendMessage={enhancedChat.handleSendMessage}
          />
        </aside>

        {/* Contract Viewer */}
        <section
          className="flex-1 order-1 lg:order-2"
          role="main"
          aria-label="عارض العقد"
        >
          <ContractViewer contract={contract} />
        </section>
      </main>

      <TemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onGenerate={handleGenerateContract}
        isGenerating={isContractGenerating}
      />
    </div>
  );
}
