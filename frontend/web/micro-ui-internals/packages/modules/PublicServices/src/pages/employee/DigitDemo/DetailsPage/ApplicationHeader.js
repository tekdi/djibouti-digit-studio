import React from "react";
import { LuUser, LuMapPin, LuCalendar, LuClock } from "react-icons/lu";
import StatusBadge from "./StatusBadge";
import InfoCard from "./InfoCard";
import { useTranslation } from "react-i18next";

const ApplicationHeader = ({ response, serviceInfo, projectDetails, applicant, isCitizen = false }) => {
  const { t } = useTranslation();
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Get address from additionalDetails
  const address = response?.additionalDetails?.applicants?.address || "N/A";

  return (
    <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl shadow-lg shadow-primary/25 p-6 border border-primary/20 hover:shadow-xl transition-all duration-300 text-white">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{response?.applicationNumber}</h1>
              <StatusBadge state={response?.processInstance?.[0]?.state?.state} isCitizen={isCitizen} />
            </div>
            <h2 className="text-xl font-semibold text-white mb-1">
              Demande de {serviceInfo.name} pour un projet à {t(projectDetails?.siteLocation) || t(projectDetails?.region) || "Non précisé"}
            </h2>
          </div>
        </div>
      </div>

      <div className="my-3">
        <InfoCard
          icon={LuUser}
          iconBgColor="bg-white/20"
          iconColor="text-white"
          label="Demandeur"
          value={`${applicant?.name} - +253 ${applicant?.mobileNumber}`}
        />
      </div>

      {/* Key Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/20 pt-3">
        <InfoCard icon={LuMapPin} iconBgColor="bg-white/20" iconColor="text-white" label="Région" value={t(projectDetails?.region)} />

        <InfoCard icon={LuMapPin} iconBgColor="bg-white/20" iconColor="text-white" label="Adresse" value={address} />

        <InfoCard
          icon={LuCalendar}
          iconBgColor="bg-white/20"
          iconColor="text-white"
          label="Soumis le"
          value={formatDate(response?.auditDetails?.createdTime)}
        />

        <InfoCard icon={LuClock} iconBgColor="bg-white/20" iconColor="text-white" label="Étape" value="2/11" />
      </div>
    </div>
  );
};

export default ApplicationHeader;
