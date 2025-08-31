import React from "react";
import { LuFolder, LuClock, LuCircleAlert } from "react-icons/lu";

const InProgressStatisticsCards = ({ applications, totalCount }) => {
  // Calculate statistics for in-progress applications
  const totalInProgressCount = applications.length;
  
  const inProcessingCount = applications.filter(
    (app) => {
      const status = app.ProcessInstance?.state?.applicationStatus;
      // Applications that are actively being processed (not waiting for info)
      return status !== "PENDING_ACTION_BY_ARCHITECT" && 
             status !== "PENDING_ACTION_BY_CITIZEN" &&
             status !== "AGENT_NOT_ASSIGNED" &&
             status !== "PERMIT_GRANTED" &&
             status !== "CERTIFICATE_GRANTED";
    }
  ).length;

  const awaitingInfoCount = applications.filter(
    (app) => {
      const status = app.ProcessInstance?.state?.applicationStatus;
      // Applications waiting for information from architect or citizen
      return status === "PENDING_ACTION_BY_ARCHITECT" || 
             status === "PENDING_ACTION_BY_CITIZEN";
    }
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Total en cours Card */}
      <div className="rounded-xl shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-md hover:-translate-y-1">
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Total en cours</p>
              <h3 className="text-2xl font-bold text-white mt-1">{totalInProgressCount}</h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm border border-white/10">
              <LuFolder className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-2 text-xs text-white/80 flex items-center gap-0.5">
            <span>Assignés aux agents</span>
          </div>
        </div>
      </div>

      {/* En traitement Card */}
      <div className="rounded-xl shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-md hover:-translate-y-1">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">En traitement</p>
              <h3 className="text-2xl font-bold text-white mt-1">{inProcessingCount}</h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm border border-white/10">
              <LuClock className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-2 text-xs text-white/80 flex items-center gap-0.5">
            <span>Traitement actif</span>
          </div>
        </div>
      </div>

      {/* En attente d'infos Card */}
      <div className="rounded-xl shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-md hover:-translate-y-1">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">En attente d'infos</p>
              <h3 className="text-2xl font-bold text-white mt-1">{awaitingInfoCount}</h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm border border-white/10">
              <LuCircleAlert className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-2 text-xs text-white/80 flex items-center gap-0.5">
            <span>Documents manquants</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InProgressStatisticsCards;
