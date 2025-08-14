import React from "react";
import { LuBell } from "react-icons/lu";

const NotificationButton = ({ notificationCount = 1 }) => {
  return (
    <button className="relative p-3 text-gray-600 hover:text-djibouti-primary-light hover:bg-djibouti-primary-light hover:bg-opacity-10 rounded-xl transition-all duration-300 hover:scale-110">
      <LuBell className="w-5 h-5" />
      {notificationCount > 0 && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
      )}
    </button>
  );
};

export default NotificationButton;

