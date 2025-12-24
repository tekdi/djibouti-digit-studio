import React from "react";
import { LuFileText, LuEye } from "react-icons/lu";

const EmptyState = ({ isReadOnly = false }) => {
  if (isReadOnly) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-gray-100 rounded-full">
            <LuFileText className="h-12 w-12 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun retour d'avis pour le moment
            </h3>
            <p className="text-sm text-gray-500">
              Les commissaires n'ont pas encore soumis leurs observations
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <LuEye className="h-8 w-8 text-blue-600" />
        <p className="text-sm font-medium text-blue-900">
          Mode lecture seule
        </p>
        <p className="text-xs text-blue-700">
          Seuls les commissaires peuvent ajouter ou modifier des observations
        </p>
      </div>
    </div>
  );
};

export default EmptyState;








