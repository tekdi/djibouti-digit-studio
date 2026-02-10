import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Loader } from "@egovernments/digit-ui-components";
import HeaderCompleted from "./HeaderCompleted";
import ApplicationsGrid from "./ApplicationsGrid";
import useApplications from "./useApplications";

const CitizenApplicationsCompleted = () => {
  const { t } = useTranslation();
  const { applications, isLoading, isRefreshing, error, refreshApplications } = useApplications();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [businessServiceFilter, setBusinessServiceFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");



  // Filter applications to show only completed ones (PERMIT_GRANTED, CERTIFICATE_ISSUED, CERTIFICATE_GRANTED)
  const completedApplications = useMemo(() => {
    return applications.filter(app => {
      const applicationStatus = app.processInstance?.[0]?.state?.applicationStatus;
      return applicationStatus === "PERMIT_GRANTED" || applicationStatus === "CERTIFICATE_GRANTED" || applicationStatus === "CERTIFICATE_ISSUED";
    });
  }, [applications]);

  // Filter applications based on search and filters
  const filteredApplications = useMemo(() => {
    return completedApplications.filter(app => {
      const matchesSearch = searchTerm === "" || 
        app.applicationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.businessService?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicants?.[0]?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBusinessService = businessServiceFilter === "all" || 
        app.businessService === businessServiceFilter;

      // Date filtering
      let matchesDate = true;
      if (startDate || endDate) {
        const applicationDate = new Date(app.auditDetails?.createdTime || app.createdTime || Date.now());
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

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
  }, [completedApplications, searchTerm, businessServiceFilter, startDate, endDate]);

  // Get unique business services for filter
  const businessServices = useMemo(() => {
    const services = [...new Set(completedApplications.map(app => app.businessService))];
    return services.filter(Boolean);
  }, [completedApplications]);

  // Refresh applications
  const handleRefresh = () => {
    refreshApplications();
  };

  if (isLoading) return <Loader />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={refreshApplications}
            className="px-4 py-2 bg-djibouti-primary text-white rounded-lg hover:bg-djibouti-primary-dark"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <HeaderCompleted 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          businessServiceFilter={businessServiceFilter}
          setBusinessServiceFilter={setBusinessServiceFilter}
          businessServices={businessServices}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredApplications.length} demande{filteredApplications.length !== 1 ? 's' : ''} complétée{filteredApplications.length !== 1 ? 's' : ''} trouvée{filteredApplications.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Applications Grid */}
        <ApplicationsGrid applications={filteredApplications} />
      </div>
    </div>
  );
};

export default CitizenApplicationsCompleted;
