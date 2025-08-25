import React from "react";
import { useTranslation } from "react-i18next";
import { LuInfo } from "react-icons/lu";

const NoServicesMessage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-16 h-16 bg-djibouti-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
          <LuInfo className="w-8 h-8 text-djibouti-primary" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t("NO_SERVICES_AVAILABLE")}</h2>
        <p className="text-gray-600">Aucun service n'est actuellement disponible.</p>
      </div>
    </div>
  );
};

export default NoServicesMessage;
