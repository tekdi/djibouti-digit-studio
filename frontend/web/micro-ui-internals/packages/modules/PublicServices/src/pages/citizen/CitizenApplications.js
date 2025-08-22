import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Loader } from "@egovernments/digit-ui-components";
import axios from "axios";
import { 
  LuSearch, 
  LuBuilding, 
  LuFileText, 
  LuClock, 
  LuCircleCheck, 
  LuCalendar,
  LuMapPin,
  LuEye,
  LuRefreshCw,
  LuShield,
  LuAward
} from "react-icons/lu";

const CitizenApplications = () => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();

  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [businessServiceFilter, setBusinessServiceFilter] = useState("all");
  const [individualDetails, setIndividualDetails] = useState();
  
  const indId = individualDetails && individualDetails?.Individual?.[0]?.individualId;
  const userDetails = Digit.UserService.getUser();
  const uuid = userDetails?.info?.uuid;

  console.log(userDetails);

  // Fetch individual details - only run once
  useEffect(() => {
    const fetchIndividualDetails = async () => {
      if (!uuid) return;
      
      try {
        const response = await axios.post(`/health-individual/v1/_search?tenantId=${tenantId}&limit=1&offset=0`, {
          "RequestInfo": {
            apiId: "Rainmaker",
            authToken: userDetails?.access_token,
            userInfo: userDetails?.info,
            msgId: `${Date.now()}|${Digit.StoreData.getCurrentLanguage()}`,
          },
          "Individual": {
            "userUuid": [uuid]
          }
        });
        setIndividualDetails(response?.data);
      } catch (error) {
        console.error("Error fetching individual details:", error);
      }
    };

    fetchIndividualDetails();
  }, [tenantId, uuid]);

  // Fetch applications - only run when indId is available
  useEffect(() => {
    const fetchApplications = async () => {
      if (!indId || !uuid) {
        console.log("Missing required data:", { indId, uuid });
        return;
      }
      
      setIsLoading(true);
      try {
        console.log("Fetching applications with params:", {
          tenantId,
          userId: indId,
          status: "ACTIVE",
          createdBy: uuid
        });

        const response = await axios.get(`/public-service/v1/application`, {
          params: {
            tenantId: tenantId,
            userId: indId,
            status: "ACTIVE",
            createdBy: uuid
          },
          headers: {
            "X-Tenant-Id": tenantId,
            "auth-token": userDetails?.access_token,
          },
        });

        console.log("API Response:", response?.data);
        setApplications(response?.data?.Application || []);
      } catch (error) {
        console.error("Error fetching applications:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [tenantId, indId, uuid]);

  // Get service info mapping from Apply.js
  const getServiceInfo = (businessService) => {
    const serviceMap = {
      BPA_PCO: {
        ref: "P1",
        name: "Permis de Construire Ordinaire (PCO) – Constructions Accueillant du Public",
        description: "Hôtel, Hôpital, École, etc.",
        category: "permits"
      },
      BPA_PCO_SIMPLE: {
        ref: "P2", 
        name: "Permis de Construire Ordinaire (PCO) – Constructions Simples",
        description: "Pour les constructions résidentielles et commerciales simples",
        category: "permits"
      },
      BPA_PR: {
        ref: "P3",
        name: "Permis de Remblai (PR)",
        description: "Autorisation pour travaux de remblai",
        category: "permits"
      },
      BPA_PL: {
        ref: "P4",
        name: "Permis de Lotir",
        description: "Division d'un terrain en plusieurs lots",
        category: "permits"
      },
      BPA_PCS: {
        ref: "P5",
        name: "Permis de Construire Simplifié (PCS)",
        description: "Pour les constructions de petite taille",
        category: "permits"
      },
      BPA_PD: {
        ref: "P6",
        name: "Permis de Démolir",
        description: "Autorisation de démolition d'une construction",
        category: "permits"
      },
      BPA_PF: {
        ref: "P7",
        name: "Permis de Clôture",
        description: "Autorisation pour construire une clôture",
        category: "permits"
      },
      BPA_PS: {
        ref: "P8",
        name: "Permis de Surélévation",
        description: "Ajout d'un ou plusieurs étages",
        category: "permits"
      },
      BPA_ATARR: {
        ref: "P9",
        name: "Autorisation des Travaux, d'Aménagement, de Rénovation et de Réhabilitation",
        description: "ATARR pour tous types de travaux",
        category: "permits"
      },
      BPA_CCR: {
        ref: "P10",
        name: "Certificat de Conformité de Remblai (CCR)",
        description: "Validation de conformité des travaux de remblai",
        category: "certificates"
      },
      BPA_CCE: {
        ref: "P11",
        name: "Certificat de Conformité Électrique (CCE)",
        description: "Validation de l'installation électrique",
        category: "certificates"
      },
      BPA_CCP: {
        ref: "P12",
        name: "Certificat de Conformité Parasismique (CCP)",
        description: "Validation des normes parasismiques",
        category: "certificates"
      },
      BPA_CCG: {
        ref: "P13",
        name: "Certificat de Conformité Général (CCG)",
        description: "Validation générale de conformité",
        category: "certificates"
      },
      BPA_PV: {
        ref: "P14",
        name: "Procès-Verbal d'Implantation",
        description: "PV d'Implantation pour positionnement",
        category: "validations"
      },
      BPA_APE: {
        ref: "P15",
        name: "Approbation de Plan d'Exécution (APE)",
        description: "Validation des plans d'exécution",
        category: "validations"
      }
    };
    return serviceMap[businessService] || {
      ref: "P?",
      name: businessService,
      description: "Service administratif en ligne"
    };
  };

  // Get service icon based on service type
  const getServiceIcon = (businessService) => {
    const iconMap = {
      BPA_PCO: LuBuilding,
      BPA_PCO_SIMPLE: LuBuilding,
      BPA_PR: LuMapPin,
      BPA_PL: LuMapPin,
      BPA_PCS: LuBuilding,
      BPA_PD: LuFileText,
      BPA_PF: LuShield,
      BPA_PS: LuBuilding,
      BPA_ATARR: LuFileText,
      BPA_CCR: LuAward,
      BPA_CCE: LuAward,
      BPA_CCP: LuAward,
      BPA_CCG: LuAward,
      BPA_PV: LuFileText,
      BPA_APE: LuFileText,
    };
    return iconMap[businessService] || LuFileText;
  };

  // Simplified status mapping based on workflow
  const getSimplifiedStatus = (status) => {
    if (status === "INITIATED") return "draft";
    if (status === "PERMIT_GRANTED" || status === "CERTIFICATE_ISSUED") return "granted";
    if (status === "PERMIT_REJECTED" || status === "CERTIFICATE_REJECTED") return "rejected";
    if (status === "INITIATED" || 
        (status !== "PERMIT_GRANTED" && status !== "PERMIT_REJECTED" && 
         status !== "CERTIFICATE_ISSUED" && status !== "CERTIFICATE_REJECTED")) {
      return "in_progress";
    }
    return "in_progress";
  };

  // Get status info for display
  const getStatusInfo = (status) => {
    const simplifiedStatus = getSimplifiedStatus(status);
    
    switch (simplifiedStatus) {
      case "draft":
        return { 
          color: "text-gray-600", 
          bgColor: "bg-gray-50", 
          icon: LuFileText, 
          label: "Brouillon",
          progress: 10
        };
      case "in_progress":
        return { 
          color: "text-blue-600", 
          bgColor: "bg-blue-50", 
          icon: LuClock, 
          label: "En cours d'examen",
          progress: 60
        };
      case "granted":
        return { 
          color: "text-green-600", 
          bgColor: "bg-green-50", 
          icon: LuCircleCheck, 
          label: "Permis Accordé",
          progress: 100
        };
      case "rejected":
        return { 
          color: "text-red-600", 
          bgColor: "bg-red-50", 
          icon: LuFileText, 
          label: "Permis Rejeté",
          progress: 0
        };
      default:
        return { 
          color: "text-gray-600", 
          bgColor: "bg-gray-50", 
          icon: LuFileText, 
          label: "En cours",
          progress: 30
        };
    }
  };

  // Filter applications based on search and filters
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = searchTerm === "" || 
        app.applicationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getServiceInfo(app.businessService).name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicants?.[0]?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || 
        getSimplifiedStatus(app.processInstance?.[0]?.state?.applicationStatus) === statusFilter;

      const matchesBusinessService = businessServiceFilter === "all" || 
        app.businessService === businessServiceFilter;

      return matchesSearch && matchesStatus && matchesBusinessService;
    });
  }, [applications, searchTerm, statusFilter, businessServiceFilter]);

  // Get unique business services for filter
  const businessServices = useMemo(() => {
    const services = [...new Set(applications.map(app => app.businessService))];
    return services.filter(Boolean);
  }, [applications]);

  // Simplified status options
  const statusOptions = [
    { value: "all", label: "Tous les statuts" },
    { value: "draft", label: "Brouillon" },
    { value: "in_progress", label: "En cours d'examen" },
    { value: "granted", label: "Permis Accordé" },
    { value: "rejected", label: "Permis Rejeté" }
  ];

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Refresh applications
  const handleRefresh = () => {
    window.location.reload();
  };

  if (isLoading) return <Loader />;

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Demandes</h1>
              <p className="text-gray-600">Gérez et suivez toutes vos demandes de permis</p>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
            >
              <LuRefreshCw className="w-4 h-4" />
              Actualiser
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par numéro de demande, type de service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-djibouti-primary focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-djibouti-primary focus:border-transparent transition-all duration-200"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Business Service Filter */}
            <div className="lg:w-48">
              <select
                value={businessServiceFilter}
                onChange={(e) => setBusinessServiceFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-djibouti-primary focus:border-transparent transition-all duration-200"
              >
                <option value="all">Tous les services</option>
                {businessServices.map(service => (
                  <option key={service} value={service}>
                    {getServiceInfo(service).name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredApplications.length} demande{filteredApplications.length !== 1 ? 's' : ''} trouvée{filteredApplications.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Applications Grid */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <LuFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune demande trouvée</h3>
            <p className="text-gray-600">Aucune demande ne correspond à vos critères de recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApplications.map((app) => {
              const statusInfo = getStatusInfo(app.processInstance?.[0]?.state?.applicationStatus);
              const StatusIcon = statusInfo.icon;
              const ServiceIcon = getServiceIcon(app.businessService);
              const serviceInfo = getServiceInfo(app.businessService);
              const applicant = app.applicants?.[0];

              return (
                <div key={app.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
                  {/* Header with status tag only */}
                  <div className="p-4 pb-0 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                      <div className="px-3 py-1 rounded-full bg-gray-50 border border-gray-200">
                        <div className="flex items-center gap-1">
                          <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                          <span className={`text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Title - Service Name */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {serviceInfo.name}
                    </h3>
                    
                    {/* Reference */}
                    <p className="text-sm text-gray-500 mb-4">
                      Réf. {serviceInfo.ref} • {app.applicationNumber}
                    </p>
                  </div>

                  {/* Content */}
                  <div className="p-4 pt-0">
                    <div className="space-y-4">
                      {/* Progress */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Progression</span>
                          <span className="text-sm font-medium text-gray-900">{statusInfo.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${statusInfo.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Current Step */}
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <LuClock className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 underline">
                            Étape actuelle
                          </p>
                          <p className="text-xs text-gray-600">
                            {statusInfo.label === "Brouillon" ? "Saisie des informations" :
                             statusInfo.label === "En cours d'examen" ? "Vérification des documents" :
                             statusInfo.label === "Permis Accordé" ? "Permis délivré" :
                             statusInfo.label === "Permis Rejeté" ? "Demande rejetée" : "Traitement en cours"}
                          </p>
                        </div>
                      </div>

                      {/* Next Step */}
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 rounded-lg">
                          <LuCircleCheck className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Prochaine étape
                          </p>
                          <p className="text-xs text-gray-600">
                            {statusInfo.label === "Brouillon" ? "Soumission" :
                             statusInfo.label === "En cours d'examen" ? "Analyse technique" :
                             statusInfo.label === "Permis Accordé" ? "Permis disponible" :
                             statusInfo.label === "Permis Rejeté" ? "Nouvelle demande" : "Validation"}
                          </p>
                        </div>
                      </div>

                      {/* Created Date */}
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg">
                          <LuCalendar className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Date de création
                          </p>
                          <p className="text-xs text-gray-600">
                            {formatDate(app.auditDetails?.createdTime)}
                          </p>
                        </div>
                      </div>

                      {/* Location */}
                      {app.serviceDetails?.landandProjectDesignDetails?.[0]?.region && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-50 rounded-lg">
                            <LuMapPin className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Localisation
                            </p>
                            <p className="text-xs text-gray-600">
                              {app.serviceDetails.landandProjectDesignDetails[0].region}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <a 
                        href={`/${window.contextPath}/citizen/publicservices/BPA/${app.businessService}/ViewScreen?applicationNumber=${app.applicationNumber}&serviceCode=${app.serviceCode}&businessService=${app.businessService}`}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-djibouti-primary text-white rounded-xl hover:bg-djibouti-primary-dark transition-colors duration-200"
                      >
                        <span>Voir les détails</span>
                        <LuEye className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenApplications;
