import React from "react";

const InfoCard = ({ icon: Icon, iconBgColor, iconColor, label, value, className = "" }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`p-2 ${iconBgColor} rounded-lg`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value || "N/A"}</p>
      </div>
    </div>
  );
};

export default InfoCard;
