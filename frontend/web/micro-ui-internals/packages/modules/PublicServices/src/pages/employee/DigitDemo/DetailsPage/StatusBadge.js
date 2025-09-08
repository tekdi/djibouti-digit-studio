import React from "react";
import { getStatusInfo, getSimplifiedStatus } from "../../applications/utils";

const StatusBadge = ({ state, isCitizen = false }) => {
  // For citizens, use simplified status
  if (isCitizen) {
    const simplifiedStatus = getSimplifiedStatus(state);
    const getSimplifiedStatusInfo = (status) => {
      switch (status) {
        case "approved":
        case "completed":
          return { 
            color: "text-green-600", 
            bgColor: "bg-green-50", 
            label: "Approuvé"
          };
        case "rejected":
          return { 
            color: "text-red-600", 
            bgColor: "bg-red-50", 
            label: "Rejeté"
          };
        case "payment_pending":
          return { 
            color: "text-orange-600", 
            bgColor: "bg-orange-50", 
            label: "Paiement en attente"
          };
        case "cancelled":
        case "expired":
          return { 
            color: "text-gray-600", 
            bgColor: "bg-gray-50", 
            label: "Annulé"
          };
        default:
          return { 
            color: "text-blue-600", 
            bgColor: "bg-blue-50", 
            label: "En cours d'examen"
          };
      }
    };

    const statusInfo = getSimplifiedStatusInfo(simplifiedStatus);
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full ${statusInfo.bgColor}`}>
        <span className={`text-sm font-medium ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </div>
    );
  }

  // For employees, use detailed status from utils.js
  const statusInfo = getStatusInfo(state);
  const StatusIcon = statusInfo.icon;

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full ${statusInfo.bgColor}`}>
      <StatusIcon className={`w-4 h-4 mr-2 ${statusInfo.color}`} />
      <span className={`text-sm font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    </div>
  );
};

export default StatusBadge;

