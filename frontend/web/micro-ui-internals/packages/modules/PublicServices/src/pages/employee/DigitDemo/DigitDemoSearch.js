import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "react-router-dom";
import { useSearchGenericConfig } from "../../../configs/searchGenericConfig";
import { InboxSearchComposer, Loader } from "@egovernments/digit-ui-components";
import { DateRangeNew } from "@egovernments/digit-ui-react-components";

const DigitDemoSearch = () => {
  const { t } = useTranslation();
  const { module } = useParams();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const location = useLocation();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const configs = useSearchGenericConfig(setIsLoading); // This may still set loading during config fetch

  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        const response = await axios.get("/public-service/v1/service", {
          params: { tenantId : tenantId },
          headers: {
            "X-Tenant-Id": tenantId,
           "auth-token":
              Digit.UserService.getUser()?.access_token,
          },
        });
        setData(response.data);
      } catch (error) {
        console.error("Error fetching service data:", error);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServiceData();
  }, [tenantId]);

  const updatedConfig = useMemo(() => {
    if (!configs || !data) return null;
   // if (!configs) return null;
    const services = data?.Services || [];

    return Digit.Utils.preProcessMDMSConfigInboxSearch(
      t,
      configs,
      "sections.search.uiConfig.fields",
      {
        updateDependent: [
          {
            key: "businessService",
            value: services.map((s) => ({
              code: s.businessService,
              name: s.businessService,
              serviceCode: s.serviceCode,
            })),
           // value : [{code:"NewTL", name:"NewTL", serviceCode:"SVC-DEV-TRADELICENSE-NEWTL-04"},{code:"OldTL", name:"OldTL", serviceCode:"SVC-DEV-TRADELICENSE-OLDTL-07"}]
          },
        ],
      }
    );
  }, [t, configs, data] //[t, configs, data]
  );

  if (!updatedConfig || isLoading) {
    return <Loader />;
  }

  //  if (!updatedConfig) {
  //   return <Loader />;
  // }

  return (
    <div className="digit-inbox-search-wrapper">
      <InboxSearchComposer configs={updatedConfig} />
    </div>
  );
};

export default DigitDemoSearch;
