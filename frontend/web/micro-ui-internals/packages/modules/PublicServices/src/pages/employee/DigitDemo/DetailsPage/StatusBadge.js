import React from "react";
import { 
  LuCircleCheck, 
  LuCircleAlert, 
  LuFileText, 
  LuClock 
} from "react-icons/lu";

const StatusBadge = ({ state }) => {
  const getStatusInfo = (state) => {
    switch (state) {
      case "PERMIT_GRANTED":
        return { 
          color: "text-green-600", 
          bgColor: "bg-green-50", 
          icon: LuCircleCheck, 
          label: "Permis Accordé"
        };
      case "PERMIT_REJECTED":
        return { 
          color: "text-red-600", 
          bgColor: "bg-red-50", 
          icon: LuCircleAlert, 
          label: "Permis Rejeté"
        };
      case "INITIATED":
        return { 
          color: "text-gray-600", 
          bgColor: "bg-gray-50", 
          icon: LuFileText, 
          label: "Brouillon"
        };
      default:
        return { 
          color: "text-blue-600", 
          bgColor: "bg-blue-50", 
          icon: LuClock, 
          label: "En cours d'examen"
        };
    }
  };

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
