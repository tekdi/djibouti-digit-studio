import React from "react";
import { LuTrendingUp, LuTrendingDown } from "react-icons/lu";

const StatsCard = ({ title, value, icon: Icon, change, gradient }) => {
  return (
    <div className="rounded-xl shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-md hover:-translate-y-1">
      <div className={`bg-gradient-to-r ${gradient} p-4`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">{title}</p>
            <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
          </div>
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm border border-white/10">
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="mt-2 text-xs text-white/80 flex items-center gap-0.5">
          {change.isPositive ? (
            <LuTrendingUp className="w-3 h-3" />
          ) : (
            <LuTrendingDown className="w-3 h-3" />
          )}
          <span>{Math.abs(change.value)}% ce mois</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;



