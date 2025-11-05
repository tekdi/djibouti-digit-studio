/**
 * MobileIDInputScreen - Écran de saisie du numéro CNI
 */

import React from "react";
import {
  LuSmartphone,
  LuInfo,
  LuArrowRight,
  LuArrowLeft,
  LuFingerprint,
  LuShield,
  LuCircleCheckBig,
} from "react-icons/lu";

const MobileIDInputScreen = ({ 
  cniNumber, 
  onCniChange, 
  onSubmit, 
  onBack, 
  error, 
  isLoading 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 to-gray-50 flex overflow-hidden">
      {/* Left side - Image and Info (Desktop only) */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-djibouti-light mix-blend-multiply z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="Mobile ID authentication"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-white p-12">
          <div className="backdrop-blur-sm bg-white/10 p-12 rounded-3xl shadow-2xl max-w-xl border border-white/20">
            <div className="flex items-center gap-3 mb-8">
              <div className="rounded-full bg-white/20 p-3">
                <LuShield className="w-8 h-8" />
              </div>
              <h1 className="text-4xl font-bold">Mobile ID</h1>
            </div>

            <div className="text-center mb-8">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center mb-6">
                <LuFingerprint className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Authentification Sécurisée
              </h2>
              <p className="text-white/90 text-lg leading-relaxed">
                Connectez-vous en toute sécurité avec votre identité numérique djiboutienne
              </p>
            </div>

            {/* Avantages */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <LuCircleCheckBig className="w-6 h-6 text-green-300 mb-2" />
                <h3 className="font-semibold text-sm mb-1">Rapide</h3>
                <p className="text-xs text-white/70">En quelques secondes</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <LuShield className="w-6 h-6 text-blue-300 mb-2" />
                <h3 className="font-semibold text-sm mb-1">Sécurisé</h3>
                <p className="text-xs text-white/70">100% protégé</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - CNI Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="backdrop-blur-xl bg-white/80 shadow-2xl rounded-3xl px-6 py-10 flex flex-col items-center">
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-djibouti-primary/10 p-3">
                  <LuSmartphone className="w-8 h-8 text-djibouti-primary" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Mobile ID</h1>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Connexion Mobile ID
            </h2>
            <p className="text-gray-600 text-base mb-8 text-center">
              Entrez votre numéro de CNI pour continuer
            </p>

            <form onSubmit={onSubmit} className="w-full space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-md flex items-start">
                  <LuInfo className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div>
                <label
                  htmlFor="cni"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Numéro de CNI
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LuFingerprint className="h-5 w-5 text-djibouti-primary" />
                  </div>
                  <input
                    id="cni"
                    name="cni"
                    type="text"
                    required
                    value={cniNumber}
                    onChange={onCniChange}
                    className="block w-full pl-10 pr-3 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-djibouti-primary focus:border-djibouti-primary bg-white/80 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200"
                    placeholder="Ex: 123456789"
                    disabled={isLoading}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Votre numéro de Carte Nationale d'Identité
                </p>
              </div>

              <button
                type="submit"
                disabled={!cniNumber || isLoading}
                className="w-full flex justify-center items-center py-4 px-4 rounded-2xl shadow-lg text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-djibouti-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                style={{
                  background: 'linear-gradient(to right, #22a4d9, #52ac47)',
                }}
              >
                <LuArrowRight className="h-5 w-5 mr-2" />
                Se connecter avec Mobile ID
              </button>
            </form>

            <div className="text-center space-y-4 mt-8">
              <button
                onClick={onBack}
                className="flex items-center justify-center w-full text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                <LuArrowLeft className="h-4 w-4 mr-2" />
                Retour à la connexion par email
              </button>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Vous n'avez pas Mobile ID ?{" "}
                  <a
                    href="https://mobileid.dj"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-djibouti-primary hover:underline"
                  >
                    En savoir plus
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileIDInputScreen;

