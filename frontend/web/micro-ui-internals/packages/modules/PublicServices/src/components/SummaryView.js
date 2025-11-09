import React, { Fragment, useState } from "react";
import { Card, CardHeader } from "@egovernments/digit-ui-react-components";

const SummaryView = ({ formData, t, serviceCode, onSubmit, onPrevious }) => {
  const [documentAttestation, setDocumentAttestation] = useState(false);

  const downloadFile = async (fileStoreId) => {
    try {
      const tenantId = Digit.ULBService.getCurrentTenantId();
      const response = await Digit.UploadServices.Filefetch([fileStoreId], tenantId);

      if (response?.data?.[fileStoreId]) {
        window.open(response.data[fileStoreId], "_blank");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      // You can add a toast notification here if needed
    }
  };

  const renderValue = (value) => {
    if (!value) return "-";

    if (typeof value === "boolean") {
      return value ? "checked" : "unchecked";
    }

    if (typeof value === "object") {
      // Handle objects that have 'name' or 'code' properties (dropdown selections)
      if (value.name) {
        return t(value.name);
      }
      return value.code || "-";
    }

    return value;
  };

  const renderSection = (data, sectionTitle) => {
    if (!data || !data[0]) return null;

    return (
      <div className="section-container">
        <h2 className="section-title">{t(sectionTitle)}</h2>
        <div className="section-content">
          {Object.entries(data[0]).map(([key, value]) => {
            const renderedValue = renderValue(value);
            const label =
              renderedValue === "checked" ? (
                <div style={{ marginLeft: "10px" }} className="field-label">
                  {t(serviceCode + "_" + key.toUpperCase())}
                </div>
              ) : (
                <div className="field-label">
                  {t(serviceCode + "_" + key.toUpperCase())}
                </div>
              );
            const field = <div className="field-value">{renderedValue}</div>;

            return (
              <div key={key}>
                {renderedValue === "checked" ? (
                  <div className="fields-container">
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
                    {label}
                  </div>
                ) : (
                  <div style={{ width: "65%" }} className="fields-container">
                    {label}
                    {field}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDocuments = (documents) => {
    if (!documents) return null;

    return (
      <div className="section-container">
        <h2 className="section-title">{t("DOCUMENTS")}</h2>
        <div className="section-content">
          {Object.entries(documents).map(([docType, files]) => {
            if (!files || !files.length) return null;

            return (
              <div key={docType} className="fields-container">
                <div className="field-label" style={{ width: "65%"}}>
                  {t(docType)}
                </div>
                <div className="field-value" style={{ width: "45%" }}>
                  {files.map(([fileName, fileData], index) => (
                    <div key={index} className="document-item">
                      <svg width="27" height="34" viewBox="0 0 27 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M16.8337 0.333374H3.50033C1.66699 0.333374 0.183659 1.83337 0.183659 3.66671L0.166992 30.3334C0.166992 32.1667 1.65033 33.6667 3.48366 33.6667H23.5003C25.3337 33.6667 26.8337 32.1667 26.8337 30.3334V10.3334L16.8337 0.333374ZM20.167 27H6.83366V23.6667H20.167V27ZM20.167 20.3334H6.83366V17H20.167V20.3334ZM15.167 12V2.83337L24.3337 12H15.167Z"
                          fill="#505A5F"
                        />
                      </svg>

                      <span className="file-name">{t(fileName)}</span>
                      <div className="footer-buttons-wrapper">
                        <button
                          style={{ width: "auto", marginLeft: "auto" }}
                          className="digit-submit-bar previous-btn"
                          onClick={() => downloadFile(fileData?.fileStoreId?.fileStoreId)}
                        >
                          <svg width="12" height="15" viewBox="0 0 12 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M11.8337 5.5H8.50033V0.5H3.50033V5.5H0.166992L6.00033 11.3333L11.8337 5.5ZM0.166992 13V14.6667H11.8337V13H0.166992Z"
                              fill="#22a4d9"
                            />
                          </svg>

                          <h2 style={{ fontSize: "16px", fontWeight: "500", color: "#22a4d9" }}>{t(`${serviceCode}_DOWNLOAD`)}</h2>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card style={{ borderRadius: "1rem" }}>
      <CardHeader style={{ marginLeft: "12px" }}>{t(`BPA_BPA_PCO_SUMMARY`)}</CardHeader>
      <div style={{ padding: "16px" }}>
        {renderSection(formData.applicantDetails, "BPA_BPA_PCO_APPLICANTDETAILS")}
        {renderSection(formData.landandProjectDesignDetails, "BPA_BPA_PCO_LANDANDPROJECTDESIGNDETAILS")}
        {renderSection(formData.designOfficeDetailing, "BPA_BPA_PCO_DESIGNOFFICEDETAILING")}
        {renderDocuments(formData.uploadedDocs)}
        
        {/* Document Attestation Checkbox */}
        <div className="mt-8 p-5 bg-gray-50 border-2 border-gray-300 rounded-lg">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="documentAttestation"
              checked={documentAttestation}
              onChange={(e) => setDocumentAttestation(e.target.checked)}
              className="w-6 h-6 min-w-[24px] mt-1 cursor-pointer accent-[#22a4d9]"
            />
            <label htmlFor="documentAttestation" className="flex-1 text-gray-900 text-base leading-relaxed cursor-pointer select-none">
              <strong className="block mb-3 text-[17px] text-gray-900">J'atteste avoir soumis :</strong>
              <ul className="m-0 pl-5 list-disc">
                <li className="mb-2 text-gray-700 text-[15px]">des documents légaux et conformes</li>
                <li className="mb-2 text-gray-700 text-[15px]">des documents scannés clairs, lisible et d'une qualité de résolution optimale ;</li>
                <li className="mb-2 text-gray-700 text-[15px]">chaque document à son emplacement spécifique ;</li>
                <li className="mb-2 text-gray-700 text-[15px]">un fichier en format AutoCAD (*.DWG) ou ArchiCAD (*.PLN) fonctionnel, à échelle correcte et ne contenant que les plans de ce projet de manière ordonnée.</li>
              </ul>
            </label>
          </div>
          {!documentAttestation && (
            <div className="mt-3 px-3 py-2 bg-yellow-50 border border-yellow-400 rounded text-yellow-800 text-sm font-medium">
              Veuillez cocher cette attestation pour continuer
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end mt-8">
        <div className="footer-buttons-wrapper">
          <button style={{ width: "auto", marginLeft: "auto" }} className="digit-submit-bar previous-btn" onClick={onPrevious}>
            <h2 style={{ fontSize: "16px", fontWeight: "500", color: "#22a4d9" }}>{t(`${serviceCode}_PREVIOUS`)}</h2>
          </button>
          <button 
            className="digit-submit-bar digit-formcomposer-submitbar" 
            style={{ marginLeft: "0", opacity: documentAttestation ? 1 : 0.5, cursor: documentAttestation ? 'pointer' : 'not-allowed' }} 
            onClick={() => {
              if (documentAttestation) {
                const dataWithAttestation = {
                  ...formData,
                  documentAttestation: documentAttestation
                };
                onSubmit(dataWithAttestation);
              }
            }}
            disabled={!documentAttestation}
          >
            <h2 style={{ fontSize: "16px", fontWeight: "500", color: "#fff" }}>{t(`${serviceCode}_APPLY`)}</h2>
          </button>
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
          text-align: center;
        }
        .file-name {
          color: #505a5f !important;
        }
        .file-id {
          color: #505a5f;
          font-size: 0.9em;
        }
      `}</style>
    </Card>
  );
};

export default SummaryView;
