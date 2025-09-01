import React from "react";
import { LuFileText, LuArrowRight, LuFilePlus, LuRefreshCw } from "react-icons/lu";
import ApplicationCard from "../../applications/ApplicationCard";

const RecentApplications = ({ applications = [], onRefresh, isRefreshing = false }) => {
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-6 bg-white rounded-2xl shadow-sm border border-gray-200">
      <div 
        className="p-4 rounded-full mb-6 shadow-sm"
        style={{
          background: "linear-gradient(135deg, rgba(0, 103, 105, 0.1) 0%, rgba(0, 103, 105, 0.05) 100%)"
        }}
      >
        <LuFilePlus className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucune demande récente</h3>
      <p className="text-sm text-gray-500 text-center max-w-sm leading-relaxed mb-6">
        Vous n'avez soumis aucune demande récemment. Commencez par créer votre première demande.
      </p>
      <a 
        href={`/${window?.contextPath}/citizen/publicservices/apply`}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white shadow-sm transition-all duration-200 hover:shadow-md"
        style={{ 
          backgroundColor: "#006769",
          background: "linear-gradient(135deg, #006769 0%, #004a4b 100%)"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)";
        }}
      >
        <LuFilePlus className="w-4 h-4" />
        Nouvelle demande
      </a>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header - Title and View All link */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="p-2.5 rounded-xl shadow-sm"
            style={{
              background: "linear-gradient(135deg, rgba(0, 103, 105, 0.2) 0%, rgba(0, 103, 105, 0.1) 100%)"
            }}
          >
            <LuFileText className="w-5 h-5" style={{ color: "#006769" }} />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Demandes récentes</h2>
        </div>
        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
              isRefreshing 
                ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-500' 
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <LuRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">
              {isRefreshing ? 'Actualisation...' : 'Actualiser'}
            </span>
          </button>
          
          {/* View All Link */}
          {applications.length > 0 && (
            <a 
              href={`/${window?.contextPath}/citizen/publicservices/applications/pending`}
              className="flex items-center gap-2 text-sm font-medium group transition-colors"
              style={{ color: "#006769" }}
              onMouseEnter={(e) => {
                e.target.style.color = "#004a4b";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "#006769";
              }}
            >
              Voir tout
              <LuArrowRight 
                className="w-4 h-4 transition-transform group-hover:translate-x-1" 
              />
            </a>
          )}
        </div>
      </div>
      
      {/* Applications Grid or Empty State */}
      {applications.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((app) => (
            <ApplicationCard key={app.id} app={app} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentApplications;
