import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { InboxSearchComposer, Loader } from "@egovernments/digit-ui-components";
import { useParams } from "react-router-dom";
import axios from "axios";
import { citizenInboxGenericConfig } from "../../../configs/citizenInboxGenericConfig";

const CitizenInboxService = () => {
  const { t } = useTranslation();
  const { module } = useParams();
  const tenantId = Digit.ULBService.getCurrentTenantId();

  const [servicesData, setServicesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [individualDetails, setIndividualDetails] = useState();
  // const serviceCode = servicesData && servicesData?.[0]?.serviceCode
  const indId = individualDetails && individualDetails?.Individual?.[0]?.individualId
  const userDetails = Digit.UserService.getUser();
  const uuid = userDetails?.info?.uuid

  useEffect(async () => {
    try {
      const response = await axios.post(`/health-individual/v1/_search?tenantId=${tenantId}&limit=1&offset=0`, {
        "RequestInfo": {
          apiId: "Rainmaker",
          authToken: userDetails?.access_token,
          userInfo: userDetails?.info,
          msgId: `${Date.now()}|${Digit.StoreData.getCurrentLanguage()}`,
        },
        "Individual": {
          "userUuid": [
            uuid
          ]
        }
      });
      setIndividualDetails(response?.data)
    } catch (error) {
      console.error("Error fetching individual details:", error);
    }

    const fetchBusinessServices = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("/public-service/v1/service", {
          params: { tenantId: tenantId },
          headers: {
            "X-Tenant-Id": tenantId,
            "auth-token":
              Digit.UserService.getUser()?.access_token,
          },
        });

        const services = response?.data?.Services || [];
        setServicesData(services);
      } catch (error) {
        console.error("Error fetching business services:", error);
        setServicesData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinessServices();

  }, [tenantId])

  const configs = citizenInboxGenericConfig(tenantId,indId,uuid);


  const updatedConfig = useMemo(() => {
    return Digit.Utils.preProcessMDMSConfigInboxSearch(
      t,
      configs,
      "sections.filter.uiConfig.fields",
      {
        updateDependent: [
          {
            key: "businessService",
            value: servicesData.filter((ob) => ob?.module?.toLowerCase() === module?.toLowerCase()).map((ob) => ({
              code: ob?.businessService,
              name: ob?.businessService,
            })),
          },
        ],
      }
    );
  }, [t, configs, servicesData]);

  if (isLoading) return <Loader />;

  return (
    <React.Fragment>
      <div className="digit-inbox-search-wrapper">
        <InboxSearchComposer configs={updatedConfig} />
      </div>
    </React.Fragment>
  );
};

export default CitizenInboxService;
