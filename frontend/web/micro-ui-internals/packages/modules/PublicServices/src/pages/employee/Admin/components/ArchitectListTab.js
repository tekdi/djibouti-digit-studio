import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LuPlus, LuPencil, LuEye, LuLoader, LuSearch, LuX, LuBuilding2 } from "react-icons/lu";
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Liste des Architectes</h2>
          <p className="text-gray-600 mt-1">Gestion de tous les architectes enregistrés</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-djibouti-primary text-white rounded-lg hover:bg-djibouti-primary-dark transition-colors"
        >
          <LuPlus className="w-5 h-5" />
          Ajouter un architecte
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LuSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, téléphone, numéro de licence..."
            className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-djibouti-primary focus:border-djibouti-primary"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <LuX className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LuLoader className="h-8 w-8 animate-spin text-djibouti-primary" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Téléphone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Numéro de licence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Genre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredArchitects.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? "Aucun architecte trouvé" : "Aucun architecte"}
                  </td>
                </tr>
              ) : (
                filteredArchitects.map((architect) => (
                  <tr key={architect.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <LuBuilding2 className="w-5 h-5 text-gray-400" />
                        <div className="text-sm font-medium text-gray-900">
                          {architect.name?.givenName || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{architect.mobileNumber || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {architect.identifiers?.[0]?.identifierId || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{architect.gender || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          architect.userDetails?.active !== false
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {architect.userDetails?.active !== false ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(architect)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Voir détails"
                        >
                          <LuEye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(architect)}
                          className="text-green-600 hover:text-green-900 p-1"
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
    </div>
  );
};

export default ArchitectListTab;

