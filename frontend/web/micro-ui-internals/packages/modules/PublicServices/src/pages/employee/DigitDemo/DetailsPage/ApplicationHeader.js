import React from "react";
import { LuUser, LuMapPin, LuCalendar, LuClock, LuFileCheck2 } from "react-icons/lu";
import StatusBadge from "./StatusBadge";
import InfoCard from "./InfoCard";
import ActionButtons from "./ActionButtons";
import { useTranslation } from "react-i18next";
import { getDisplayApplicationId, getDisplayApplicantName } from "../../../employee/applications/utils";
import { getFileUrl } from "./utils/fileUtils";

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

  const isPermitGranted = processInstanceState === "PERMIT_GRANTED" || processInstanceState === "CERTIFICATE_GRANTED" || processInstanceState === "CERTIFICATE_ISSUED" || processInstanceState === "APPROVED";

  const signedPermit = response?.additionalDetails?.signedPermit || null;
  const hasSignedPermit = Boolean(signedPermit && signedPermit.fileStoreId);

  const handleSignedPermitDownload = async () => {
    if (!signedPermit?.fileStoreId) return;
    try {
      const url = await getFileUrl(signedPermit.fileStoreId, tenantId);
      if (!url) {
        if (Digit.Toast) Digit.Toast.error("Impossible de récupérer le permis signé");
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.error("Error downloading signed permit:", e);
      if (Digit.Toast) Digit.Toast.error("Erreur lors du téléchargement du permis signé");
    }
  };

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
  const terrainDetailsFirst = response && response.serviceDetails && response.serviceDetails.terrainDetails && response.serviceDetails.terrainDetails[0];
  const landProjectDetailsFirst = response && response.serviceDetails && response.serviceDetails.landandProjectDesignDetails && response.serviceDetails.landandProjectDesignDetails[0];
  const propertyDetailsFirst = response && response.serviceDetails && response.serviceDetails.propertyDetails && response.serviceDetails.propertyDetails[0];
  const originalPermitFirst = response && response.serviceDetails && response.serviceDetails.originalPermitDetails && response.serviceDetails.originalPermitDetails[0];
  const projectDetailsFirst = response && response.serviceDetails && response.serviceDetails.projectDetails && response.serviceDetails.projectDetails[0];
  const terrainVerifFirst = response && response.serviceDetails && response.serviceDetails.terrainVerificationDetails && response.serviceDetails.terrainVerificationDetails[0];
  const terrainLocationRaw =
    (terrainDetailsFirst && terrainDetailsFirst.terrainLocation) ||
    (landProjectDetailsFirst && landProjectDetailsFirst.siteLocation) ||
    (propertyDetailsFirst && (propertyDetailsFirst.constructionLocation || propertyDetailsFirst.propertyLocation)) ||
    (originalPermitFirst && (originalPermitFirst.localisation || originalPermitFirst.location)) ||
    (projectDetailsFirst && (projectDetailsFirst.projectLocation || projectDetailsFirst.location)) ||
    (terrainVerifFirst && (terrainVerifFirst.terrainLocation || terrainVerifFirst.location)) ||
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
  // NOTE: We intentionally do NOT fall back to address.boundarycode anymore — that
  // returns useless values like "dj.city" which aren't real regions.
  const regionRaw =
    (terrainDetailsFirst && terrainDetailsFirst.region) ||
    (landProjectDetailsFirst && landProjectDetailsFirst.region) ||
    (projectDetails && projectDetails.region);
  const region =
    typeof regionRaw === "string"
      ? regionRaw
      : regionRaw && typeof regionRaw === "object"
        ? regionRaw.name || regionRaw.code || ""
        : "";
  const hasRegion = Boolean(region && region.trim());

  return (
    <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl shadow-lg shadow-primary/25 p-6 border border-primary/20 hover:shadow-xl transition-all duration-300 text-white">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {/* Once the relevant Fiche/PV is filled with a permit or
                  certificate number, show that as the primary title instead
                  of the raw internal application number. Supported fiches:
                  PCO/PCS/PF/PD/ATARR/PV (pcoNumber), CCG (ccgNumber). The
                  application number stays as a subtitle for traceability. */}
              <h1 className="text-2xl font-bold text-white">
                {getDisplayApplicationId(response)}
              </h1>
              <StatusBadge state={response?.processInstance?.[0]?.state?.state} isCitizen={isCitizen} />
            </div>
            {(() => {
              const displayId = getDisplayApplicationId(response);
              const hasFicheNumber = displayId && displayId !== response?.applicationNumber;
              return hasFicheNumber ? (
                <p className="text-xs text-white/70 mb-1">
                  Dossier : {response?.applicationNumber}
                </p>
              ) : null;
            })()}
            <h2 className="text-xl font-semibold text-white mb-1">
              {serviceInfo.name}
            </h2>
          </div>
        </div>

        {/* Action Buttons - Top Right */}
        {!isCitizen ? (
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
        ) : (
          isPermitGranted && (
            hasSignedPermit ? (
              <button
                onClick={handleSignedPermitDownload}
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/30"
                title={signedPermit.fileName}
              >
                <LuFileCheck2 className="h-4 w-4" />
                {({
                  BPA_PCO: "Télécharger le Permis de Construire signé",
                  BPA_PCO_SIMPLE: "Télécharger le Permis de Construire signé",
                  BPA_PR: "Télécharger le Permis de Remblai signé",
                  BPA_PL: "Télécharger le Permis de Lotir signé",
                  BPA_PCS: "Télécharger le Permis de Construire Simplifié signé",
                  BPA_PD: "Télécharger le Permis de Démolir signé",
                  BPA_PF: "Télécharger le Permis de Clôture signé",
                  BPA_PS: "Télécharger le Permis de Surélévation signé",
                  BPA_ATARR: "Télécharger l'Autorisation de Travaux signée",
                  BPA_CCR: "Télécharger le Certificat de Conformité de Remblai signé",
                  BPA_CCE: "Télécharger le Certificat de Conformité Électrique signé",
                  BPA_CCP: "Télécharger le Certificat de Conformité Parasismique signé",
                  BPA_CCG: "Télécharger le Certificat de Conformité Général signé",
                  BPA_PV: "Télécharger le Procès-Verbal d'Implantation signé",
                  BPA_APE: "Télécharger l'Approbation du Plan d'Exécution signée",
                })[response?.businessService] || "Télécharger le document signé"}
              </button>
            ) : (
              <div
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2.5 text-sm font-medium text-white/80"
                title="Le document signé sera disponible une fois téléversé par l'administration."
              >
                <LuClock className="h-4 w-4" />
                Document signé en cours de préparation
              </div>
            )
          )
        )}
      </div>

      <div className="my-3">
        <InfoCard
          icon={LuUser}
          iconBgColor="bg-white/20"
          iconColor="text-white"
          label="Demandeur"
          value={`Nom et prénom : ${getDisplayApplicantName(response) || applicant?.name || "N/A"} | Téléphone : ${applicant?.prefix ? `+${applicant.prefix} ` : "+253 "}${applicant?.mobileNumber || "N/A"}`}
        />
      </div>

      {/* Key Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/20 pt-3">
        <InfoCard icon={LuMapPin} iconBgColor="bg-white/20" iconColor="text-white" label="Localisation de la parcelle" value={terrainLocation} />

        {hasRegion && (
          <InfoCard icon={LuMapPin} iconBgColor="bg-white/20" iconColor="text-white" label="Région" value={t(region)} />
        )}

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
