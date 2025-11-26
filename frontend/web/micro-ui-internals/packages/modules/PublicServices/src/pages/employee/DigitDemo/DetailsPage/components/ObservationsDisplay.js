import React from "react";
import { LuFileText } from "react-icons/lu";

const ObservationsDisplay = ({ observations }) => {
  if (!observations) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <LuFileText className="h-4 w-4 text-djibouti-primary" />
        Observations
      </h3>
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {observations}
        </p>
      </div>
    </div>
  );
};

export default ObservationsDisplay;

