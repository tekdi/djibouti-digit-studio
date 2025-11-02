/**
 * Composant SelectMobileID
 * 
 * Interface utilisateur pour l'authentification via MobileID Djibouti
 * Permet aux utilisateurs de se connecter en utilisant leur numéro de CNI
 */

import React, { useState, useEffect, Fragment } from "react";
import {
  LuSmartphone,
  LuInfo,
  LuArrowRight,
  LuArrowLeft,
  LuFingerprint,
  LuShield,
  LuLoaderCircle,
  LuCircleCheckBig,
  LuCircleAlert,
} from "react-icons/lu";

const SelectMobileID = ({ t, onSuccess, onCancel, stateCode = "dj" }) => {
  const [cniNumber, setCniNumber] = useState("");
  const [localError, setLocalError] = useState("");

  // États pour l'authentification MobileID
  const [isInitiating, setIsInitiating] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [keyval, setKeyval] = useState(null);

  // Configuration API MobileID
  const MOBILEID_BASE_URL = "https://services.mobileid.dj/api";
  const HARDCODED_PHONE = "77711878"; // Numéro pour connexion automatique après MobileID
  const HARDCODED_OTP = "123456"; // OTP hardcodé pour la démo

  // Fonction de validation CNI locale
  const validateCNI = (cni) => {
    // Validation basique: au moins 5 caractères
    return cni && cni.length >= 5;
  };

  // Fonction pour initier l'authentification MobileID
  const initiateMobileIDAuth = async (clientId) => {
    try {
      const response = await fetch(`${MOBILEID_BASE_URL}/authenticatefromweb`, {
        method: "POST",
        headers: {
          "WebMobileIDAuthorization": "MTA3phrqv04as1f378cmbjxtu0kwodi62g",
          "Org": "107",
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          client_id: clientId
        })
      });

      const data = await response.json();
      
      if (data.status && data.rsaved && data.data?.keyval) {
        return { success: true, keyval: data.data.keyval };
      } else {
        return { success: false, error: data.message || "Erreur lors de l'initiation" };
      }
    } catch (err) {
      console.error("Error initiating MobileID:", err);
      return { success: false, error: "Erreur de connexion au service MobileID" };
    }
  };

  // Fonction pour vérifier le statut de l'authentification
  const checkMobileIDStatus = async (clientId, keyval) => {
    try {
      const response = await fetch(`${MOBILEID_BASE_URL}/authenticate/checkStatus`, {
        method: "POST",
        headers: {
          "MobileIDAuthorization": "djmobilewqMoBileAuthen123456789aER==",
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          client_id: clientId,
          keyval: keyval
        })
      });

      const data = await response.json();
      
      if (data.code === 800 && data.status) {
        // Authentification réussie
        return {
          success: true,
          userData: {
            name: data.name,
            dob: data.dob,
            mname: data.mname,
            loc: data.loc,
            midvalidto: data.midvalidto,
            uno: data.uno
          }
        };
      } else if (data.code === 801) {
        // En attente
        return { success: false, pending: true };
      } else {
        // Rejeté ou erreur
        return { success: false, error: data.message || "Authentification refusée" };
      }
    } catch (err) {
      console.error("Error checking MobileID status:", err);
      return { success: false, error: "Erreur lors de la vérification" };
    }
  };

  // Fonction pour connecter l'utilisateur automatiquement (en arrière-plan)
  const loginWithHardcodedPhone = async () => {
    try {
      console.log("Envoi automatique de l'OTP...");
      
      // Étape 1: Envoyer OTP
      const otpData = {
        otp: {
          mobileNumber: HARDCODED_PHONE,
          tenantId: stateCode,
          userType: "CITIZEN",
          type: "login"
        }
      };

      const otpResponse = await Digit.UserService.sendOtp(otpData, stateCode);
      console.log("OTP envoyé avec succès");
      
      // Petite pause pour simuler la réception de l'OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Authentification automatique avec OTP hardcodé...");
      
      // Étape 2: Authenticate automatiquement avec l'OTP hardcodé
      const requestData = {
        username: HARDCODED_PHONE,
        password: HARDCODED_OTP,
        tenantId: stateCode,
        userType: "CITIZEN"
      };
      
      const { ResponseInfo, UserRequest: info, ...tokens } = await Digit.UserService.authenticate(requestData);
      
      if (window?.globalConfigs?.getConfig("ENABLE_SINGLEINSTANCE")) {
        info.tenantId = Digit.ULBService.getStateId();
      }

      // Sauvegarder l'utilisateur
      const nextUser = { info, ...tokens };
      Digit.UserService.setUser(nextUser);
      Digit.SessionStorage.set("citizen.userRequestObject", nextUser);
      
      // Sauvegarder dans localStorage
      let locale = JSON.parse(sessionStorage.getItem("Digit.initData"))?.value?.selectedLanguage || "fr_FR";
      localStorage.setItem("Citizen.tenant-id", stateCode);
      localStorage.setItem("tenant-id", stateCode);
      localStorage.setItem("citizen.userRequestObject", JSON.stringify(nextUser));
      localStorage.setItem("locale", locale);
      localStorage.setItem("Citizen.locale", locale);
      localStorage.setItem("token", tokens.access_token);
      localStorage.setItem("Citizen.token", tokens.access_token);
      localStorage.setItem("user-info", JSON.stringify(info));
      localStorage.setItem("Citizen.user-info", JSON.stringify(info));
      
      console.log("Connexion réussie !");
      return { success: true, authenticated: true, user: nextUser };
    } catch (err) {
      console.error("Erreur lors de la connexion automatique:", err);
      return { success: false, error: err.message || "Erreur lors de la connexion automatique" };
    }
  };

  // Fonction startAuth avec vraie API
  const startAuth = async (cni) => {
    setIsInitiating(true);
    setLocalError("");
    
    // Appel à l'API MobileID pour initier l'authentification
    const result = await initiateMobileIDAuth(cni);
    
    if (!result.success) {
      setIsInitiating(false);
      setIsError(true);
      setError(result.error);
      return;
    }

    // Stocker le keyval pour le polling
    setKeyval(result.keyval);
    setIsInitiating(false);
    setIsPolling(true);
    setTimeRemaining(60);
    
    // Démarrer le polling du statut
    let remaining = 60;
    const interval = setInterval(async () => {
      remaining--;
      setTimeRemaining(remaining);
      
      // Vérifier le statut
      const statusResult = await checkMobileIDStatus(cni, result.keyval);
      
      if (statusResult.success) {
        // Authentification MobileID réussie !
        clearInterval(interval);
        setPollingInterval(null);
        // NE PAS mettre isPolling à false ici pour éviter de montrer l'écran de login
        setUserData(statusResult.userData);
        
        console.log("✅ MobileID authentifié :", statusResult.userData.name);
        console.log("🔄 Connexion automatique en cours...");
        
        // Connexion automatique (OTP envoyé + authentification) en arrière-plan
        const loginResult = await loginWithHardcodedPhone();
        
        if (loginResult.success && loginResult.authenticated) {
          // Succès ! Passer directement à l'écran de succès
          setIsPolling(false); // On peut maintenant arrêter le polling
          setIsSuccess(true);
          console.log("✅ Connexion réussie ! Affichage du succès...");
          
          // Redirection vers le dashboard après 2.5 secondes
          setTimeout(() => {
            const DEFAULT_REDIRECT_URL = `/${window?.contextPath || "digit-studio"}/citizen`;
            window.location.href = DEFAULT_REDIRECT_URL;
          }, 2500);
        } else {
          // En cas d'erreur de connexion automatique
          setIsPolling(false);
          setIsError(true);
          setError(loginResult.error || "Échec de la connexion automatique");
        }
      } else if (statusResult.error && !statusResult.pending) {
        // Erreur définitive
        clearInterval(interval);
        setPollingInterval(null);
        setIsPolling(false);
        setIsError(true);
        setError(statusResult.error);
      }
      
      // Timeout
      if (remaining <= 0) {
        clearInterval(interval);
        setPollingInterval(null);
        setIsPolling(false);
        setIsError(true);
        setError("Délai d'authentification expiré. Veuillez réessayer.");
      }
    }, 2000); // Vérifier toutes les 2 secondes
    
    setPollingInterval(interval);
  };

  // Fonction cancelAuth
  const cancelAuth = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setIsPolling(false);
    setIsInitiating(false);
    setTimeRemaining(60);
    setKeyval(null);
  };

  // Fonction reset
  const reset = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setIsInitiating(false);
    setIsPolling(false);
    setIsSuccess(false);
    setIsError(false);
    setError("");
    setUserData(null);
    setTimeRemaining(60);
    setCniNumber("");
    setLocalError("");
    setKeyval(null);
  };

  // Nettoyage de l'intervalle au démontage du composant
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Effet pour gérer le succès de l'authentification
  // Note: On ne notifie plus le parent pour éviter le retour à l'écran de login
  // La redirection se fait automatiquement après l'affichage de l'écran de succès

  const handleCniChange = (e) => {
    const value = e.target.value;
    setCniNumber(value);
    if (localError) {
      setLocalError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cniNumber) {
      setLocalError("Veuillez entrer votre numéro de CNI");
      return;
    }

    if (!validateCNI(cniNumber)) {
      setLocalError("Le format du numéro de CNI est invalide");
      return;
    }

    setLocalError("");
    await startAuth(cniNumber);
  };

  const handleCancel = () => {
    cancelAuth();
    if (onCancel) {
      onCancel();
    }
  };

  const handleBackToLogin = () => {
    reset();
    window.history.back();
  };

  // Écran de succès
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-green-50 to-emerald-50 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="backdrop-blur-xl bg-white/90 shadow-2xl rounded-3xl px-6 py-12 flex flex-col items-center">
            {/* Animation de succès */}
            <div className="mb-8">
              <div className="relative w-32 h-32 mx-auto">
                {/* Cercle extérieur animé */}
                <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-75"></div>
                {/* Cercle principal */}
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                  <LuCircleCheckBig className="w-16 h-16 text-white animate-bounce" />
                </div>
              </div>
            </div>

            {/* Message de succès */}
            <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">
              Authentification réussie !
            </h2>
            
            {/* Informations utilisateur si disponibles */}
            {userData && (
              <div className="w-full bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <p className="text-center text-green-800 font-medium">
                  Bienvenue, {userData.name || 'Utilisateur'}
                </p>
              </div>
            )}

            <p className="text-gray-600 text-base mb-8 text-center">
              Connexion sécurisée établie avec succès.
              <br />
              Redirection vers votre espace en cours...
            </p>

            {/* Barre de progression */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
              <div 
                className="h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"
                style={{
                  animation: 'progress 2.5s ease-in-out forwards',
                }}
              ></div>
            </div>

            {/* Indicateur de chargement */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <LuLoaderCircle className="w-4 h-4 animate-spin text-green-500" />
              <span>Chargement de votre espace...</span>
            </div>
          </div>
        </div>

        {/* CSS pour l'animation de la barre de progression */}
        <style jsx>{`
          @keyframes progress {
            from {
              width: 0%;
            }
            to {
              width: 100%;
            }
          }
        `}</style>
      </div>
    );
  }

  // Écran d'attente pendant le polling
  if (isPolling) {
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
                onClick={handleCancel}
                className="w-full flex justify-center items-center py-3 px-4 rounded-xl border-2 border-gray-300 text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Écran d'erreur
  if (isError) {
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
              <p className="text-sm text-red-700">{error}</p>
            </div>

            <div className="w-full space-y-3">
              <button
                onClick={reset}
                className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-base font-semibold text-white transition-all duration-200"
                style={{
                  background: 'linear-gradient(to right, #22a4d9, #52ac47)',
                }}
              >
                Réessayer
              </button>

              <button
                onClick={handleBackToLogin}
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
  }

  // Écran principal - Saisie du CNI
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

            <form onSubmit={handleSubmit} className="w-full space-y-6">
              {(localError || (isError && error)) && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-md flex items-start">
                  <LuInfo className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-red-700">{localError || error}</p>
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
                    onChange={handleCniChange}
                    className="block w-full pl-10 pr-3 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-djibouti-primary focus:border-djibouti-primary bg-white/80 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200"
                    placeholder="Ex: 123456789"
                    disabled={isInitiating}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Votre numéro de Carte Nationale d'Identité
                </p>
              </div>

              <button
                type="submit"
                disabled={!cniNumber || isInitiating}
                className="w-full flex justify-center items-center py-4 px-4 rounded-2xl shadow-lg text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-djibouti-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                style={{
                  background: 'linear-gradient(to right, #22a4d9, #52ac47)',
                }}
              >
                {isInitiating ? (
                  <>
                    <LuLoaderCircle className="h-5 w-5 mr-2 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <LuArrowRight className="h-5 w-5 mr-2" />
                    Se connecter avec Mobile ID
                  </>
                )}
              </button>
            </form>

            <div className="text-center space-y-4 mt-8">
              <button
                onClick={handleBackToLogin}
                className="flex items-center justify-center w-full text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                <LuArrowLeft className="h-4 w-4 mr-2" />
                Retour à la connexion par téléphone
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

export default SelectMobileID;



