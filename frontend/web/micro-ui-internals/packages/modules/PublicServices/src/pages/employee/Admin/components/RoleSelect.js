import React, { useState, useRef, useEffect } from "react";
import { LuSearch, LuX, LuChevronDown, LuCheck } from "react-icons/lu";

const RoleSelect = ({ 
  availableRoles, 
  selectedRoles, 
  onRoleToggle, 
  disabled = false,
  maxRoles = null 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Filter roles based on search term
  const filteredRoles = availableRoles.filter((role) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      role.code?.toLowerCase().includes(searchLower) ||
      role.name?.toLowerCase().includes(searchLower) ||
      role.description?.toLowerCase().includes(searchLower)
    );
  });

  // Filter out already selected roles
  const availableToSelect = filteredRoles.filter(
    (role) => !selectedRoles.some((r) => r.code === role.code)
  );

  const handleRoleClick = (role) => {
    if (disabled || (maxRoles && selectedRoles.length >= maxRoles)) return;
    onRoleToggle(role);
    setSearchTerm("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-3 border-2 border-[#22a4d9]/30 rounded-xl focus:ring-2 focus:ring-[#22a4d9] focus:border-[#22a4d9] bg-white/50 backdrop-blur-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between ${
          isOpen ? "ring-2 ring-[#22a4d9] border-[#22a4d9]" : ""
        }`}
      >
        <span className="text-gray-700">
          {disabled && maxRoles && selectedRoles.length >= maxRoles
            ? "Maximum de rôles atteint"
            : "Rechercher et sélectionner un rôle"}
        </span>
        <LuChevronDown
          className={`w-5 h-5 text-[#22a4d9] transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-[#22a4d9]/30 overflow-hidden animate-fadeIn">
          {/* Search Input */}
          <div className="p-3 border-b border-[#22a4d9]/20 bg-gradient-to-r from-[#22a4d9]/5 to-transparent">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LuSearch className="h-5 w-5 text-[#22a4d9]" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par code, nom ou description..."
                className="w-full pl-10 pr-4 py-2 border-2 border-[#22a4d9]/30 rounded-lg focus:ring-2 focus:ring-[#22a4d9] focus:border-[#22a4d9] transition-all duration-200"
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#22a4d9] transition-colors"
                >
                  <LuX className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Roles List */}
          <div className="max-h-64 overflow-y-auto">
            {availableToSelect.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? "Aucun rôle trouvé" : "Aucun rôle disponible"}
              </div>
            ) : (
              availableToSelect.map((role) => (
                <button
                  key={role.code}
                  type="button"
                  onClick={() => handleRoleClick(role)}
                  className="w-full px-4 py-3 text-left hover:bg-[#22a4d9]/10 transition-colors duration-200 border-b border-[#22a4d9]/10 last:border-b-0 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 group-hover:text-[#22a4d9] transition-colors">
                          {role.name}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-[#22a4d9]/10 text-[#1978a0] rounded-full font-medium">
                          {role.code}
                        </span>
                      </div>
                      {role.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {role.description}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 rounded border-2 border-[#22a4d9]/30 group-hover:border-[#22a4d9] transition-colors flex items-center justify-center">
                        <LuCheck className="w-4 h-4 text-[#22a4d9] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RoleSelect;

