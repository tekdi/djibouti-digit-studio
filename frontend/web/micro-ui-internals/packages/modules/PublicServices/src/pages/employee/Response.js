import React, { useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Card,
  LinkLabel,
  AddFileFilled,
  ArrowLeftWhite,
  ActionBar,
  SubmitBar,
  ArrowRightInbox,
  ArrowDown,
} from "@egovernments/digit-ui-react-components";
import Banner from "../../../../../ui-components/src/atoms/Banner";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import { downloadStudioPDF, getPdfKeyForState } from "../../utils";

const Response = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const queryStrings = Digit.Hooks.useQueryParams();
  const { module, service } = useParams();
  const [isResponseSuccess, setIsResponseSuccess] = useState(
    queryStrings?.isSuccess === "true" ? true : queryStrings?.isSuccess === "false" ? false : true
  );
  const { state } = useLocation();
  const userDetails = Digit.UserService.getUser();
  const userType = userDetails?.info?.type?.toLowerCase();
  const tenantId = Digit.ULBService.getCurrentTenantId();

  const handlePdfDownload = async () => {
    downloadStudioPDF(
      "pdf",
      {
        tenantId,
        serviceCode: queryStrings?.serviceCode,
        applicationNumber: state?.applicationNumber,
        pdfKey: getPdfKeyForState(state?.config?.data?.pdf, state?.workflowStatus),
      },
      `application-receipt-${state?.applicationNumber}.pdf`
    );
  };

  const navigate = (page) => {
    switch (page) {
      case "home": {
        history.push(`/${window.contextPath}/${userType}/publicservices/modules?selectedPath=Apply`);
      }
      case "view": {
        history.push(state.redirectionUrl);
      }
    }
  };

  return (
    <div style={{ width: "100%", padding: "16px", marginTop: "16px", height: "50%" }}>
      <Banner
        style={{
          borderRadius: "10px",
          width: "100%",
          height: "300px",
        }}
        successful={isResponseSuccess}
        message={t(state?.message || "SUCCESS")}
        info={`${state?.showID ? t("COMMON_APPLICATION_ID") : ""}`}
        whichSvg={`${isResponseSuccess ? "tick" : null}`}
        applicationNumber={state?.applicationNumber}
      />
      {isResponseSuccess && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <LinkLabel style={{ display: "flex", marginRight: "3rem" }} onClick={() => navigate("view")}>
            <ArrowRightInbox fill="#F47738" style={{ marginRight: "8px", marginTop: "3px" }} />
            {t(`${module.toUpperCase()}_${service.toUpperCase()}_VIEW_APPLICATION`)}
          </LinkLabel>
          <LinkLabel style={{ display: "flex", marginRight: "3rem", alignItems: "center" }} onClick={handlePdfDownload}>
            <ArrowDown fill="#F47738" style={{ marginRight: "8px", marginTop: "3px" }} />
            {t("CS_COMMON_DOWNLOAD_RECEIPT")}
          </LinkLabel>
        </div>
      )}
      <ActionBar>
        <Link to={`/${window.contextPath}/${userType}/publicservices/modules?selectedPath=Apply`}>
          <SubmitBar style={{ borderRadius: "10px" }} label={t(`${module.toUpperCase()}_${service.toUpperCase()}_GO_TO_HOME`)} />
        </Link>
      </ActionBar>
    </div>
  );
};

export default Response;
