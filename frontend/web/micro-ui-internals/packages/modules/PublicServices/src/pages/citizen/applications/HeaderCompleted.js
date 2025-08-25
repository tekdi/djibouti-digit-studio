import React, { Fragment } from "react";
import { LuSearch, LuRefreshCw, LuCircleCheck, LuAward, LuCalendar } from "react-icons/lu";
import { getServiceInfo } from "./utils";

const HeaderCompleted = ({ 
  searchTerm = "", 
  setSearchTerm, 
  businessServiceFilter = "all", 
  setBusinessServiceFilter, 
  businessServices = [], 
  startDate = "",
  setStartDate,
  endDate = "",
  setEndDate,
  onRefresh,
  isRefreshing = false
}) => {
  return (
    <Fragment>
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-green-100 to-blue-200 rounded-3xl p-8 border border-green-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-2xl shadow-lg">
                <LuCircleCheck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-gray-900 mb-2 flex items-center gap-3">
                  Mes Demandes Complétées
                  <LuAward className="w-8 h-8 text-green-600" />
                </h1>
                <p className="text-lg text-gray-600">Consultez vos permis et certificats accordés avec succès</p>
              </div>
            </div>
            <button
              onClick={onRefresh || (() => window.location.reload())}
              disabled={isRefreshing}
              className={`flex items-center gap-3 px-6 py-3 bg-white border border-green-200 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md ${
                isRefreshing 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-green-50 hover:border-green-300'
              }`}
            >
              <LuRefreshCw className={`w-5 h-5 text-green-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="font-medium text-gray-700">
                {isRefreshing ? 'Actualisation...' : 'Actualiser'}
              </span>
            </button>
          </div>
        </div>
      </div>

             {/* Search and Filters */}
       <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 mb-8">
         <div className="flex flex-col gap-6">
           {/* First Row - Search and Service Filter */}
           <div className="flex flex-col lg:flex-row gap-6">
             {/* Search */}
             <div className="flex-1">
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <LuSearch className="text-gray-400 w-6 h-6" />
                 </div>
                 <input
                   type="text"
                   placeholder="Rechercher par numéro de demande, type de service..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
                   className="w-full pl-12 pr-6 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 text-lg"
                 />
               </div>
             </div>

             {/* Business Service Filter */}
             <div className="lg:w-64">
               <select
                 value={businessServiceFilter}
                 onChange={(e) => setBusinessServiceFilter && setBusinessServiceFilter(e.target.value)}
                 className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 text-lg"
               >
                 <option value="all">Tous les services</option>
                 {businessServices && businessServices.length > 0 && businessServices.map(service => (
                   <option key={service} value={service}>
                     {getServiceInfo(service)?.name || service}
                   </option>
                 ))}
               </select>
             </div>
           </div>

           {/* Second Row - Date Filters */}
           <div className="flex flex-col lg:flex-row gap-6">
             {/* Start Date */}
             <div className="lg:w-64">
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <LuCalendar className="text-gray-400 w-6 h-6" />
                 </div>
                 <input
                   type="date"
                   value={startDate}
                   onChange={(e) => setStartDate && setStartDate(e.target.value)}
                   className="w-full pl-12 pr-6 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 text-lg"
                   placeholder="Date de début"
                 />
               </div>
             </div>

             {/* End Date */}
             <div className="lg:w-64">
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <LuCalendar className="text-gray-400 w-6 h-6" />
                 </div>
                 <input
                   type="date"
                   value={endDate}
                   onChange={(e) => setEndDate && setEndDate(e.target.value)}
                   className="w-full pl-12 pr-6 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 text-lg"
                   placeholder="Date de fin"
                 />
               </div>
             </div>

             {/* Clear Date Filters Button */}
             <div className="lg:w-auto">
               <button
                 onClick={() => {
                   setStartDate && setStartDate("");
                   setEndDate && setEndDate("");
                 }}
                 className="w-full lg:w-auto px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-gray-100 transition-all duration-300 text-lg text-gray-600 hover:text-gray-800"
               >
                 Effacer les dates
               </button>
             </div>
           </div>
         </div>
       </div>
    </Fragment>
  );
};

export default HeaderCompleted;
