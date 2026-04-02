import React, { Fragment } from "react";
import { LuSearch, LuRefreshCw, LuFileText, LuX } from "react-icons/lu";
import { getServiceInfo, statusOptions } from "./utils";

const Header = ({
  searchTerm = "", setSearchTerm,
  statusFilter = "all", setStatusFilter,
  businessServiceFilter = "all", setBusinessServiceFilter,
  businessServices = [],
  startDate = "", setStartDate,
  endDate = "", setEndDate,
  onRefresh, isRefreshing = false
}) => {
  const hasFilters = searchTerm || statusFilter !== "all" || businessServiceFilter !== "all" || startDate || endDate;

  const clearAll = () => {
    setSearchTerm && setSearchTerm("");
    setStatusFilter && setStatusFilter("all");
    setBusinessServiceFilter && setBusinessServiceFilter("all");
    setStartDate && setStartDate("");
    setEndDate && setEndDate("");
  };

  return (
    <Fragment>
      {/* Header */}
      <div className="mb-5">
        <div className="bg-gradient-to-r from-blue-100 to-indigo-200 rounded-2xl p-5 sm:p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl shadow-sm">
                <LuFileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Mes Demandes</h1>
                <p className="text-xs text-gray-600">Gérez et suivez toutes vos demandes</p>
              </div>
            </div>
            <button
              onClick={onRefresh || (() => window.location.reload())}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs font-medium text-gray-700 transition-all hover:bg-blue-50 disabled:opacity-50"
            >
              <LuRefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isRefreshing ? 'Actualisation...' : 'Actualiser'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Compact Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap mb-5">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <LuSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm placeholder:text-gray-400 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 hover:border-gray-300"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <LuX className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter && setStatusFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 hover:border-gray-300"
        >
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Service */}
        <select
          value={businessServiceFilter}
          onChange={(e) => setBusinessServiceFilter && setBusinessServiceFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 hover:border-gray-300"
        >
          <option value="all">Tous les services</option>
          {businessServices.map(s => (
            <option key={s} value={s}>{getServiceInfo(s)?.name || s}</option>
          ))}
        </select>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate && setStartDate(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
          <span className="text-xs text-gray-400">—</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate && setEndDate(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </div>

        {/* Reset */}
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-500 hover:bg-red-100"
          >
            <LuX className="h-3.5 w-3.5" />
            Réinitialiser
          </button>
        )}
      </div>
    </Fragment>
  );
};

export default Header;
