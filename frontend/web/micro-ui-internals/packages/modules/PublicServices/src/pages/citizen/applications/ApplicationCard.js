import React from "react";
import { 
  LuClock, 
  LuCalendar,
  LuMapPin,
  LuUser,
  LuEye
} from "react-icons/lu";
import { getStatusInfo, getServiceInfo, getSimplifiedStatus, formatDate } from "./utils";
import { useTranslation } from "react-i18next";

const ApplicationCard = ({ app }) => {
  const { t } = useTranslation();
  const applicationStatus = app.processInstance?.[0]?.state?.applicationStatus;
  const statusInfo = getStatusInfo(applicationStatus, app.businessService);
  const StatusIcon = statusInfo.icon;
  const serviceInfo = getServiceInfo(app.businessService);
  const simplifiedStatus = getSimplifiedStatus(applicationStatus);
  const isCompleted = simplifiedStatus === "granted" || simplifiedStatus === "rejected";
  const displayDate = isCompleted ? app.auditDetails?.lastModifiedTime : app.auditDetails?.createdTime;
  const dateLabel = simplifiedStatus === "granted" ? "Date de délivrance" : simplifiedStatus === "rejected" ? "Date de clôture" : "Date de création";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* Header with status tag only */}
      <div className="p-4 pb-0 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className={`px-3 py-1 rounded-full ${statusInfo.bgColor} border ${statusInfo.color.replace('text-', 'border-')}`}>
            <div className="flex items-center gap-1">
              <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
              <span className={`text-xs font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>
        
        {/* Title - Service Name */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
        {serviceInfo.ref} - {serviceInfo.name}
        </h3>
        
        {/* Reference */}
        <p className="text-sm text-gray-500 mb-4">
          Réf • {app.applicationNumber}
        </p>
      </div>

      {/* Content - This will flex to fill available space */}
      <div className="p-4 pt-0 flex-1 flex flex-col">
        <div className="space-y-4 flex-1">
          {/* Current Step */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <LuClock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Étape actuelle
              </p>
              <p className="text-xs text-gray-600">
                {statusInfo.stepSubtext != null ? statusInfo.stepSubtext : statusInfo.label}
              </p>
            </div>
          </div>

          {/* Date (creation or closure depending on status) */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <LuCalendar className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {dateLabel}
              </p>
              <p className="text-xs text-gray-600">
                {formatDate(displayDate)}
              </p>
            </div>
          </div>

          {/* Applicant Name */}
          {app.applicants?.[0]?.name && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                <LuUser className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Nom du demandeur
                </p> 
                <p className="text-xs text-gray-600">
                  {app.applicants[0].name}
                </p>
              </div>
            </div>
          )}

          {/* Location */}
          {app.serviceDetails?.landandProjectDesignDetails?.[0]?.siteLocation && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                <LuMapPin className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Localisation de la parcelle
                </p>
                <p className="text-xs text-gray-600">
                  {app.serviceDetails.landandProjectDesignDetails[0].siteLocation}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions - This will always be at the bottom */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <a 
            href={`/${window.contextPath}/citizen/publicservices/BPA/${app.businessService}/ViewScreen?applicationNumber=${app.applicationNumber}&serviceCode=${app.serviceCode}&businessService=${app.businessService}`}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-djibouti-primary text-white rounded-xl hover:bg-djibouti-primary-dark transition-colors duration-200"
          >
            <span>Voir les détails</span>
            <LuEye className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ApplicationCard;
