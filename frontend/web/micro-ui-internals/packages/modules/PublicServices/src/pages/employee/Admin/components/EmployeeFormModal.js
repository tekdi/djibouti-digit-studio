import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { LuX, LuLoader, LuX as LuXIcon } from "react-icons/lu";
import axios from "axios";
import RoleSelect from "./RoleSelect";

const EmployeeFormModal = ({ employee, isEdit, onClose, onSuccess }) => {
  // Store the original employee object to preserve all fields
  const [originalEmployee, setOriginalEmployee] = useState(null);
  
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    emailId: "",
    mobileNumber: "",
    password: "",
    employeeStatus: "EMPLOYED",
    employeeType: "PERMANENT",
    designation: "DESIG_05",
    department: "DATUH",
    roles: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const userInfo = Digit.UserService.getUser();

  // Fetch roles from MDMS (only once on mount)
  useEffect(() => {
    let isMounted = true;
    
    const fetchRoles = async () => {
      if (!isMounted) return;
      
      setRolesLoading(true);
      try {
        const currentUserInfo = Digit.UserService.getUser();
        const currentTenantId = Digit.ULBService.getCurrentTenantId();
        
        const response = await axios.post(
          "/egov-mdms-service/v2/_search",
          {
            RequestInfo: {
              apiId: "Rainmaker",
              authToken: currentUserInfo?.access_token,
              userInfo: {
                id: currentUserInfo?.info?.id,
                uuid: currentUserInfo?.info?.uuid,
                userName: currentUserInfo?.info?.userName,
                name: currentUserInfo?.info?.name,
                mobileNumber: currentUserInfo?.info?.mobileNumber,
                emailId: currentUserInfo?.info?.emailId,
                locale: currentUserInfo?.info?.locale,
                type: currentUserInfo?.info?.type,
                roles: currentUserInfo?.info?.roles,
                active: currentUserInfo?.info?.active,
                tenantId: currentUserInfo?.info?.tenantId,
                permanentCity: currentUserInfo?.info?.permanentCity,
              },
            },
            MdmsCriteria: {
              tenantId: currentTenantId,
              schemaCode: "ACCESSCONTROL-ROLES.roles",
            },
          },
          {
            headers: {
              "X-Tenant-Id": currentTenantId,
              "auth-token": currentUserInfo?.access_token,
            },
          }
        );

        if (!isMounted) return;

        const roles = (response.data?.mdms || [])
          .filter((item) => item.isActive)
          .map((item) => ({
            code: item.data.code,
            name: item.data.name,
            description: item.data.description,
            tenantId: currentTenantId,
          }));

        // Add the 3 specific roles
        const additionalRoles = [
          {
            code: "HRMS_ADMIN",
            name: "HRMS Admin",
            description: "HRMS Admin",
            tenantId: currentTenantId,
          },
          {
            code: "MDMS_ADMIN",
            name: "MDMS ADMIN",
            description: "MDMS ADMIN",
            tenantId: currentTenantId,
          },
          {
            code: "LOC_ADMIN",
            name: "LOC ADMIN",
            description: "LOC ADMIN",
            tenantId: currentTenantId,
          },
        ];

        // Merge and remove duplicates
        const allRoles = [...roles, ...additionalRoles];
        const uniqueRoles = allRoles.filter(
          (role, index, self) =>
            index === self.findIndex((r) => r.code === role.code)
        );

        setAvailableRoles(uniqueRoles);
      } catch (error) {
        console.error("Error fetching roles:", error);
        if (isMounted) {
          setAvailableRoles([]);
        }
      } finally {
        if (isMounted) {
          setRolesLoading(false);
        }
      }
    };

    fetchRoles();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only fetch once on mount

  useEffect(() => {
    if (isEdit && employee) {
      // Store the original employee object to preserve all fields
      setOriginalEmployee(employee);
      
      setFormData({
        code: employee.code || "",
        name: employee.user?.name || "",
        emailId: employee.user?.emailId || "",
        mobileNumber: employee.user?.mobileNumber || "",
        password: "",
        employeeStatus: employee.employeeStatus || "EMPLOYED",
        employeeType: employee.employeeType || "PERMANENT",
        designation: employee.assignments?.find((a) => a.isCurrentAssignment)?.designation || employee.assignments?.[0]?.designation || "DESIG_05",
        department: employee.assignments?.find((a) => a.isCurrentAssignment)?.department || employee.assignments?.[0]?.department || "DATUH",
        roles: employee.user?.roles || [],
      });
    }
  }, [employee, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleToggle = (role) => {
    setFormData((prev) => {
      const isSelected = prev.roles.some((r) => r.code === role.code);
      if (isSelected) {
        // Remove role
        setError(null);
        return {
          ...prev,
          roles: prev.roles.filter((r) => r.code !== role.code),
        };
      } else {
        // Add role (max 5 in edit mode)
        if (isEdit && prev.roles.length >= 5) {
          setError("Maximum 5 rôles autorisés");
          setTimeout(() => setError(null), 3000);
          return prev;
        }
        setError(null);
        return {
          ...prev,
          roles: [...prev.roles, { 
            code: role.code, 
            name: role.name, 
            description: role.description,
            tenantId: tenantId 
          }],
        };
      }
    });
  };

  const removeRole = (roleCode) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.filter((r) => r.code !== roleCode),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Ensure original employee data is loaded for edit mode
    if (isEdit && !originalEmployee) {
      setError("Les données de l'employé ne sont pas encore chargées. Veuillez patienter.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let employeePayload;
      
      if (isEdit && originalEmployee) {
        // Use spread operator to preserve all original fields (like in EditEmployee.tsx)
        // Only override the fields that changed in the form
        employeePayload = {
          ...originalEmployee,
          // Ensure reActivateEmployee is always set (backend requires it)
          reActivateEmployee: originalEmployee.reActivateEmployee !== undefined && originalEmployee.reActivateEmployee !== null ? originalEmployee.reActivateEmployee : false,
          code: formData.code || formData.emailId,
          name: formData.name,
          employeeStatus: formData.employeeStatus,
          employeeType: formData.employeeType,
          user: {
            ...originalEmployee.user,
            userName: formData.code || formData.emailId,
            emailId: formData.emailId,
            name: formData.name,
            mobileNumber: formData.mobileNumber,
            dob: originalEmployee.user.dob,
            roles: formData.roles,
            // Ensure active is never null - use original value if exists, otherwise true
            active: originalEmployee.user.active !== undefined ? originalEmployee.user.active : true,
            type: originalEmployee.user.type || "EMPLOYEE",
            permanentAddress: originalEmployee.user.permanentAddress,
            permanentCity: originalEmployee.user.permanentCity,
            permanentPinCode: originalEmployee.user.permanentPinCode,
            correspondenceAddress: originalEmployee.user.correspondenceAddress,
            correspondenceCity: originalEmployee.user.correspondenceCity,
            correspondencePinCode: originalEmployee.user.correspondencePinCode,
            // Add password only if provided
            ...(formData.password && { password: formData.password }),
          },
          assignments: originalEmployee.assignments.map((assignment) =>
            assignment.isCurrentAssignment ? {
              ...assignment,
              designation: formData.designation,
              department: formData.department,
              fromDate: assignment.fromDate,
            } : assignment
          ),
          jurisdictions: originalEmployee.jurisdictions.map((jurisdiction, index) =>
            index === 0 ? {
              ...jurisdiction,
              hierarchy: "REVENUE",
              boundary: tenantId,
              boundaryType: "City",
            } : jurisdiction
          ),
        };
      } else {
        // Create new employee
        employeePayload = {
          tenantId: tenantId,
          code: formData.code || formData.emailId,
          name: formData.name,
          employeeStatus: formData.employeeStatus,
          employeeType: formData.employeeType,
          user: {
            tenantId: tenantId,
            userName: formData.code || formData.emailId,
            emailId: formData.emailId,
            password: formData.password,
            name: formData.name,
            mobileNumber: formData.mobileNumber,
            roles: formData.roles.length > 0 ? formData.roles : [{ code: "EMPLOYEE", name: "Employee", tenantId: tenantId }],
            active: true,
            type: "EMPLOYEE",
          },
          assignments: [
            {
              designation: formData.designation,
              department: formData.department,
              fromDate: new Date().getTime(),
              isCurrentAssignment: true,
              tenantid: tenantId,
            },
          ],
          jurisdictions: [
            {
              hierarchy: "REVENUE",
              boundary: tenantId,
              boundaryType: "City",
              active: true,
              tenantId: tenantId,
            },
          ],
        };
      }

      const requestBody = {
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
        Employees: [employeePayload],
      };

      const endpoint = isEdit ? "/egov-hrms/employees/_update" : "/egov-hrms/employees/_create";

      await axios.post(endpoint, requestBody, {
        headers: {
          "X-Tenant-Id": tenantId,
          "auth-token": userInfo?.access_token,
        },
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving employee:", error);
      setError(
        error.response?.data?.Error?.message ||
          error.response?.data?.Errors?.[0]?.message ||
          "Erreur lors de l'enregistrement de l'employé"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fadeIn" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden transform transition-all animate-scaleIn">
        <div className="sticky top-0 bg-gradient-to-r from-[#22a4d9] to-[#1978a0] px-6 py-5 flex items-center justify-between z-10">
          <h2 className="text-2xl font-black text-white">
            {isEdit ? "Modifier l'employé" : "Ajouter un employé"}
          </h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors hover:scale-110 transform duration-200"
          >
            <LuX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 overflow-y-auto max-h-[calc(90vh-80px)]">
          {error && (
            <div className="mb-6 p-4 bg-[#22a4d9]/10 border-2 border-[#22a4d9]/30 rounded-xl text-[#1978a0] backdrop-blur-sm animate-fadeIn">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Code / Username *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-[#22a4d9]/30 rounded-xl focus:ring-2 focus:ring-[#22a4d9] focus:border-[#22a4d9] bg-white/50 backdrop-blur-sm transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nom complet *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-[#22a4d9]/30 rounded-xl focus:ring-2 focus:ring-[#22a4d9] focus:border-[#22a4d9] bg-white/50 backdrop-blur-sm transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                name="emailId"
                value={formData.emailId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-[#22a4d9]/30 rounded-xl focus:ring-2 focus:ring-[#22a4d9] focus:border-[#22a4d9] bg-white/50 backdrop-blur-sm transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone *</label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-[#22a4d9]/30 rounded-xl focus:ring-2 focus:ring-[#22a4d9] focus:border-[#22a4d9] bg-white/50 backdrop-blur-sm transition-all duration-300"
              />
            </div>

            {!isEdit && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mot de passe *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!isEdit}
                  className="w-full px-4 py-3 border-2 border-[#22a4d9]/30 rounded-xl focus:ring-2 focus:ring-[#22a4d9] focus:border-[#22a4d9] bg-white/50 backdrop-blur-sm transition-all duration-300"
                />
              </div>
            )}
          </div>

          {/* Roles Multi-Select */}
          <div className="mt-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Rôles {isEdit && `(Maximum 5)`}
            </label>
            {rolesLoading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <LuLoader className="w-4 h-4 animate-spin" />
                <span>Chargement des rôles...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Selected Roles */}
                {formData.roles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.roles.map((role) => (
                      <span
                        key={role.code}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#22a4d9]/10 text-[#1978a0] rounded-xl text-sm font-semibold border-2 border-[#22a4d9]/20 shadow-sm"
                      >
                        {role.name}
                        <button
                          type="button"
                          onClick={() => removeRole(role.code)}
                          className="hover:text-[#22a4d9] transition-colors hover:scale-110 transform duration-200"
                        >
                          <LuXIcon className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Role Select Component with Search */}
                <RoleSelect
                  availableRoles={availableRoles}
                  selectedRoles={formData.roles}
                  onRoleToggle={handleRoleToggle}
                  disabled={isEdit && formData.roles.length >= 5}
                  maxRoles={isEdit ? 5 : null}
                />

                {isEdit && formData.roles.length >= 5 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Vous avez atteint la limite de 5 rôles. Supprimez un rôle pour en ajouter un autre.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-end gap-4 pt-6 border-t border-[#22a4d9]/20">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold hover:scale-105 transform"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-[#22a4d9] to-[#1978a0] text-white rounded-xl hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center gap-2 font-semibold hover:scale-105 transform disabled:transform-none"
            >
              {isSubmitting ? (
                <React.Fragment>
                  <LuLoader className="w-5 h-5 animate-spin" />
                  Enregistrement...
                </React.Fragment>
              ) : (
                isEdit ? "Modifier" : "Créer"
              )}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default EmployeeFormModal;

