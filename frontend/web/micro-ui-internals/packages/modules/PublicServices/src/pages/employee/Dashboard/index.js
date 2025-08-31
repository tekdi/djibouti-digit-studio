import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import StatsCard from "./components/StatsCard";
import RecentApplications from "./components/RecentApplications";
import useApplications from "../applications/useApplications";
import { getStatusInfo, formatDate, getServiceInfo } from "../applications/utils";
import { 
  LuFileText, 
  LuUsers, 
  LuUserCheck, 
  LuSend,
  LuTrendingUp,
  LuTrendingDown,
  LuArrowRight,
  LuArrowUpRight
} from "react-icons/lu";

const EmployeeDashboard = () => {
  const { t } = useTranslation();
  const userDetails = Digit.UserService.getUser();
  const userName = userDetails?.info?.name || "Employé";
  const userRoles = userDetails?.info?.roles?.map((roleData) => roleData?.code) || [];

  const { applications, isLoading, lastFetchTime } = useApplications();

  // Function to get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  // Extract first name only from full name
  const getFirstName = (fullName) => {
    if (!fullName) return "Employé";
    const nameParts = fullName.trim().split(' ');
    return nameParts[0];
  };

  const firstName = getFirstName(userName);
  const greeting = getGreeting();

  // Calculate real statistics from API data
  const stats = useMemo(() => {
    if (!applications || applications.length === 0) {
      return [
        {
          title: "Nouveaux dossiers",
          value: 0,
          icon: LuFileText,
          change: { value: 0, isPositive: true },
          gradient: "from-primary to-primary-dark"
        },
        {
          title: "Dossiers assignés",
          value: 0,
          icon: LuUserCheck,
          change: { value: 0, isPositive: true },
          gradient: "from-green-500 to-emerald-600"
        },
        {
          title: "En cours de traitement",
          value: 0,
          icon: LuUsers,
          change: { value: 0, isPositive: true },
          gradient: "from-blue-500 to-indigo-600"
        },
        {
          title: "Approuvés",
          value: 0,
          icon: LuSend,
          change: { value: 0, isPositive: true },
          gradient: "from-amber-500 to-orange-600"
        }
      ];
    }

    const newApplicationsCount = applications.filter(
      (app) => app.ProcessInstance?.state?.applicationStatus === "AGENT_NOT_ASSIGNED"
    ).length;

    const assignedApplicationsCount = applications.filter(
      (app) => app.ProcessInstance?.state?.applicationStatus !== "AGENT_NOT_ASSIGNED" &&
               app.ProcessInstance?.state?.applicationStatus !== "PERMIT_GRANTED" &&
               app.ProcessInstance?.state?.applicationStatus !== "CERTIFICATE_GRANTED"
    ).length;

    const inProgressCount = applications.filter(
      (app) => {
        const status = app.ProcessInstance?.state?.applicationStatus;
        return status !== "AGENT_NOT_ASSIGNED" && 
               status !== "PERMIT_GRANTED" && 
               status !== "CERTIFICATE_GRANTED";
      }
    ).length;

    const approvedCount = applications.filter(
      (app) => {
        const status = app.ProcessInstance?.state?.applicationStatus;
        return status === "PERMIT_GRANTED" || status === "CERTIFICATE_GRANTED";
      }
    ).length;

    return [
      {
        title: "Nouveaux dossiers",
        value: newApplicationsCount,
        icon: LuFileText,
        change: { value: 12, isPositive: true },
        gradient: "from-primary to-primary-dark"
      },
      {
        title: "Dossiers assignés",
        value: assignedApplicationsCount,
        icon: LuUserCheck,
        change: { value: 8, isPositive: true },
        gradient: "from-green-500 to-emerald-600"
      },
      {
        title: "En cours de traitement",
        value: inProgressCount,
        icon: LuUsers,
        change: { value: 3, isPositive: true },
        gradient: "from-blue-500 to-indigo-600"
      },
      {
        title: "Approuvés",
        value: approvedCount,
        icon: LuSend,
        change: { value: 5, isPositive: true },
        gradient: "from-amber-500 to-orange-600"
      }
    ];
  }, [applications]);

  // Get recent applications from API data
  const recentApplications = useMemo(() => {
    if (!applications || applications.length === 0) return [];

    return applications
      .slice(0, 4) // Get first 4 applications
      .map((app) => {
        const businessObject = app.businessObject;
        const processInstance = app.ProcessInstance;
        const status = processInstance?.state?.applicationStatus;
        const statusInfo = getStatusInfo(status);
        const serviceInfo = getServiceInfo(businessObject?.businessService);
        const applicant = businessObject?.applicants?.[0];

        return {
          id: businessObject?.applicationNumber,
          title: serviceInfo?.shortName || businessObject?.businessService,
          client: applicant?.name || "N/A",
          status: statusInfo?.label || status,
          statusColor: statusInfo?.bgColor + " " + statusInfo?.color,
          submittedDate: formatDate(businessObject?.auditDetails?.createdTime),
          businessService: businessObject?.businessService,
          serviceCode: businessObject?.serviceCode,
          module: businessObject?.module
        };
      });
  }, [applications]);

  return (
    <div className="max-w-7xl mx-auto space-y-5 pt-4">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{greeting}, {firstName}</h1>
            <p className="mt-1 opacity-90">Gestion et traitement des demandes d'autorisation</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-75">Dernière mise à jour</p>
            <p className="font-medium">
              {lastFetchTime ? formatDate(lastFetchTime) : "Aujourd'hui, 14:30"}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="rounded-xl shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-md hover:-translate-y-1">
            <div className={`bg-gradient-to-r ${stat.gradient} p-4`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
                </div>
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm border border-white/10">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-2 text-xs text-white/80 flex items-center gap-0.5">
                {stat.change.isPositive ? (
                  <LuTrendingUp className="w-3 h-3" />
                ) : (
                  <LuTrendingDown className="w-3 h-3" />
                )}
                <span>{Math.abs(stat.change.value)}% ce mois</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Dossiers récents</h2>
            <Link to={`/${window?.contextPath}/employee/publicservices/applications-employee/all`} className="text-sm text-primary font-medium hover:text-primary-dark flex items-center">
              Voir tout <LuArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dossier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demandeur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <LuArrowRight className="animate-spin h-6 w-6 text-primary" />
                      <span className="ml-2">Chargement...</span>
                    </div>
                  </td>
                </tr>
              ) : recentApplications.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    Aucun dossier récent
                  </td>
                </tr>
              ) : (
                recentApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{app.id}</div>
                        <div className="text-sm text-gray-500">{app.title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${app.statusColor}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {app.client}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {app.submittedDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/${window?.contextPath}/employee/publicservices/${app.module}/${app.businessService}/ViewScreen?applicationNumber=${app.id}&serviceCode=${app.serviceCode}&businessService=${app.businessService}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                      >
                        <span>Détails</span>
                        <LuArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
