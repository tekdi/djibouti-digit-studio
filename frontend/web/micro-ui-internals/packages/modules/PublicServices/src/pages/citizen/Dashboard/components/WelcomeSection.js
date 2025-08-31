import React from "react";
import { Link } from "react-router-dom";
import { LuFile, LuCreditCard, LuBell } from "react-icons/lu";

const WelcomeSection = ({ userName = "" }) => {
  // Extract first name only from full name
  const getFirstName = (fullName) => {
    if (!fullName) return "Utilisateur";
    const nameParts = fullName.trim().split(' ');
    return nameParts[0];
  };

  const firstName = getFirstName(userName);

  return (
    <div className="relative rounded-xl shadow-xl p-8 overflow-hidden bg-gradient-djibouti-light">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-20 -top-20 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-white rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="text-white">
          <h1 className="text-3xl font-bold tracking-tight">Bienvenue, {firstName}</h1>
          <p className="text-white mt-2 text-lg" style={{ opacity: 0.9 }}>
            Voici le résumé de vos activités et demandes
          </p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <a 
            href={`/${window?.contextPath}/citizen/publicservices/apply`}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white border border-white/20 backdrop-blur-sm hover:scale-105 hover:shadow-lg hover:shadow-primary/20 group"
          >
            <div className="p-2 rounded-lg transition-all" style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}>
              <LuFile className="w-5 h-5" />
            </div>
            <span className="font-medium">Nouvelle demande</span>
          </a>
          
          <a 
            href={`/${window?.contextPath}/citizen/publicservices/applications/pending-payment`}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white border border-white/20 backdrop-blur-sm hover:scale-105 hover:shadow-lg hover:shadow-primary/20 group"
          >
            <div className="p-2 rounded-lg transition-all" style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}>
              <LuCreditCard className="w-5 h-5" />
            </div>
            <span className="font-medium">Effectuer un paiement</span>
          </a>

          <a 
            href={`#`}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white border border-white/20 backdrop-blur-sm hover:scale-105 hover:shadow-lg hover:shadow-primary/20 group"
          >
            <div className="p-2 rounded-lg transition-all" style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}>
              <LuBell className="w-5 h-5" />
            </div>
            <span className="font-medium">Notifications</span>
            <span 
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium text-white"
              style={{ 
                backgroundColor: "#ef4444",
                borderColor: "#006769"
              }}
            >
              3
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;
