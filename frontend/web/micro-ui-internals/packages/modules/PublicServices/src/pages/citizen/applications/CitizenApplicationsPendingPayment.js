import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Loader } from "@egovernments/digit-ui-components";
import axios from "axios";
import HeaderPendingPayment from "./HeaderPendingPayment";
import ApplicationsGrid from "./ApplicationsGrid";
import { getSimplifiedStatus } from "./utils";

const CitizenApplicationsPendingPayment = () => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();

  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [businessServiceFilter, setBusinessServiceFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [individualDetails, setIndividualDetails] = useState();
  
  const indId = individualDetails && individualDetails?.Individual?.[0]?.individualId;
  const userDetails = Digit.UserService.getUser();
  const uuid = userDetails?.info?.uuid;

  console.log(userDetails);

  // Fetch individual details - only run once
  useEffect(() => {
    const fetchIndividualDetails = async () => {
      if (!uuid) return;
      
      try {
        const response = await axios.post(`/health-individual/v1/_search?tenantId=${tenantId}&limit=1&offset=0`, {
          "RequestInfo": {
            apiId: "Rainmaker",
            authToken: userDetails?.access_token,
            userInfo: userDetails?.info,
            msgId: `${Date.now()}|${Digit.StoreData.getCurrentLanguage()}`,
          },
          "Individual": {
            "userUuid": [uuid]
          }
        });
        setIndividualDetails(response?.data);
      } catch (error) {
        console.error("Error fetching individual details:", error);
      }
    };

    fetchIndividualDetails();
  }, [tenantId, uuid]);

  // Fetch applications - only run when indId is available
  useEffect(() => {
    const fetchApplications = async () => {
      if (!indId || !uuid) {
        console.log("Missing required data:", { indId, uuid });
        return;
      }
      
      setIsLoading(true);
      try {
        console.log("Fetching pending payment applications with params:", {
          tenantId,
          userId: indId,
          status: "ACTIVE",
          createdBy: uuid
        });

        const response = await axios.get(`/public-service/v1/application`, {
          params: {
            tenantId: tenantId,
            userId: indId,
            status: "ACTIVE",
            createdBy: uuid
          },
          headers: {
            "X-Tenant-Id": tenantId,
            "auth-token": userDetails?.access_token,
          },
        });

        console.log("API Response:", response?.data);
        setApplications(response?.data?.Application || []);
      } catch (error) {
        console.error("Error fetching applications:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [tenantId, indId, uuid]);

  // Filter applications to show only pending payment ones (AWAITING_CITIZEN_PAYMENT)
  const pendingPaymentApplications = useMemo(() => {
    return applications.filter(app => {
      const applicationStatus = app.processInstance?.[0]?.state?.applicationStatus;
      return applicationStatus === "AWAITING_CITIZEN_PAYMENT";
    });
  }, [applications]);

  // Filter applications based on search and filters
  const filteredApplications = useMemo(() => {
    return pendingPaymentApplications.filter(app => {
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
  }, [pendingPaymentApplications, searchTerm, businessServiceFilter, startDate, endDate]);

  // Get unique business services for filter
  const businessServices = useMemo(() => {
    const services = [...new Set(pendingPaymentApplications.map(app => app.businessService))];
    return services.filter(Boolean);
  }, [pendingPaymentApplications]);

  // Refresh applications
  const handleRefresh = () => {
    window.location.reload();
  };

  if (isLoading) return <Loader />;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <HeaderPendingPayment 
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
        />

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredApplications.length} demande{filteredApplications.length !== 1 ? 's' : ''} en attente de paiement trouvée{filteredApplications.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Applications Grid */}
        <ApplicationsGrid applications={filteredApplications} />
      </div>
    </div>
  );
};

export default CitizenApplicationsPendingPayment;
