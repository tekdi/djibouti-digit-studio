import React from "react";
import { LuUser, LuMapPin, LuCalendar, LuClock } from "react-icons/lu";
import StatusBadge from "./StatusBadge";
import InfoCard from "./InfoCard";
import ActionButtons from "./ActionButtons";
import { useTranslation } from "react-i18next";

const ApplicationHeader = ({ 
  response, 
  serviceInfo, 
  projectDetails, 
  applicant, 
  isCitizen = false,
  // Action button props
  selectedBusinessService,
  matchedBusinessServices,
  setSelectedBusinessService,
  queryStrings,
  tenantId,
  serviceConfig,
  processInstanceState,
  isDownloadButtonEnable,
  service
}) => {
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

  // Localisation de la parcelle: support multiple application types
  // - terrainDetails.terrainLocation for BPA_PR
  // - landandProjectDesignDetails.siteLocation for PCO_SIMPLE
  // - additionalDetails.applicants.address for others
  const terrainDetailsFirst = response && response.serviceDetails && response.serviceDetails.terrainDetails && response.serviceDetails.terrainDetails[0];
  const landProjectDetailsFirst = response && response.serviceDetails && response.serviceDetails.landandProjectDesignDetails && response.serviceDetails.landandProjectDesignDetails[0];
  const terrainLocationRaw =
    (terrainDetailsFirst && terrainDetailsFirst.terrainLocation) ||
    (landProjectDetailsFirst && landProjectDetailsFirst.siteLocation) ||
    (response && response.additionalDetails && response.additionalDetails.applicants && response.additionalDetails.applicants.address);
  const terrainLocation =
    typeof terrainLocationRaw === "string"
      ? (terrainLocationRaw || "N/A")
      : terrainLocationRaw && typeof terrainLocationRaw === "object"
        ? [terrainLocationRaw.addressLine1, terrainLocationRaw.detail, terrainLocationRaw.city].filter(Boolean).join(", ") || "N/A"
        : "N/A";

  // Région: support multiple application types
  // - terrainDetails.region for BPA_PR
  // - landandProjectDesignDetails.region for PCO_SIMPLE
  // - projectDetails.region for others
  const regionRaw =
    (terrainDetailsFirst && terrainDetailsFirst.region) ||
    (landProjectDetailsFirst && landProjectDetailsFirst.region) ||
    (projectDetails && projectDetails.region);
  const region =
    typeof regionRaw === "string"
      ? (regionRaw || "N/A")
      : regionRaw && typeof regionRaw === "object"
        ? regionRaw.name || regionRaw.code || "N/A"
        : "N/A";

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
              {serviceInfo.name} 
            </h2>
          </div>
        </div>

        {/* Action Buttons - Top Right */}
        {!isCitizen && (
          <ActionButtons
            isCitizen={isCitizen}
            selectedBusinessService={selectedBusinessService}
            matchedBusinessServices={matchedBusinessServices}
            setSelectedBusinessService={setSelectedBusinessService}
            response={response}
            queryStrings={queryStrings}
            tenantId={tenantId}
            serviceConfig={serviceConfig}
            processInstanceState={processInstanceState}
            isDownloadButtonEnable={isDownloadButtonEnable}
            service={service}
          />
        )}
      </div>

      <div className="my-3">
        <InfoCard
          icon={LuUser}
          iconBgColor="bg-white/20"
          iconColor="text-white"
          label="Demandeur"
          value={`Nom et prénom : ${applicant?.name} | Téléphone : +253 ${applicant?.mobileNumber}`}
        />
      </div>

      {/* Key Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/20 pt-3">
        <InfoCard icon={LuMapPin} iconBgColor="bg-white/20" iconColor="text-white" label="Localisation de la parcelle" value={terrainLocation} />

        <InfoCard icon={LuMapPin} iconBgColor="bg-white/20" iconColor="text-white" label="Région" value={t(region)} />

        <InfoCard
          icon={LuCalendar}
          iconBgColor="bg-white/20"
          iconColor="text-white"
          label="Soumis le"
          value={formatDate(response?.auditDetails?.createdTime)}
        />
      </div>
    </div>
  );
};

export default ApplicationHeader;
