import React from "react";
import { createPortal } from "react-dom";
import { LuX, LuUser, LuMail, LuPhone, LuShield } from "react-icons/lu";

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

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fadeIn" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all animate-scaleIn">
        <div className="sticky top-0 bg-gradient-to-r from-[#22a4d9] to-[#1978a0] px-6 py-5 flex items-center justify-between z-10">
          <h2 className="text-2xl font-black text-white">Détails de l'employé</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors hover:scale-110 transform duration-200"
          >
            <LuX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-[#22a4d9]/5 to-transparent rounded-xl p-4 border border-[#22a4d9]/20">
              <div className="flex items-center gap-3 text-sm font-semibold text-[#22a4d9] mb-2">
                <div className="p-2 bg-[#22a4d9]/10 rounded-lg">
                  <LuUser className="w-5 h-5" />
                </div>
                Nom complet
              </div>
              <p className="text-gray-900 font-medium text-lg">{employee.user?.name || "N/A"}</p>
            </div>

            <div className="bg-gradient-to-br from-[#22a4d9]/5 to-transparent rounded-xl p-4 border border-[#22a4d9]/20">
              <div className="flex items-center gap-3 text-sm font-semibold text-[#22a4d9] mb-2">
                <div className="p-2 bg-[#22a4d9]/10 rounded-lg">
                  <LuMail className="w-5 h-5" />
                </div>
                Email
              </div>
              <p className="text-gray-900 font-medium">{employee.user?.emailId || "N/A"}</p>
            </div>

            <div className="bg-gradient-to-br from-[#22a4d9]/5 to-transparent rounded-xl p-4 border border-[#22a4d9]/20">
              <div className="flex items-center gap-3 text-sm font-semibold text-[#22a4d9] mb-2">
                <div className="p-2 bg-[#22a4d9]/10 rounded-lg">
                  <LuPhone className="w-5 h-5" />
                </div>
                Téléphone
              </div>
              <p className="text-gray-900 font-medium">{employee.user?.mobileNumber || "N/A"}</p>
            </div>

            <div className="bg-gradient-to-br from-[#22a4d9]/5 to-transparent rounded-xl p-4 border border-[#22a4d9]/20">
              <div className="text-sm font-semibold text-[#22a4d9] mb-2">Code / Username</div>
              <p className="text-gray-900 font-medium">{employee.code || "N/A"}</p>
            </div>

            <div className="bg-gradient-to-br from-[#22a4d9]/5 to-transparent rounded-xl p-4 border border-[#22a4d9]/20 md:col-span-2">
              <div className="flex items-center gap-3 text-sm font-semibold text-[#22a4d9] mb-3">
                <div className="p-2 bg-[#22a4d9]/10 rounded-lg">
                  <LuShield className="w-5 h-5" />
                </div>
                Rôles
              </div>
              <div className="flex flex-wrap gap-2">
                {employee.user?.roles?.map((role, idx) => (
                  <span
                    key={idx}
                    className="inline-flex px-3 py-1.5 text-xs font-semibold bg-[#22a4d9]/10 text-[#1978a0] rounded-lg border border-[#22a4d9]/20"
                  >
                    {role.name}
                  </span>
                ))}
              </div>
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

export default EmployeeDetailModal;

