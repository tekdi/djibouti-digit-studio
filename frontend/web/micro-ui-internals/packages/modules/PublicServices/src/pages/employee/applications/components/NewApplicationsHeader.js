import React from "react";
import { LuRefreshCw } from "react-icons/lu";

const NewApplicationsHeader = ({ isRefreshing, onRefresh }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Nouveaux dossiers
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Dossiers en attente d'assignation
        </p>
      </div>

      <div className="flex items-center">
        <button
          className="group flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 hover:text-primary hover:border-primary/30 transition-colors duration-200 shadow-sm"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <LuRefreshCw className={`w-4 h-4 text-gray-400 group-hover:text-primary ${isRefreshing ? "animate-spin text-primary" : ""}`} />
          <span>Actualiser</span>
        </button>
      </div>
    </div>
  );
};

export default NewApplicationsHeader;

