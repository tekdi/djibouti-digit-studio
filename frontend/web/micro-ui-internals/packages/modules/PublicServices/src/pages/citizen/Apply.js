import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Loader } from "@egovernments/digit-ui-components";
import { LuFileText, LuBuilding, LuMapPin, LuShield, LuClock, LuCircleCheck, LuArrowRight, LuInfo, LuSearch, LuFilter, LuAward } from "react-icons/lu";
import axios from "axios";
import { transformResponseforModulePage } from "../../utils";

const Apply = () => {
  const { t } = useTranslation();
  const [individualDetails, setIndividualDetails] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const userDetails = Digit.UserService.getUser();
  const roles = userDetails?.info?.roles;
  const isCitizen = roles?.length === 1 && roles[0].code === "CITIZEN";
  const isArchitect = roles?.some((role) => role.code === "BPA_ARCHITECT");
  const uuid = userDetails?.info?.uuid;
  const userType = userDetails?.info?.type?.toLowerCase();

  // Fetch service configurations from MDMS
  const mdmsRequestCriteria = {
    url: "/egov-mdms-service/v2/_search",
    body: {
      MdmsCriteria: {
        tenantId: tenantId,
        schemaCode: "Studio.ServiceConfiguration",
      },
    },
  };
  const { data: mdmsData } = Digit.Hooks.useCustomAPIHook(mdmsRequestCriteria);

  // Fetch service details configured for the tenant
  const request = {
    url: "/public-service/v1/service",
    params: { tenantId: tenantId },
    headers: {
      "X-Tenant-Id": tenantId,
      "auth-token": Digit.UserService.getUser()?.access_token,
    },
    method: "GET",
  };
  const { isLoading: servicesDataLoading, data: servicesData } = Digit.Hooks.useCustomAPIHook(request);

  const module = servicesData?.Services?.[0]?.module;

  // Transform services data
  let detailsConfig = servicesData ? transformResponseforModulePage(servicesData?.Services) : [];
  const hasNoData = detailsConfig.length === 0 && !servicesDataLoading;

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


  // Filter options
  const filterOptions = [
    { value: "all", label: "Tous les services", icon: LuFilter },
    { value: "permits", label: "Permis", icon: LuBuilding },
    { value: "certificates", label: "Certificats", icon: LuAward },
    { value: "validations", label: "Validations", icon: LuFileText }
  ];

  // Get service description and ref based on service type
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

  // Fetch individual details for citizens
  useEffect(async () => {
    if (!isCitizen && !isArchitect) return;
    try {
      const response = await axios.post(`/health-individual/v1/_search?tenantId=${tenantId}&limit=1&offset=0`, {
        RequestInfo: {
          apiId: "Rainmaker",
          authToken: userDetails?.access_token,
          userInfo: userDetails?.info,
          msgId: `${Date.now()}|${Digit.StoreData.getCurrentLanguage()}`,
        },
        Individual: {
          userUuid: [uuid],
        },
      });
      setIndividualDetails(response?.data);
    } catch (error) {
      console.error("Error fetching individual details:", error);
    }
  }, []);

  if (servicesDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (hasNoData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-djibouti-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
            <LuInfo className="w-8 h-8 text-djibouti-primary" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t("NO_SERVICES_AVAILABLE")}</h2>
          <p className="text-gray-600">Aucun service n'est actuellement disponible.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-6 pt-8">
              {/* Header Section - Clean like NewApplicationProcess */}
        <div className="bg-white rounded-2xl border border-gray-100 px-8 py-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nouvelle Demande</h1>
          <p className="text-gray-600 text-lg">Sélectionnez le service pour lequel vous souhaitez faire une demande.</p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LuSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-djibouti-primary focus:border-djibouti-primary"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            {filterOptions.map((filter) => {
              const FilterIcon = filter.icon;
              return (
                <button
                  key={filter.value}
                  onClick={() => setSelectedFilter(filter.value)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedFilter === filter.value
                      ? 'bg-djibouti-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FilterIcon className="w-4 h-4" />
                  <span>{filter.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      {/* Services Grid - Clean cards like NewApplicationProcess */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {detailsConfig?.map((product, productIndex) => (
          <React.Fragment key={productIndex}>
            {product?.businessServices
              ?.filter((bs) => {
                if (isCitizen) {
                  return (
                    bs.businessService === "BPA_PCO_SIMPLE" ||
                    bs.businessService === "BPA_PCS" ||
                    bs.businessService === "BPA_PL" ||
                    bs.businessService === "BPA_PD" ||
                    bs.businessService === "BPA_PF" ||
                    bs.businessService === "BPA_ATARR"
                  );
                }
                return true; // show all for architects
              })
              ?.filter((bs) => {
                const serviceInfo = getServiceInfo(bs.businessService);
                
                // Filter by category
                if (selectedFilter !== "all" && serviceInfo.category !== selectedFilter) {
                  return false;
                }
                
                // Filter by search term
                if (searchTerm) {
                  const searchLower = searchTerm.toLowerCase();
                  return (
                    serviceInfo.name.toLowerCase().includes(searchLower) ||
                    serviceInfo.description.toLowerCase().includes(searchLower) ||
                    serviceInfo.ref.toLowerCase().includes(searchLower)
                  );
                }
                
                return true;
              })
                             ?.sort((a, b) => a.displayOrder - b.displayOrder)
               ?.map((service, serviceIndex) => {
                 const ServiceIcon = getServiceIcon(service.businessService);
                 const serviceInfo = getServiceInfo(service.businessService);

                 return (
                   <div
                     key={service.businessService}
                     className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-djibouti-primary hover:border-opacity-30 transition-all group"
                   >
                     {/* Card Header */}
                     <div className="p-6 pb-4">
                       <div className="flex items-start gap-4">
                         <div className="w-14 h-14 rounded-xl bg-djibouti-primary-light flex items-center justify-center flex-shrink-0 group-hover:bg-djibouti-primary group-hover:bg-opacity-15 transition-colors">
                           <ServiceIcon className="w-7 h-7 text-djibouti-primary" />
                         </div>
                         <div className="flex-1 min-w-0">
                           {/* Reference Number */}
                           <div className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700 mb-2">
                             Réf. {serviceInfo.ref}
                           </div>
                           <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2 group-hover:text-djibouti-primary transition-colors">
                             {serviceInfo.name}
                           </h3>
                           <p 
                             className="text-sm text-gray-600 leading-relaxed overflow-hidden" 
                             title={serviceInfo.description}
                             style={{
                               display: '-webkit-box',
                               WebkitLineClamp: 1,
                               WebkitBoxOrient: 'vertical',
                               textOverflow: 'ellipsis'
                             }}
                           >
                             {serviceInfo.description}
                           </p>
                         </div>
                       </div>
                     </div>

                     {/* Card Footer */}
                     <div className="px-6 pb-6">
                       <div className="flex items-center justify-between gap-4">
                         {/* Features */}
                         <div className="flex items-center gap-4 text-xs text-gray-500">
                           <div className="flex items-center gap-1">
                             <LuClock className="w-3 h-3" />
                             <span>Rapide</span>
                           </div>
                           <div className="flex items-center gap-1">
                             <LuCircleCheck className="w-3 h-3" />
                             <span>En ligne</span>
                           </div>
                         </div>
                         
                         {/* Apply Button */}
                         <Link
                           to={`/${window.contextPath}/${userType}/publicservices/${product.module}/${service.businessService}/Apply?serviceCode=${service.serviceCode}`}
                           className="inline-flex items-center gap-2 bg-djibouti-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-djibouti-primary-dark transition-colors group/btn"
                         >
                           <span>Faire une demande</span>
                           <LuArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                         </Link>
                       </div>
                     </div>
                   </div>
                 );
               })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Apply;
