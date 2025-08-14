import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { ContractData } from "../../types/contracts";
import { getStatusLabel, getStatusStyle } from "../../lib/contractUtils";

interface ContractHeaderProps {
  currentContract: ContractData | null;
  onNewContract: () => void;
}

export const ContractHeader: React.FC<ContractHeaderProps> = ({
  currentContract,
  onNewContract,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const isContractPage = pathname !== "/dashboard/contracts";

  return (
    <div className="bg-white/90 backdrop-blur-xl border-b border-indigo-200/30 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {isContractPage && (
              <button
                onClick={() => router.push("/dashboard/contracts")}
                className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200"
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
            )}
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              مولد العقود الذكي
            </h1>
            {currentContract && (
              <div className="flex items-center space-x-2">
                <div className="h-6 w-px bg-indigo-300"></div>
                <span className="text-sm font-medium text-slate-700">
                  {currentContract.title}
                </span>
                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusStyle(
                    currentContract.status
                  )}`}
                >
                  {getStatusLabel(currentContract.status)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {currentContract && (
              <>
                <button className="px-4 py-2 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-all duration-200 hover:scale-105">
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
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </button>
                <button className="px-4 py-2 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-all duration-200 hover:scale-105">
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
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H9.5a2 2 0 01-2-2V5a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2h13z"
                    />
                  </svg>
                </button>
              </>
            )}

            <button
              onClick={onNewContract}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105"
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
        </div>
      </div>
    </div>
  );
};
