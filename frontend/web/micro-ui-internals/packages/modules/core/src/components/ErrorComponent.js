import React from "react";
import { LuTriangleAlert, LuWrench, LuCompass, LuHouse, LuRotateCcw } from "react-icons/lu";

// Type-specific visual + copy. Plain French text, no translation keys.
const ErrorConfig = {
  error: {
    Icon: LuTriangleAlert,
    iconBg: "from-red-100 to-rose-50",
    iconColor: "text-red-500",
    accent: "bg-red-500",
    title: "Une erreur est survenue",
    message:
      "Un problème inattendu nous empêche d'afficher cette page. Veuillez réessayer dans un instant.",
  },
  maintenance: {
    Icon: LuWrench,
    iconBg: "from-amber-100 to-yellow-50",
    iconColor: "text-amber-500",
    accent: "bg-amber-500",
    title: "Plateforme en maintenance",
    message:
      "La plateforme est temporairement indisponible pour maintenance. Merci de revenir dans quelques minutes.",
  },
  notfound: {
    Icon: LuCompass,
    iconBg: "from-djibouti-primary/15 to-djibouti-primary/5",
    iconColor: "text-djibouti-primary",
    accent: "bg-djibouti-primary",
    title: "Page introuvable",
    message:
      "La page que vous cherchez n'existe pas ou a été déplacée. Vérifiez l'adresse ou revenez à l'accueil.",
  },
};

const ErrorComponent = (props) => {
  const { type = "error" } = Digit.Hooks.useQueryParams();
  const config = ErrorConfig[type] || ErrorConfig.error;
  const { Icon } = config;

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-xl">
        {/* Glow behind the card */}
        <div className={`absolute -inset-4 ${config.accent} opacity-10 blur-3xl rounded-3xl`} />

        <div className="relative bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Top accent bar */}
          <div className={`h-1.5 ${config.accent}`} />

          <div className="p-10 sm:p-12 text-center">
            {/* Icon */}
            <div className="flex items-center justify-center mb-6">
              <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${config.iconBg} flex items-center justify-center shadow-inner`}>
                <Icon className={`w-12 h-12 ${config.iconColor}`} strokeWidth={1.75} />
              </div>
            </div>

            {/* Copy */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              {config.title}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-md mx-auto mb-8">
              {config.message}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => props.goToHome && props.goToHome()}
                className="inline-flex items-center gap-2 rounded-xl bg-djibouti-primary text-white px-5 py-3 text-sm font-semibold shadow-sm transition-all hover:bg-djibouti-primary-dark hover:shadow-md w-full sm:w-auto justify-center"
              >
                <LuHouse className="w-4 h-4" />
                Retour à l'accueil
              </button>
              <button
                onClick={handleReload}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-700 px-5 py-3 text-sm font-semibold transition-all hover:border-djibouti-primary/40 hover:text-djibouti-primary w-full sm:w-auto justify-center"
              >
                <LuRotateCcw className="w-4 h-4" />
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorComponent;
