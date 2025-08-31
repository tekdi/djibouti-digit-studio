import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import useApplications from "./useApplications";
import { getServiceInfo } from "./utils";
import axios from "axios";

// Import components
import Header from "./components/Header";
import StatisticsCards from "./components/StatisticsCards";
import Filters from "./components/Filters";
import ErrorDisplay from "./components/ErrorDisplay";
import ApplicationsTable from "./components/ApplicationsTable";

const EmployeeApplications = () => {
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

  // Fetch business services like in InboxService.js
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

  // Filter applications based on search and filters (like citizen applications)
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Extract data from inbox API structure
      const businessObject = app.businessObject;
      const processInstance = app.ProcessInstance;

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

      // Date filtering
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
  }, [applications, searchTerm, selectedBusinessService, dateRange]);

  // Get unique business services for filter
  const availableBusinessServices = useMemo(() => {
    const services = [...new Set(applications.map((app) => app.businessObject?.businessService))];
    return services.filter(Boolean);
  }, [applications]);



  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleBusinessServiceChange = (value) => {
    setSelectedBusinessService(value);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (startDate, endDate) => {
    setDateRange([startDate, endDate]);
    setCurrentPage(1);
    setShowDatePicker(false);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };



  const clearFilters = () => {
    setSearchTerm("");
    setSelectedBusinessService("");
    setDateRange(null);
    setCurrentPage(1);
  };

  // Pagination logic
  const totalCount = filteredApplications.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount);

  // Get paginated applications
  const paginatedApplications = filteredApplications.slice(startIndex - 1, endIndex);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <Header isRefreshing={isRefreshing} onRefresh={refreshApplications} />

      <StatisticsCards applications={applications} totalCount={totalCount} />

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

      <ErrorDisplay error={error} onRetry={refreshApplications} />

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
  );
};

export default EmployeeApplications;
