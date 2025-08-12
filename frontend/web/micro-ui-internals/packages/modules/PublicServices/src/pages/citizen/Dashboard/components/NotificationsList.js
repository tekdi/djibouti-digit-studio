import React from "react";
import { Link } from "react-router-dom";
import { LuBell, LuArrowRight, LuCircleCheck, LuCircleAlert, LuInfo } from "react-icons/lu";

const NotificationsList = ({ notifications }) => {
  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <LuCircleCheck className="w-5 h-5 text-green-500" />;
      case "warning":
        return <LuCircleAlert className="w-5 h-5 text-amber-500" />;
      case "info":
        return <LuInfo className="w-5 h-5 text-blue-500" />;
      default:
        return <LuInfo className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-300"
      style={{ borderColor: "#e5e7eb" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)";
      }}
    >
      <div 
        className="p-6 border-b"
        style={{ 
          borderColor: "#e5e7eb",
          background: "linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)"
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="p-2.5 rounded-xl shadow-sm"
              style={{
                background: "linear-gradient(135deg, rgba(0, 103, 105, 0.2) 0%, rgba(0, 103, 105, 0.1) 100%)"
              }}
            >
              <LuBell className="w-5 h-5" style={{ color: "#006769" }} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
          </div>
          <Link 
            to="/citizen/notifications" 
            className="flex items-center gap-2 text-sm font-medium group transition-colors"
            style={{ color: "#006769" }}
            onMouseEnter={(e) => {
              e.target.style.color = "#004a4b";
            }}
            onMouseLeave={(e) => {
              e.target.style.color = "#006769";
            }}
          >
            Voir tout
            <LuArrowRight 
              className="w-4 h-4 transition-transform group-hover:translate-x-1" 
            />
          </Link>
        </div>
      </div>
      
      <div style={{ borderColor: "#e5e7eb" }}>
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className="p-6 transition-all duration-200"
            style={{
              borderBottom: "1px solid #e5e7eb"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(249, 250, 251, 0.8)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <div className="flex items-start gap-4">
              <div 
                className="p-2 rounded-lg shadow-sm"
                style={{ backgroundColor: "rgba(249, 250, 251, 0.8)" }}
              >
                {getIcon(notification.type)}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">{notification.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                <span className="text-xs text-gray-500">{notification.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsList;
