import React, { Fragment } from "react";
import { LuSearch, LuRefreshCw, LuCreditCard, LuX } from "react-icons/lu";
import { getServiceInfo } from "./utils";

const HeaderPendingPayment = ({
  searchTerm = "", setSearchTerm,
  businessServiceFilter = "all", setBusinessServiceFilter,
  businessServices = [],
  startDate = "", setStartDate,
  endDate = "", setEndDate,
  onRefresh, isRefreshing = false
}) => {
  const hasFilters = searchTerm || businessServiceFilter !== "all" || startDate || endDate;
  const clearAll = () => { setSearchTerm?.(""); setBusinessServiceFilter?.("all"); setStartDate?.(""); setEndDate?.(""); };

  return (
    <Fragment>
      <div className="mb-5">
        <div className="bg-gradient-to-r from-amber-100 to-orange-200 rounded-2xl p-5 sm:p-6 border border-amber-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-2.5 rounded-xl shadow-sm">
                <LuCreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Paiements en attente</h1>
                <p className="text-xs text-gray-600">Demandes en attente de paiement</p>
              </div>
            </div>
            <button onClick={onRefresh} disabled={isRefreshing} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-amber-50 disabled:opacity-50">
              <LuRefreshCw className={`w-3.5 h-3.5 text-amber-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isRefreshing ? 'Actualisation...' : 'Actualiser'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <LuSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm?.(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 hover:border-gray-300" />
          {searchTerm && <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><LuX className="h-4 w-4" /></button>}
        </div>
        <select value={businessServiceFilter} onChange={(e) => setBusinessServiceFilter?.(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 hover:border-gray-300">
          <option value="all">Tous les services</option>
          {businessServices.map(s => <option key={s} value={s}>{getServiceInfo(s)?.name || s}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <input type="date" value={startDate} onChange={(e) => setStartDate?.(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10" />
          <span className="text-xs text-gray-400">—</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate?.(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10" />
        </div>
        {hasFilters && <button onClick={clearAll} className="flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-500 hover:bg-red-100"><LuX className="h-3.5 w-3.5" />Réinitialiser</button>}
      </div>
    </Fragment>
  );
};

export default HeaderPendingPayment;
