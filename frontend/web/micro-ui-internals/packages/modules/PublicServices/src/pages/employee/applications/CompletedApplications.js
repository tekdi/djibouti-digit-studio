import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import useApplications from "./useApplications";
import { getServiceInfo } from "./utils";
import axios from "axios";

import Filters from "./components/Filters";
import ErrorDisplay from "./components/ErrorDisplay";
import ApplicationsTable from "./components/ApplicationsTable";
import { LuCircleCheck, LuRefreshCw } from "react-icons/lu";

const CompletedApplications = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBusinessService, setSelectedBusinessService] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { applications, isLoading, isRefreshing, error, refreshApplications, lastFetchTime } = useApplications();

  const [businessServices, setBusinessServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  useEffect(() => {
    const fetchBusinessServices = async () => {
      setServicesLoading(true);
      try {
        const tenantId = Digit.ULBService.getCurrentTenantId();
        const response = await axios.get("/public-service/v1/service", {
          params: { tenantId: tenantId },
          headers: {
            "X-Tenant-Id": tenantId,
            "auth-token": Digit.UserService.getUser()?.access_token,
          },
        });
        const services = response?.data?.Services || [];
        setBusinessServices(services);
      } catch (error) {
        console.error("Error fetching business services:", error);
        setBusinessServices([]);
      } finally {
        setServicesLoading(false);
      }
    };
    fetchBusinessServices();
  }, []);

  const completedStatuses = ["PERMIT_GRANTED", "CERTIFICATE_GRANTED"];

  const completedApplications = useMemo(() => {
    return applications.filter((app) => {
      const status = app.ProcessInstance?.state?.applicationStatus;
      return completedStatuses.includes(status);
    });
  }, [applications]);

  const filteredApplications = useMemo(() => {
    return completedApplications.filter((app) => {
      const businessObject = app.businessObject;
      const applicationNumber = businessObject?.applicationNumber;
      const businessService = businessObject?.businessService;
      const applicantName = businessObject?.applicants?.[0]?.name;
      const createdTime = businessObject?.auditDetails?.createdTime;

      const matchesSearch =
        searchTerm === "" ||
        applicationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        businessService?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicantName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBusinessService = selectedBusinessService === "" || businessService === selectedBusinessService;

      let matchesDate = true;
      if (dateRange?.[0] || dateRange?.[1]) {
        const applicationDate = new Date(createdTime || Date.now());
        const start = dateRange?.[0] ? new Date(dateRange[0]) : null;
        const end = dateRange?.[1] ? new Date(dateRange[1]) : null;
        if (start && end) {
          matchesDate = applicationDate >= start && applicationDate <= end;
        } else if (start) {
          matchesDate = applicationDate >= start;
        } else if (end) {
          matchesDate = applicationDate <= end;
        }
      }

      return matchesSearch && matchesBusinessService && matchesDate;
    });
  }, [completedApplications, searchTerm, selectedBusinessService, dateRange]);

  const availableBusinessServices = useMemo(() => {
    const services = [...new Set(completedApplications.map((app) => app.businessObject?.businessService))];
    return services.filter(Boolean);
  }, [completedApplications]);

  const handleSearch = (value) => { setSearchTerm(value); setCurrentPage(1); };
  const handleBusinessServiceChange = (value) => { setSelectedBusinessService(value); setCurrentPage(1); };
  const handleDateRangeChange = (startDate, endDate) => { setDateRange([startDate, endDate]); setCurrentPage(1); setShowDatePicker(false); };
  const handlePageChange = (newPage) => { setCurrentPage(newPage); };
  const clearFilters = () => { setSearchTerm(""); setSelectedBusinessService(""); setDateRange(null); setCurrentPage(1); };

  const totalCount = filteredApplications.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount);
  const paginatedApplications = filteredApplications.slice(startIndex - 1, endIndex);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="pt-[100px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50">
              <LuCircleCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 sm:text-xl">Dossiers terminés</h1>
              <p className="text-xs text-gray-400">Dossiers approuvés et complétés</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50 px-4 py-2">
              <p className="text-2xl font-bold text-gray-900">{completedApplications.length}</p>
              <p className="text-[10px] text-gray-500">Terminés</p>
            </div>
            <button
              onClick={refreshApplications}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition-all hover:border-primary/30 hover:text-primary disabled:opacity-50"
            >
              <LuRefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Actualisation..." : "Actualiser"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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

export default CompletedApplications;
