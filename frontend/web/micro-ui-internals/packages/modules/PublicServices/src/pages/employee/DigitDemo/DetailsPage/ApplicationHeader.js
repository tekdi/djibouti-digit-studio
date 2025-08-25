import React from "react";
import { LuUser, LuMapPin, LuCalendar, LuClock } from "react-icons/lu";
import StatusBadge from "./StatusBadge";
import InfoCard from "./InfoCard";
import { useTranslation } from "react-i18next";

const ApplicationHeader = ({ response, serviceInfo, projectDetails, applicant }) => {
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

  // Get address from additionalDetails
  const address = response?.additionalDetails?.applicants?.address || "N/A";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {response?.applicationNumber}
              </h1>
              <StatusBadge state={response?.processInstance?.[0]?.state?.state} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              {serviceInfo.name} - {serviceInfo.description}
            </h2>
            <p className="text-gray-600">
              Demande de {serviceInfo.name} pour un projet à {projectDetails?.siteLocation || projectDetails?.region || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Key Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-6 border-t border-gray-100">
        <InfoCard
          icon={LuUser}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
          label="Demandeur"
          value={`${applicant?.name} - +253 ${applicant?.mobileNumber}`}
        />
        
        <InfoCard
          icon={LuMapPin}
          iconBgColor="bg-green-50"
          iconColor="text-green-600"
          label="Région"
          value={t(projectDetails?.region)}
        />

        <InfoCard
          icon={LuMapPin}
          iconBgColor="bg-teal-50"
          iconColor="text-teal-600"
          label="Adresse"
          value={address}
        />
        
        <InfoCard
          icon={LuCalendar}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
          label="Soumis le"
          value={formatDate(response?.auditDetails?.createdTime)}
        />
        
        <InfoCard
          icon={LuClock}
          iconBgColor="bg-orange-50"
          iconColor="text-orange-600"
          label="Étape"
          value="2/11"
        />
      </div>
    </div>
  );
};

export default ApplicationHeader;
