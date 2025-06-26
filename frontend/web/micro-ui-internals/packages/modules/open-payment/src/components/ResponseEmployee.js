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
import Banner from "../../../../ui-components/src/atoms/Banner";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";

const ResponseEmployee = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { state } = useLocation();
  const queryStrings = Digit.Hooks.useQueryParams();
  const { businessService } = useParams();
  const [isResponseSuccess, setIsResponseSuccess] = useState(state?.iSuccess || false);
  const userDetails = Digit.UserService.getUser();
  const userType = userDetails?.info?.type?.toLowerCase();
  const tenantId = Digit?.ULBService?.getStateId();

  const handleTemplateDownload = async () => {
    try {
      const params = {
        tenantId,
        serviceCode: queryStrings?.serviceCode,
        applicationNumber: state?.applicationNumber,
        pdfKey: "payment-receipt",
      };

      let url = `/studio-pdf/public-service/download/pdf`;
      try {
        const response = await Digit.CustomService.getResponse({
          url,
          params,
          method: "POST",
          useCache: false,
          userDownload: true,
          headers: {
            Accept: "application/pdf",
          },
        });

        const downloadPdf = (blob, fileName) => {
          if (window.mSewaApp && window.mSewaApp.isMsewaApp() && window.mSewaApp.downloadBase64File) {
            var reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = function () {
              var base64data = reader.result;
              window.mSewaApp.downloadBase64File(base64data, fileName);
            };
          } else {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            document.body.append(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(link.href), 7000);
          }
        };

        downloadPdf(new Blob([response.data], { type: "application/pdf" }), `${state?.applicationNumber}_receipt.pdf`);
      } catch (err) {
        console.error(err);
        Digit.Toast.error(t("TEMPLATE_DOWNLOAD_FAILED"));
      }
    } catch (err) {
      console.error("Template download error", err);
    }
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
        successful={isResponseSuccess || state?.iSuccess}
        message={t(state?.message || "PAYMENT_SUCCESS")}
        info={`${isResponseSuccess ? t("COMMON_APPLICATION_ID") : ""}`}
        whichSvg={`${isResponseSuccess ? "tick" : null}`}
        applicationNumber={state?.applicationNumber}
      />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <LinkLabel style={{ display: "flex", marginRight: "3rem" }} onClick={() => navigate("view")}>
          <ArrowRightInbox fill="#F47738" style={{ marginRight: "8px", marginTop: "3px" }} />
          {t("BPA_BPA_PCO_VIEW_APPLICATION")}
        </LinkLabel>
        <LinkLabel style={{ display: "flex", marginRight: "3rem", alignItems: "center" }} onClick={handleTemplateDownload}>
          <ArrowDown fill="#F47738" style={{ marginRight: "8px", marginTop: "3px" }} />
          {t("CS_COMMON_DOWNLOAD_RECEIPT")}
        </LinkLabel>
      </div>
      <ActionBar>
        <Link to={`/${window.contextPath}/${userType}/publicservices/modules?selectedPath=Apply`}>
          {/* <SubmitBar style={{borderRadius: "10px"}} label={t(`${businessService.toUpperCase()}_GO_TO_HOME`)} /> */}
          <button
            style={{
              borderRadius: "10px",
              backgroundColor: "#006769",
              color: "white",
              padding: "10px 20px",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            {t(`${businessService?.toUpperCase()}_GO_TO_HOME`)}
          </button>
        </Link>
      </ActionBar>
    </div>
  );
};

export default ResponseEmployee;
