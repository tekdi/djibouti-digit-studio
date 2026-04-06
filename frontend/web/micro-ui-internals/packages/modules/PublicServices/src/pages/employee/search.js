import React, { useState, useEffect, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { LuSearch, LuFileText, LuUser, LuCalendar, LuArrowUpRight, LuLoader, LuCircleAlert, LuSparkles } from "react-icons/lu";
import axios from "axios";
import { getServiceInfo, getStatusInfo as getStatusInfoFromUtils } from "../citizen/applications/utils";
import { resolveBusinessServiceForUser } from "./applications/utils";

const truncateName = (name, max = 25) => {
  if (!name) return "—";
  return name.length > max ? name.slice(0, max) + "..." : name;
};

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

  useEffect(() => {
    const fetchServiceCodes = async () => {
      setServicesLoading(true);
      try {
        const response = await axios.get("/public-service/v1/service", {
          params: { tenantId },
          headers: { "X-Tenant-Id": tenantId, "auth-token": userInfo?.access_token },
        });
        const services = response?.data?.Services || [];
        setServiceCodes(services.map((s) => s.serviceCode).filter(Boolean));
      } catch (e) {
        setServiceCodes([]);
      } finally {
        setServicesLoading(false);
      }
    };
    fetchServiceCodes();
  }, [tenantId, userInfo?.access_token]);

  useEffect(() => {
    if (isLoading) setError(null);
  }, [isLoading]);

  const searchApplications = async () => {
    if (!searchTerm.trim()) {
      setError("Veuillez entrer un terme de recherche");
      return;
    }
    setIsLoading(true);
    setHasSearched(true);

    try {
      if (servicesLoading) { setError("Chargement des services..."); return; }
      if (serviceCodes.length === 0) { setError("Aucun service configuré."); return; }

      let found = [];
      for (const sc of serviceCodes) {
        try {
          const res = await axios.get(`/public-service/v1/application/${sc}`, {
            params: { applicationNumber: searchTerm.trim(), tenantId },
            headers: { "X-Tenant-Id": tenantId, "auth-token": userInfo?.access_token },
          });
          if (res.data?.Application?.length > 0) {
            found = [...found, ...res.data.Application];
            break;
          }
        } catch (e) { /* continue */ }
      }

      if (found.length > 0) {
        setSearchResults(found);
        setError(null);
      } else {
        setSearchResults([]);
        setError("Aucune demande trouvée avec ce numéro de dossier.");
      }
    } catch (e) {
      let msg = "Erreur lors de la recherche. Veuillez réessayer.";
      if (e.response?.data?.Errors?.length > 0) msg = e.response.data.Errors[0].description || msg;
      else if (e.response?.status === 500) msg = "Erreur serveur temporaire.";
      setError(msg);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => { e.preventDefault(); searchApplications(); };

  const viewDetails = (app) => {
    const bs = app?.businessService;
    const cbs = resolveBusinessServiceForUser(bs);
    const userType = Digit.UserService.getType()?.toLowerCase();
    history.push(
      `/${window.contextPath}/${userType}/publicservices/${app?.module}/${bs}/ViewScreen?applicationNumber=${app?.applicationNumber}&serviceCode=${app?.serviceCode}&businessService=${cbs}`
    );
  };

  const fmtDate = (ts) => {
    if (!ts) return "—";
    try { return new Date(ts).toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "numeric" }); }
    catch (e) { return "—"; }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-3 py-4 sm:px-5 sm:py-6">
      {/* Header */}
      <div className="pt-[100px]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
            <LuSearch className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 sm:text-xl">Recherche de dossiers</h1>
            <p className="text-xs text-gray-400">Recherchez par numéro de dossier</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <LuSearch className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchApplications()}
              placeholder="Entrez le numéro de dossier (ex: PCO-000001/2025)"
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 hover:border-gray-300"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || servicesLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
          >
            {isLoading || servicesLoading ? (
              <Fragment><LuLoader className="h-4 w-4 animate-spin" /><span>{servicesLoading ? "Chargement..." : "Recherche..."}</span></Fragment>
            ) : (
              <Fragment><LuSearch className="h-4 w-4" /><span>Rechercher</span></Fragment>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            <LuCircleAlert className="h-4 w-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={searchApplications} disabled={isLoading} className="shrink-0 rounded-lg bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-50">
              Réessayer
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
            <h2 className="text-sm font-bold text-gray-900">Résultats</h2>
            {searchResults.length > 0 && (
              <span className="rounded-lg bg-primary/8 px-2 py-0.5 text-[10px] font-bold text-primary">
                {searchResults.length} trouvé{searchResults.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <LuLoader className="h-5 w-5 animate-spin" />
              <span className="ml-2 text-sm">Recherche en cours...</span>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
                <LuSparkles className="h-7 w-7 text-gray-300" />
              </div>
              <h3 className="mb-1 text-sm font-bold text-gray-900">Aucun résultat</h3>
              <p className="text-xs text-gray-400">Vérifiez le numéro et réessayez</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {searchResults.map((app) => {
                const applicant = app.applicants?.[0];
                const responseApplicant = app.serviceDetails?.responseData?.Application?.applicants?.[0];
                const displayApplicant = responseApplicant?.name ? responseApplicant : applicant;
                const statusInfo = getStatusInfoFromUtils(app.status);
                const serviceInfo = getServiceInfo(app.businessService);
                const pi = app.processInstance || [];
                const currentStatus = pi.length > 0 ? pi[pi.length - 1]?.state?.applicationStatus : null;
                const currentStatusInfo = currentStatus ? getStatusInfoFromUtils(currentStatus) : statusInfo;

                return (
                  <button
                    key={app.applicationNumber}
                    onClick={() => viewDetails(app)}
                    className="group w-full flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50/80"
                  >
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${currentStatusInfo.bgColor || "bg-gray-50"}`}>
                      {currentStatusInfo.icon ? (
                        <currentStatusInfo.icon className={`h-5 w-5 ${currentStatusInfo.color || "text-gray-400"}`} />
                      ) : (
                        <LuFileText className="h-5 w-5 text-gray-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 group-hover:text-primary">{app.applicationNumber}</span>
                        {serviceInfo?.ref && (
                          <span className="shrink-0 rounded-md bg-primary/8 px-1.5 py-0.5 text-[9px] font-bold text-primary">{serviceInfo.ref}</span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-gray-400 truncate">{serviceInfo?.name || app.businessService}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${currentStatusInfo.bgColor} ${currentStatusInfo.color}`}>
                          {currentStatusInfo.label}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-gray-400">
                          <LuUser className="h-3 w-3" />
                          {truncateName(displayApplicant?.name)}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-gray-400">
                          <LuCalendar className="h-3 w-3" />
                          {fmtDate(app.auditDetails?.createdTime)}
                        </span>
                      </div>
                    </div>

                    <LuArrowUpRight className="h-4 w-4 shrink-0 text-gray-200 transition-colors group-hover:text-primary" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeSearch;
