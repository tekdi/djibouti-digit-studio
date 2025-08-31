import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import StatsCard from "./components/StatsCard";
import RecentApplications from "./components/RecentApplications";
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

  const stats = [
    {
      title: "Nouveaux dossiers",
      value: 45,
      icon: LuFileText,
      change: { value: 12, isPositive: true },
      gradient: "from-primary to-primary-dark"
    },
    {
      title: "Dossiers assignés",
      value: 156,
      icon: LuUserCheck,
      change: { value: 8, isPositive: true },
      gradient: "from-green-500 to-emerald-600"
    },
    {
      title: "En cours de traitement",
      value: 28,
      icon: LuUsers,
      change: { value: 3, isPositive: true },
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      title: "Transferts effectués",
      value: 23,
      icon: LuSend,
      change: { value: 5, isPositive: false },
      gradient: "from-amber-500 to-orange-600"
    }
  ];

  const recentApplications = [
    {
      id: 'PCO-2024-0156',
      title: 'Complexe résidentiel Hayableh',
      client: 'Société Immobilière Djibouti',
      status: 'Nouveau',
      priority: 'Haute',
      submittedDate: '20/01/2024',
      agent: null
    },
    {
      id: 'PCO-2024-0155',
      title: 'Centre commercial Balbala',
      client: 'OpenTrade SARL',
      status: 'Assigné',
      priority: 'Moyenne',
      submittedDate: '18/01/2024',
      agent: 'Fatouma Ali'
    },
    {
      id: 'PCO-2024-0154',
      title: 'Hôtel 4 étoiles Ambouli',
      client: 'Djibouti Hotels Group',
      status: 'En cours',
      priority: 'Haute',
      submittedDate: '15/01/2024',
      agent: 'Mohamed Youssouf'
    },
    {
      id: 'PCO-2024-0153',
      title: 'Résidence Les Palmiers',
      client: 'Hassan Osman',
      status: 'Transféré',
      priority: 'Basse',
      submittedDate: '12/01/2024',
      agent: 'Amina Said',
      transferredTo: 'SDATUH'
    }
  ];



  const getStatusColor = (status) => {
    switch (status) {
      case 'Nouveau':
        return 'bg-blue-100 text-blue-800';
      case 'Assigné':
        return 'bg-yellow-100 text-yellow-800';
      case 'En cours':
        return 'bg-orange-100 text-orange-800';
      case 'Transféré':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Haute':
        return 'bg-red-100 text-red-800';
      case 'Moyenne':
        return 'bg-amber-100 text-amber-800';
      case 'Basse':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 pt-4">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tableau de bord Employé</h1>
            <p className="mt-1 opacity-90">Gestion et traitement des demandes d'autorisation</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-75">Dernière mise à jour</p>
            <p className="font-medium">Aujourd'hui, 14:30</p>
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
            <Link to="/employee/publicservices/applications-employee/all" className="text-sm text-primary font-medium hover:text-primary-dark flex items-center">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priorité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentApplications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{app.id}</div>
                      <div className="text-sm text-gray-500">{app.title}</div>
                      <div className="text-xs text-gray-400">{app.client}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(app.priority)}`}>
                      {app.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.agent || '-'}
                    {app.transferredTo && (
                      <div className="text-xs text-purple-600">→ {app.transferredTo}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/employee/applications/${app.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                    >
                      <span>Détails</span>
                      <LuArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
