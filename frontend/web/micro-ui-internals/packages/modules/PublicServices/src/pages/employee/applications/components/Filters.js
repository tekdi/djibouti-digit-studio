import React, { useState, useRef, useEffect } from "react";
import { LuSearch, LuCalendar, LuX, LuChevronDown, LuFilter } from "react-icons/lu";
import { getServiceInfo } from "../utils";

const CustomSelect = ({ value, onChange, options, placeholder }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedLabel = value
    ? (getServiceInfo(value)?.shortName || value)
    : placeholder;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all w-full sm:w-auto ${
          value
            ? "border-primary/30 bg-primary/5 text-primary font-medium"
            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
        }`}
      >
        <LuFilter className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate max-w-[160px]">{selectedLabel}</span>
        <LuChevronDown className={`h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1.5 w-64 max-h-64 overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-lg py-1">
          <button
            onClick={() => { onChange(""); setOpen(false); }}
            className={`w-full flex items-center px-3 py-2 text-sm transition-colors ${
              !value ? "bg-primary/5 text-primary font-medium" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {placeholder}
          </button>
          {options.map((code) => {
            const info = getServiceInfo(code);
            return (
              <button
                key={code}
                onClick={() => { onChange(code); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                  value === code ? "bg-primary/5 text-primary font-medium" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {info?.ref && <span className="shrink-0 text-[10px] font-bold text-gray-400">{info.ref}</span>}
                <span className="truncate">{info?.shortName || code}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

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
  const hasFilters = searchTerm || selectedBusinessService || dateRange;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <LuSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher par numéro, demandeur..."
          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 hover:border-gray-300"
        />
        {searchTerm && (
          <button onClick={() => onSearchChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <LuX className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Service filter */}
      <CustomSelect
        value={selectedBusinessService}
        onChange={onBusinessServiceChange}
        options={availableBusinessServices}
        placeholder="Tous les services"
      />

      {/* Date filter */}
      <div className="relative">
        <button
          onClick={onToggleDatePicker}
          className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all ${
            dateRange
              ? "border-primary/30 bg-primary/5 text-primary font-medium"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
          }`}
        >
          <LuCalendar className="h-3.5 w-3.5" />
          <span>{dateRange ? "Date filtrée" : "Date"}</span>
        </button>
        {showDatePicker && (
          <div className="absolute right-0 top-full z-50 mt-1.5 rounded-xl border border-gray-100 bg-white p-4 shadow-lg">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase text-gray-400">Début</label>
                <input
                  type="date"
                  value={dateRange?.[0]?.toISOString().split("T")[0] || ""}
                  onChange={(e) => onDateRangeChange(new Date(e.target.value), dateRange?.[1])}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase text-gray-400">Fin</label>
                <input
                  type="date"
                  value={dateRange?.[1]?.toISOString().split("T")[0] || ""}
                  onChange={(e) => onDateRangeChange(dateRange?.[0], new Date(e.target.value))}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reset */}
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-500 transition-all hover:bg-red-100"
        >
          <LuX className="h-3.5 w-3.5" />
          Réinitialiser
        </button>
      )}
    </div>
  );
};

export default Filters;
