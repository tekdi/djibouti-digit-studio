import React from "react";
import { Link } from "react-router-dom";
import { LuFileText, LuArrowRight } from "react-icons/lu";

const RecentApplications = ({ applications }) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case "En traitement":
        return {
          background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
          color: "#92400e",
          borderColor: "rgba(245, 158, 11, 0.5)"
        };
      case "Approuvée":
        return {
          background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
          color: "#166534",
          borderColor: "rgba(34, 197, 94, 0.5)"
        };
      case "Paiement requis":
        return {
          background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
          color: "#991b1b",
          borderColor: "rgba(239, 68, 68, 0.5)"
        };
      default:
        return {
          background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
          color: "#374151",
          borderColor: "rgba(107, 114, 128, 0.5)"
        };
    }
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-300"
      style={{ borderColor: "#e5e7eb" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)";
      }}
    >
      <div 
        className="p-6 border-b"
        style={{ 
          borderColor: "#e5e7eb",
          background: "linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)"
        }}
      >
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
          <Link 
            to="/citizen/applications/pending" 
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
          </Link>
        </div>
      </div>
      
      <div style={{ borderColor: "#e5e7eb" }}>
        {applications.map((app) => (
          <div 
            key={app.id} 
            className="p-6 transition-all duration-200 group"
            style={{
              borderBottom: "1px solid #e5e7eb"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(249, 250, 251, 0.8)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 
                className="font-medium text-gray-900 group-hover:transition-colors"
                onMouseEnter={(e) => {
                  e.target.style.color = "#006769";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "#111827";
                }}
              >
                {app.title}
              </h3>
              <span 
                className="px-3 py-1.5 rounded-full text-xs font-medium border shadow-sm"
                style={getStatusStyle(app.status)}
              >
                {app.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{app.location}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Soumis le {app.submittedDate}</span>
              <span>Dernière mise à jour: {app.lastUpdate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentApplications;
