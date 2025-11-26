import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LuPlus, LuPencil, LuEye, LuLoader, LuSearch, LuX, LuBuilding2, LuChevronLeft, LuChevronRight } from "react-icons/lu";
import axios from "axios";
import ArchitectFormModal from "./ArchitectFormModal";
import ArchitectDetailModal from "./ArchitectDetailModal";

const ArchitectListTab = () => {
  const { t } = useTranslation();
  const [architects, setArchitects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedArchitect, setSelectedArchitect] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const userInfo = Digit.UserService.getUser();

  // Fetch architects - Search for individuals with BPA_ARCHITECT role
  const fetchArchitects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Search for individuals - the API should return those with BPA_ARCHITECT role
      const individualResponse = await axios.post(
        "/health-individual/v1/_search",
        {
          RequestInfo: {
            apiId: "Rainmaker",
            authToken: userInfo?.access_token,
            userInfo: {
              id: userInfo?.info?.id,
              uuid: userInfo?.info?.uuid,
              userName: userInfo?.info?.userName,
              name: userInfo?.info?.name,
              mobileNumber: userInfo?.info?.mobileNumber,
              emailId: userInfo?.info?.emailId,
              locale: userInfo?.info?.locale,
              type: userInfo?.info?.type,
              roles: userInfo?.info?.roles,
              active: userInfo?.info?.active,
              tenantId: userInfo?.info?.tenantId,
              permanentCity: userInfo?.info?.permanentCity,
            },
          },
          Individual: {
            tenantId: tenantId,
          },
        },
        {
          params: {
            tenantId: tenantId,
            limit: 1000, // Large limit to get all architects
            offset: 0,
          },
          headers: {
            "X-Tenant-Id": tenantId,
            "auth-token": userInfo?.access_token,
          },
        }
      );

      // Filter individuals that have BPA_ARCHITECT role
      const allIndividuals = individualResponse.data?.Individual || [];
      const architectIndividuals = allIndividuals.filter((ind) => {
        return ind.userDetails?.roles?.some((role) => role.code === "BPA_ARCHITECT");
      });

      setArchitects(architectIndividuals);
    } catch (error) {
      console.error("Error fetching architects:", error);
      // If authorization error, show a more helpful message
      if (error.response?.data?.Errors?.[0]?.code === "CustomException") {
        setError("Vous n'avez pas les autorisations nécessaires pour accéder à cette ressource. Veuillez contacter l'administrateur.");
      } else {
        setError("Erreur lors du chargement des architectes");
      }
      setArchitects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArchitects();
  }, []);


  // Filter architects
  const filteredArchitects = architects.filter((arch) => {
    const searchLower = searchTerm.toLowerCase();
    const name = arch.name?.givenName || "";
    const mobile = arch.mobileNumber || "";
    const license = arch.identifiers?.[0]?.identifierId || "";
    return (
      name.toLowerCase().includes(searchLower) ||
      mobile.includes(searchTerm) ||
      license.toLowerCase().includes(searchLower)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredArchitects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedArchitects = filteredArchitects.slice(startIndex, endIndex);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Helper function to truncate text
  const truncateText = (text, maxLength = 10) => {
    if (!text) return "N/A";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Helper function to get company name
  const getCompanyName = (architect) => {
    return architect.additionalFields?.fields?.find((f) => f.key === "companyName")?.value || "N/A";
  };

  const handleCreate = () => {
    setSelectedArchitect(null);
    setIsEditMode(false);
    setShowFormModal(true);
  };

  const handleEdit = (architect) => {
    setSelectedArchitect(architect);
    setIsEditMode(true);
    setShowFormModal(true);
  };

  const handleView = (architect) => {
    setSelectedArchitect(architect);
    setShowDetailModal(true);
  };

  const handleFormClose = () => {
    setShowFormModal(false);
    setSelectedArchitect(null);
    fetchArchitects();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-[#22a4d9] to-[#1978a0] bg-clip-text text-transparent mb-2">
            Liste des Architectes
          </h2>
          <p className="text-gray-600">Gestion de tous les architectes enregistrés</p>
        </div>
        <button
          onClick={handleCreate}
          className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#22a4d9] to-[#1978a0] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
          <LuPlus className="w-5 h-5 relative z-10" />
          <span className="relative z-10">Ajouter un architecte</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <LuSearch className="h-5 w-5 text-[#22a4d9] group-focus-within:text-[#1978a0] transition-colors" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, téléphone, numéro de licence..."
            className="block w-full pl-12 pr-12 py-3.5 border-2 border-[#22a4d9]/30 rounded-xl focus:ring-2 focus:ring-[#22a4d9] focus:border-[#22a4d9] bg-white/50 backdrop-blur-sm transition-all duration-300 placeholder:text-gray-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform"
            >
              <LuX className="h-5 w-5 text-gray-400 hover:text-[#22a4d9] transition-colors" />
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-[#22a4d9]/10 border-2 border-[#22a4d9]/30 rounded-xl text-[#1978a0] backdrop-blur-sm animate-fadeIn">
          {error}
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="absolute inset-0 bg-[#22a4d9]/20 rounded-full animate-ping"></div>
            <LuLoader className="h-12 w-12 animate-spin text-[#22a4d9] relative" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Chargement des architectes...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#22a4d9]/20 shadow-xl bg-white/50 backdrop-blur-sm">
          <table className="min-w-full divide-y divide-[#22a4d9]/10">
            <thead>
              <tr className="bg-gradient-to-r from-[#22a4d9] to-[#1978a0]" style={{ background: 'linear-gradient(to right, #22a4d9, #1978a0)' }}>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider" style={{ color: '#ffffff', backgroundColor: 'transparent' }}>
                  Nom
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider" style={{ color: '#ffffff', backgroundColor: 'transparent' }}>
                  Téléphone
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider" style={{ color: '#ffffff', backgroundColor: 'transparent' }}>
                  Numéro de licence
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider" style={{ color: '#ffffff', backgroundColor: 'transparent' }}>
                  Nom de l'entreprise
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider" style={{ color: '#ffffff', backgroundColor: 'transparent' }}>
                  Statut
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider" style={{ color: '#ffffff', backgroundColor: 'transparent' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#22a4d9]/10">
              {filteredArchitects.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-[#22a4d9]/10 flex items-center justify-center mb-4">
                        <LuSearch className="w-8 h-8 text-[#22a4d9]" />
                      </div>
                      <p className="text-gray-600 font-medium text-lg">
                        {searchTerm ? "Aucun architecte trouvé" : "Aucun architecte"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedArchitects.map((architect, index) => (
                  <tr 
                    key={architect.id} 
                    className="hover:bg-[#22a4d9]/5 transition-colors duration-200 animate-fadeInRow"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#22a4d9]/10 rounded-lg">
                          <LuBuilding2 className="w-5 h-5 text-[#22a4d9]" />
                        </div>
                        <div className="text-sm font-semibold text-gray-900" title={architect.name?.givenName || "N/A"}>
                          {truncateText(architect.name?.givenName || "N/A", 10)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{architect.mobileNumber || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600" title={architect.identifiers?.[0]?.identifierId || "N/A"}>
                        {truncateText(architect.identifiers?.[0]?.identifierId || "N/A", 10)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{truncateText(getCompanyName(architect), 10)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full ${
                          architect.userDetails?.active !== false
                            ? "bg-[#22a4d9]/20 text-[#1978a0] border border-[#22a4d9]/30"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {architect.userDetails?.active !== false ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(architect)}
                          className="p-2 text-[#22a4d9] hover:bg-[#22a4d9]/10 rounded-lg transition-all duration-200 hover:scale-110"
                          title="Voir détails"
                        >
                          <LuEye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(architect)}
                          className="p-2 text-[#22a4d9] hover:bg-[#22a4d9]/10 rounded-lg transition-all duration-200 hover:scale-110"
                          title="Modifier"
                        >
                          <LuPencil className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filteredArchitects.length > 0 && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between px-4">
          <div className="text-sm text-gray-600">
            Affichage de {startIndex + 1} à {Math.min(endIndex, filteredArchitects.length)} sur {filteredArchitects.length} architectes
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border-2 border-[#22a4d9]/30 rounded-lg hover:bg-[#22a4d9]/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <LuChevronLeft className="w-4 h-4" />
              Précédent
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                    currentPage === page
                      ? "bg-gradient-to-r from-[#22a4d9] to-[#1978a0] text-white font-semibold"
                      : "border-2 border-[#22a4d9]/30 hover:bg-[#22a4d9]/10 text-gray-700"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border-2 border-[#22a4d9]/30 rounded-lg hover:bg-[#22a4d9]/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Suivant
              <LuChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showFormModal && (
        <ArchitectFormModal
          architect={selectedArchitect}
          isEdit={isEditMode}
          onClose={handleFormClose}
          onSuccess={fetchArchitects}
        />
      )}

      {showDetailModal && (
        <ArchitectDetailModal
          architect={selectedArchitect}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedArchitect(null);
          }}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInRow {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-fadeInRow {
          animation: fadeInRow 0.4s ease-out both;
        }
      `}</style>
    </div>
  );
};

export default ArchitectListTab;

