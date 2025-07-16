import { Card, CardText, HeaderComponent, Loader } from "@egovernments/digit-ui-components";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { getParallelWorkflow, transformResponseforModulePage } from "../../../utils";

const ModulePageComponent = () => {
  const { t } = useTranslation();
  const [individualDetails, setIndividualDetails] = useState();

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const queryStrings = Digit.Hooks.useQueryParams();
  localStorage.removeItem("formData");
  localStorage.removeItem("currentStep");
  sessionStorage.removeItem("formData");

  const userDetails = Digit.UserService.getUser();
  const roles = userDetails?.info?.roles;
  const isCitizen = roles?.length === 1 && roles[0].code === "CITIZEN";
  const isArchitect = roles?.some((role) => role.code === "BPA_ARCHITECT");
  const indId = individualDetails?.Individual?.[0]?.individualId;
  const uuid = userDetails?.info?.uuid;

  //To fetch the service configurations of the services
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

  //To fetch the service details configured for the tenant
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

  const module = servicesData?.Services?.[0]?.module;

  const businessServices = servicesData?.Services?.filter((ob) => ob?.module?.toLowerCase() === module?.toLowerCase())?.map((ob) => ({
    code: ob?.businessService,
    name: ob?.businessService,
    parallelWorkflow: getParallelWorkflow(module, ob?.businessService, mdmsData?.mdms),
  }));

  const businessServicesList = Array.from(
    new Set(
      businessServices?.flatMap((bs) => {
        const allCodes = [bs.code, ...(bs.parallelWorkflow || [])];
        return allCodes;
      }) || []
    )
  );

  const { data: inboxData, isLoading: isInboxLoading } = Digit.Hooks.useCustomAPIHook({
    url: "/inbox/v2/_search",
    method: "POST",
    body: {
      inbox: {
        limit: 10,
        offset: 0,
        processSearchCriteria: {
          businessService: businessServicesList,
          moduleName: "public-services",
          tenantId: tenantId,
        },
        moduleSearchCriteria: {
          businessService: businessServicesList,
          module: module,
        },
        tenantId: tenantId,
      },
    },
    config: {
      enabled: !isCitizen && businessServicesList?.length > 0,
    },
  });

  const { data: citizenApplications, isLoading: isCitizenAppsLoading } = Digit.Hooks.useCustomAPIHook({
    url: `/public-service/v1/application?tenantId=${tenantId}&userId=${indId}&status=ACTIVE&createdBy=${userDetails?.info?.uuid}`,
    method: "GET",
    headers: { "X-Tenant-Id": tenantId, "auth-token": Digit.UserService.getUser()?.access_token },
    config: {
      enabled: !!indId && (isCitizen || isArchitect),
    },
  });

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

  //  util to transform raw data into UI-friendly structure
  let detailsConfig = servicesData ? transformResponseforModulePage(servicesData?.Services) : [];
  const hasNoData = detailsConfig.length === 0 && !servicesDataLoading;

  const userType = userDetails?.info?.type?.toLowerCase();
  const isDirector = roles?.some((role) => role.code.includes("DIRECTOR"));
  const isCounterEmployee = roles?.some((role) => role.code === "COUNTER_EMPLOYEE");
  const count = citizenApplications?.Application?.length || inboxData?.totalCount || 0;

  if (servicesDataLoading || (!isCitizen && !isArchitect && isInboxLoading) || ((isCitizen || isArchitect) && isCitizenAppsLoading)) {
    return <Loader />;
  }

  // Show fallback UI when no data is available
  if (hasNoData) {
    return (
      <div className="products-container">
        <HeaderComponent className="products-title">{t("DIGIT_STUDIO_HEADER")}</HeaderComponent>
        <CardText>{t("NO_SERVICES_AVAILABLE")}</CardText>
      </div>
    );
  }

  return (
    <div className="products-container">
      {/* Header Section */}
      {/* <HeaderComponent className="products-title">{t("DIGIT_STUDIO_HEADER")}</HeaderComponent>
      <CardText className="products-description">
        {t("DIGIT_STUDIO_HEADER_DESCRIPTION")}
      </CardText> */}

      {/* Product Cards Section */}
      <div className="products-list">
        {detailsConfig?.map((product, index) => (
          <React.Fragment key={index}>
            {/* BPA_PCO Card */}
            {queryStrings?.selectedPath === "Apply" && (isArchitect || isCitizen) && (
              <Card key={`${index}-bpa`} className="product-card module-card">
                <div className="product-header inbox-header">
                  <HeaderComponent className="product-title">{t(product.heading)}</HeaderComponent>
                </div>
                <ul className="list-disc space-y-2 pt-2">
                  {product?.businessServices
                    ?.filter((bs) => {
                      if (isCitizen) {
                        return bs.businessService === "BPA_PCO_SIMPLE";
                      }
                      return true; // show all for non-citizens
                    })
                    ?.sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((bs) => (
                      <li style={{ marginBottom: "15px" }} key={bs?.businessService}>
                        <Link
                          key={bs?.businessService}
                          className="link request-button"
                          to={`/${window.contextPath}/${userType}/publicservices/${product.module}/${bs.businessService}/Apply?serviceCode=${bs?.serviceCode}`}
                        >
                          {t(bs?.businessService)}
                        </Link>
                      </li>
                    ))}
                </ul>
              </Card>
            )}

            {/* Inbox Card */}
            {!isCitizen && !isArchitect && (
              <Card key={`${index}-inbox`} className="product-card module-card">
                <div className="product-header inbox-header">
                  <HeaderComponent className="product-title">{t("INBOX_HEADING")}</HeaderComponent>
                  <div className="product-icon">
                    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="56" height="56" rx="2" fill="#006769" />
                      <g clip-path="url(#clip0_101_37716)">
                        <path
                          d="M41.3334 11.3333H14.6667C12.8334 11.3333 11.35 12.8333 11.35 14.6667L11.3334 44.6667L18 38H41.3334C43.1667 38 44.6667 36.5 44.6667 34.6667V14.6667C44.6667 12.8333 43.1667 11.3333 41.3334 11.3333ZM29.6667 26.3333H26.3334V16.3333H29.6667V26.3333ZM29.6667 33H26.3334V29.6667H29.6667V33Z"
                          fill="white"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_101_37716">
                          <rect width="40" height="40" fill="white" transform="translate(8 8)" />
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                </div>
                <div className="inbox-count-container">
                  <CardText className="product-description inbox-count-number">{count}</CardText>
                  <CardText className="product-description">{t("TOTAL_INBOX_COUNT")}</CardText>
                </div>
                <div className="product-button-container">
                  <Link className="link request-button" to={`/${window.contextPath}/${userType}/publicservices/${product.module}/Inbox`}>
                    {t("VIEW_ALL")}
                  </Link>
                  <svg width="21" height="14" viewBox="0 0 21 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.5 0L12.09 1.41L16.67 6H0.5V8H16.67L12.08 12.59L13.5 14L20.5 7L13.5 0Z" fill="#006769" />
                  </svg>
                </div>
                {/* <Link className="link" to={{
                pathname: `/${window.contextPath}/employee/publicservices/${product.module}/search`,
                state: {
                  moduleData:data
                }
              }}>
                Search
              </Link> */}
              </Card>
            )}

            {/* Search application */}
            {(isDirector || isCounterEmployee) && (
              <Card key={`${index}-search`} className="product-card module-card">
                <div className="product-header inbox-header">
                  <HeaderComponent className="product-title">{t("SEARCH_HEADER")}</HeaderComponent>
                </div>
                <div className="">
                  <Link className="link request-button" to={`/${window.contextPath}/${userType}/publicservices/${product.module}/search`}>
                    {t("BPA_SEARCH")}
                  </Link>
                  <svg width="21" height="14" viewBox="0 0 21 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.5 0L12.09 1.41L16.67 6H0.5V8H16.67L12.08 12.59L13.5 14L20.5 7L13.5 0Z" fill="#006769" />
                  </svg>
                </div>
              </Card>
            )}

            {/* My application Card */}
            {(isCitizen || isArchitect) && (
              <Card key={`${index}-my-application`} className="product-card module-card">
                <div className="product-header inbox-header">
                  <HeaderComponent className="product-title">{t("MY_APPLICATION_HEADER")}</HeaderComponent>
                  <div className="product-icon">
                    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="56" height="56" rx="2" fill="#006769" />
                      <g clip-path="url(#clip0_101_37716)">
                        <path
                          d="M41.3334 11.3333H14.6667C12.8334 11.3333 11.35 12.8333 11.35 14.6667L11.3334 44.6667L18 38H41.3334C43.1667 38 44.6667 36.5 44.6667 34.6667V14.6667C44.6667 12.8333 43.1667 11.3333 41.3334 11.3333ZM29.6667 26.3333H26.3334V16.3333H29.6667V26.3333ZM29.6667 33H26.3334V29.6667H29.6667V33Z"
                          fill="white"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_101_37716">
                          <rect width="40" height="40" fill="white" transform="translate(8 8)" />
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                </div>
                <div className="inbox-count-container">
                  <CardText className="product-description inbox-count-number">{count}</CardText>
                  <CardText className="product-description">{t("TOTAL_INBOX_COUNT")}</CardText>
                </div>
                <div className="product-button-container">
                  <Link className="link request-button" to={`/${window.contextPath}/${userType}/publicservices/${product.module}/CitizenInbox`}>
                    {t("VIEW_ALL")}
                  </Link>
                  <svg width="21" height="14" viewBox="0 0 21 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.5 0L12.09 1.41L16.67 6H0.5V8H16.67L12.08 12.59L13.5 14L20.5 7L13.5 0Z" fill="#006769" />
                  </svg>
                </div>
                {/* <Link className="link" to={{
                pathname: `/${window.contextPath}/employee/publicservices/${product.module}/search`,
                state: {
                  moduleData:data
                }
              }}>
                Search
              </Link> */}
              </Card>
            )}

            <style jsx>{`
              .list-disc {
                list-style: disc;
                margin: 0;
                padding-left: 20px;
              }
              .module-card {
                width: 100%;
                min-width: 400px;
                min-height: 220px;
                padding: 15px 30px 15px 30px;
              }
              .inbox-header {
                display: flex;
                justify-content: space-between;
                width: 100%;
                border-bottom: 1px solid #ccc;
                margin-bottom: 10px;
              }
              .inbox-count-number {
                font-size: 18px;
                font-weight: 600;
              }
              .product-icon {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 56px;
                height: 56px;
              }
              .product-button-container {
                display: flex;
                align-items: center;
                border-top: 1px solid #ccc;
                padding-top: 10px;
                width: 100%;
              }
              .request-button {
                cursor: pointer;
                color: #006769;
                border-radius: 10px;
                padding: 10px 0px;
                text-decoration: none;
                margin-right: 10px;
              }
            `}</style>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ModulePageComponent;
