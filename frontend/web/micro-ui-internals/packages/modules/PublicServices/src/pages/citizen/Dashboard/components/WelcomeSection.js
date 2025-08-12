import React from "react";
import { Link } from "react-router-dom";
import { LuFile, LuCreditCard, LuBell } from "react-icons/lu";

const WelcomeSection = ({ userName = "Ahmed" }) => {
  return (
    <div className="relative rounded-xl shadow-xl p-8 border overflow-hidden" style={{
      background: "linear-gradient(135deg, #006769 0%, #004a4b 50%, #006769 100%)",
      borderColor: "rgba(0, 103, 105, 0.2)"
    }}>
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-20 -top-20 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-white rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="text-white">
          <h1 className="text-3xl font-bold tracking-tight">Bienvenue, {userName}</h1>
          <p className="text-white mt-2 text-lg" style={{ opacity: 0.9 }}>
            Voici le résumé de vos activités et demandes
          </p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <Link 
            to="/citizen/publicservices/apply" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-white border backdrop-blur-sm group"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderColor: "rgba(255, 255, 255, 0.2)"
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
              e.target.style.transform = "scale(1.05)";
              e.target.style.boxShadow = "0 10px 25px rgba(0, 103, 105, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "none";
            }}
          >
            <div className="p-2 rounded-lg transition-all" style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}>
              <LuFile className="w-5 h-5" />
            </div>
            <span className="font-medium">Nouvelle demande</span>
          </Link>
          
          <Link 
            to="/citizen/payments" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-white border backdrop-blur-sm group"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderColor: "rgba(255, 255, 255, 0.2)"
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
              e.target.style.transform = "scale(1.05)";
              e.target.style.boxShadow = "0 10px 25px rgba(0, 103, 105, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "none";
            }}
          >
            <div className="p-2 rounded-lg transition-all" style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}>
              <LuCreditCard className="w-5 h-5" />
            </div>
            <span className="font-medium">Effectuer un paiement</span>
          </Link>

          <Link 
            to="/citizen/notifications" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-white border backdrop-blur-sm group relative"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.2)",
              borderColor: "rgba(239, 68, 68, 0.3)"
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "rgba(239, 68, 68, 0.3)";
              e.target.style.transform = "scale(1.05)";
              e.target.style.boxShadow = "0 10px 25px rgba(239, 68, 68, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "rgba(239, 68, 68, 0.2)";
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "none";
            }}
          >
            <div className="p-2 rounded-lg transition-all" style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}>
              <LuBell className="w-5 h-5" />
            </div>
            <span className="font-medium">Notifications</span>
            <span 
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium text-white border-2"
              style={{ 
                backgroundColor: "#ef4444",
                borderColor: "#006769"
              }}
            >
              3
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;
