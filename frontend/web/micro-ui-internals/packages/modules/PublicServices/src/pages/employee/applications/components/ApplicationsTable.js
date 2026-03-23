import React from "react";
import { useHistory } from "react-router-dom";
import { LuRefreshCw, LuArrowUpRight, LuChevronLeft, LuChevronRight, LuChevronsLeft, LuChevronsRight, LuInbox, LuFileText, LuUser, LuCalendar } from "react-icons/lu";
import { getStatusInfo, formatDate, getServiceInfo } from "../utils";

const truncateName = (name, max = 20) => {
  if (!name) return "—";
  return name.length > max ? name.slice(0, max) + "..." : name;
};

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

  const handleViewDetails = (app) => {
    const bo = app.businessObject;
    const bs = bo?.businessService;
    const cbs = app?.ProcessInstance?.businessService || bs;
    const userType = Digit.UserService.getType()?.toLowerCase();
    history.push(
      `/${window.contextPath}/${userType}/publicservices/${bo?.module}/${bs}/ViewScreen?applicationNumber=${bo?.applicationNumber}&serviceCode=${bo?.serviceCode}&businessService=${cbs}`
    );
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="p-4 sm:p-5 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse flex items-center gap-4 rounded-xl border border-gray-50 p-4">
            <div className="h-10 w-10 rounded-xl bg-gray-100 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded-lg bg-gray-100" />
              <div className="h-3 w-1/4 rounded-lg bg-gray-50" />
            </div>
            <div className="h-5 w-20 rounded-full bg-gray-50" />
            <div className="h-3 w-16 rounded-lg bg-gray-50" />
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (filteredApplications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
          <LuInbox className="h-7 w-7 text-gray-300" />
        </div>
        <h3 className="mb-1 text-sm font-bold text-gray-900">Aucune demande trouvée</h3>
        <p className="text-xs text-gray-400">Essayez de modifier vos filtres</p>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <table className="w-full">
          <thead>
            <tr>
              <th className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500">N° Dossier</th>
              <th className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500">Demandeur</th>
              <th className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500">Service</th>
              <th className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500">Statut</th>
              <th className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500">Date</th>
              <th className="px-5 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedApplications.map((app) => {
              const bo = app.businessObject;
              const pi = app.ProcessInstance;
              const applicant = bo?.applicants?.[0];
              const serviceInfo = getServiceInfo(bo?.businessService);
              const status = pi?.state?.applicationStatus;
              const statusInfo = getStatusInfo(status);

              return (
                <tr
                  key={bo?.applicationNumber}
                  onClick={() => handleViewDetails(app)}
                  className="group cursor-pointer border-b border-gray-50 transition-colors hover:bg-gray-50/80"
                >
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-semibold text-gray-900 group-hover:text-primary">{bo?.applicationNumber}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]" title={applicant?.name}>
                        {truncateName(applicant?.name)}
                      </p>
                      {applicant?.mobileNumber && (
                        <p className="text-[11px] text-gray-400">{applicant.mobileNumber}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {serviceInfo?.ref && (
                        <span className="shrink-0 rounded-md bg-primary/8 px-1.5 py-0.5 text-[9px] font-bold text-primary">{serviceInfo.ref}</span>
                      )}
                      <span className="text-sm text-gray-600 truncate max-w-[140px]">{serviceInfo?.shortName || bo?.businessService}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                      {statusInfo.icon && <statusInfo.icon className="h-3 w-3" />}
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-gray-500">{formatDate(bo?.auditDetails?.createdTime)}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <LuArrowUpRight className="inline-block h-4 w-4 text-gray-200 transition-colors group-hover:text-primary" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="lg:hidden divide-y divide-gray-50">
        {paginatedApplications.map((app) => {
          const bo = app.businessObject;
          const pi = app.ProcessInstance;
          const applicant = bo?.applicants?.[0];
          const serviceInfo = getServiceInfo(bo?.businessService);
          const status = pi?.state?.applicationStatus;
          const statusInfo = getStatusInfo(status);

          return (
            <button
              key={bo?.applicationNumber}
              onClick={() => handleViewDetails(app)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-gray-50/80"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${statusInfo.bgColor}`}>
                {statusInfo.icon ? <statusInfo.icon className={`h-4 w-4 ${statusInfo.color}`} /> : <LuFileText className="h-4 w-4 text-gray-400" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900 truncate">{bo?.applicationNumber}</span>
                  {serviceInfo?.ref && (
                    <span className="shrink-0 rounded-md bg-primary/8 px-1 py-0.5 text-[9px] font-bold text-primary">{serviceInfo.ref}</span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1 truncate"><LuUser className="h-3 w-3" />{truncateName(applicant?.name, 15)}</span>
                  <span className="flex items-center gap-1"><LuCalendar className="h-3 w-3" />{formatDate(bo?.auditDetails?.createdTime)}</span>
                </div>
              </div>
              <LuArrowUpRight className="h-4 w-4 shrink-0 text-gray-200" />
            </button>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
          <p className="text-xs text-gray-500">
            <span className="font-semibold text-gray-900">{startIndex}</span>–<span className="font-semibold text-gray-900">{endIndex}</span> sur <span className="font-semibold text-gray-900">{totalCount}</span>
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => onPageChange(1)} disabled={currentPage === 1} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30">
              <LuChevronsLeft className="h-4 w-4" />
            </button>
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30">
              <LuChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              if (p > totalPages) return null;
              return (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`h-8 min-w-[2rem] rounded-lg px-2 text-xs font-semibold transition-colors ${
                    p === currentPage ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30">
              <LuChevronRight className="h-4 w-4" />
            </button>
            <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30">
              <LuChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsTable;
