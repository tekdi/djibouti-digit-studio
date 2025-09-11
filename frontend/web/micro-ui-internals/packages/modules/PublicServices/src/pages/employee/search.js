import React, { useState, useEffect, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { LuSearch, LuFileText, LuUser, LuCalendar, LuMapPin, LuEye, LuLoader, LuCircleAlert } from "react-icons/lu";
import axios from "axios";
import { getServiceInfo, getStatusInfo as getStatusInfoFromUtils } from "../citizen/applications/utils";

const EmployeeSearch = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const userInfo = Digit.UserService.getUser();
  const [serviceCodes, setServiceCodes] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  // Fetch service codes from API
  useEffect(() => {
    const fetchServiceCodes = async () => {
      setServicesLoading(true);
      try {
        const response = await axios.get("/public-service/v1/service", {
          params: { tenantId: tenantId },
          headers: {
            "X-Tenant-Id": tenantId,
            "auth-token": userInfo?.access_token,
          },
        });

        const services = response?.data?.Services || [];
        // Extract service codes from services
        const codes = services.map((service) => service.serviceCode).filter(Boolean);
        setServiceCodes(codes);
      } catch (error) {
        console.error("Error fetching service codes:", error);
        setServiceCodes([]);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServiceCodes();
  }, [tenantId, userInfo?.access_token]);

  // Clear error when starting a new search
  useEffect(() => {
    if (isLoading) {
      setError(null);
    }
  }, [isLoading]);

  const searchApplications = async () => {
    if (!searchTerm.trim()) {
      setError("Veuillez entrer un terme de recherche");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      // Check if service codes are loaded
      if (servicesLoading) {
        setError("Chargement des services en cours...");
        return;
      }

      if (serviceCodes.length === 0) {
        setError("Aucun service configuré trouvé.");
        return;
      }

      // Try to find by exact application number across all service codes
      let foundApplications = [];

      for (const serviceCode of serviceCodes) {
        try {
          const response = await axios.get(`/public-service/v1/application/${serviceCode}`, {
            params: {
              applicationNumber: searchTerm.trim(),
              tenantId: tenantId,
            },
            headers: {
              "X-Tenant-Id": tenantId,
              "auth-token": userInfo?.access_token,
            },
          });

          if (response.data?.Application && response.data.Application.length > 0) {
            foundApplications = [...foundApplications, ...response.data.Application];
            // If we found the application, we can break early
            break;
          }
        } catch (searchError) {
          // Continue searching other service codes if one fails
          console.log(`Service code ${serviceCode} not found for application ${searchTerm}`);
        }
      }

      if (foundApplications.length > 0) {
        setSearchResults(foundApplications);
        setError(null);
      } else {
        setSearchResults([]);
        setError("Aucune demande trouvée avec ce numéro de dossier.");
      }
    } catch (error) {
      console.error("Error searching applications:", error);

      // Handle specific error types
      let errorMessage = "Erreur lors de la recherche. Veuillez réessayer.";

      if (error.response?.data?.Errors) {
        const errors = error.response.data.Errors;
        if (errors.some((err) => err.code === "TracerException")) {
          errorMessage = "Le service de recherche est temporairement indisponible. Veuillez réessayer plus tard.";
        } else if (errors.length > 0) {
          errorMessage = errors[0].description || errors[0].message || errorMessage;
        }
      } else if (error.response?.status === 500) {
        errorMessage = "Erreur serveur. Le service de recherche est temporairement indisponible.";
      } else if (error.code === "NETWORK_ERROR" || error.message?.includes("Network Error")) {
        errorMessage = "Erreur de connexion. Vérifiez votre connexion internet et réessayez.";
      }

      setError(errorMessage);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchApplications();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      searchApplications();
    }
  };

  const viewApplicationDetails = (app) => {
    const businessObject = app;
    const applicationNumber = businessObject?.applicationNumber;
    const baseBusinessService = businessObject?.businessService;
    const currentBusinessService =
      app?.processInstance?.[0]?.businessService || // array form
      app?.processInstance?.businessService || // object form (rare)
      app?.ProcessInstance?.businessService || // capitalized form
      baseBusinessService;
    const serviceCode = businessObject?.serviceCode;
    const userType = Digit.UserService.getType()?.toLowerCase();
    
    history.push(
      `/${window.contextPath}/${userType}/publicservices/${businessObject?.module}/${baseBusinessService}/ViewScreen?applicationNumber=${applicationNumber}&serviceCode=${serviceCode}&businessService=${currentBusinessService}`
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "N/A";
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center justify-center mt-5">
          <h1 className="text-5xl font-black text-gray-900 mb-2">Recherche de Demandes</h1>
          <p className="text-gray-600">Recherchez et trouvez rapidement les demandes de permis de construction</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <LuSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Rechercher par numéro de dossier, nom du demandeur, téléphone..."
                className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-djibouti-primary focus:border-djibouti-primary text-lg transition-all duration-200"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || servicesLoading}
              className="px-8 py-4 bg-djibouti-primary text-white font-semibold rounded-xl hover:bg-djibouti-primary-dark transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <LuLoader className="h-5 w-5 animate-spin" />
                  Recherche...
                </>
              ) : servicesLoading ? (
                <>
                  <LuLoader className="h-5 w-5 animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  <LuSearch className="h-5 w-5" />
                  Rechercher
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 flex items-center justify-between text-red-600 bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <LuCircleAlert className="h-5 w-5" />
                <span>{error}</span>
              </div>
              <button
                onClick={searchApplications}
                disabled={isLoading}
                className="text-sm px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors duration-200 disabled:opacity-50"
              >
                Réessayer
              </button>
            </div>
          )}
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Résultats de recherche
                {searchResults.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({searchResults.length} résultat{searchResults.length > 1 ? "s" : ""})
                  </span>
                )}
              </h2>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3 text-gray-600">
                  <LuLoader className="h-6 w-6 animate-spin" />
                  <span>Recherche en cours...</span>
                </div>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <LuFileText className="h-16 w-16 mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Aucun résultat trouvé</h3>
                <p className="text-center">
                  Aucune demande ne correspond à votre recherche.
                  <br />
                  Essayez avec d'autres termes ou vérifiez l'orthographe.
                </p>
              </div>
            ) : (
                             <div className="divide-y divide-gray-200">
                 {searchResults.map((app) => {
                   // Extract data from the API response structure
                   const applicant = app.applicants?.[0];
                   const statusInfo = getStatusInfoFromUtils(app.status);
                   const serviceInfo = getServiceInfo(app.businessService);
                   const createdTime = app.auditDetails?.createdTime;

                   return (
                     <div key={app.applicationNumber} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                       <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                         <div className="flex-1">
                           <div className="flex items-start justify-between mb-3">
                             <div>
                               <h3 className="text-lg font-semibold text-gray-900 mb-1">{app.applicationNumber}</h3>
                               <p className="text-sm text-gray-600">{serviceInfo?.name || app.businessService}</p>
                             </div>
                             <span
                               className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                             >
                               {statusInfo.label}
                             </span>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                             <div className="flex items-center gap-2 text-gray-600">
                               <LuUser className="h-4 w-4 text-gray-400" />
                               <span className="text-sm">
                                 <span className="font-medium">Demandeur:</span> {applicant?.name || "N/A"}
                               </span>
                             </div>

                             <div className="flex items-center gap-2 text-gray-600">
                               <LuMapPin className="h-4 w-4 text-gray-400" />
                               <span className="text-sm">
                                 <span className="font-medium">Téléphone:</span> {applicant?.mobileNumber || "N/A"}
                               </span>
                             </div>

                             <div className="flex items-center gap-2 text-gray-600">
                               <LuCalendar className="h-4 w-4 text-gray-400" />
                               <span className="text-sm">
                                 <span className="font-medium">Date:</span> {formatDate(createdTime)}
                               </span>
                             </div>
                           </div>
                         </div>

                         <div className="flex-shrink-0">
                           <button
                             onClick={() => viewApplicationDetails(app)}
                             className="inline-flex items-center gap-2 px-4 py-2 bg-djibouti-primary text-white text-sm font-medium rounded-lg hover:bg-djibouti-primary-dark transition-colors duration-200"
                           >
                             <LuEye className="h-4 w-4" />
                             Voir détails
                           </button>
                         </div>
                       </div>
                     </div>
                   );
                 })}
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeSearch;
