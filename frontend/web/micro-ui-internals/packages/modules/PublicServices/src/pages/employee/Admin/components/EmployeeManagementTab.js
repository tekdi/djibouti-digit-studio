import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LuPlus, LuPencil, LuEye, LuLoader, LuSearch, LuX } from "react-icons/lu";
import axios from "axios";
import EmployeeFormModal from "./EmployeeFormModal";
import EmployeeDetailModal from "./EmployeeDetailModal";
import SuccessModal from "./SuccessModal";
import ErrorModal from "./ErrorModal";

const EmployeeManagementTab = () => {
  const { t } = useTranslation();
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const userInfo = Digit.UserService.getUser();

  // Fetch employees
  const fetchEmployees = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        "/egov-hrms/employees/_search",
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
        },
        {
          params: { tenantId: tenantId },
          headers: {
            "X-Tenant-Id": tenantId,
            "auth-token": userInfo?.access_token,
          },
        }
      );

      setEmployees(response.data?.Employees || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setError("Erreur lors du chargement des employés");
      setErrorMessage("Erreur lors du chargement des employés");
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);


  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      emp.user?.name?.toLowerCase().includes(searchLower) ||
      emp.user?.emailId?.toLowerCase().includes(searchLower) ||
      emp.user?.mobileNumber?.includes(searchTerm) ||
      emp.code?.toLowerCase().includes(searchLower)
    );
  });

  const handleCreate = () => {
    setSelectedEmployee(null);
    setIsEditMode(false);
    setShowFormModal(true);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setIsEditMode(true);
    setShowFormModal(true);
  };

  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailModal(true);
  };

  const handleFormClose = () => {
    setShowFormModal(false);
    setSelectedEmployee(null);
    fetchEmployees();
  };

  const handleFormSuccess = () => {
    setSuccessMessage(isEditMode ? "Employé modifié avec succès" : "Employé créé avec succès");
    setShowSuccessModal(true);
    fetchEmployees();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-[#22a4d9] to-[#1978a0] bg-clip-text text-transparent mb-2">
            Gestion des Employés
          </h2>
          <p className="text-gray-600">Liste et gestion de tous les employés</p>
        </div>
        <button
          onClick={handleCreate}
          className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#22a4d9] to-[#1978a0] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
          <LuPlus className="w-5 h-5 relative z-10" />
          <span className="relative z-10">Ajouter un employé</span>
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
            placeholder="Rechercher par nom, email, téléphone..."
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
          <p className="mt-4 text-gray-600 font-medium">Chargement des employés...</p>
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
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider" style={{ color: '#ffffff', backgroundColor: 'transparent' }}>
                  Téléphone
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider" style={{ color: '#ffffff', backgroundColor: 'transparent' }}>
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider" style={{ color: '#ffffff', backgroundColor: 'transparent' }}>
                  Rôles
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider" style={{ color: '#ffffff', backgroundColor: 'transparent' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#22a4d9]/10">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-[#22a4d9]/10 flex items-center justify-center mb-4">
                        <LuSearch className="w-8 h-8 text-[#22a4d9]" />
                      </div>
                      <p className="text-gray-600 font-medium text-lg">
                        {searchTerm ? "Aucun employé trouvé" : "Aucun employé"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee, index) => (
                  <tr 
                    key={employee.uuid} 
                    className="hover:bg-[#22a4d9]/5 transition-colors duration-200 animate-fadeInRow"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{employee.user?.name || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{employee.user?.emailId || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{employee.user?.mobileNumber || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full ${
                          employee.isActive && employee.user?.active
                            ? "bg-[#22a4d9]/20 text-[#1978a0] border border-[#22a4d9]/30"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {employee.isActive && employee.user?.active ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {employee.user?.roles?.slice(0, 2).map((role, idx) => (
                          <span
                            key={idx}
                            className="inline-flex px-2.5 py-1 text-xs font-semibold bg-[#22a4d9]/10 text-[#1978a0] rounded-lg border border-[#22a4d9]/20"
                          >
                            {role.name}
                          </span>
                        ))}
                        {employee.user?.roles?.length > 2 && (
                          <span className="inline-flex px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded-lg border border-gray-200">
                            +{employee.user.roles.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(employee)}
                          className="p-2 text-[#22a4d9] hover:bg-[#22a4d9]/10 rounded-lg transition-all duration-200 hover:scale-110"
                          title="Voir détails"
                        >
                          <LuEye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(employee)}
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

      {/* Modals */}
      {showFormModal && (
        <EmployeeFormModal
          employee={selectedEmployee}
          isEdit={isEditMode}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {showDetailModal && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedEmployee(null);
          }}
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => setShowSuccessModal(false)}
        />
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setShowErrorModal(false)}
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

export default EmployeeManagementTab;

