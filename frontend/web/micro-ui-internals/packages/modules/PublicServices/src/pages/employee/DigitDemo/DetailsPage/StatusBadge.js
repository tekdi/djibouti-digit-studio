import React from "react";
import { getStatusInfo, getSimplifiedStatus } from "../../applications/utils";

const StatusBadge = ({ state, isCitizen = false }) => {
  if (isCitizen) {
    const simplifiedStatus = getSimplifiedStatus(state);
    const getSimplifiedStatusInfo = (status) => {
      switch (status) {
        case "approved":
        case "completed":
          return { color: "text-emerald-700", bgColor: "bg-emerald-50", label: "Approuvé" };
        case "rejected":
          return { color: "text-red-700", bgColor: "bg-red-50", label: "Rejeté" };
        case "payment_pending":
          return { color: "text-amber-700", bgColor: "bg-amber-50", label: "Paiement en attente" };
        case "cancelled":
        case "expired":
          return { color: "text-gray-600", bgColor: "bg-gray-100", label: "Annulé" };
        default:
          return { color: "text-blue-700", bgColor: "bg-blue-50", label: "En cours" };
      }
    };
    const info = getSimplifiedStatusInfo(simplifiedStatus);
    return (
      <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold ${info.bgColor} ${info.color}`}>
        {info.label}
      </span>
    );
  }

  const statusInfo = getStatusInfo(state);
  const StatusIcon = statusInfo.icon;

  return (
    <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold ${statusInfo.bgColor} ${statusInfo.color}`}>
      {StatusIcon && <StatusIcon className="w-3 h-3" />}
      {statusInfo.label}
    </span>
  );
};

export default StatusBadge;
