import React from "react";
import { createPortal } from "react-dom";
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

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fadeIn" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all animate-scaleIn">
        <div className="sticky top-0 bg-gradient-to-r from-[#22a4d9] to-[#1978a0] px-6 py-5 flex items-center justify-between z-10">
          <h2 className="text-2xl font-black text-white">Détails de l'architecte</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors hover:scale-110 transform duration-200"
          >
            <LuX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#22a4d9]/5 to-transparent rounded-xl p-4 border border-[#22a4d9]/20">
                <div className="flex items-center gap-3 text-sm font-semibold text-[#22a4d9] mb-2">
                  <div className="p-2 bg-[#22a4d9]/10 rounded-lg">
                    <LuUser className="w-5 h-5" />
                  </div>
                  Nom
                </div>
                <p className="text-gray-900 font-medium text-lg">{architect.name?.givenName || "N/A"}</p>
              </div>

              <div className="bg-gradient-to-br from-[#22a4d9]/5 to-transparent rounded-xl p-4 border border-[#22a4d9]/20">
                <div className="flex items-center gap-3 text-sm font-semibold text-[#22a4d9] mb-2">
                  <div className="p-2 bg-[#22a4d9]/10 rounded-lg">
                    <LuPhone className="w-5 h-5" />
                  </div>
                  Téléphone
                </div>
                <p className="text-gray-900 font-medium">{architect.mobileNumber || "N/A"}</p>
              </div>

              <div className="bg-gradient-to-br from-[#22a4d9]/5 to-transparent rounded-xl p-4 border border-[#22a4d9]/20">
                <div className="flex items-center gap-3 text-sm font-semibold text-[#22a4d9] mb-2">
                  <div className="p-2 bg-[#22a4d9]/10 rounded-lg">
                    <LuCalendar className="w-5 h-5" />
                  </div>
                  Date de naissance
                </div>
                <p className="text-gray-900 font-medium">{formatDate(architect.dateOfBirth)}</p>
              </div>

              <div className="bg-gradient-to-br from-[#22a4d9]/5 to-transparent rounded-xl p-4 border border-[#22a4d9]/20">
                <div className="text-sm font-semibold text-[#22a4d9] mb-2">Genre</div>
                <p className="text-gray-900 font-medium">{architect.gender || "N/A"}</p>
              </div>

              <div className="bg-gradient-to-br from-[#22a4d9]/5 to-transparent rounded-xl p-4 border border-[#22a4d9]/20">
                <div className="text-sm font-semibold text-[#22a4d9] mb-2">Numéro de licence</div>
                <p className="text-gray-900 font-medium">
                  {architect.identifiers?.[0]?.identifierId || "N/A"}
                </p>
              </div>

              <div className="bg-gradient-to-br from-[#22a4d9]/5 to-transparent rounded-xl p-4 border border-[#22a4d9]/20">
                <div className="text-sm font-semibold text-[#22a4d9] mb-2">Statut</div>
                <span
                  className={`inline-flex px-4 py-2 text-sm font-bold rounded-xl ${
                    architect.userDetails?.active !== false
                      ? "bg-[#22a4d9]/20 text-[#1978a0] border-2 border-[#22a4d9]/30"
                      : "bg-gray-100 text-gray-600 border-2 border-gray-200"
                  }`}
                >
                  {architect.userDetails?.active !== false ? "Actif" : "Inactif"}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#22a4d9]/5 to-transparent rounded-xl p-4 border border-[#22a4d9]/20">
                <div className="flex items-center gap-3 text-sm font-semibold text-[#22a4d9] mb-2">
                  <div className="p-2 bg-[#22a4d9]/10 rounded-lg">
                    <LuBuilding2 className="w-5 h-5" />
                  </div>
                  Nom de l'entreprise
                </div>
                <p className="text-gray-900 font-medium">{getFieldValue("companyName")}</p>
              </div>

              <div className="bg-gradient-to-br from-[#22a4d9]/5 to-transparent rounded-xl p-4 border border-[#22a4d9]/20">
                <div className="flex items-center gap-3 text-sm font-semibold text-[#22a4d9] mb-2">
                  <div className="p-2 bg-[#22a4d9]/10 rounded-lg">
                    <LuMapPin className="w-5 h-5" />
                  </div>
                  Adresse du siège social
                </div>
                <p className="text-gray-900 font-medium">{getFieldValue("hqAddress")}</p>
              </div>

              <div className="bg-gradient-to-br from-[#22a4d9]/5 to-transparent rounded-xl p-4 border border-[#22a4d9]/20">
                <div className="text-sm font-semibold text-[#22a4d9] mb-2">
                  Nom du responsable technique
                </div>
                <p className="text-gray-900 font-medium">{getFieldValue("nameOfTechnicalManager")}</p>
              </div>

              <div className="bg-gradient-to-br from-[#22a4d9]/5 to-transparent rounded-xl p-4 border border-[#22a4d9]/20">
                <div className="text-sm font-semibold text-[#22a4d9] mb-2">
                  Téléphone/Email professionnel
                </div>
                <p className="text-gray-900 font-medium">{getFieldValue("professionalPhoneOrEmail")}</p>
              </div>

              {architect.address?.[0] && (
                <div className="bg-gradient-to-br from-[#22a4d9]/5 to-transparent rounded-xl p-4 border border-[#22a4d9]/20">
                  <div className="text-sm font-semibold text-[#22a4d9] mb-2">Localité</div>
                  <p className="text-gray-900 font-medium">{architect.address[0].locality?.code || "N/A"}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end pt-6 border-t border-[#22a4d9]/20">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-[#22a4d9] to-[#1978a0] text-white rounded-xl hover:shadow-xl transition-all duration-300 font-semibold hover:scale-105 transform"
            >
              Fermer
            </button>
          </div>
        </div>
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

export default ArchitectDetailModal;

