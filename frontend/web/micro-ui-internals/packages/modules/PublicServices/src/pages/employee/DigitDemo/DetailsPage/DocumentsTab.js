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

      if (response?.data?.[fileStoreId]) {
        window.open(response.data[fileStoreId], "_blank");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("DOCUMENTS")}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents?.map((doc, index) => (
          <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <LuFileText className="w-4 h-4 text-blue-600" />
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
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
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
