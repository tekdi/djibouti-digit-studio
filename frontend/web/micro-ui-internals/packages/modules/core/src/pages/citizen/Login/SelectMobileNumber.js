import FormStep from "../../../../../../ui-components/src/molecules/FormStep";
import React, { useState, useEffect } from "react";
import { LuBuilding, LuPhone, LuInfo, LuRocket, LuSparkles, LuZap, LuArrowRight, LuArrowLeft, LuSmartphone } from "react-icons/lu";

const features = [
  {
    icon: LuRocket,
    title: "Démarches Citoyen (ne)nes",
    description: "Accédez facilement à tous vos services administratifs en ligne",
    color: "text-djibouti-primary",
  },
  {
    icon: LuSparkles,
    title: "Interface simplifiée",
    description: "Une expérience utilisateur moderne et intuitive pour tous",
    color: "text-djibouti-secondary",
  },
  {
    icon: LuZap,
    title: "Traitement rapide",
    description: "Suivez vos demandes en temps réel et obtenez des réponses rapides",
    color: "text-djibouti-primary",
  },
];

const SelectMobileNumber = ({ t, onSelect, showRegisterLink, mobileNumber, onMobileChange, config, canSubmit }) => {
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (mobileNumber && mobileNumber.length > 1) {
      if (!mobileNumber.startsWith("77")) {
        setError(t("CORE_COMMON_MOBILE_NUMBER_INVALID_MSG"));
      } else {
        setError(null);
      }
    } else {
      setError(null);
    }
  }, [mobileNumber]);

  // Auto slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  const isValidMobile = (mobile) => {
    if (!mobile) return false;
    return mobile.length === 8 && mobile.startsWith("77");
  };

  const handleMobileChange = (e) => {
    console.log("handleMobileChange received:", e);

    // Handle SyntheticBaseEvent and other React events
    if (e && typeof e === "object" && e.target && e.target.value !== undefined) {
      const value = e.target.value.replace(/[^0-9]/g, "");
      console.log("Extracted value from event:", value);
      onMobileChange(value);
    }
    // Handle direct string/number values
    else if (typeof e === "string" || typeof e === "number") {
      const value = e.toString().replace(/[^0-9]/g, "");
      console.log("Direct value:", value);
      onMobileChange(value);
    }
    // Fallback for any other case
    else {
      console.log("Fallback to empty string");
      onMobileChange("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValidMobile(mobileNumber) && !error && canSubmit) {
      onSelect({ mobileNumber });
    }
  };

  const handleBackToProfileSelection = () => {
    window.location.href = `/${window?.contextPath}/profile-selection`;
  };

  const handleMobileIDLogin = () => {
    window.location.href = `/${window?.contextPath}/login/mobileid`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 to-gray-50 flex overflow-hidden">
      {/* Left side - Image and Info (Desktop only) */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-djibouti-light mix-blend-multiply z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Citizen services"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-white p-12">
          <div className="backdrop-blur-sm bg-white/10 p-12 rounded-3xl shadow-2xl max-w-xl border border-white/20">
            <div className="relative">
              {/* Current Feature Display */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-white/10 mb-8">
                  {React.createElement(features[currentSlide].icon, {
                    className: `w-12 h-12 ${features[currentSlide].color}`,
                  })}
                </div>
                <h2 className="text-4xl font-bold mb-6">{features[currentSlide].title}</h2>
                <p className="text-white/90 text-xl leading-relaxed max-w-md mx-auto">{features[currentSlide].description}</p>
              </div>

              {/* Simple Dots */}
              <div className="flex justify-center gap-3 mt-8">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? "bg-white scale-125" : "bg-gray-400"}`}
                  />
                ))}
              </div>
            </div>

            {/* Stats Section */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-white">24/7</div>
                  <div className="text-white/60 text-base">Disponible</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">100%</div>
                  <div className="text-white/60 text-base">Numérique</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">5k+</div>
                  <div className="text-white/60 text-base">Citoyen (ne)s</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Phone Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8">
        {/* Mobile Card */}
        <div className="block lg:hidden w-full max-w-md mx-auto px-2 py-8">
          <div className="relative z-10 w-full">
            <div className="backdrop-blur-xl bg-white/80 shadow-2xl rounded-3xl px-6 py-10 flex flex-col items-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Connexion</h2>
              <p className="text-gray-600 text-base mb-8 text-center">Entrez votre numéro de téléphone pour continuer</p>

              <form onSubmit={handleSubmit} className="w-full space-y-6">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-md flex items-start">
                    <LuInfo className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-sm text-red-700">{t(error)}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de téléphone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LuPhone className="h-5 w-5 text-djibouti-primary" />
                    </div>
                    <div className="absolute inset-y-0 left-10 flex items-center pointer-events-none">
                      <span className="text-gray-600 font-medium">+253</span>
                    </div>
                    <input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      required
                      value={mobileNumber || ""}
                      onChange={handleMobileChange}
                      className="block w-full pl-20 pr-3 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-djibouti-primary focus:border-djibouti-primary bg-white/80 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200"
                      placeholder="77 XX XX XX"
                      maxLength={8}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isValidMobile(mobileNumber) || error || !canSubmit}
                  className="w-full flex justify-center items-center py-4 px-4 rounded-2xl shadow-lg text-base font-semibold text-white btn-gradient-djibouti focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-djibouti-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mt-2"
                  style={{
                    background: "linear-gradient(to right, #22a4d9, #52ac47)",
                    color: "white",
                    border: "none",
                  }}
                >
                  <LuArrowRight className="h-5 w-5 mr-2" />
                  Continuer
                </button>
              </form>

              {/* Séparateur OU */}
              {/* <div className="relative my-6 w-full">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">OU</span>
                </div>
              </div> */}

              {/* Bouton Mobile ID */}
              {/* <button
                onClick={handleMobileIDLogin}
                className="w-full flex justify-center items-center py-4 px-4 rounded-2xl shadow-lg text-base font-semibold border-2 border-djibouti-primary text-djibouti-primary bg-white hover:bg-djibouti-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-djibouti-primary transition-all duration-200"
              >
                <LuSmartphone className="h-5 w-5 mr-2" />
                Se connecter avec Mobile ID
              </button> */}

              <div className="text-center space-y-4 mt-8">
                <button
                  onClick={handleBackToProfileSelection}
                  className="flex items-center justify-center w-full text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  <LuArrowLeft className="h-4 w-4 mr-2" />
                  Retour à la sélection de profil
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Form */}
        <div className="hidden lg:flex w-full max-w-md items-center justify-center">
          <div className="backdrop-blur-xl bg-white/80 shadow-2xl rounded-3xl px-6 py-10 flex flex-col items-center w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connexion</h2>
            <p className="text-gray-600 text-base mb-8 text-center">Entrez votre numéro de téléphone pour continuer</p>

            <form onSubmit={handleSubmit} className="w-full space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
                  <LuInfo className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-red-700">{t(error)}</p>
                </div>
              )}

              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de téléphone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LuPhone className="h-5 w-5 text-djibouti-primary" />
                  </div>
                  <div className="absolute inset-y-0 left-10 flex items-center pointer-events-none">
                    <span className="text-gray-600 font-medium">+253</span>
                  </div>
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    required
                    value={mobileNumber || ""}
                    onChange={handleMobileChange}
                    className="block w-full pl-20 pr-3 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-djibouti-primary focus:border-djibouti-primary bg-white/80 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200"
                    placeholder="77 XX XX XX"
                    maxLength={8}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!isValidMobile(mobileNumber) || error || !canSubmit}
                className="w-full flex justify-center items-center py-4 px-4 rounded-2xl shadow-lg text-base font-semibold text-white btn-gradient-djibouti focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-djibouti-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mt-2"
                style={{
                  background: "linear-gradient(to right, #22a4d9, #52ac47)",
                  color: "white",
                  border: "none",
                }}
              >
                <LuArrowRight className="h-5 w-5 mr-2" />
                Continuer
              </button>
            </form>

            {/* Séparateur OU */}
            {/* <div className="relative my-6 w-full">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">OU</span>
              </div>
            </div> */}

            {/* Bouton Mobile ID */}
            {/* <button
              onClick={handleMobileIDLogin}
              className="w-full flex justify-center items-center py-4 px-4 rounded-2xl shadow-lg text-base font-semibold border-2 border-djibouti-primary text-djibouti-primary bg-white hover:bg-djibouti-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-djibouti-primary transition-all duration-200"
            >
              <LuSmartphone className="h-5 w-5 mr-2" />
              Se connecter avec Mobile ID
            </button> */}

            <div className="text-center space-y-4 mt-8">
              <button
                onClick={handleBackToProfileSelection}
                className="flex items-center justify-center w-full text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                <LuArrowLeft className="h-4 w-4 mr-2" />
                Retour à la sélection de profil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectMobileNumber;
