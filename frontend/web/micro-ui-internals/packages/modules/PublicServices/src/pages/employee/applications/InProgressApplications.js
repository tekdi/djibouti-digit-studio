import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import useApplications from "./useApplications";
import { getServiceInfo, getNewStatusesForUser } from "./utils";
import axios from "axios";
import { LuClock, LuRefreshCw, LuFolder, LuCircleAlert } from "react-icons/lu";

import Filters from "./components/Filters";
import ErrorDisplay from "./components/ErrorDisplay";
import ApplicationsTable from "./components/ApplicationsTable";

const InProgressApplications = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBusinessService, setSelectedBusinessService] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { applications, isLoading, isRefreshing, error, refreshApplications } = useApplications();

  const [businessServices, setBusinessServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  useEffect(() => {
    const fetchBusinessServices = async () => {
      setServicesLoading(true);
      try {
        const tenantId = Digit.ULBService.getCurrentTenantId();
        const response = await axios.get("/public-service/v1/service", {
          params: { tenantId },
          headers: { "X-Tenant-Id": tenantId, "auth-token": Digit.UserService.getUser()?.access_token },
        });
        setBusinessServices(response?.data?.Services || []);
      } catch (e) {
        setBusinessServices([]);
      } finally {
        setServicesLoading(false);
      }
    };
    fetchBusinessServices();
  }, []);

  // Exclude anything that's already in "Nouveau" (role-aware) or "Terminés".
  const excludedStatuses = [
    ...getNewStatusesForUser(Digit.UserService.getUser()?.info?.roles || []),
    "PERMIT_GRANTED",
    "CERTIFICATE_GRANTED",
  ];

  const inProgressApplications = useMemo(() => {
    return applications.filter((app) => {
      const status = app.ProcessInstance?.state?.applicationStatus;
      return !excludedStatuses.includes(status);
    });
  }, [applications]);

  const counts = useMemo(() => {
    const total = inProgressApplications.length;
    const processing = inProgressApplications.filter((app) => {
      const s = app.ProcessInstance?.state?.applicationStatus;
      return s !== "PENDING_ACTION_BY_ARCHITECT" && s !== "PENDING_ACTION_BY_CITIZEN";
    }).length;
    const awaiting = inProgressApplications.filter((app) => {
      const s = app.ProcessInstance?.state?.applicationStatus;
      return s === "PENDING_ACTION_BY_ARCHITECT" || s === "PENDING_ACTION_BY_CITIZEN";
    }).length;
    return { total, processing, awaiting };
  }, [inProgressApplications]);

  const filteredApplications = useMemo(() => {
    return inProgressApplications.filter((app) => {
      const bo = app.businessObject;
      const appNum = bo?.applicationNumber;
      const bs = bo?.businessService;
      const name = bo?.applicants?.[0]?.name;
      const time = bo?.auditDetails?.createdTime;

      const matchSearch = searchTerm === "" ||
        appNum?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bs?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchBs = selectedBusinessService === "" || bs === selectedBusinessService;
      let matchDate = true;
      if (dateRange?.[0] || dateRange?.[1]) {
        const d = new Date(time || Date.now());
        const s = dateRange?.[0] ? new Date(dateRange[0]) : null;
        const e = dateRange?.[1] ? new Date(dateRange[1]) : null;
        if (s && e) matchDate = d >= s && d <= e;
        else if (s) matchDate = d >= s;
        else if (e) matchDate = d <= e;
      }
      return matchSearch && matchBs && matchDate;
    });
  }, [inProgressApplications, searchTerm, selectedBusinessService, dateRange]);

  const availableBusinessServices = useMemo(() => {
    return [...new Set(inProgressApplications.map((a) => a.businessObject?.businessService))].filter(Boolean);
  }, [inProgressApplications]);

  const handleSearch = (v) => { setSearchTerm(v); setCurrentPage(1); };
  const handleBusinessServiceChange = (v) => { setSelectedBusinessService(v); setCurrentPage(1); };
  const handleDateRangeChange = (s, e) => { setDateRange([s, e]); setCurrentPage(1); setShowDatePicker(false); };
  const handlePageChange = (p) => setCurrentPage(p);
  const clearFilters = () => { setSearchTerm(""); setSelectedBusinessService(""); setDateRange(null); setCurrentPage(1); };

  const totalCount = filteredApplications.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount);
  const paginatedApplications = filteredApplications.slice(startIndex - 1, endIndex);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-3 py-4 sm:px-5 sm:py-6">
      {/* Header */}
      <div className="pt-[100px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50">
              <LuClock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 sm:text-xl">Dossiers en cours</h1>
              <p className="text-xs text-gray-400">Dossiers assignés et en cours de traitement</p>
            </div>
          </div>
          <button
            onClick={refreshApplications}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 self-start rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition-all hover:border-primary/30 hover:text-primary disabled:opacity-50 sm:self-auto"
          >
            <LuRefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Actualisation..." : "Actualiser"}
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-amber-200/60 bg-amber-50 p-4">
          <div className="mb-2 inline-flex rounded-xl bg-amber-100 p-2 text-amber-600"><LuFolder className="h-4 w-4" /></div>
          <p className="text-xl font-bold text-gray-900">{counts.total}</p>
          <p className="text-[10px] text-gray-500">Total en cours</p>
        </div>
        <div className="rounded-2xl border border-blue-200/60 bg-blue-50 p-4">
          <div className="mb-2 inline-flex rounded-xl bg-blue-100 p-2 text-blue-600"><LuClock className="h-4 w-4" /></div>
          <p className="text-xl font-bold text-gray-900">{counts.processing}</p>
          <p className="text-[10px] text-gray-500">En traitement</p>
        </div>
        <div className="rounded-2xl border border-orange-200/60 bg-orange-50 p-4">
          <div className="mb-2 inline-flex rounded-xl bg-orange-100 p-2 text-orange-600"><LuCircleAlert className="h-4 w-4" /></div>
          <p className="text-xl font-bold text-gray-900">{counts.awaiting}</p>
          <p className="text-[10px] text-gray-500">En attente d'infos</p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
        <Filters
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
          selectedBusinessService={selectedBusinessService}
          onBusinessServiceChange={handleBusinessServiceChange}
          availableBusinessServices={availableBusinessServices}
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          showDatePicker={showDatePicker}
          onToggleDatePicker={() => setShowDatePicker(!showDatePicker)}
          onClearFilters={clearFilters}
        />
      </div>

      <ErrorDisplay error={error} onRetry={refreshApplications} />

      {/* Table */}
      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
        <ApplicationsTable
          isLoading={isLoading}
          filteredApplications={filteredApplications}
          paginatedApplications={paginatedApplications}
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalCount={totalCount}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default InProgressApplications;
