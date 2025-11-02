/**
 * Hook React personnalisé pour gérer l'authentification MobileID
 * 
 * Ce hook encapsule toute la logique d'authentification MobileID incluant:
 * - L'initiation de l'authentification
 * - Le polling du statut
 * - La gestion des timeouts
 * - Le cleanup des ressources
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import MobileIDService, { 
  MOBILEID_STATUS_CODES,
  MobileIDError 
} from '../services/MobileIDService';

// Configuration du polling
const POLLING_INTERVAL = 3000; // 3 secondes
const MAX_POLLING_TIME = 60000; // 60 secondes
const MAX_ATTEMPTS = Math.floor(MAX_POLLING_TIME / POLLING_INTERVAL); // 20 tentatives

/**
 * États possibles du hook
 */
const AUTH_STATES = {
  IDLE: 'idle',
  INITIATING: 'initiating',
  POLLING: 'polling',
  SUCCESS: 'success',
  ERROR: 'error',
  CANCELLED: 'cancelled'
};

/**
 * Hook useMobileID
 * 
 * @returns {Object} État et méthodes pour gérer l'authentification MobileID
 */
const useMobileID = () => {
  // État
  const [state, setState] = useState(AUTH_STATES.IDLE);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(MAX_POLLING_TIME / 1000); // en secondes
  
  // Références pour le nettoyage
  const pollingIntervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const attemptCountRef = useRef(0);
  const keyvalRef = useRef(null);
  const clientIdRef = useRef(null);

  /**
   * Nettoyer tous les timers et références
   */
  const cleanup = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearInterval(timeoutRef.current);
      timeoutRef.current = null;
    }
    attemptCountRef.current = 0;
    setTimeRemaining(MAX_POLLING_TIME / 1000);
  }, []);

  /**
   * Vérifier le statut de l'authentification
   */
  const checkStatus = useCallback(async () => {
    if (!clientIdRef.current || !keyvalRef.current) {
      return;
    }

    try {
      attemptCountRef.current += 1;

      const response = await MobileIDService.checkMobileIDStatus(
        clientIdRef.current,
        keyvalRef.current
      );

      // Succès - l'utilisateur a validé
      if (response.code === MOBILEID_STATUS_CODES.SUCCESS) {
        cleanup();
        setState(AUTH_STATES.SUCCESS);
        setUserData(response.userData);
        return;
      }

      // En attente - continuer le polling
      if (response.code === MOBILEID_STATUS_CODES.PENDING) {
        // Vérifier si nous avons dépassé le nombre max de tentatives
        if (attemptCountRef.current >= MAX_ATTEMPTS) {
          cleanup();
          setState(AUTH_STATES.ERROR);
          setError('La demande a expiré. Veuillez réessayer.');
        }
        return;
      }

      // Autre code - traiter comme une erreur
      cleanup();
      setState(AUTH_STATES.ERROR);
      setError(MobileIDService.getErrorMessage(response.code));

    } catch (err) {
      cleanup();
      setState(AUTH_STATES.ERROR);
      
      if (err instanceof MobileIDError) {
        setError(err.userMessage);
      } else {
        setError('Erreur lors de la vérification du statut.');
      }
    }
  }, [cleanup]);

  /**
   * Démarrer le polling
   */
  const startPolling = useCallback(() => {
    setState(AUTH_STATES.POLLING);
    attemptCountRef.current = 0;

    // Première vérification immédiate
    checkStatus();

    // Polling périodique
    pollingIntervalRef.current = setInterval(checkStatus, POLLING_INTERVAL);

    // Timer pour le compte à rebours
    let secondsLeft = MAX_POLLING_TIME / 1000;
    timeoutRef.current = setInterval(() => {
      secondsLeft -= 1;
      setTimeRemaining(secondsLeft);
      
      if (secondsLeft <= 0) {
        clearInterval(timeoutRef.current);
      }
    }, 1000);

  }, [checkStatus]);

  /**
   * Initier l'authentification MobileID
   * 
   * @param {string} clientId - Numéro de CNI de l'utilisateur
   * @returns {Promise<void>}
   */
  const startAuth = useCallback(async (clientId) => {
    // Validation
    if (!clientId) {
      setError('Le numéro CNI est requis.');
      setState(AUTH_STATES.ERROR);
      return;
    }

    if (!MobileIDService.validateCNI(clientId)) {
      setError('Le format du numéro CNI est invalide.');
      setState(AUTH_STATES.ERROR);
      return;
    }

    // Nettoyer tout état précédent
    cleanup();
    setError(null);
    setUserData(null);
    setState(AUTH_STATES.INITIATING);
    clientIdRef.current = clientId;

    try {
      // Appeler l'API pour initier l'authentification
      const response = await MobileIDService.initiateMobileIDAuth(clientId);
      
      // Sauvegarder le keyval
      keyvalRef.current = response.keyval;

      // Démarrer le polling
      startPolling();

    } catch (err) {
      setState(AUTH_STATES.ERROR);
      
      if (err instanceof MobileIDError) {
        setError(err.userMessage);
      } else {
        setError('Erreur lors de l\'initiation de l\'authentification.');
      }
    }
  }, [cleanup, startPolling]);

  /**
   * Annuler l'authentification en cours
   */
  const cancelAuth = useCallback(() => {
    cleanup();
    setState(AUTH_STATES.CANCELLED);
    setError(null);
    setUserData(null);
    keyvalRef.current = null;
    clientIdRef.current = null;
  }, [cleanup]);

  /**
   * Réinitialiser le hook à l'état initial
   */
  const reset = useCallback(() => {
    cleanup();
    setState(AUTH_STATES.IDLE);
    setError(null);
    setUserData(null);
    keyvalRef.current = null;
    clientIdRef.current = null;
  }, [cleanup]);

  /**
   * Cleanup lors du démontage du composant
   */
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Retourner l'état et les méthodes
  return {
    // État
    state,
    isIdle: state === AUTH_STATES.IDLE,
    isInitiating: state === AUTH_STATES.INITIATING,
    isPolling: state === AUTH_STATES.POLLING,
    isSuccess: state === AUTH_STATES.SUCCESS,
    isError: state === AUTH_STATES.ERROR,
    isCancelled: state === AUTH_STATES.CANCELLED,
    
    // Données
    error,
    userData,
    timeRemaining,
    
    // Méthodes
    startAuth,
    cancelAuth,
    reset,
    
    // Utilitaires
    validateCNI: MobileIDService.validateCNI
  };
};

export default useMobileID;
export { AUTH_STATES };











