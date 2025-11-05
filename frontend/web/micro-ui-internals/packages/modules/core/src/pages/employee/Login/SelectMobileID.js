/**
 * Composant SelectMobileID
 * 
 * Interface utilisateur pour l'authentification via MobileID Djibouti
 * Version UI seulement - AUCUN appel API pour la sécurité
 */

import React, { useState, useEffect, Fragment } from "react";
import MobileIDInputScreen from "./MobileIDInputScreen";
import MobileIDWaitingScreen from "./MobileIDWaitingScreen";
import MobileIDErrorScreen from "./MobileIDErrorScreen";

const SelectMobileID = ({ t, onSuccess, onCancel }) => {
  const [cniNumber, setCniNumber] = useState("");
  const [localError, setLocalError] = useState("");
  const [currentScreen, setCurrentScreen] = useState("input"); // "input", "waiting", "error"
  const [timeRemaining, setTimeRemaining] = useState(60);

  // Validation CNI locale
  const validateCNI = (cni) => {
    return cni && cni.length >= 5;
  };

  // Gestion du changement du CNI
  const handleCniChange = (e) => {
    const value = e.target.value;
    setCniNumber(value);
    if (localError) {
      setLocalError("");
    }
  };

  // Gestion de la soumission du formulaire
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
    
    // Pour la démo UI : passer à l'écran d'attente
    setCurrentScreen("waiting");
    setTimeRemaining(60);
    
    // Simuler le compte à rebours pour la démo UI
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Après timeout, afficher l'erreur
          setCurrentScreen("error");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Gestion de l'annulation
  const handleCancel = () => {
    setCurrentScreen("input");
    setTimeRemaining(60);
    if (onCancel) {
      onCancel();
    }
  };

  // Retour à la connexion
  const handleBackToLogin = () => {
    setCurrentScreen("input");
    setCniNumber("");
    setLocalError("");
    setTimeRemaining(60);
    window.history.back();
  };

  // Réessayer après erreur
  const handleRetry = () => {
    setCurrentScreen("input");
    setLocalError("");
    setTimeRemaining(60);
  };

  // Rendu conditionnel selon l'écran actuel
  switch (currentScreen) {
    case "waiting":
      return (
        <MobileIDWaitingScreen
          timeRemaining={timeRemaining}
          onCancel={handleCancel}
        />
      );

    case "error":
      return (
        <MobileIDErrorScreen
          error="Délai d'authentification expiré. Veuillez réessayer."
          onRetry={handleRetry}
          onBackToLogin={handleBackToLogin}
        />
      );

    case "input":
    default:
      return (
        <MobileIDInputScreen
          cniNumber={cniNumber}
          onCniChange={handleCniChange}
          onSubmit={handleSubmit}
          onBack={handleBackToLogin}
          error={localError}
          isLoading={false}
        />
      );
  }
};

export default SelectMobileID;
