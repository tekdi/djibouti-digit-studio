import React from "react";
import { useHistory } from "react-router-dom";
import { LuRefreshCw, LuEye, LuChevronLeft, LuChevronRight, LuChevronsLeft, LuChevronsRight } from "react-icons/lu";
import { getStatusInfo, formatDate, getServiceInfo } from "../utils";

const ApplicationsTable = ({
  isLoading,
  filteredApplications,
  paginatedApplications,
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalCount,
  onPageChange,
}) => {
  const history = useHistory();

  const getStatusTag = (status) => {
    const statusInfo = getStatusInfo(status);
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
        {statusInfo.icon && <statusInfo.icon className="w-3 h-3 mr-1" />}
        {statusInfo.label}
      </span>
    );
  };

  const handleViewDetails = (app) => {
    const businessObject = app.businessObject;
    const applicationNumber = businessObject?.applicationNumber;
    const businessService = businessObject?.businessService;
    const serviceCode = businessObject?.serviceCode;
    const userType = Digit.UserService.getType()?.toLowerCase();
    
    history.push(
      `/${window.contextPath}/${userType}/publicservices/${businessObject?.module}/${businessService}/ViewScreen?applicationNumber=${applicationNumber}&serviceCode=${serviceCode}&businessService=${businessService}`
    );
  };

  return (
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
                const businessObject = app.businessObject;
                const processInstance = app.ProcessInstance;
                const applicant = businessObject?.applicants?.[0];
                const serviceInfo = getServiceInfo(businessObject?.businessService);
                const status = processInstance?.state?.applicationStatus;
                const applicationNumber = businessObject?.applicationNumber;
                const createdTime = businessObject?.auditDetails?.createdTime;

                return (
                  <tr key={applicationNumber} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-medium text-gray-900">{applicationNumber}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{applicant?.name}</div>
                        <div className="text-sm text-gray-500">{applicant?.mobileNumber}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {serviceInfo?.ref} - {serviceInfo?.shortName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusTag(status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(createdTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewDetails(app)}
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
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Précédent
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Affichage de <span className="font-medium">{startIndex}</span> à{" "}
              <span className="font-medium">{endIndex}</span> sur{" "}
              <span className="font-medium">{totalCount}</span> demandes
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <LuChevronsLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => onPageChange(currentPage - 1)}
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
                    onClick={() => onPageChange(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      pageNum === currentPage
                        ? "z-10 bg-primary border-primary text-white"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <LuChevronRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => onPageChange(totalPages)}
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
  );
};

export default ApplicationsTable;
