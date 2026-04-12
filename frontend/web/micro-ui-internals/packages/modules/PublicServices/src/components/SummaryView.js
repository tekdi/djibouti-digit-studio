import React, { useState } from "react";
import { LuFileText, LuDownload, LuCheck, LuArrowLeft, LuSend, LuTriangleAlert } from "react-icons/lu";

const SummaryView = ({ formData, t, serviceCode, onSubmit, onPrevious }) => {
  const [documentAttestation, setDocumentAttestation] = useState(false);

  const downloadFile = async (fileStoreId) => {
    try {
      const tenantId = Digit.ULBService.getCurrentTenantId();
      const response = await Digit.UploadServices.Filefetch([fileStoreId], tenantId);
      const urls = response?.data?.[fileStoreId];
      if (urls) {
        // API may return comma-separated URLs (original,large,medium,small) — use only the first one
        const firstUrl = urls.split(",")[0].trim();
        window.open(firstUrl, "_blank");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const renderValue = (value) => {
    if (!value) return "-";
    if (typeof value === "boolean") return value ? "checked" : "unchecked";
    if (typeof value === "object") {
      if (value.name) return t(value.name);
      return value.code || "-";
    }
    return value;
  };

  const renderSection = (data, sectionTitle) => {
    if (!data || !data[0]) return null;
    const entries = Object.entries(data[0]);

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          {t(sectionTitle)}
        </h3>
        <div className="space-y-1">
          {entries.map(([key, value]) => {
            const rendered = renderValue(value);
            const label = t(serviceCode + "_" + key.toUpperCase());

            if (rendered === "checked") {
              return (
                <div key={key} className="flex items-center gap-2 py-2 px-3 rounded-lg bg-emerald-50">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500">
                    <LuCheck className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-sm text-gray-700">{label}</span>
                </div>
              );
            }

            if (rendered === "unchecked") return null;

            return (
              <div key={key} className="flex items-start justify-between gap-4 py-3 px-3 rounded-lg even:bg-gray-50">
                <span className="text-sm font-medium text-gray-500 min-w-0 flex-shrink-0 w-2/5">
                  {label}
                </span>
                <span className="text-sm text-gray-900 text-right break-words min-w-0 flex-1">
                  {rendered}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDocuments = (documents) => {
    if (!documents) return null;
    const allDocs = Object.entries(documents).filter(([, files]) => files && files.length > 0);
    if (allDocs.length === 0) return null;

    let docIndex = 0;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          {t("DOCUMENTS")}
        </h3>
        <div className="space-y-3">
          {allDocs.map(([docType, files]) =>
            files.map(([fileName, fileData], fileIdx) => {
              docIndex += 1;
              return (
                <div
                  key={`${docType}-${fileIdx}`}
                  className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-djibouti-primary/10 text-sm font-bold text-djibouti-primary">
                    {docIndex}
                  </div>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <LuFileText className="h-5 w-5 flex-shrink-0 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{t(docType)}</p>
                      <p className="text-xs text-gray-500 truncate">{t(fileName)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadFile(fileData?.fileStoreId?.fileStoreId)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-djibouti-primary/30 bg-djibouti-primary/5 px-3 py-1.5 text-xs font-semibold text-djibouti-primary transition-all duration-200 hover:bg-djibouti-primary/10 flex-shrink-0"
                  >
                    <LuDownload className="h-3.5 w-3.5" />
                    {t(`${serviceCode}_DOWNLOAD`)}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // Collect all section keys from formData (excluding uploadedDocs and non-array sections)
  const sectionKeys = Object.keys(formData).filter(
    (key) => key !== "uploadedDocs" && key !== "documentAttestation" && Array.isArray(formData[key])
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-blue-100">
        <h2 className="text-2xl font-bold text-gray-900">{t("BPA_BPA_PCO_SUMMARY")}</h2>
        <p className="text-gray-500 text-sm mt-1">Vérifiez les informations avant de soumettre votre demande</p>
      </div>

      {/* Sections */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        {sectionKeys.map((key) => (
          <div key={key}>
            {renderSection(formData[key], `BPA_BPA_PCO_${key.toUpperCase()}`)}
          </div>
        ))}
        {renderDocuments(formData.uploadedDocs)}
      </div>

      {/* Attestation */}
      <div className={`rounded-2xl border-2 p-6 mb-6 transition-all duration-300 ${
        documentAttestation
          ? "border-emerald-300 bg-emerald-50/50"
          : "border-amber-300 bg-amber-50/50"
      }`}>
        <div className="flex items-start gap-4">
          <label className="relative flex-shrink-0 mt-0.5 cursor-pointer">
            <input
              type="checkbox"
              checked={documentAttestation}
              onChange={(e) => setDocumentAttestation(e.target.checked)}
              className="peer sr-only"
            />
            <div className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all duration-200 ${
              documentAttestation
                ? "border-emerald-500 bg-emerald-500"
                : "border-gray-300 bg-white"
            }`}>
              {documentAttestation && <LuCheck className="h-4 w-4 text-white" />}
            </div>
          </label>
          <label
            onClick={() => setDocumentAttestation(!documentAttestation)}
            className="flex-1 cursor-pointer select-none"
          >
            <p className="font-semibold text-gray-900 mb-2">J'atteste avoir soumis :</p>
            <ul className="space-y-1.5 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                des documents légaux et conformes
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                des documents scannés clairs, lisibles et d'une qualité de résolution optimale
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                chaque document à son emplacement spécifique
              </li>
              {!serviceCode.includes("CCR") && (
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                  un fichier en format AutoCAD (*.DWG) ou ArchiCAD (*.PLN) fonctionnel, à échelle correcte et ne contenant que les plans de ce projet
                </li>
              )}
            </ul>
          </label>
        </div>
        {!documentAttestation && (
          <div className="flex items-center gap-2 mt-4 px-3 py-2 rounded-lg bg-amber-100 text-amber-800 text-sm font-medium">
            <LuTriangleAlert className="h-4 w-4 flex-shrink-0" />
            Veuillez cocher cette attestation pour continuer
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <button
          onClick={onPrevious}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:border-gray-400"
        >
          <LuArrowLeft className="h-4 w-4" />
          {t(`${serviceCode}_PREVIOUS`)}
        </button>
        <button
          onClick={() => {
            if (documentAttestation) {
              onSubmit({ ...formData, documentAttestation });
            }
          }}
          disabled={!documentAttestation}
          className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 ${
            documentAttestation
              ? "bg-djibouti-primary hover:bg-djibouti-primary-dark hover:shadow-lg cursor-pointer"
              : "bg-gray-300 cursor-not-allowed shadow-none"
          }`}
        >
          <LuSend className="h-4 w-4" />
          {t(`${serviceCode}_APPLY`)}
        </button>
      </div>
    </div>
  );
};

export default SummaryView;
