import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { LuX, LuLoader } from "react-icons/lu";
import axios from "axios";

const ArchitectFormModal = ({ architect, isEdit, onClose, onSuccess }) => {
  // Store the original architect object to preserve all fields
  const [originalArchitect, setOriginalArchitect] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    gender: "MALE",
    licenseNumber: "",
    companyName: "",
    hqAddress: "",
    technicalManagerName: "",
    professionalPhoneOrEmail: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const userInfo = Digit.UserService.getUser();

  useEffect(() => {
    if (isEdit && architect) {
      // Store the original architect object to preserve all fields
      setOriginalArchitect(architect);
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

      setFormData({
        name: architect.name?.givenName || "",
        mobileNumber: architect.mobileNumber || "",
        gender: architect.gender || "MALE",
        licenseNumber: licenseId,
        companyName: companyName,
        hqAddress: hqAddress,
        technicalManagerName: techManager,
        professionalPhoneOrEmail: professionalContact,
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
          gender: formData.gender,
          mobileNumber: formData.mobileNumber,
          address: [
            {
              tenantId: tenantId,
              city: tenantId,
              locality: {
                code: "DZB-PLATEAU",
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

      // Use axios.post with params like ArchitectListTab.js (which works fine)
      const endpoint = isEdit
        ? "/health-individual/v1/_update"
        : "/health-individual/v1/_create";

      await axios.post(endpoint, requestBody, {
        params: {
          tenantId: tenantId,
        },
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

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fadeIn" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all animate-scaleIn">
        <div className="sticky top-0 bg-gradient-to-r from-[#22a4d9] to-[#1978a0] px-6 py-5 flex items-center justify-between z-10">
          <h2 className="text-2xl font-black text-white">
            {isEdit ? "Modifier l'architecte" : "Ajouter un architecte"}
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nom *</label>
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Numéro de licence *
              </label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-[#22a4d9]/30 rounded-xl focus:ring-2 focus:ring-[#22a4d9] focus:border-[#22a4d9] bg-white/50 backdrop-blur-sm transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nom de l'entreprise</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-[#22a4d9]/30 rounded-xl focus:ring-2 focus:ring-[#22a4d9] focus:border-[#22a4d9] bg-white/50 backdrop-blur-sm transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Adresse du siège social
              </label>
              <input
                type="text"
                name="hqAddress"
                value={formData.hqAddress}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-[#22a4d9]/30 rounded-xl focus:ring-2 focus:ring-[#22a4d9] focus:border-[#22a4d9] bg-white/50 backdrop-blur-sm transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom du responsable technique
              </label>
              <input
                type="text"
                name="technicalManagerName"
                value={formData.technicalManagerName}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-[#22a4d9]/30 rounded-xl focus:ring-2 focus:ring-[#22a4d9] focus:border-[#22a4d9] bg-white/50 backdrop-blur-sm transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Téléphone/Email professionnel
              </label>
              <input
                type="text"
                name="professionalPhoneOrEmail"
                value={formData.professionalPhoneOrEmail}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-[#22a4d9]/30 rounded-xl focus:ring-2 focus:ring-[#22a4d9] focus:border-[#22a4d9] bg-white/50 backdrop-blur-sm transition-all duration-300"
              />
            </div>
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

export default ArchitectFormModal;

