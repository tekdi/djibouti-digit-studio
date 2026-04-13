import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import useApplications from "../applications/useApplications";
import { getStatusInfo, formatDate, getServiceInfo, resolveBusinessServiceForUser } from "../applications/utils";
import {
  LuFileText,
  LuClock,
  LuCircleCheck,
  LuArrowRight,
  LuArrowUpRight,
  LuCalendar,
  LuUser,
  LuRefreshCw,
  LuFolderOpen,
  LuSparkles
} from "react-icons/lu";

// Truncate long names
const truncateName = (name, maxLen = 20) => {
  if (!name || name === "N/A") return "N/A";
  return name.length > maxLen ? name.slice(0, maxLen) + "..." : name;
};

const EmployeeDashboard = () => {
  const { t } = useTranslation();
  const userDetails = Digit.UserService.getUser();
  const userName = userDetails?.info?.name || "Employé";

  const { applications, isLoading, isRefreshing, refreshApplications, lastFetchTime } = useApplications();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  const getFirstName = (fullName) => {
    if (!fullName) return "Employé";
    return fullName.trim().split(" ")[0];
  };

  const firstName = getFirstName(userName);
  const greeting = getGreeting();

  // Calculate statistics
  const counts = useMemo(() => {
    const newStatuses = ["AGENT_NOT_ASSIGNED", "APPLICATION_SUBMITTED", "BPA_SDECC_SUB_DIRECTOR_REVIEW", "PENDING_ACTION", "PENDING_ACTION_BY_AGENT"];
    const completedStatuses = ["PERMIT_GRANTED", "CERTIFICATE_GRANTED"];

    let total = applications.length;
    let newCount = 0;
    let inProgress = 0;
    let completed = 0;

    applications.forEach((app) => {
      const status = app.ProcessInstance?.state?.applicationStatus;
      if (newStatuses.includes(status)) newCount++;
      else if (completedStatuses.includes(status)) completed++;
      else inProgress++;
    });

    return { total, newCount, inProgress, completed };
  }, [applications]);

  // Recent applications sorted by most recent
  const recentApplications = useMemo(() => {
    if (!applications || applications.length === 0) return [];

    return [...applications]
      .sort((a, b) => {
        const timeA = a.businessObject?.auditDetails?.lastModifiedTime || a.businessObject?.auditDetails?.createdTime || 0;
        const timeB = b.businessObject?.auditDetails?.lastModifiedTime || b.businessObject?.auditDetails?.createdTime || 0;
        return timeB - timeA;
      })
      .slice(0, 6)
      .map((app) => {
        const bo = app.businessObject;
        const pi = app.ProcessInstance;
        const status = pi?.state?.applicationStatus;
        const statusInfo = getStatusInfo(status);
        const serviceInfo = getServiceInfo(bo?.businessService);
        const applicant = bo?.applicants?.[0];

        return {
          id: bo?.applicationNumber,
          title: serviceInfo?.name || bo?.businessService,
          shortName: serviceInfo?.shortName || bo?.businessService,
          ref: serviceInfo?.ref,
          client: applicant?.name || "N/A",
          clientPhone: applicant?.mobileNumber || "",
          status: statusInfo?.label || status,
          statusBg: statusInfo?.bgColor,
          statusColor: statusInfo?.color,
          statusIcon: statusInfo?.icon,
          submittedDate: formatDate(bo?.auditDetails?.createdTime),
          businessService: bo?.businessService,
          currentBusinessService: resolveBusinessServiceForUser(bo?.businessService),
          serviceCode: bo?.serviceCode,
          module: bo?.module,
        };
      });
  }, [applications]);

  const basePath = `/${window?.contextPath}/employee/publicservices`;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-3 py-4 sm:px-5 sm:py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 pt-[100px] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
            <LuFolderOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 sm:text-xl">{greeting}, {firstName}</h1>
            <p className="text-xs text-gray-400">Gestion et traitement des demandes</p>
          </div>
        </div>
        <button
          onClick={refreshApplications}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 self-start rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition-all hover:border-primary/30 hover:text-primary disabled:opacity-50 sm:self-auto"
        >
          <LuRefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Actualisation..." : "Actualiser"}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <Link to={`${basePath}/applications-employee/all`} className="group">
          <div className="rounded-2xl border border-gray-200/80 bg-gray-50 p-4 transition-all hover:border-primary/30 hover:shadow-md sm:p-5">
            <div className="mb-3 inline-flex rounded-xl bg-gray-200/60 p-2.5 text-gray-500 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
              <LuFolderOpen className="h-5 w-5" />
            </div>
            {isLoading ? <div className="h-7 w-10 animate-pulse rounded-lg bg-gray-200 mt-1" /> : <p className="text-2xl font-bold text-gray-900">{counts.total}</p>}
            <p className="mt-0.5 text-xs text-gray-500">Total dossiers</p>
          </div>
        </Link>
        <Link to={`${basePath}/applications-employee/new`} className="group">
          <div className="rounded-2xl border border-blue-200/60 bg-blue-50 p-4 transition-all hover:border-blue-300 hover:shadow-md sm:p-5">
            <div className="mb-3 inline-flex rounded-xl bg-blue-100 p-2.5 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
              <LuFileText className="h-5 w-5" />
            </div>
            {isLoading ? <div className="h-7 w-10 animate-pulse rounded-lg bg-blue-200 mt-1" /> : <p className="text-2xl font-bold text-gray-900">{counts.newCount}</p>}
            <p className="mt-0.5 text-xs text-gray-500">Nouveaux</p>
          </div>
        </Link>
        <Link to={`${basePath}/applications-employee/in-progress`} className="group">
          <div className="rounded-2xl border border-amber-200/60 bg-amber-50 p-4 transition-all hover:border-amber-300 hover:shadow-md sm:p-5">
            <div className="mb-3 inline-flex rounded-xl bg-amber-100 p-2.5 text-amber-600 transition-colors group-hover:bg-amber-500 group-hover:text-white">
              <LuClock className="h-5 w-5" />
            </div>
            {isLoading ? <div className="h-7 w-10 animate-pulse rounded-lg bg-amber-200 mt-1" /> : <p className="text-2xl font-bold text-gray-900">{counts.inProgress}</p>}
            <p className="mt-0.5 text-xs text-gray-500">En cours</p>
          </div>
        </Link>
        <Link to={`${basePath}/applications-employee/all`} className="group">
          <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50 p-4 transition-all hover:border-emerald-300 hover:shadow-md sm:p-5">
            <div className="mb-3 inline-flex rounded-xl bg-emerald-100 p-2.5 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
              <LuCircleCheck className="h-5 w-5" />
            </div>
            {isLoading ? <div className="h-7 w-10 animate-pulse rounded-lg bg-emerald-200 mt-1" /> : <p className="text-2xl font-bold text-gray-900">{counts.completed}</p>}
            <p className="mt-0.5 text-xs text-gray-500">Terminés</p>
          </div>
        </Link>
      </div>

      {/* Recent Applications */}
      <div>
        <div className="mb-3 flex items-center justify-between sm:mb-4">
          <h2 className="text-sm font-bold text-gray-900 sm:text-base">Dossiers récents</h2>
          <Link
            to={`${basePath}/applications-employee/all`}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark"
          >
            Voir tout <LuArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-2/3 rounded-lg bg-gray-100" />
                    <div className="h-5 w-12 rounded-full bg-gray-50" />
                  </div>
                  <div className="h-3 w-full rounded-lg bg-gray-50" />
                  <div className="h-5 w-24 rounded-full bg-gray-50" />
                  <div className="flex gap-3">
                    <div className="h-3 w-20 rounded-lg bg-gray-50" />
                    <div className="h-3 w-16 rounded-lg bg-gray-50" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : recentApplications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
              <LuSparkles className="h-7 w-7 text-emerald-500" />
            </div>
            <h3 className="mb-1 text-base font-bold text-gray-900">Aucun dossier</h3>
            <p className="text-sm text-gray-400">Aucun dossier récent à afficher</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {recentApplications.map((app) => (
              <Link
                key={app.id}
                to={`${basePath}/${app.module}/${app.businessService}/ViewScreen?applicationNumber=${app.id}&serviceCode=${app.serviceCode}&businessService=${app.currentBusinessService}`}
                className="group block"
              >
                <div className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:border-primary/20 hover:shadow-sm sm:p-5">
                  {/* Header: ID + ref badge + arrow */}
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-primary">{app.id}</span>
                      {app.ref && (
                        <span className="ml-1.5 inline-flex rounded-lg bg-primary/8 px-1.5 py-0.5 text-[10px] font-bold text-primary align-middle">
                          {app.ref}
                        </span>
                      )}
                    </div>
                    <LuArrowUpRight className="h-4 w-4 shrink-0 text-gray-200 transition-colors group-hover:text-primary" />
                  </div>

                  {/* Service name */}
                  <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-gray-400">{app.shortName}</p>

                  {/* Status badge */}
                  <div className="mb-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${app.statusBg} ${app.statusColor}`}>
                      {app.statusIcon && <app.statusIcon className="h-3 w-3" />}
                      {app.status}
                    </span>
                  </div>

                  {/* Spacer to push meta to bottom */}
                  <div className="mt-auto flex items-center gap-3 border-t border-gray-50 pt-3">
                    <span className="flex items-center gap-1 text-[11px] text-gray-400 truncate">
                      <LuUser className="h-3 w-3 shrink-0" />
                      {truncateName(app.client)}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-gray-400 shrink-0">
                      <LuCalendar className="h-3 w-3" />
                      {app.submittedDate}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
