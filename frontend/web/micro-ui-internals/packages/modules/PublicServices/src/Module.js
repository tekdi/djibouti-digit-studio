import Loader from "../../../ui-components/src/atoms/Loader";
import React, { useEffect, useState, useMemo } from "react";
import { useRouteMatch } from "react-router-dom";
import { default as EmployeeApp } from "./pages/employee";
import PublicServicesCard from "./components/PublicServicesCard";
import PersonTypeSelector from "./pages/employee/DigitDemo/components/PersonTypeSelector";
import { updateCustomConfigs } from "./utils";
import axios from "axios";

export const PublicServicesModule = ({ stateCode, userType, tenants }) => {
  const { path } = useRouteMatch();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const language = Digit.StoreData.getCurrentLanguage();

  const [serviceData, setServiceData] = useState(null);
  const [moduleListLoading, setModuleListLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Initialize custom components
  useEffect(() => {
    initPublicServiceComponents();
  }, []);

  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        setModuleListLoading(true);
        const response = await axios.get("/public-service/v1/service", {
          params: { tenantId },
          headers: {
            "X-Tenant-Id": tenantId,
            "auth-token": Digit.UserService.getUser()?.access_token,
          },
        });
        setServiceData(response.data);
      } catch (err) {
        console.error("API fetch error:", err);
        setApiError(err);
      } finally {
        setModuleListLoading(false);
      }
    };

    fetchServiceData();
  }, [tenantId]);

  const moduleCode = useMemo(() => {
    const moduleList = [...new Set(serviceData?.Services?.map((ob) => ob?.module))] || [];
    let codes = ["sample", "common", "workflow"];
    moduleList.forEach((ob) => codes.push(`studio-${ob}`));
    codes.push("studio-newtl-checklist");
    return codes;
  }, [serviceData]);

  const { isLoading: storeLoading, data: store } = Digit.Services.useStore({
    stateCode,
    moduleCode,
    language,
  });

  if (storeLoading || moduleListLoading) {
    return <Loader page={true} variant={"PageLoader"} />;
  }

  if (apiError) {
    return <div>Error loading services: {apiError.message}</div>;
  }

  return <EmployeeApp path={path} stateCode={stateCode} userType={userType} tenants={tenants} />;
};

const componentsToRegister = {
  PublicServicesModule,
  PersonTypeSelector,
  // PublicServicesCard,
};

export const initPublicServiceComponents = () => {
  updateCustomConfigs();
  Object.entries(componentsToRegister).forEach(([key, value]) => {
    Digit.ComponentRegistryService.setComponent(key, value);
  });
};
