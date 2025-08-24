import React from "react";
import { LuFileText } from "react-icons/lu";

const EmptyState = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
      <LuFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune demande trouvée</h3>
      <p className="text-gray-600">Aucune demande ne correspond à vos critères de recherche.</p>
    </div>
  );
};

export default EmptyState;
