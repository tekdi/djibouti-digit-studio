import React from "react";
import { useTranslation } from "react-i18next";
import { LuFileText, LuDownload } from "react-icons/lu";

const DocumentsTab = ({ documents }) => {
  const { t } = useTranslation();

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const downloadFile = async (fileStoreId) => {
    try {
      const tenantId = Digit.ULBService.getCurrentTenantId();
      const response = await Digit.UploadServices.Filefetch([fileStoreId], tenantId);

      const urls = response?.data?.[fileStoreId];
      if (urls) {
        const firstUrl = urls.split(",")[0].trim();
        window.open(firstUrl, "_blank");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("DOCUMENTS")}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents?.map((doc, index) => (
          <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-bold">
                {index + 1}
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <LuFileText className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {t(doc.documentType)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(doc.auditDetails?.lastModifiedTime)}
                </p>
              </div>
            </div>
            <button
              onClick={() => downloadFile(doc.fileStoreId)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
            >
              <LuDownload className="w-4 h-4" />
              {t("DOWNLOAD")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentsTab;
