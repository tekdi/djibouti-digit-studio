import React, { useState, useEffect, Fragment } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  LuCircleCheck, 
  LuCircleX, 
  LuDownload, 
  LuHouse, 
  LuFileText,
  LuArrowRight,
  LuReceipt,
  LuSparkles
} from "react-icons/lu";
import { downloadStudioPDF } from "../../../PublicServices/src/utils";

const ResponseEmployee = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { state } = useLocation();
  const queryStrings = Digit.Hooks.useQueryParams();
  const { businessService } = useParams();
  const [isResponseSuccess, setIsResponseSuccess] = useState(state?.iSuccess || false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const userDetails = Digit.UserService.getUser();
  const userType = userDetails?.info?.type?.toLowerCase();
  const tenantId = Digit.ULBService.getCurrentTenantId();

  useEffect(() => {
    if (isResponseSuccess) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isResponseSuccess]);

  const handlePdfDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadStudioPDF(
        "pdf",
        {
          tenantId,
          serviceCode: queryStrings?.serviceCode,
          applicationNumber: state?.applicationNumber,
          pdfKey: "payment-receipt",
        },
        `payment-receipt-${state?.applicationNumber}.pdf`
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const navigate = (page) => {
    switch (page) {
      case "home": {
        history.push(`/${window?.contextPath}/${userType}/publicservices/dashboard-employee`);
        break;
      }
      case "view": {
        history.push(state?.redirectionUrl);
        break;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 p-4 md:p-8">
      {/* Confetti Animation for Success */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <div
                className={`w-3 h-3 ${
                  ['bg-primary', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-pink-500', 'bg-purple-500'][
                    Math.floor(Math.random() * 6)
                  ]
                } ${Math.random() > 0.5 ? 'rounded-full' : 'rotate-45'}`}
              />
            </div>
          ))}
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className={`relative px-8 py-12 ${
            isResponseSuccess 
              ? 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500' 
              : 'bg-gradient-to-br from-red-500 via-rose-500 to-pink-500'
          }`}>
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />
            
            {/* Icon */}
            <div className="relative flex justify-center mb-6">
              <div className={`relative ${isResponseSuccess ? 'animate-successBounce' : 'animate-shake'}`}>
                <div className={`absolute inset-0 ${
                  isResponseSuccess ? 'bg-white/30' : 'bg-white/20'
                } rounded-full animate-ping`} style={{ animationDuration: '2s' }} />
                <div className="relative bg-white/20 backdrop-blur-sm p-6 rounded-full">
                  {isResponseSuccess ? (
                    <LuCircleCheck className="w-16 h-16 text-white" strokeWidth={2.5} />
                  ) : (
                    <LuCircleX className="w-16 h-16 text-white" strokeWidth={2.5} />
                  )}
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="relative text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {isResponseSuccess && <LuSparkles className="w-6 h-6 text-yellow-300 animate-pulse" />}
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  {isResponseSuccess ? t("PAYMENT_SUCCESS") : t("PAYMENT_FAILED")}
                </h1>
                {isResponseSuccess && <LuSparkles className="w-6 h-6 text-yellow-300 animate-pulse" />}
              </div>
              <p className="text-white/80 text-lg">
                {isResponseSuccess 
                  ? "Votre paiement a été traité avec succès" 
                  : "Une erreur s'est produite lors du traitement"
                }
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {/* Application Number Card */}
            {state?.applicationNumber && isResponseSuccess && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-6 border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <LuReceipt className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{t("COMMON_APPLICATION_ID")}</p>
                    <p className="text-xl font-bold text-gray-900 font-mono">{state?.applicationNumber}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Info Box */}
            {isResponseSuccess && (
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5 mb-6">
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-100 p-2 rounded-lg mt-0.5">
                    <LuCircleCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-800 mb-1">Transaction confirmée</p>
                    <p className="text-emerald-700 text-sm">
                      Un reçu de paiement a été généré. Vous pouvez le télécharger ci-dessous.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Info Box */}
            {!isResponseSuccess && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 mb-6">
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 p-2 rounded-lg mt-0.5">
                    <LuCircleX className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-800 mb-1">Échec de la transaction</p>
                    <p className="text-red-700 text-sm">
                      {state?.message || "Veuillez réessayer ou contacter le support si le problème persiste."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              {/* Download Receipt Button - Only for success */}
              {isResponseSuccess && (
                <button
                  onClick={handlePdfDownload}
                  disabled={isDownloading}
                  className="w-full group flex items-center justify-center gap-3 px-6 py-4 bg-primary text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isDownloading ? (
                    <Fragment>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Téléchargement en cours...</span>
                    </Fragment>
                  ) : (
                    <Fragment>
                      <LuDownload className="w-5 h-5" />
                      <span>{t("CS_COMMON_DOWNLOAD_RECEIPT")}</span>
                    </Fragment>
                  )}
                </button>
              )}

              {/* View Application Button */}
              {state?.redirectionUrl && (
                <button
                  onClick={() => navigate("view")}
                  className="w-full group flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300"
                >
                  <LuFileText className="w-5 h-5" />
                  <span>Voir la demande</span>
                </button>
              )}

              {/* Go Home Button */}
              <button
                onClick={() => navigate("home")}
                className="w-full group flex items-center justify-center gap-3 px-6 py-4 bg-gray-100 text-gray-600 font-semibold rounded-2xl hover:bg-gray-200 transition-all duration-300"
              >
                <LuHouse className="w-5 h-5" />
                <span>Retour à l'accueil</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-gray-400 text-sm mt-6">
          © {new Date().getFullYear()} - Portail des Services Publics de Djibouti
        </p>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes successBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
        .animate-successBounce {
          animation: successBounce 0.6s ease-in-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ResponseEmployee;
