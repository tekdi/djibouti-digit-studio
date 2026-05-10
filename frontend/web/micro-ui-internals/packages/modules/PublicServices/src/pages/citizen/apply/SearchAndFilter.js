import React from "react";
import { LuSearch, LuFilter, LuBuilding, LuAward, LuFileText } from "react-icons/lu";

const SearchAndFilter = ({ searchTerm, setSearchTerm, selectedFilter, setSelectedFilter }) => {
  // Filter options
  const filterOptions = [
    { value: "all", label: "Tous les services", icon: LuFilter },
    { value: "permits", label: "Autorisations ", icon: LuBuilding },
    { value: "certificates", label: "Certificats", icon: LuAward },
    { value: "validations", label: "Approbations", icon: LuFileText }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
      {/* Search Bar */}
      <div className="relative mb-3 sm:mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <LuSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Rechercher un service..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2.5 sm:py-3 border border-gray-200 rounded-lg text-sm sm:text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-djibouti-primary focus:border-djibouti-primary"
        />
      </div>

      {/* Filter Buttons — horizontal scroll on mobile, wrapped on tablet+ */}
      <div className="flex gap-2 overflow-x-auto sm:flex-wrap -mx-1 px-1 pb-1 sm:pb-0 sm:mx-0 sm:px-0 scrollbar-none">
        {filterOptions.map((filter) => {
          const FilterIcon = filter.icon;
          return (
            <button
              key={filter.value}
              onClick={() => setSelectedFilter(filter.value)}
              className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                selectedFilter === filter.value
                  ? 'bg-djibouti-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FilterIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SearchAndFilter;
