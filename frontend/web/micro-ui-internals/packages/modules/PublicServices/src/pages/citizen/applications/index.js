import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Loader } from "@egovernments/digit-ui-components";
import Header from "./Header";
import ApplicationsGrid from "./ApplicationsGrid";
import useApplications from "./useApplications";
import { getSimplifiedStatus } from "./utils";

const getAppStatus = (app) => app.processInstance?.[0]?.state?.applicationStatus || app.serviceDetails?.responseData?.Application?.processInstance?.[0]?.state?.applicationStatus || null;

const CitizenApplications = () => {
  const { t } = useTranslation();
  const { applications, isLoading, isRefreshing, error, refreshApplications } = useApplications();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [businessServiceFilter, setBusinessServiceFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Filter applications based on search and filters
  const filteredApplications = useMemo(() => {
    return applications
      .filter(app => {
        const applicationStatus = getAppStatus(app);

        // Only show applications that are NOT completed
        const isNotCompleted = applicationStatus !== "PERMIT_GRANTED" && applicationStatus !== "CERTIFICATE_GRANTED" && applicationStatus !== "CERTIFICATE_ISSUED";

        const matchesSearch = searchTerm === "" ||
          app.applicationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.businessService?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.applicants?.[0]?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" ||
          getSimplifiedStatus(applicationStatus) === statusFilter;

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

        return isNotCompleted && matchesSearch && matchesStatus && matchesBusinessService && matchesDate;
      })
      .sort((a, b) => (b.auditDetails?.createdTime || 0) - (a.auditDetails?.createdTime || 0));
  }, [applications, searchTerm, statusFilter, businessServiceFilter, startDate, endDate]);

  // Get unique business services for filter
  const businessServices = useMemo(() => {
    const services = [...new Set(applications.map(app => app.businessService))];
    return services.filter(Boolean);
  }, [applications]);

  if (isLoading) return <div className="flex items-center justify-center" style={{ minHeight: "80vh", paddingTop: "100px" }}><Loader /></div>;

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
    <div className="min-h-screen pt-[100px] pb-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-5">
        <Header
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          businessServiceFilter={businessServiceFilter}
          setBusinessServiceFilter={setBusinessServiceFilter}
          businessServices={businessServices}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          onRefresh={refreshApplications}
          isRefreshing={isRefreshing}
        />

        <div className="mb-6">
          <p className="text-gray-600">
            {filteredApplications.length} demande{filteredApplications.length !== 1 ? 's' : ''} trouvée{filteredApplications.length !== 1 ? 's' : ''}
          </p>
        </div>

        <ApplicationsGrid applications={filteredApplications} />
      </div>
    </div>
  );
};

export default CitizenApplications;
