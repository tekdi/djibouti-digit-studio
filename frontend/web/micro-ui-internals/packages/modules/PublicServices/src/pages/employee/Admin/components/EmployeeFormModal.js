import React, { useState, useEffect } from "react";
import { LuX, LuLoader, LuX as LuXIcon } from "react-icons/lu";
import axios from "axios";

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

        setAvailableRoles(roles);
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
          roles: [...prev.roles, { code: role.code, name: role.name, tenantId: tenantId }],
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Modifier l'employé" : "Ajouter un employé"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <LuX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code / Username *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-djibouti-primary focus:border-djibouti-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-djibouti-primary focus:border-djibouti-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                name="emailId"
                value={formData.emailId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-djibouti-primary focus:border-djibouti-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-djibouti-primary focus:border-djibouti-primary"
              />
            </div>

            {!isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!isEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-djibouti-primary focus:border-djibouti-primary"
                />
              </div>
            )}
          </div>

          {/* Roles Multi-Select */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.roles.map((role) => (
                      <span
                        key={role.code}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-djibouti-primary/10 text-djibouti-primary rounded-lg text-sm font-medium"
                      >
                        {role.name}
                        <button
                          type="button"
                          onClick={() => removeRole(role.code)}
                          className="hover:text-red-600 transition-colors"
                        >
                          <LuXIcon className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Available Roles Dropdown */}
                <div className="relative">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        const selectedRole = availableRoles.find((r) => r.code === e.target.value);
                        if (selectedRole) {
                          handleRoleToggle(selectedRole);
                          e.target.value = ""; // Reset select
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-djibouti-primary focus:border-djibouti-primary"
                    disabled={isEdit && formData.roles.length >= 5}
                  >
                    <option value="">
                      {isEdit && formData.roles.length >= 5
                        ? "Maximum 5 rôles atteint"
                        : "Sélectionner un rôle à ajouter"}
                    </option>
                    {availableRoles
                      .filter((role) => !formData.roles.some((r) => r.code === role.code))
                      .map((role) => (
                        <option key={role.code} value={role.code}>
                          {role.name} ({role.code})
                        </option>
                      ))}
                  </select>
                </div>

                {isEdit && formData.roles.length >= 5 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Vous avez atteint la limite de 5 rôles. Supprimez un rôle pour en ajouter un autre.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-djibouti-primary text-white rounded-lg hover:bg-djibouti-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <React.Fragment>
                  <LuLoader className="w-4 h-4 animate-spin" />
                  Enregistrement...
                </React.Fragment>
              ) : (
                isEdit ? "Modifier" : "Créer"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeFormModal;

