import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import WelcomeSection from "./components/WelcomeSection";
import StatsCard from "./components/StatsCard";
import RecentApplications from "./components/RecentApplications";
import NotificationsList from "./components/NotificationsList";
import { 
  LuCircleAlert, 
  LuCircleCheck, 
  LuCreditCard, 
  LuFileText 
} from "react-icons/lu";

const CitizenDashboard = () => {
  const { t } = useTranslation();
  const userDetails = Digit.UserService.getUser();
  const userName = userDetails?.info?.name || "Citoyen";

  const stats = [
    {
      title: "Demandes en cours",
      value: 3,
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
      value: 12,
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
      title: "Paiements effectués",
      value: 8,
      icon: LuCreditCard,
      gradient: {
        from: "from-green-500",
        via: "via-green-500",
        to: "to-transparent"
      },
      borderColor: "border-green-500",
      textGradient: "from-green-500 to-green-600"
    },
    {
      title: "Notifications",
      value: 3,
      icon: LuCircleAlert,
      gradient: {
        from: "from-indigo-500",
        via: "via-indigo-500",
        to: "to-transparent"
      },
      borderColor: "border-indigo-500",
      textGradient: "from-indigo-500 to-indigo-600"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto pt-5">
      <div className="space-y-6">
        <WelcomeSection userName={userName} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentApplications applications={[]} />
          <NotificationsList notifications={[]} />
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
