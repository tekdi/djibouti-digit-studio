/**
 * MobileIDErrorScreen - Écran d'erreur d'authentification
 */

import React from "react";
import {
  LuCircleAlert,
  LuArrowLeft,
} from "react-icons/lu";

const MobileIDErrorScreen = ({ error, onRetry, onBackToLogin }) => {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 to-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/80 shadow-2xl rounded-3xl px-6 py-10 flex flex-col items-center">
          <div className="mb-6">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <LuCircleAlert className="w-10 h-10 text-red-500" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Authentification échouée
          </h2>
          
          <div className="w-full bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
            <p className="text-sm text-red-700">{error || "Une erreur s'est produite"}</p>
          </div>

          <div className="w-full space-y-3">
            <button
              onClick={onRetry}
              className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-base font-semibold text-white transition-all duration-200"
              style={{
                background: 'linear-gradient(to right, #22a4d9, #52ac47)',
              }}
            >
              Réessayer
            </button>

            <button
              onClick={onBackToLogin}
              className="w-full flex justify-center items-center py-3 px-4 rounded-xl border-2 border-gray-300 text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
            >
              <LuArrowLeft className="h-4 w-4 mr-2" />
              Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileIDErrorScreen;

