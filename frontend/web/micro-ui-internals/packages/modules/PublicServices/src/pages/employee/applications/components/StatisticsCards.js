import React from "react";
import { LuFolder, LuCircle, LuClock, LuCircleCheck } from "react-icons/lu";

const StatisticsCards = ({ applications, totalCount }) => {
  const newStatuses = ["AGENT_NOT_ASSIGNED", "APPLICATION_SUBMITTED"];
  const completedStatuses = ["PERMIT_GRANTED", "CERTIFICATE_GRANTED"];

  const newApplicationsCount = applications.filter(
    (app) => newStatuses.includes(app.ProcessInstance?.state?.applicationStatus)
  ).length;

  const inProgressCount = applications.filter(
    (app) => {
      const status = app.ProcessInstance?.state?.applicationStatus;
      return !newStatuses.includes(status) && !completedStatuses.includes(status);
    }
  ).length;

  const approvedCount = applications.filter(
    (app) => completedStatuses.includes(app.ProcessInstance?.state?.applicationStatus)
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Applications Card */}
      <div className="rounded-xl shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-md hover:-translate-y-1">
        <div className="bg-gradient-to-r from-primary to-primary-dark p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Total dossiers</p>
              <h3 className="text-2xl font-bold text-white mt-1">{totalCount || 0}</h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm border border-white/10">
              <LuFolder className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-2 text-xs text-white/80 flex items-center gap-0.5">
            <span>Tous statuts confondus</span>
          </div>
        </div>
      </div>

      {/* New Applications Card */}
      <div className="rounded-xl shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-md hover:-translate-y-1">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Nouveaux</p>
              <h3 className="text-2xl font-bold text-white mt-1">{newApplicationsCount}</h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm border border-white/10">
              <LuCircle className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-2 text-xs text-white/80 flex items-center gap-0.5">
            <span>À assigner</span>
          </div>
        </div>
      </div>

      {/* In Progress Card */}
      <div className="rounded-xl shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-md hover:-translate-y-1">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">En cours</p>
              <h3 className="text-2xl font-bold text-white mt-1">{inProgressCount}</h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm border border-white/10">
              <LuClock className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-2 text-xs text-white/80 flex items-center gap-0.5">
            <span>En traitement</span>
          </div>
        </div>
      </div>

      {/* Approved Card */}
      <div className="rounded-xl shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-md hover:-translate-y-1">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Approuvés</p>
              <h3 className="text-2xl font-bold text-white mt-1">{approvedCount}</h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm border border-white/10">
              <LuCircleCheck className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-2 text-xs text-white/80 flex items-center gap-0.5">
            <span>Terminés avec succès</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsCards;
