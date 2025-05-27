import React from "react";
import { Card, Button, HeaderComponent, CardText, Loader, SubmitBar } from "@egovernments/digit-ui-components";
import { useTranslation } from "react-i18next";
import { Link, useHistory } from "react-router-dom";
import { transformResponseforModulePage } from "../../../utils";

const modulePageComponent = ({}) => {
  const { t } = useTranslation();
  const history = useHistory();

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const queryStrings = Digit.Hooks.useQueryParams();

  const request = {
    url: "/public-service/v1/service",
    params: { tenantId: tenantId },
    headers: {
      "X-Tenant-Id": tenantId,
      "auth-token": Digit.UserService.getUser()?.access_token,
    },
    method: "GET",
  };
  const { isLoading, data } = Digit.Hooks.useCustomAPIHook(request);

  let detailsConfig = data ? transformResponseforModulePage(data?.Services) : [];

  const userDetails = Digit.UserService.getUser();
  const userType = userDetails?.info?.type?.toLowerCase();
  const isArchitect = userDetails?.info?.roles?.some((role) => role.code !== "CITIZEN");

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="products-container">
      {/* Header Section */}
      <HeaderComponent className="products-title">{t("DIGIT_STUDIO_HEADER")}</HeaderComponent>
      <CardText className="products-description">{t("DIGIT_STUDIO_HEADER_DESCRIPTION")}</CardText>

      {/* Product Cards Section */}
      <div className="products-list">
        {detailsConfig?.map((product, index) => (
          <Card key={index} className="product-card">
            <div className="product-header">
              <HeaderComponent className="product-title">{t(product.heading)}</HeaderComponent>
            </div>
            <CardText className="product-description">{t(product?.cardDescription)}</CardText>
            {queryStrings?.selectedPath === "Apply" &&
              isArchitect &&
              product?.businessServices.map((bs) => (
                <Link
                  className="link"
                  to={`/${window.contextPath}/${userType}/publicservices/${product.module}/${bs.businessService}/Apply?serviceCode=${bs?.serviceCode}`}
                >
                  {bs.businessService}
                </Link>
              ))}
            <Link
              className="link"
              to={{
                pathname: `/${window.contextPath}/${userType}/publicservices/${product.module}/search`,
                state: {
                  moduleData: data, // example
                },
              }}
            >
              Search
            </Link>
            <Link className="link" to={`/${window.contextPath}/${userType}/publicservices/${product.module}/Inbox`}>
              Inbox
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default modulePageComponent;
