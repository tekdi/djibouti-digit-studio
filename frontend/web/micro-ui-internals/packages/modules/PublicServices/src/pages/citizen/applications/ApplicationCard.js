import React from "react";
import { 
  LuClock, 
  LuCircleCheck, 
  LuCalendar,
  LuMapPin,
  LuEye
} from "react-icons/lu";
import { getStatusInfo, getServiceInfo, formatDate } from "./utils";

const ApplicationCard = ({ app }) => {
  const statusInfo = getStatusInfo(app.processInstance?.[0]?.state?.applicationStatus);
  const StatusIcon = statusInfo.icon;
  const serviceInfo = getServiceInfo(app.businessService);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
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
          {serviceInfo.name}
        </h3>
        
        {/* Reference */}
        <p className="text-sm text-gray-500 mb-4">
          Réf. {serviceInfo.ref} • {app.applicationNumber}
        </p>
      </div>

      {/* Content */}
      <div className="p-4 pt-0">
        <div className="space-y-4">
          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progression</span>
              <span className="text-sm font-medium text-gray-900">{statusInfo.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${statusInfo.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Current Step */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <LuClock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 underline">
                Étape actuelle
              </p>
              <p className="text-xs text-gray-600">
                {statusInfo.label === "Brouillon" ? "Saisie des informations" :
                 statusInfo.label === "En cours d'examen" ? "Vérification des documents" :
                 statusInfo.label === "Permis Accordé" ? "Permis délivré" :
                 statusInfo.label === "Permis Rejeté" ? "Demande rejetée" : "Traitement en cours"}
              </p>
            </div>
          </div>

          {/* Next Step */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <LuCircleCheck className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Prochaine étape
              </p>
              <p className="text-xs text-gray-600">
                {statusInfo.label === "Brouillon" ? "Soumission" :
                 statusInfo.label === "En cours d'examen" ? "Analyse technique" :
                 statusInfo.label === "Permis Accordé" ? "Permis disponible" :
                 statusInfo.label === "Permis Rejeté" ? "Nouvelle demande" : "Validation"}
              </p>
            </div>
          </div>

          {/* Created Date */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <LuCalendar className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Date de création
              </p>
              <p className="text-xs text-gray-600">
                {formatDate(app.auditDetails?.createdTime)}
              </p>
            </div>
          </div>

          {/* Location */}
          {app.serviceDetails?.landandProjectDesignDetails?.[0]?.region && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                <LuMapPin className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Localisation
                </p>
                <p className="text-xs text-gray-600">
                  {app.serviceDetails.landandProjectDesignDetails[0].region}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
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
