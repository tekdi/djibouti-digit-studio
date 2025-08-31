import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import useApplications from "./useApplications";
import { getStatusInfo, getSimplifiedStatus, formatDate, getServiceInfo, getServiceShortName } from "./utils";
import axios from "axios";
import { 
  LuSearch, 
  LuRefreshCw, 
  LuFilter, 
  LuEye, 
  LuChevronLeft, 
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
  LuFolder,
  LuCircle,
  LuClock,
  LuCircleCheck
} from "react-icons/lu";

const EmployeeApplications = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBusinessService, setSelectedBusinessService] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    applications,
    isLoading,
    isRefreshing,
    error,
    refreshApplications,
    lastFetchTime
  } = useApplications();

  const [businessServices, setBusinessServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  // Fetch business services like in InboxService.js
  useEffect(() => {
    const fetchBusinessServices = async () => {
      setServicesLoading(true);
      try {
        const tenantId = Digit.ULBService.getCurrentTenantId();
        const response = await axios.get("/public-service/v1/service", {
          params: { tenantId: tenantId },
          headers: {
            "X-Tenant-Id": tenantId,
            "auth-token": Digit.UserService.getUser()?.access_token,
          },
        });

        const services = response?.data?.Services || [];
        setBusinessServices(services);
      } catch (error) {
        console.error("Error fetching business services:", error);
        setBusinessServices([]);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchBusinessServices();
  }, []);

  // Filter applications based on search and filters (like citizen applications)
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      // Extract data from inbox API structure
      const businessObject = app.businessObject;
      const processInstance = app.ProcessInstance;
      
      const applicationNumber = businessObject?.applicationNumber;
      const businessService = businessObject?.businessService;
      const applicantName = businessObject?.applicants?.[0]?.name;
      const createdTime = businessObject?.auditDetails?.createdTime;

      const matchesSearch = searchTerm === "" || 
        applicationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        businessService?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicantName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBusinessService = selectedBusinessService === "" || 
        businessService === selectedBusinessService;

      // Date filtering
      let matchesDate = true;
      if (dateRange?.[0] || dateRange?.[1]) {
        const applicationDate = new Date(createdTime || Date.now());
        const start = dateRange?.[0] ? new Date(dateRange[0]) : null;
        const end = dateRange?.[1] ? new Date(dateRange[1]) : null;

        if (start && end) {
          matchesDate = applicationDate >= start && applicationDate <= end;
        } else if (start) {
          matchesDate = applicationDate >= start;
        } else if (end) {
          matchesDate = applicationDate <= end;
        }
      }

      return matchesSearch && matchesBusinessService && matchesDate;
    });
  }, [applications, searchTerm, selectedBusinessService, dateRange]);

  // Get unique business services for filter
  const availableBusinessServices = useMemo(() => {
    const services = [...new Set(applications.map(app => app.businessObject?.businessService))];
    return services.filter(Boolean);
  }, [applications]);

  const getStatusTag = (status) => {
    const statusInfo = getStatusInfo(status);
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
        {statusInfo.icon && <statusInfo.icon className="w-3 h-3 mr-1" />}
        {statusInfo.label}
      </span>
    );
  };

  const getPriorityTag = (priority) => {
    const priorityConfig = {
      HIGH: { color: "bg-red-100 text-red-800", label: "Haute" },
      MEDIUM: { color: "bg-orange-100 text-orange-800", label: "Moyenne" },
      LOW: { color: "bg-green-100 text-green-800", label: "Basse" }
    };
    const config = priorityConfig[priority] || { color: "bg-gray-100 text-gray-800", label: "Non définie" };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleBusinessServiceChange = (value) => {
    setSelectedBusinessService(value);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (startDate, endDate) => {
    setDateRange([startDate, endDate]);
    setCurrentPage(1);
    setShowDatePicker(false);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedBusinessService("");
    setDateRange(null);
    setCurrentPage(1);
  };

  // Pagination logic
  const totalCount = filteredApplications.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount);
  
  // Get paginated applications
  const paginatedApplications = filteredApplications.slice(startIndex - 1, endIndex);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tous les dossiers</h1>
          <p className="text-gray-500 mt-1">Vue d'ensemble de tous les dossiers</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 px-3 py-2 bg-white text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 shadow-sm transition-all duration-200"
            onClick={refreshApplications}
            disabled={isRefreshing}
          >
            <LuRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Applications Card */}
        <div className="rounded-xl shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-md hover:-translate-y-1">
          <div className="bg-gradient-to-r from-primary to-primary-dark p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Total dossiers</p>
                <h3 className="text-2xl font-bold text-white mt-1">{totalCount || 0}</h3>
              </div>
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm border border-white/10">
                <LuFolder className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-2 text-xs text-white/80 flex items-center gap-0.5">
              <span>Tous statuts confondus</span>
            </div>
          </div>
        </div>
        
        {/* New Applications Card */}
        <div className="rounded-xl shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-md hover:-translate-y-1">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Nouveaux</p>
                <h3 className="text-2xl font-bold text-white mt-1">{applications.filter(app => app.ProcessInstance?.state?.applicationStatus === 'AGENT_NOT_ASSIGNED').length}</h3>
              </div>
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm border border-white/10">
                <LuCircle className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-2 text-xs text-white/80 flex items-center gap-0.5">
              <span>À assigner</span>
            </div>
          </div>
        </div>
        
        {/* In Progress Card */}
        <div className="rounded-xl shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-md hover:-translate-y-1">
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">En cours</p>
                <h3 className="text-2xl font-bold text-white mt-1">{applications.filter(app => app.ProcessInstance?.state?.applicationStatus !== 'AGENT_NOT_ASSIGNED' && app.ProcessInstance?.state?.applicationStatus !== 'PERMIT_GRANTED' && app.ProcessInstance?.state?.applicationStatus !== 'CERTIFICATE_GRANTED').length}</h3>
              </div>
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm border border-white/10">
                <LuClock className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-2 text-xs text-white/80 flex items-center gap-0.5">
              <span>En traitement</span>
            </div>
          </div>
        </div>
        
        {/* Approved Card */}
        <div className="rounded-xl shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-md hover:-translate-y-1">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Approuvés</p>
                <h3 className="text-2xl font-bold text-white mt-1">{applications.filter(app => app.ProcessInstance?.state?.applicationStatus === 'PERMIT_GRANTED' || app.ProcessInstance?.state?.applicationStatus === 'CERTIFICATE_GRANTED').length}</h3>
              </div>
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm border border-white/10">
                <LuCircleCheck className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-2 text-xs text-white/80 flex items-center gap-0.5">
              <span>Terminés avec succès</span>
            </div>
          </div>
        </div>
      </div>

            {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LuSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary"
              placeholder="Rechercher par numéro, titre, demandeur ou agent..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <select
                className="rounded-lg border-gray-300 focus:ring-primary focus:border-primary pr-10 bg-white"
                value={selectedBusinessService}
                onChange={(e) => handleBusinessServiceChange(e.target.value)}
              >
                <option value="">Tous les services</option>
                {availableBusinessServices.map((serviceCode) => {
                  const shortName = getServiceShortName(serviceCode);
                  return (
                    <option key={serviceCode} value={serviceCode}>
                      {shortName}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
              >
                <LuFilter className="w-4 h-4" />
                <span>{dateRange ? `${formatDate(dateRange[0])} - ${formatDate(dateRange[1])}` : "Filtrer par date"}</span>
              </button>
              
              {showDatePicker && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={dateRange?.[0]?.toISOString().split('T')[0] || ''}
                      onChange={(e) => handleDateRangeChange(new Date(e.target.value), dateRange?.[1])}
                      className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                    <input
                      type="date"
                      value={dateRange?.[1]?.toISOString().split('T')[0] || ''}
                      onChange={(e) => handleDateRangeChange(dateRange?.[0], new Date(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <button
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
              onClick={clearFilters}
            >
              <LuFilter className="w-4 h-4" />
              <span>Réinitialiser</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Erreur lors du chargement des demandes
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={refreshApplications}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Applications List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  N° Dossier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Demandeur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date de soumission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                             {isLoading ? (
                 <tr>
                   <td colSpan="6" className="px-6 py-4 text-center">
                     <div className="flex items-center justify-center">
                       <LuRefreshCw className="animate-spin h-6 w-6 text-primary" />
                       <span className="ml-2">Chargement...</span>
                     </div>
                   </td>
                 </tr>
                             ) : filteredApplications.length === 0 ? (
                 <tr>
                   <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                     Aucune demande trouvée
                   </td>
                 </tr>
              ) : (
                paginatedApplications.map((app) => {
                  // Extract data from inbox API structure
                  const businessObject = app.businessObject;
                  const processInstance = app.ProcessInstance;
                  
                  const applicant = businessObject?.applicants?.[0];
                  const serviceInfo = getServiceInfo(businessObject?.businessService);
                  const status = processInstance?.state?.applicationStatus;
                  const applicationNumber = businessObject?.applicationNumber;
                  const businessService = businessObject?.businessService;
                  const createdTime = businessObject?.auditDetails?.createdTime;
                  
                  return (
                    <tr key={applicationNumber} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {applicationNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{applicant?.name}</div>
                          <div className="text-sm text-gray-500">{applicant?.mobileNumber}</div>
                        </div>
                      </td>
                                             <td className="px-6 py-4">
                         <span className="text-sm text-gray-700">
                           {serviceInfo?.name || businessService}
                         </span>
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusTag(status)}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(createdTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            const userType = Digit.UserService.getType()?.toLowerCase();
                            history.push(
                              `/${window.contextPath}/${userType}/publicservices/${businessObject?.module}/${businessService}/ViewScreen?applicationNumber=${applicationNumber}&serviceCode=${businessService}`
                            );
                          }}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                          <LuEye className="h-4 w-4 mr-1" />
                          Détails
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Précédent
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de <span className="font-medium">{startIndex}</span> à <span className="font-medium">{endIndex}</span> sur{' '}
                <span className="font-medium">{totalCount}</span> demandes
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <LuChevronsLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <LuChevronLeft className="h-5 w-5" />
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNum === currentPage
                          ? 'z-10 bg-primary border-primary text-white'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <LuChevronRight className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <LuChevronsRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeApplications;
