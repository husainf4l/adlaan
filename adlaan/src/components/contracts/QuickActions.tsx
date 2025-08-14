import React from "react";
import { quickActions } from "../../lib/contractConstants";

interface QuickActionsProps {
  onActionClick: (action: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onActionClick,
}) => {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {quickActions.map((action) => (
        <button
          key={action}
          onClick={() => onActionClick(action)}
          className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {action}
        </button>
      ))}
    </div>
  );
};
