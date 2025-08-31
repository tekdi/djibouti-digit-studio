import React from "react";
import { LuRefreshCw } from "react-icons/lu";

const Header = ({ isRefreshing, onRefresh }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tous les dossiers</h1>
        <p className="text-gray-500 mt-1">Vue d'ensemble de tous les dossiers</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="flex items-center gap-1.5 px-3 py-2 bg-white text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 shadow-sm transition-all duration-200"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <LuRefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>Actualiser</span>
        </button>
      </div>
    </div>
  );
};

export default Header;
