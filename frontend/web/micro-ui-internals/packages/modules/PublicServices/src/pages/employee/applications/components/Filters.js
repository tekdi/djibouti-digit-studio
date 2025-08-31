import React from "react";
import { LuSearch, LuFilter } from "react-icons/lu";
import { getServiceInfo, formatDate } from "../utils";

const Filters = ({
  searchTerm,
  onSearchChange,
  selectedBusinessService,
  onBusinessServiceChange,
  availableBusinessServices,
  dateRange,
  onDateRangeChange,
  showDatePicker,
  onToggleDatePicker,
  onClearFilters,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LuSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-10 w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary"
            placeholder="Rechercher par numéro, titre, demandeur ou agent..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <select
              className="rounded-lg border-gray-300 focus:ring-primary focus:border-primary pr-10 bg-white"
              value={selectedBusinessService}
              onChange={(e) => onBusinessServiceChange(e.target.value)}
            >
              <option value="">Tous les services</option>
              {availableBusinessServices.map((serviceCode) => {
                const serviceInfo = getServiceInfo(serviceCode);
                return (
                  <option key={serviceCode} value={serviceCode}>
                    {serviceInfo.shortName || serviceCode}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="relative">
            <button
              onClick={onToggleDatePicker}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
            >
              <LuFilter className="w-4 h-4" />
              <span>
                {dateRange ? `${formatDate(dateRange[0])} - ${formatDate(dateRange[1])}` : "Filtrer par date"}
              </span>
            </button>

            {showDatePicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateRange?.[0]?.toISOString().split("T")[0] || ""}
                    onChange={(e) => onDateRangeChange(new Date(e.target.value), dateRange?.[1])}
                    className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <input
                    type="date"
                    value={dateRange?.[1]?.toISOString().split("T")[0] || ""}
                    onChange={(e) => onDateRangeChange(dateRange?.[0], new Date(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
            onClick={onClearFilters}
          >
            <LuFilter className="w-4 h-4" />
            <span>Réinitialiser</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filters;
