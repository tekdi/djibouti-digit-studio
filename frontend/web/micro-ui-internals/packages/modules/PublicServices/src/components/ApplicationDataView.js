import React from "react";
import { Card, CardHeader } from "@egovernments/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { colorCodes } from "../configs/UICustomizations";

const ApplicationDataView = ({serviceCode, data, status, applicationNumber, businessService }) => {
  const { t } = useTranslation();

  if (!data) return null;

  const {
    applicants = [],
    additionalDetails = {},
    documents = [],
    serviceDetails = {}
  } = data;


  const downloadFile = async (fileStoreId) => {
    try {
      const tenantId = Digit.ULBService.getCurrentTenantId();
      const response = await Digit.UploadServices.Filefetch([fileStoreId], tenantId);

      if (response?.data?.[fileStoreId]) {
        window.open(response.data[fileStoreId], "_blank");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const renderValue = (value) => {
    if (!value) return "-";

    if (typeof value === "boolean") {
      return value ? "checked" : "unchecked";
    }

    if (typeof value === "object") {
      if (value.name) {
        return t(value.name);
      }
      return value.code || "-";
    }

    return value;
  };

  const renderSection = (data, sectionTitle) => {
    if (!data || Object.keys(data).length === 0) return null;

    // Filter and combine applicant data if this is the applicant section
    let displayData = data;
    if (sectionTitle === `${serviceCode}_APPLICANTDETAILS`) {
      displayData = {
        legalName: data.name,
        address: additionalDetails?.applicants?.address || "-",
        wayToAddress: additionalDetails?.applicants?.wayToAddress || "-",
        telephone: `+253 ${data?.mobileNumber}`,
      };
    }

    if (sectionTitle === `${serviceCode}_DESIGNOFFICEDETAILING`) {
        displayData = {
          telephone: `+253 ${data?.telephone}`,
        };
      }

    return (
      <div className="section-container">
        <p className="field-label">{t(sectionTitle)}</p>
        <div className="section-content">
          {Object.entries(displayData).map(([key, value]) => {
            const renderedValue = renderValue(value);
            const label = renderedValue === "checked" ? (
              <div style={{ fontSize: "16px", marginLeft: "10px" }} className="field-label">
                  {t(serviceCode + "_" + key.toUpperCase())}
              </div>
            ) : (
              <div style={{ fontSize: "16px" }} className="field-label">
                {t(serviceCode + "_" + key.toUpperCase())}
              </div>
            );

            return (
              <div key={key}>
                {renderedValue === "checked" ? (
                  <div className="fields-container" style={{ width: "100%" }}>
                    <span
                      className="digit-custom-checkbox digit-custom-checkbox-emp"
                      style={{
                        border: "3px solid grey",
                        display: "inline-block",
                        borderRadius: "6px",
                        marginRight: "8px",
                        height: "27px",
                      }}
                    >
                      <svg width="20" height="20"  viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_105_1500)">
                          <path
                            d="M9.00016 16.1698L4.83016 11.9998L3.41016 13.4098L9.00016 18.9998L21.0002 6.99984L19.5902 5.58984L9.00016 16.1698Z"
                            fill="#808080"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_105_1500">
                            <rect width="20" height="20"  fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </span>
                    {label}
                  </div>
                ) : (
                  <div style={{ width: "65%" }} className="fields-container">
                    {label}
                    <div className="field-value">{t(renderedValue)}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCheckbox = (key, checked) => {
    return (
      <div key={key} style={{ width: "100%" }} className="fields-container">
        <span
          className="digit-custom-checkbox digit-custom-checkbox-emp"
          style={{
            border: "3px solid grey",
            display: "inline-block",
            borderRadius: "6px",
            marginRight: "8px",
            height: "27px",
          }}
        >
          {checked && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_105_1500)">
                <path
                  d="M9.00016 16.1698L4.83016 11.9998L3.41016 13.4098L9.00016 18.9998L21.0002 6.99984L19.5902 5.58984L9.00016 16.1698Z"
                  fill="#808080"
                />
              </g>
              <defs>
                <clipPath id="clip0_105_1500">
                  <rect width="20" height="20" fill="white" />
                </clipPath>
              </defs>
            </svg>
          )}
        </span>
        <div style={{ fontSize: "16px", marginLeft: "10px" }} className="field-label">
          {t(serviceCode + "_" + key.toUpperCase())}
        </div>
      </div>
    );
  };

  const renderDeclarations = () => {
    const declarations = additionalDetails?.applicants || {};
    const declarationKeys = [
      "accuracyDeclaration",
      "checkValidation",
      "eligibilityDeclaration",
      "taxCalculationAgreement"
    ];

    if (!Object.keys(declarations).length) return null;

    return (
      <div className="section-container">
        {/* <p className="field-label">{t(serviceCode + "_DECLARATIONS")}</p> */}
        <div className="section-content">
          {declarationKeys.map(key => renderCheckbox(key, declarations[key]))}
        </div>
      </div>
    );
  };

  const renderDocuments = () => {
    if (!documents || documents.length === 0) return null;

    return (
      <div className="section-container">
        <h2 className="field-label">{t("DOCUMENTS")}</h2>
        <div className="section-content">
          {documents.map((doc, index) => (
            <div key={index} className="fields-container">
              <div className="field-label" style={{ width: "65%", fontSize: "16px", fontWeight: "500" }}>
                {t(doc?.documentType)}
              </div>
              <div className="field-value">
                <div className="document-item">
                  <svg width="27" height="34" viewBox="0 0 27 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M16.8337 0.333374H3.50033C1.66699 0.333374 0.183659 1.83337 0.183659 3.66671L0.166992 30.3334C0.166992 32.1667 1.65033 33.6667 3.48366 33.6667H23.5003C25.3337 33.6667 26.8337 32.1667 26.8337 30.3334V10.3334L16.8337 0.333374ZM20.167 27H6.83366V23.6667H20.167V27ZM20.167 20.3334H6.83366V17H20.167V20.3334ZM15.167 12V2.83337L24.3337 12H15.167Z"
                      fill="#505A5F"
                    />
                  </svg>
                  <span className="file-name">{t(doc?.documentType)}</span>
                  <div className="footer-buttons-wrapper">
                    <button
                      style={{ width: "auto", marginLeft: "auto" }}
                      className="digit-submit-bar previous-btn"
                      onClick={() => downloadFile(doc.fileStoreId)}
                    >
                      <svg width="12" height="15" viewBox="0 0 12 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M11.8337 5.5H8.50033V0.5H3.50033V5.5H0.166992L6.00033 11.3333L11.8337 5.5ZM0.166992 13V14.6667H11.8337V13H0.166992Z"
                          fill="#006769"
                        />
                      </svg>
                      <h2 style={{ fontSize: "16px", fontWeight: "500", color: "#006769" }}>{t("DOWNLOAD")}</h2>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card style={{ borderRadius: "1rem", padding: "30px" }}>
      <CardHeader style={{ marginLeft: "12px" }}>{t(`${serviceCode}_APPLICANTDETAILS`)}</CardHeader>
      <div style={{ padding: "16px" }}>
        <div style={{ display: "flex", width: "100%" }}>
    <p style={{width:'40%'}} className="field-label">{t("CURRENT_STATUS")} </p>
    <p
      className="field-value"
      style={{
        backgroundColor: colorCodes[status]?.[0] || "#F1F4CF",
        color: colorCodes[status]?.[1] || "#4B4B4B",
        padding: "5px 10px",
        borderRadius: "5px",
        fontSize: "14px",
        fontWeight: "400",
        width: "fit-content"
      }}
    >
      {t(businessService + "_" + status)}
    </p>
  </div>
  <div style={{ display: "flex", width: "100%" }}>

    <p style={{width:'40%'}} className="field-label">{t("APPLICATION_NUMBER")} </p>
        <p
      className="field-value"
      style={{
        borderRadius: "5px",
        fontSize: "18px",
        width: "50%",
        fontFamily: "Inter"
      }}
    >
      {applicationNumber}
    </p>
  </div>

        {renderSection(applicants[0], `${serviceCode}_APPLICANTDETAILS`)}
        {renderDeclarations()}
        {renderSection(serviceDetails.landInfo, `${serviceCode}_LANDANDPROJECTDESIGNDETAILS`)}
        {renderSection(serviceDetails.designOffice, `${serviceCode}_DESIGNOFFICEDETAILING`)}
        {renderDocuments()}
          <div style={{ width: "100%" }} className="fields-container">
          <span
            className="digit-custom-checkbox digit-custom-checkbox-emp"
            style={{
              border: "3px solid grey",
              display: "inline-block",
              borderRadius: "6px",
              marginRight: "8px",
              height: "27px",
              cursor: "pointer"
            }}
            onClick={() => setIsAttested(!isAttested)}
          >

              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_105_1500)">
                  <path
                    d="M9.00016 16.1698L4.83016 11.9998L3.41016 13.4098L9.00016 18.9998L21.0002 6.99984L19.5902 5.58984L9.00016 16.1698Z"
                    fill="#808080"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_105_1500">
                    <rect width="20" height="20" fill="white" />
                  </clipPath>
                </defs>
              </svg>
          </span>
          <div
            style={{ fontSize: "16px", marginLeft: "10px", cursor: "pointer" }}
            className="field-label"
            onClick={() => setIsAttested(!isAttested)}
          >
            {t("IS_ATTESTED_BY_CITIZEN")}
          </div>
        </div>

      </div>
      <style jsx>{`
        .section-container {
          margin-bottom: 24px;
          background: #fff;
          border-radius: 4px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 16px;
          color: #0b0c0c;
        }
        .section-content {
          display: flex;
          flex-direction: column;
        }
        .fields-container {
          display: flex;
          padding: 12px 0;
          width: 68%;
          align-items: center;
        }
        .field-label {
          width: 100%;
          color: #505a5f;
          font-weight: 500;
          font-size: 16px;
          font-family: "Inter";
        }
        .field-value {
          width: 60%;
          color: #0b0c0c;
          font-size: 19px;
        }
        .document-item {
          margin-bottom: 8px;
          display: flex;
          gap: 8px;
          justify-content: flex-start;
          align-items: center;
          flex-direction: column;
          flex-wrap: wrap;
          align-content: flex-start;
        }
        .file-name {
          color: #505a5f !important;
          text-align: center;
          width:90% !important;
        }
        .file-id {
          color: #505a5f;
          font-size: 0.9em;
        }
      `}</style>
    </Card>
  );
};

export default ApplicationDataView;
