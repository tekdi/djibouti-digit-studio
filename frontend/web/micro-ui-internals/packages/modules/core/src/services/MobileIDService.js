/**
 * Service pour gérer l'authentification MobileID Djibouti
 * 
 * Ce service encapsule les appels API vers le système MobileID de Djibouti
 * Documentation complète : doc/djiboutimobileID/README.md
 */

// Configuration API MobileID
const MOBILEID_CONFIG = {
  baseUrl: 'https://services.mobileid.dj/api',
  headers: {
    web: {
      'Content-Type': 'application/json',
      'WebMobileIDAuthorization': 'MTA3phrqv04as1f378cmbjxtu0kwodi62g',
      'Org': '107'
    },
    check: {
      'Content-Type': 'application/json',
      'MobileIDAuthorization': 'djmobilewqMoBileAuthen123456789aER=='
    }
  }
};

/**
 * Codes de statut MobileID
 */
export const MOBILEID_STATUS_CODES = {
  // Succès
  NOTIFICATION_SENT: 602,
  SUCCESS: 800,
  
  // En attente
  PENDING: 801,
  
  // Erreurs
  UNAUTHORIZED_ORG: 601,
  UNAUTHORIZED_TOKEN: 604,
  CLIENT_NOT_FOUND: 700,
  ORG_NOT_ALLOWED: 701,
  DEVICE_NOT_REGISTERED: 702,
  KEY_VALUE_MISSING: 723,
  NO_RECORD_FOR_KEY: 724,
  NO_REQUEST_FOUND: 803
};

/**
 * Messages d'erreur utilisateur pour chaque code
 */
const ERROR_MESSAGES = {
  [MOBILEID_STATUS_CODES.UNAUTHORIZED_ORG]: "Erreur de configuration système. Veuillez contacter l'administrateur.",
  [MOBILEID_STATUS_CODES.UNAUTHORIZED_TOKEN]: "Erreur de configuration système. Veuillez contacter l'administrateur.",
  [MOBILEID_STATUS_CODES.CLIENT_NOT_FOUND]: "Ce numéro CNI n'est pas enregistré dans le système Mobile ID.",
  [MOBILEID_STATUS_CODES.ORG_NOT_ALLOWED]: "Erreur de configuration système. Veuillez contacter l'administrateur.",
  [MOBILEID_STATUS_CODES.DEVICE_NOT_REGISTERED]: "Veuillez enregistrer votre appareil dans l'application Mobile ID.",
  [MOBILEID_STATUS_CODES.KEY_VALUE_MISSING]: "Erreur technique. Veuillez réessayer.",
  [MOBILEID_STATUS_CODES.NO_RECORD_FOR_KEY]: "La session a expiré. Veuillez réessayer.",
  [MOBILEID_STATUS_CODES.NO_REQUEST_FOUND]: "La demande a expiré. Veuillez réessayer.",
  'default': "Une erreur est survenue. Veuillez réessayer."
};

/**
 * Obtenir le message d'erreur utilisateur pour un code donné
 * @param {number} code - Code d'erreur MobileID
 * @returns {string} Message d'erreur localisé
 */
export const getErrorMessage = (code) => {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES['default'];
};

/**
 * Classe d'erreur personnalisée pour MobileID
 */
export class MobileIDError extends Error {
  constructor(code, message, originalError = null) {
    super(message);
    this.name = 'MobileIDError';
    this.code = code;
    this.originalError = originalError;
    this.userMessage = getErrorMessage(code);
  }
}

/**
 * Effectuer une requête HTTP vers l'API MobileID
 * @param {string} endpoint - Endpoint de l'API (ex: '/authenticatefromweb')
 * @param {Object} headers - Headers HTTP
 * @param {Object} body - Corps de la requête
 * @returns {Promise<Object>} Réponse de l'API
 */
const makeRequest = async (endpoint, headers, body) => {
  try {
    const response = await fetch(`${MOBILEID_CONFIG.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    });

    const data = await response.json();

    // Vérifier si la réponse contient un code d'erreur
    if (!data.status && data.code) {
      throw new MobileIDError(
        data.code,
        data.message || 'Erreur API MobileID',
        null
      );
    }

    // Vérifier les erreurs HTTP standard
    if (!response.ok) {
      throw new MobileIDError(
        data.code || response.status,
        data.message || `Erreur HTTP ${response.status}`,
        null
      );
    }

    return data;
  } catch (error) {
    // Si c'est déjà une MobileIDError, la propager
    if (error instanceof MobileIDError) {
      throw error;
    }

    // Pour les erreurs réseau ou autres
    console.error('MobileID API Error:', error);
    throw new MobileIDError(
      0,
      'Erreur de connexion au service MobileID',
      error
    );
  }
};

/**
 * Initier une authentification MobileID
 * @param {string} clientId - Numéro de CNI de l'utilisateur
 * @returns {Promise<{keyval: string, code: number}>} Token pour vérification ultérieure
 */
export const initiateMobileIDAuth = async (clientId) => {
  if (!clientId || typeof clientId !== 'string') {
    throw new MobileIDError(
      MOBILEID_STATUS_CODES.CLIENT_NOT_FOUND,
      'Le numéro CNI est requis',
      null
    );
  }

  try {
    const response = await makeRequest(
      '/authenticatefromweb',
      MOBILEID_CONFIG.headers.web,
      { client_id: clientId.trim() }
    );

    // Vérifier que nous avons bien reçu le keyval
    if (!response.data || !response.data.keyval) {
      throw new MobileIDError(
        MOBILEID_STATUS_CODES.KEY_VALUE_MISSING,
        'Réponse API invalide: keyval manquant',
        null
      );
    }

    return {
      keyval: response.data.keyval,
      code: response.code
    };
  } catch (error) {
    console.error('Error initiating MobileID auth:', error);
    throw error;
  }
};

/**
 * Vérifier le statut d'une authentification MobileID
 * @param {string} clientId - Numéro de CNI de l'utilisateur
 * @param {string} keyval - Token reçu lors de l'initiation
 * @returns {Promise<Object>} Statut de l'authentification
 */
export const checkMobileIDStatus = async (clientId, keyval) => {
  if (!clientId || !keyval) {
    throw new MobileIDError(
      MOBILEID_STATUS_CODES.KEY_VALUE_MISSING,
      'clientId et keyval sont requis',
      null
    );
  }

  try {
    const response = await makeRequest(
      '/authenticate/checkStatus',
      MOBILEID_CONFIG.headers.check,
      {
        client_id: clientId.trim(),
        keyval: keyval.trim()
      }
    );

    return {
      code: response.code,
      status: response.status,
      message: response.message,
      // Données utilisateur (disponibles uniquement en cas de succès)
      userData: response.code === MOBILEID_STATUS_CODES.SUCCESS ? {
        name: response.name,
        dob: response.dob
      } : null
    };
  } catch (error) {
    console.error('Error checking MobileID status:', error);
    throw error;
  }
};

/**
 * Valider le format d'un numéro CNI
 * @param {string} cni - Numéro de CNI à valider
 * @returns {boolean} True si le format est valide
 */
export const validateCNI = (cni) => {
  if (!cni || typeof cni !== 'string') {
    return false;
  }

  // Supprimer les espaces
  const cleanCNI = cni.trim();

  // Format: au moins 5 caractères alphanumériques
  // Le format exact devrait être confirmé avec les autorités djiboutiennes
  return /^[A-Za-z0-9]{5,15}$/.test(cleanCNI);
};

/**
 * Exporter le service MobileID
 */
const MobileIDService = {
  initiateMobileIDAuth,
  checkMobileIDStatus,
  validateCNI,
  getErrorMessage,
  MOBILEID_STATUS_CODES
};

export default MobileIDService;











