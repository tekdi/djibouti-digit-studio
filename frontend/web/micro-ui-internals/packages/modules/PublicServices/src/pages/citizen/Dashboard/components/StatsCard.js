import React from "react";

const StatsCard = ({ title, value, icon: Icon, gradient, borderColor, textGradient }) => {
  return (
    <div 
      className={`rounded-xl shadow-sm p-6 border transition-all duration-300 relative overflow-hidden group`}
      style={{
        background: `linear-gradient(135deg, rgba(0, 103, 105, 0.05) 0%, rgba(0, 103, 105, 0.1) 50%, transparent 100%)`,
        borderColor: "rgba(0, 103, 105, 0.2)"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)";
      }}
    >
      <div 
        className="absolute -right-10 -top-10 w-20 h-20 rounded-full blur-xl transition-all"
        style={{ backgroundColor: "rgba(0, 103, 105, 0.05)" }}
      ></div>
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 
            className="text-3xl font-bold mt-2"
            style={{ color: "#006769" }}
          >
            {value}
          </h3>
        </div>
        <div 
          className="p-3.5 rounded-xl shadow-sm transition-all"
          style={{
            background: "linear-gradient(135deg, rgba(0, 103, 105, 0.1) 0%, rgba(0, 103, 105, 0.2) 100%)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 103, 105, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)";
          }}
        >
          <Icon className="w-6 h-6" style={{ color: "#006769" }} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
