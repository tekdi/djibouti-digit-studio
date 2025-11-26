import React, { useState, useEffect } from "react";
import { LuX, LuLoader } from "react-icons/lu";
import axios from "axios";

const ArchitectFormModal = ({ architect, isEdit, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    dateOfBirth: "",
    gender: "MALE",
    licenseNumber: "",
    companyName: "",
    hqAddress: "",
    technicalManagerName: "",
    professionalPhoneOrEmail: "",
    locality: "DZB-PLATEAU",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const userInfo = Digit.UserService.getUser();

  useEffect(() => {
    if (isEdit && architect) {
      const dob = architect.dateOfBirth
        ? new Date(architect.dateOfBirth).toISOString().split("T")[0]
        : "";
      const licenseId = architect.identifiers?.[0]?.identifierId || "";
      const companyName =
        architect.additionalFields?.fields?.find((f) => f.key === "companyName")?.value || "";
      const hqAddress =
        architect.additionalFields?.fields?.find((f) => f.key === "hqAddress")?.value || "";
      const techManager =
        architect.additionalFields?.fields?.find((f) => f.key === "nameOfTechnicalManager")?.value ||
        "";
      const professionalContact =
        architect.additionalFields?.fields?.find((f) => f.key === "professionalPhoneOrEmail")
          ?.value || "";
      const locality = architect.address?.[0]?.locality?.code || "DZB-PLATEAU";

      setFormData({
        name: architect.name?.givenName || "",
        mobileNumber: architect.mobileNumber || "",
        dateOfBirth: dob,
        gender: architect.gender || "MALE",
        licenseNumber: licenseId,
        companyName: companyName,
        hqAddress: hqAddress,
        technicalManagerName: techManager,
        professionalPhoneOrEmail: professionalContact,
        locality: locality,
      });
    }
  }, [architect, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
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
          msgId: `${Date.now()}|en_IN`,
          plainAccessRequest: {},
        },
        Individual: {
          ...(isEdit && architect
            ? {
                id: architect.id,
                individualId: architect.individualId,
              }
            : {}),
          tenantId: tenantId,
          name: {
            givenName: formData.name,
          },
          ...(formData.dateOfBirth
            ? { dateOfBirth: new Date(formData.dateOfBirth).getTime() }
            : {}),
          gender: formData.gender,
          mobileNumber: formData.mobileNumber,
          address: [
            {
              tenantId: tenantId,
              city: tenantId,
              locality: {
                code: formData.locality,
              },
              type: "PERMANENT",
            },
          ],
          identifiers: [
            {
              identifierType: "licenseOrAccreditationNumber",
              identifierId: formData.licenseNumber,
            },
          ],
          skills: [
            {
              type: "DRIVING",
              level: "UNSKILLED",
            },
          ],
          photo: null,
          additionalFields: {
            fields: [
              {
                key: "companyName",
                value: formData.companyName,
              },
              {
                key: "hqAddress",
                value: formData.hqAddress,
              },
              {
                key: "nameOfTechnicalManager",
                value: formData.technicalManagerName,
              },
              {
                key: "professionalPhoneOrEmail",
                value: formData.professionalPhoneOrEmail,
              },
            ],
          },
          isSystemUser: true,
          userDetails: {
            ...(isEdit && architect?.userDetails
              ? {
                  uuid: architect.userDetails.uuid,
                  username: architect.userDetails.username,
                }
              : {
                  username: formData.mobileNumber,
                }),
            tenantId: tenantId,
            roles: [
              {
                code: "BPA_ARCHITECT",
                tenantId: tenantId,
              },
            ],
            type: "CITIZEN",
          },
        },
      };

      const endpoint = isEdit
        ? "/health-individual/v1/_update"
        : "/health-individual/v1/_create";

      await axios.post(endpoint, requestBody, {
        headers: {
          "X-Tenant-Id": tenantId,
          "auth-token": userInfo?.access_token,
        },
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving architect:", error);
      setError(
        error.response?.data?.Error?.message ||
          error.response?.data?.Errors?.[0]?.message ||
          "Erreur lors de l'enregistrement de l'architecte"
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
            {isEdit ? "Modifier l'architecte" : "Ajouter un architecte"}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-djibouti-primary focus:border-djibouti-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-djibouti-primary focus:border-djibouti-primary"
              >
                <option value="MALE">Homme</option>
                <option value="FEMALE">Femme</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de licence *
              </label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-djibouti-primary focus:border-djibouti-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Localité</label>
              <input
                type="text"
                name="locality"
                value={formData.locality}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-djibouti-primary focus:border-djibouti-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-djibouti-primary focus:border-djibouti-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse du siège social
              </label>
              <input
                type="text"
                name="hqAddress"
                value={formData.hqAddress}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-djibouti-primary focus:border-djibouti-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du responsable technique
              </label>
              <input
                type="text"
                name="technicalManagerName"
                value={formData.technicalManagerName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-djibouti-primary focus:border-djibouti-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone/Email professionnel
              </label>
              <input
                type="text"
                name="professionalPhoneOrEmail"
                value={formData.professionalPhoneOrEmail}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-djibouti-primary focus:border-djibouti-primary"
              />
            </div>
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
                <>
                  <LuLoader className="w-4 h-4 animate-spin" />
                  Enregistrement...
                </>
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

export default ArchitectFormModal;

