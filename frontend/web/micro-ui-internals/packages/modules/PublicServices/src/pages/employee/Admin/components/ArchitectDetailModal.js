import React from "react";
import { LuX, LuUser, LuPhone, LuBuilding2, LuCalendar, LuMapPin } from "react-icons/lu";

const ArchitectDetailModal = ({ architect, onClose }) => {
  if (!architect) return null;

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

  const getFieldValue = (key) => {
    return architect.additionalFields?.fields?.find((f) => f.key === key)?.value || "N/A";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Détails de l'architecte</h2>
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
                  Nom
                </div>
                <p className="text-gray-900">{architect.name?.givenName || "N/A"}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                  <LuPhone className="w-4 h-4" />
                  Téléphone
                </div>
                <p className="text-gray-900">{architect.mobileNumber || "N/A"}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                  <LuCalendar className="w-4 h-4" />
                  Date de naissance
                </div>
                <p className="text-gray-900">{formatDate(architect.dateOfBirth)}</p>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Genre</div>
                <p className="text-gray-900">{architect.gender || "N/A"}</p>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Numéro de licence</div>
                <p className="text-gray-900">
                  {architect.identifiers?.[0]?.identifierId || "N/A"}
                </p>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Statut</div>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    architect.userDetails?.active !== false
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {architect.userDetails?.active !== false ? "Actif" : "Inactif"}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                  <LuBuilding2 className="w-4 h-4" />
                  Nom de l'entreprise
                </div>
                <p className="text-gray-900">{getFieldValue("companyName")}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                  <LuMapPin className="w-4 h-4" />
                  Adresse du siège social
                </div>
                <p className="text-gray-900">{getFieldValue("hqAddress")}</p>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">
                  Nom du responsable technique
                </div>
                <p className="text-gray-900">{getFieldValue("nameOfTechnicalManager")}</p>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">
                  Téléphone/Email professionnel
                </div>
                <p className="text-gray-900">{getFieldValue("professionalPhoneOrEmail")}</p>
              </div>

              {architect.address?.[0] && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Localité</div>
                  <p className="text-gray-900">{architect.address[0].locality?.code || "N/A"}</p>
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

export default ArchitectDetailModal;

