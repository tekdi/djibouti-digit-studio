import React, { useEffect, useState } from "react";
import { Loader } from "@egovernments/digit-ui-components";
import axios from "axios";
import { transformResponseforModulePage } from "../../../utils";
import { getServiceIcon, getServiceInfo } from "./utils";
import ApplyHeader from "./ApplyHeader";
import SearchAndFilter from "./SearchAndFilter";
import ServicesGrid from "./ServicesGrid";
import NoServicesMessage from "./NoServicesMessage";

const Apply = () => {
  const [individualDetails, setIndividualDetails] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const userDetails = Digit.UserService.getUser();
  const roles = userDetails?.info?.roles;
  const isCitizen = roles?.length === 1 && roles[0].code === "CITIZEN";
  const isArchitect = roles?.some((role) => role.code === "BPA_ARCHITECT");
  const uuid = userDetails?.info?.uuid;
  const userType = userDetails?.info?.type?.toLowerCase();

  // Fetch service configurations from MDMS
  const mdmsRequestCriteria = {
    url: "/egov-mdms-service/v2/_search",
    body: {
      MdmsCriteria: {
        tenantId: tenantId,
        schemaCode: "Studio.ServiceConfiguration",
      },
    },
  };
  const { data: mdmsData } = Digit.Hooks.useCustomAPIHook(mdmsRequestCriteria);

  // Fetch service details configured for the tenant
  const request = {
    url: "/public-service/v1/service",
    params: { tenantId: tenantId },
    headers: {
      "X-Tenant-Id": tenantId,
      "auth-token": Digit.UserService.getUser()?.access_token,
    },
    method: "GET",
  };
  const { isLoading: servicesDataLoading, data: servicesData } = Digit.Hooks.useCustomAPIHook(request);


  // Transform services data
  let detailsConfig = servicesData ? transformResponseforModulePage(servicesData?.Services) : [];
  const hasNoData = detailsConfig.length === 0 && !servicesDataLoading;

  // Fetch individual details for citizens
  useEffect(async () => {
    if (!isCitizen && !isArchitect) return;
    try {
      const response = await axios.post(`/health-individual/v1/_search?tenantId=${tenantId}&limit=1&offset=0`, {
        RequestInfo: {
          apiId: "Rainmaker",
          authToken: userDetails?.access_token,
          userInfo: userDetails?.info,
          msgId: `${Date.now()}|${Digit.StoreData.getCurrentLanguage()}`,
        },
        Individual: {
          userUuid: [uuid],
        },
      });
      setIndividualDetails(response?.data);
    } catch (error) {
      console.error("Error fetching individual details:", error);
    }
  }, []);



  if (servicesDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (hasNoData) {
    return <NoServicesMessage />;
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-6 pt-8">
      <ApplyHeader />
      
      <SearchAndFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
      />

      <ServicesGrid 
        detailsConfig={detailsConfig}
        searchTerm={searchTerm}
        selectedFilter={selectedFilter}
        isCitizen={isCitizen}
        getServiceIcon={getServiceIcon}
        getServiceInfo={getServiceInfo}
        servicesData={servicesData}
      />
    </div>
  );
};

export default Apply;
