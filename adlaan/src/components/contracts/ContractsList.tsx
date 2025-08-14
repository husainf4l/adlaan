import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ContractData } from "../../types/contracts";
import { getStatusLabel, getStatusStyle } from "../../lib/contractUtils";

interface ContractsListProps {
  onNewContract: () => void;
}

export const ContractsList: React.FC<ContractsListProps> = ({
  onNewContract,
}) => {
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Load contracts from localStorage
    const storedContracts = localStorage.getItem("contracts");
    if (storedContracts) {
      setContracts(JSON.parse(storedContracts));
    }
  }, []);

  const handleContractClick = (contractId: string) => {
    router.push(`/dashboard/contracts/${contractId}`);
  };

  const deleteContract = (e: React.MouseEvent, contractId: string) => {
    e.stopPropagation();
    const updatedContracts = contracts.filter((c) => c.id !== contractId);
    setContracts(updatedContracts);
    localStorage.setItem("contracts", JSON.stringify(updatedContracts));
  };

  if (contracts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-indigo-100 via-blue-100 to-purple-100 rounded-3xl flex items-center justify-center shadow-lg">
            <svg
              className="w-16 h-16 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>

          <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-4">
            مرحباً بك في مولد العقود الذكي
          </h3>
          <p className="text-slate-600 mb-8 leading-relaxed">
            أنشئ عقود احترافية بالذكاء الاصطناعي. اختر نوع العقد وقم بتخصيصه
            باستخدام المساعد الذكي.
          </p>

          <button
            onClick={onNewContract}
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-8 py-4 rounded-2xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:scale-105"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span>إنشاء عقد جديد</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-800">
            العقود المحفوظة
          </h2>
          <button
            onClick={onNewContract}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span>عقد جديد</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contracts.map((contract) => (
            <div
              key={contract.id}
              onClick={() => handleContractClick(contract.id)}
              className="bg-white rounded-xl border border-indigo-200/30 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                    {contract.title}
                  </h3>
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusStyle(
                      contract.status
                    )}`}
                  >
                    {getStatusLabel(contract.status)}
                  </span>
                </div>
                <button
                  onClick={(e) => deleteContract(e, contract.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>

              <div className="text-sm text-slate-500 space-y-1">
                <p>
                  تم الإنشاء:{" "}
                  {new Date(contract.createdAt).toLocaleDateString("ar-SA")}
                </p>
                <p>
                  آخر تعديل:{" "}
                  {new Date(contract.lastModified).toLocaleDateString("ar-SA")}
                </p>
              </div>

              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600 line-clamp-3">
                  {contract.content.substring(0, 150)}...
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
