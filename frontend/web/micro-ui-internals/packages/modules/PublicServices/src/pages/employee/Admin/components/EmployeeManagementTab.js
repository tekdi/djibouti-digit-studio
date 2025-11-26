import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LuPlus, LuPencil, LuEye, LuLoader, LuSearch, LuX } from "react-icons/lu";
import axios from "axios";
import EmployeeFormModal from "./EmployeeFormModal";
import EmployeeDetailModal from "./EmployeeDetailModal";

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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Employés</h2>
          <p className="text-gray-600 mt-1">Liste et gestion de tous les employés</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-djibouti-primary text-white rounded-lg hover:bg-djibouti-primary-dark transition-colors"
        >
          <LuPlus className="w-5 h-5" />
          Ajouter un employé
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
            placeholder="Rechercher par nom, email, téléphone..."
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
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Téléphone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôles
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? "Aucun employé trouvé" : "Aucun employé"}
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr key={employee.uuid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{employee.user?.name || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{employee.user?.emailId || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{employee.user?.mobileNumber || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          employee.isActive && employee.user?.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {employee.isActive && employee.user?.active ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {employee.user?.roles?.slice(0, 2).map((role, idx) => (
                          <span
                            key={idx}
                            className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                          >
                            {role.name}
                          </span>
                        ))}
                        {employee.user?.roles?.length > 2 && (
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                            +{employee.user.roles.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(employee)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Voir détails"
                        >
                          <LuEye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(employee)}
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
        <EmployeeFormModal
          employee={selectedEmployee}
          isEdit={isEditMode}
          onClose={handleFormClose}
          onSuccess={fetchEmployees}
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
    </div>
  );
};

export default EmployeeManagementTab;

