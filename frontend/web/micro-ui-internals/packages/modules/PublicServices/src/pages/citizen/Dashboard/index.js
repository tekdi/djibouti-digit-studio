import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import WelcomeSection from "./components/WelcomeSection";
import StatsCard from "./components/StatsCard";
import RecentApplications from "./components/RecentApplications";
import useApplications from "../applications/useApplications";
import { getSimplifiedStatus } from "../applications/utils";
import { 
  LuCircleCheck, 
  LuCreditCard, 
  LuFileText,
  LuLoader
} from "react-icons/lu";

const CitizenDashboard = () => {
  const { t } = useTranslation();
  const userDetails = Digit.UserService.getUser();
  const userName = userDetails?.info?.name || "Citoyen";
  const { applications, isLoading, error, refreshApplications, isRefreshing } = useApplications();

  // Calculate stats from real API data
  const stats = useMemo(() => {
    if (!applications || applications.length === 0) {
      return [
        {
          title: "Demandes en cours",
          value: 0,
          icon: LuFileText,
          gradient: {
            from: "from-djibouti-primary",
            via: "via-djibouti-primary",
            to: "to-transparent"
          },
          borderColor: "border-djibouti-primary",
          textGradient: "from-djibouti-primary to-djibouti-primary"
        },
        {
          title: "Demandes approuvées",
          value: 0,
          icon: LuCircleCheck,
          gradient: {
            from: "from-yellow-500",
            via: "via-yellow-500",
            to: "to-transparent"
          },
          borderColor: "border-yellow-500",
          textGradient: "from-yellow-500 to-yellow-600"
        },
        {
          title: "En attente de paiement",
          value: 0,
          icon: LuCreditCard,
          gradient: {
            from: "from-green-500",
            via: "via-green-500",
            to: "to-transparent"
          },
          borderColor: "border-green-500",
          textGradient: "from-green-500 to-green-600"
        }
      ];
    }

    const inProgressCount = applications.filter(app => {
      const status = app.processInstance?.[0]?.state?.applicationStatus;
      const simplifiedStatus = getSimplifiedStatus(status);
      return simplifiedStatus === "in_progress" || simplifiedStatus === "draft";
    }).length;

    const approvedCount = applications.filter(app => {
      const status = app.processInstance?.[0]?.state?.applicationStatus;
      const simplifiedStatus = getSimplifiedStatus(status);
      return simplifiedStatus === "granted";
    }).length;

    const paymentPendingCount = applications.filter(app => {
      const status = app.processInstance?.[0]?.state?.applicationStatus;
      const simplifiedStatus = getSimplifiedStatus(status);
      return simplifiedStatus === "payment_pending";
    }).length;

    return [
      {
        title: "Demandes en cours",
        value: inProgressCount,
        icon: LuFileText,
        gradient: {
          from: "from-djibouti-primary",
          via: "via-djibouti-primary",
          to: "to-transparent"
        },
        borderColor: "border-djibouti-primary",
        textGradient: "from-djibouti-primary to-djibouti-primary"
      },
      {
        title: "Demandes approuvées",
        value: approvedCount,
        icon: LuCircleCheck,
        gradient: {
          from: "from-yellow-500",
          via: "via-yellow-500",
          to: "to-transparent"
        },
        borderColor: "border-yellow-500",
        textGradient: "from-yellow-500 to-yellow-600"
      },
      {
        title: "En attente de paiement",
        value: paymentPendingCount,
        icon: LuCreditCard,
        gradient: {
          from: "from-green-500",
          via: "via-green-500",
          to: "to-transparent"
        },
        borderColor: "border-green-500",
        textGradient: "from-green-500 to-green-600"
      }
    ];
  }, [applications]);

  // Get recent applications (first 3)
  const recentApplications = useMemo(() => {
    if (!applications || applications.length === 0) return [];
    
    // Sort by creation date (newest first) and take first 3
    return applications
      .sort((a, b) => new Date(b.auditDetails?.createdTime || b.createdTime || 0) - new Date(a.auditDetails?.createdTime || a.createdTime || 0))
      .slice(0, 3);
  }, [applications]);

  // Handle refresh
  const handleRefresh = () => {
    refreshApplications();
  };

  // Show loading spinner when data is being fetched
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto pt-5">
        <div className="space-y-6">
          <WelcomeSection userName={userName} />
          
          {/* Loading Spinner */}
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <LuLoader className="w-12 h-12 animate-spin" style={{ color: "#006769" }} />
              </div>
              <p className="text-lg font-medium text-gray-600">Chargement des données...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pt-5">
      <div className="space-y-6">
        <WelcomeSection userName={userName} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <RecentApplications 
            applications={recentApplications} 
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
