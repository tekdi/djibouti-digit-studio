import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Loader } from "@egovernments/digit-ui-components";
import HeaderCompleted from "./HeaderCompleted";
import ApplicationsGrid from "./ApplicationsGrid";
import useApplications from "./useApplications";

const getAppStatus = (app) => app.processInstance?.[0]?.state?.applicationStatus || app.serviceDetails?.responseData?.Application?.processInstance?.[0]?.state?.applicationStatus || null;

const CitizenApplicationsCompleted = () => {
  const { t } = useTranslation();
  const { applications, isLoading, isRefreshing, error, refreshApplications } = useApplications();

  const [searchTerm, setSearchTerm] = useState("");
  const [businessServiceFilter, setBusinessServiceFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const completedStatuses = ["PERMIT_GRANTED", "CERTIFICATE_GRANTED", "CERTIFICATE_ISSUED"];

  // Filter applications to show only completed ones
  const filteredApplications = useMemo(() => {
    return applications
      .filter(app => {
        const applicationStatus = getAppStatus(app);
        const isCompleted = completedStatuses.includes(applicationStatus);

        const matchesSearch = searchTerm === "" ||
          app.applicationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.businessService?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.applicants?.[0]?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesBusinessService = businessServiceFilter === "all" ||
          app.businessService === businessServiceFilter;

        let matchesDate = true;
        if (startDate || endDate) {
          const applicationDate = new Date(app.auditDetails?.createdTime || app.createdTime || Date.now());
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;
          if (start && end) matchesDate = applicationDate >= start && applicationDate <= end;
          else if (start) matchesDate = applicationDate >= start;
          else if (end) matchesDate = applicationDate <= end;
        }

        return isCompleted && matchesSearch && matchesBusinessService && matchesDate;
      })
      .sort((a, b) => (b.auditDetails?.createdTime || 0) - (a.auditDetails?.createdTime || 0));
  }, [applications, searchTerm, businessServiceFilter, startDate, endDate]);

  // Get unique business services for filter
  const businessServices = useMemo(() => {
    const completed = applications.filter(a => completedStatuses.includes(getAppStatus(a)));
    return [...new Set(completed.map(app => app.businessService))].filter(Boolean);
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
          onRefresh={refreshApplications}
          isRefreshing={isRefreshing}
        />

        <div className="mb-6">
          <p className="text-gray-600">
            {filteredApplications.length} demande{filteredApplications.length !== 1 ? 's' : ''} complétée{filteredApplications.length !== 1 ? 's' : ''}
          </p>
        </div>

        <ApplicationsGrid applications={filteredApplications} />
      </div>
    </div>
  );
};

export default CitizenApplicationsCompleted;
