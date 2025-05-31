import React, { useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, LinkLabel, AddFileFilled, ArrowLeftWhite, ActionBar, SubmitBar, ArrowRightInbox } from "@egovernments/digit-ui-react-components";
import Banner from "../../../../ui-components/src/atoms/Banner";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";

const ResponseEmployee = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { state } = useLocation();
  const {businessService, consumerCode, tenantId} = useParams();
  const [isResponseSuccess, setIsResponseSuccess] = useState(
    state?.iSuccess || false
  );

  const navigate = (page) => {
    switch (page) {
      case "home": {
        history.push(`/${window.contextPath}/employee`);
      }
      case "view": {
        history.push(state.redirectionUrl);
      }
    }
  };

  return (
    <div style={{width: "100%", padding: "16px", marginTop: "16px", height: "50%"}}>
      <Banner
        style={{
          borderRadius: "10px",
          width: "100%",
          height: "300px",
        }}
        successful={isResponseSuccess || state?.iSuccess}
        message={t(state?.message || "PAYMENT_SUCCESS")}
        info={`${isResponseSuccess ? t("COMMON_APPLICATION_ID") : ""}`}
        whichSvg={`${isResponseSuccess ? "tick" : null}`}
        applicationNumber={state?.applicationNumber}
      />
      <div style={{ display: "flex" }}>
        <LinkLabel style={{ display: "flex", marginRight: "3rem" }} onClick={() => navigate("view")}>
          <ArrowRightInbox fill="#F47738" style={{ marginRight: "8px", marginTop: "3px" }} />
          {t("BPA_BPA_PCO_VIEW_APPLICATION")}
        </LinkLabel>
      </div>
      <ActionBar>
        <Link to={`/${window.contextPath}/employee`}>
          {/* <SubmitBar style={{borderRadius: "10px"}} label={t(`${businessService.toUpperCase()}_GO_TO_HOME`)} /> */}
          <button style={{borderRadius: "10px", backgroundColor: "#006769", color: "white", padding: "10px 20px", border: "none", cursor: "pointer", fontSize: "16px", fontWeight: "bold"}}>{t(`${businessService.toUpperCase()}_GO_TO_HOME`)}</button>
        </Link>
      </ActionBar>
    </div>
  );
};

export default ResponseEmployee;
