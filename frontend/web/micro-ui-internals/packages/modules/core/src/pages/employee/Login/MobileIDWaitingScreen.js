/**
 * MobileIDWaitingScreen - Écran d'attente d'approbation Mobile ID
 */

import React from "react";
import {
  LuSmartphone,
  LuInfo,
  LuFingerprint,
} from "react-icons/lu";

const MobileIDWaitingScreen = ({ timeRemaining = 60, onCancel }) => {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 to-gray-50 flex overflow-hidden">
      {/* Left side - Info (Desktop only) */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-djibouti-light mix-blend-multiply z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="Mobile security"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-white p-12">
          <div className="backdrop-blur-xl bg-white/20 p-12 rounded-3xl shadow-2xl max-w-xl border border-white/30">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center mb-6">
                <LuSmartphone className="w-12 h-12 text-white animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Vérification en cours</h2>
              <p className="text-white/90 text-lg leading-relaxed">
                Une notification a été envoyée sur votre appareil Mobile ID.
                Veuillez l'ouvrir et approuver la demande d'authentification.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Waiting UI */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="backdrop-blur-xl bg-white/80 shadow-2xl rounded-3xl px-6 py-10 flex flex-col items-center">
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-djibouti-primary/10 p-3">
                  <LuSmartphone className="w-8 h-8 text-djibouti-primary" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Mobile ID</h1>
              </div>
            </div>

            {/* Animation de chargement */}
            <div className="mb-8">
              <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-djibouti-primary/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-djibouti-primary border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <LuFingerprint className="w-12 h-12 text-djibouti-primary" />
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
              Vérifiez votre appareil
            </h2>
            <p className="text-gray-600 text-base mb-6 text-center">
              Ouvrez l'application Mobile ID sur votre téléphone et approuvez la demande d'authentification
            </p>

            {/* Compte à rebours */}
            <div className="w-full bg-gray-100 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Temps restant</span>
                <span className="text-lg font-bold text-djibouti-primary">
                  {timeRemaining}s
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-djibouti-primary h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(timeRemaining / 60) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Instructions */}
            <div className="w-full bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md mb-6">
              <div className="flex">
                <LuInfo className="text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Que faire maintenant ?</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Ouvrez l'application Mobile ID</li>
                    <li>Vérifiez la notification reçue</li>
                    <li>Approuvez avec votre empreinte ou code PIN</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Bouton d'annulation */}
            <button
              onClick={onCancel}
              className="w-full flex justify-center items-center py-3 px-4 rounded-xl border-2 border-gray-300 text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileIDWaitingScreen;

