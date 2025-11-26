import React from "react";
import { LuX, LuUser, LuMail, LuPhone, LuBuilding, LuShield } from "react-icons/lu";

const EmployeeDetailModal = ({ employee, onClose }) => {
  if (!employee) return null;

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      return new Date(timestamp).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Détails de l'employé</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <LuX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                  <LuUser className="w-4 h-4" />
                  Nom complet
                </div>
                <p className="text-gray-900">{employee.user?.name || "N/A"}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                  <LuMail className="w-4 h-4" />
                  Email
                </div>
                <p className="text-gray-900">{employee.user?.emailId || "N/A"}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                  <LuPhone className="w-4 h-4" />
                  Téléphone
                </div>
                <p className="text-gray-900">{employee.user?.mobileNumber || "N/A"}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                  <LuBuilding className="w-4 h-4" />
                  Code
                </div>
                <p className="text-gray-900">{employee.code || "N/A"}</p>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Date de naissance</div>
                <p className="text-gray-900">{formatDate(employee.user?.dob)}</p>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Statut</div>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    employee.isActive && employee.user?.active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {employee.isActive && employee.user?.active ? "Actif" : "Inactif"}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Statut employé</div>
                <p className="text-gray-900">{employee.employeeStatus || "N/A"}</p>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Type d'employé</div>
                <p className="text-gray-900">{employee.employeeType || "N/A"}</p>
              </div>

              {employee.assignments?.[0] && (
                <React.Fragment>
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Département</div>
                    <p className="text-gray-900">{employee.assignments[0].department || "N/A"}</p>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Désignation</div>
                    <p className="text-gray-900">{employee.assignments[0].designation || "N/A"}</p>
                  </div>
                </React.Fragment>
              )}

              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                  <LuShield className="w-4 h-4" />
                  Rôles
                </div>
                <div className="flex flex-wrap gap-2">
                  {employee.user?.roles?.map((role, idx) => (
                    <span
                      key={idx}
                      className="inline-flex px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-lg"
                    >
                      {role.name}
                    </span>
                  ))}
                </div>
              </div>

              {employee.user?.permanentAddress && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Adresse permanente</div>
                  <p className="text-gray-900">{employee.user.permanentAddress}</p>
                  <p className="text-sm text-gray-600">
                    {employee.user.permanentCity} {employee.user.permanentPinCode}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-djibouti-primary text-white rounded-lg hover:bg-djibouti-primary-dark transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailModal;

