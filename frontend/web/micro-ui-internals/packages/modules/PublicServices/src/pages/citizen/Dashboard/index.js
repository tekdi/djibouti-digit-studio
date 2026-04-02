import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import useApplications from "../applications/useApplications";
import { getSimplifiedStatus, getServiceInfo, getStatusInfo } from "../applications/utils";
import {
  LuFileText,
  LuCircleCheck,
  LuCreditCard,
  LuClock,
  LuArrowRight,
  LuArrowUpRight,
  LuRefreshCw,
  LuUser,
  LuCalendar,
  LuPlus,
  LuSparkles,
  LuFolderOpen,
} from "react-icons/lu";

const truncateName = (name, max = 20) => {
  if (!name) return "—";
  return name.length > max ? name.slice(0, max) + "..." : name;
};

const formatDate = (ts) => {
  if (!ts) return "—";
  try { return new Date(ts).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }); }
  catch (e) { return "—"; }
};

const CitizenDashboard = () => {
  const { t } = useTranslation();
  const userDetails = Digit.UserService.getUser();
  const userName = userDetails?.info?.name || "Citoyen (ne)";
  const { applications, isLoading, refreshApplications, isRefreshing } = useApplications();

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bonjour";
    if (h < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  const firstName = (userName || "").trim().split(" ")[0] || "Utilisateur";
  const greeting = getGreeting();
  const basePath = `/${window?.contextPath}/citizen/publicservices`;

  // Get applicationStatus from either top-level or nested processInstance
  const getAppStatus = (app) => {
    return app.processInstance?.[0]?.state?.applicationStatus
      || app.serviceDetails?.responseData?.Application?.processInstance?.[0]?.state?.applicationStatus
      || null;
  };

  const counts = useMemo(() => {
    let inProgress = 0, approved = 0, paymentPending = 0;
    (applications || []).forEach((app) => {
      const status = getAppStatus(app);
      const s = getSimplifiedStatus(status);
      if (s === "in_progress" || s === "draft") inProgress++;
      else if (s === "granted") approved++;
      else if (s === "payment_pending") paymentPending++;
    });
    return { total: applications?.length || 0, inProgress, approved, paymentPending };
  }, [applications]);

  const recentApplications = useMemo(() => {
    if (!applications || applications.length === 0) return [];
    return [...applications]
      .sort((a, b) => (b.auditDetails?.createdTime || 0) - (a.auditDetails?.createdTime || 0))
      .slice(0, 6)
      .map((app) => {
        const status = getAppStatus(app);
        const statusInfo = getStatusInfo(status, app.businessService) || {};
        const serviceInfo = getServiceInfo(app.businessService) || {};
        const applicant = app.serviceDetails?.responseData?.Application?.applicants?.[0] || app.applicants?.[0];
        return {
          id: app.applicationNumber,
          title: serviceInfo.name || app.businessService,
          shortName: serviceInfo.name || app.businessService,
          ref: serviceInfo.ref || null,
          client: applicant?.name || "—",
          status: statusInfo.label || "En cours",
          statusBg: statusInfo.bgColor || "bg-gray-50",
          statusColor: statusInfo.color || "text-gray-600",
          statusIcon: statusInfo.icon || null,
          date: formatDate(app.auditDetails?.createdTime),
          businessService: app.businessService,
          module: app.module,
          serviceCode: app.serviceCode,
          currentBs: app.serviceDetails?.responseData?.Application?.processInstance?.[0]?.businessService || app.businessService,
        };
      });
  }, [applications]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-3 py-4 sm:px-5 sm:py-6">
      {/* Header */}
      <div className="pt-[100px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
              <LuFolderOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 sm:text-xl">{greeting}, {firstName}</h1>
              <p className="text-xs text-gray-400">Résumé de vos demandes et activités</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              to={`${basePath}/apply`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-medium text-white transition-all hover:opacity-90"
            >
              <LuPlus className="h-3.5 w-3.5" />
              Nouvelle demande
            </Link>
            <button
              onClick={refreshApplications}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition-all hover:border-primary/30 hover:text-primary disabled:opacity-50"
            >
              <LuRefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <Link to={`${basePath}/applications/pending`} className="group">
          <div className="rounded-2xl border border-gray-200/80 bg-gray-50 p-4 transition-all hover:border-primary/30 hover:shadow-sm sm:p-5">
            <div className="mb-3 inline-flex rounded-xl bg-gray-200/60 p-2.5 text-gray-500 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
              <LuFolderOpen className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{counts.total}</p>
            <p className="mt-0.5 text-xs text-gray-500">Total demandes</p>
          </div>
        </Link>
        <Link to={`${basePath}/applications/pending`} className="group">
          <div className="rounded-2xl border border-blue-200/60 bg-blue-50 p-4 transition-all hover:border-blue-300 hover:shadow-sm sm:p-5">
            <div className="mb-3 inline-flex rounded-xl bg-blue-100 p-2.5 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
              <LuClock className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{counts.inProgress}</p>
            <p className="mt-0.5 text-xs text-gray-500">En cours</p>
          </div>
        </Link>
        <Link to={`${basePath}/applications/completed`} className="group">
          <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50 p-4 transition-all hover:border-emerald-300 hover:shadow-sm sm:p-5">
            <div className="mb-3 inline-flex rounded-xl bg-emerald-100 p-2.5 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
              <LuCircleCheck className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{counts.approved}</p>
            <p className="mt-0.5 text-xs text-gray-500">Approuvées</p>
          </div>
        </Link>
        <Link to={`${basePath}/applications/pending-payment`} className="group">
          <div className="rounded-2xl border border-amber-200/60 bg-amber-50 p-4 transition-all hover:border-amber-300 hover:shadow-sm sm:p-5">
            <div className="mb-3 inline-flex rounded-xl bg-amber-100 p-2.5 text-amber-600 transition-colors group-hover:bg-amber-500 group-hover:text-white">
              <LuCreditCard className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{counts.paymentPending}</p>
            <p className="mt-0.5 text-xs text-gray-500">Paiement en attente</p>
          </div>
        </Link>
      </div>

      {/* Recent Applications */}
      <div>
        <div className="mb-3 flex items-center justify-between sm:mb-4">
          <h2 className="text-sm font-bold text-gray-900 sm:text-base">Demandes récentes</h2>
          <Link
            to={`${basePath}/applications/pending`}
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
            <h3 className="mb-1 text-base font-bold text-gray-900">Aucune demande</h3>
            <p className="mb-4 text-sm text-gray-400">Commencez par créer votre première demande</p>
            <Link
              to={`${basePath}/apply`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              <LuPlus className="h-4 w-4" />
              Nouvelle demande
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {recentApplications.map((app) => (
              <Link
                key={app.id}
                to={`${basePath}/BPA/${app.businessService}/ViewScreen?applicationNumber=${app.id}&serviceCode=${app.serviceCode}&businessService=${app.currentBs}`}
                className="group block"
              >
                <div className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:border-primary/20 hover:shadow-sm sm:p-5">
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

                  <p className="mb-3 line-clamp-2 text-xs font-medium leading-relaxed text-gray-600">{app.shortName}</p>

                  <div className="mb-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${app.statusBg} ${app.statusColor}`}>
                      {app.statusIcon && <app.statusIcon className="h-3 w-3" />}
                      {app.status}
                    </span>
                  </div>

                  <div className="mt-auto flex items-center gap-3 border-t border-gray-50 pt-3">
                    <span className="flex items-center gap-1 text-[11px] text-gray-400 truncate">
                      <LuUser className="h-3 w-3 shrink-0" />
                      {truncateName(app.client)}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-gray-400 shrink-0">
                      <LuCalendar className="h-3 w-3" />
                      {app.date}
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

export default CitizenDashboard;
