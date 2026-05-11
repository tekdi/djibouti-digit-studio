import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom/cjs/react-router-dom";
import {
  LuBuilding,
  LuUser,
  LuPhone,
  LuInfo,
  LuRocket,
  LuSparkles,
  LuZap,
  LuArrowRight,
  LuArrowLeft,
} from "react-icons/lu";
import AnimatedLogo from "../../../components/TopBarSideBar/AnimatedLogo";

const features = [
  {
    icon: LuRocket,
    title: "Inscription simplifiée",
    description:
      "Créez votre compte en quelques étapes simples et sécurisées",
    color: "text-djibouti-primary",
  },
  {
    icon: LuSparkles,
    title: "Accès immédiat",
    description:
      "Accédez à tous vos services administratifs dès votre inscription",
    color: "text-djibouti-secondary",
  },
  {
    icon: LuZap,
    title: "Sécurité garantie",
    description:
      "Vos informations sont protégées et sécurisées à tout moment",
    color: "text-djibouti-primary",
  },
];

const SelectName = ({ onSelect, t, isDisabled, mobileNumber: propMobileNumber = "" }) => {
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState(propMobileNumber);
  const [error, setError] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { module, service } = useParams();

  useEffect(() => {
    setMobileNumber(propMobileNumber || "");
  }, [propMobileNumber]);

  useEffect(() => {
    const validMobile = mobileNumber.length === 8 && mobileNumber.startsWith("77");
    setCanSubmit(name.trim().length > 0 && validMobile);
    if (mobileNumber && mobileNumber.length > 1 && !mobileNumber.startsWith("77")) {
      setError("Mobile number should start with 77");
    } else {
      setError("");
    }
  }, [name, mobileNumber]);

  // Auto slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (canSubmit) {
      onSelect({ name, mobileNumber });
    }
  };

  const handleBackToProfileSelection = () => {
    window.location.href = `/${window?.contextPath}/profile-selection`;
  };

  // Mobile must NOT use min-h-screen — parent .citizen .main already enforces 100vh
  // and that double height + padding-top: 82px from digit-ui-components-css would
  // force scroll. Only apply min-h-screen at lg+ for the side-by-side desktop layout.
  return (
    <div className="w-full relative flex overflow-hidden lg:min-h-screen">
      {/* Soft gradient backdrop with djibouti-primary tint and decorative blobs */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-djibouti-primary/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-djibouti-primary/10 blur-3xl pointer-events-none" />
      {/* Left side - Image and Info (Desktop only) */}
      <div className="hidden lg:block lg:w-1/2 relative z-10">
        <div className="absolute inset-0 bg-gradient-djibouti-light mix-blend-multiply z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Registration"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-white p-12">
          <div className="backdrop-blur-sm bg-white/10 p-12 rounded-3xl shadow-2xl max-w-xl border border-white/20">
            <div className="flex items-center gap-3 mb-12">
              <div className="rounded-full bg-white/20 p-3">
                <LuBuilding className="w-8 h-8" />
              </div>
              <h1 className="text-4xl font-bold">E-Permis</h1>
            </div>

            <div className="relative">
              {/* Feature Slides */}
              <div className="relative h-[350px]">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`absolute w-full transition-all duration-700 ease-in-out ${
                      index === currentSlide
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-8"
                    }`}
                  >
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-white/10 mb-8">
                        <feature.icon
                          className={`w-12 h-12 ${feature.color}`}
                        />
                      </div>
                      <h2 className="text-4xl font-bold mb-6">
                        {feature.title}
                      </h2>
                      <p className="text-white/90 text-xl leading-relaxed max-w-md mx-auto">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Simple Dots */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-3">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? "bg-white scale-125"
                        : "bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Stats Section */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-white">10k+</div>
                  <div className="text-white/60 text-base">Utilisateurs</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">98%</div>
                  <div className="text-white/60 text-base">Satisfaction</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">24h</div>
                  <div className="text-white/60 text-base">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Registration Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8 relative z-10">
        {/* Mobile Card */}
        <div className="block lg:hidden w-full max-w-md mx-auto py-4">
          <div className="relative z-10 w-full">
            <div className="bg-white shadow-xl rounded-2xl px-4 sm:px-6 py-6 sm:py-10 flex flex-col items-center border border-gray-100">
              <div className="mb-4 flex justify-center">
                <AnimatedLogo />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Inscription
              </h2>
              <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8 text-center">
                Créez votre compte pour commencer
              </p>

              <form onSubmit={handleSubmit} className="w-full space-y-6">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-md flex items-start">
                    <LuInfo className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nom légal
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LuUser className="h-5 w-5 text-djibouti-primary" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-djibouti-primary focus:border-djibouti-primary bg-white/80 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200"
                      placeholder="Entrez votre nom légal selon vos documents"
                      disabled={isDisabled}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="mobile"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
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
                      value={mobileNumber}
                      disabled
                      className="block w-full pl-20 pr-3 py-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 shadow-sm"
                      placeholder="77 XX XX XX"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit || isDisabled}
                  className="w-full flex justify-center items-center py-4 px-4 rounded-2xl shadow-lg text-base font-semibold text-white btn-gradient-djibouti focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-djibouti-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mt-2"
                  style={{
                    background: 'linear-gradient(to right, #22a4d9, #52ac47)',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  <LuArrowRight className="h-5 w-5 mr-2" />
                  S'inscrire
                </button>
              </form>

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
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-djibouti-primary/10 p-3">
                  <LuBuilding className="w-8 h-8 text-djibouti-primary" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">E-Permis</h1>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Inscription</h2>
            <p className="text-gray-600 text-base mb-8 text-center">
              Créez votre compte pour commencer
            </p>

            <form onSubmit={handleSubmit} className="w-full space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
                  <LuInfo className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nom légal
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LuUser className="h-5 w-5 text-djibouti-primary" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-djibouti-primary focus:border-djibouti-primary bg-white/80 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200"
                    placeholder="Entrez votre nom légal selon vos documents"
                    disabled={isDisabled}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="mobile"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
                    value={mobileNumber}
                    disabled
                    className="block w-full pl-20 pr-3 py-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 shadow-sm"
                    placeholder="77 XX XX XX"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!canSubmit || isDisabled}
                className="w-full flex justify-center items-center py-4 px-4 rounded-2xl shadow-lg text-base font-semibold text-white btn-gradient-djibouti focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-djibouti-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mt-2"
                style={{
                  background: 'linear-gradient(to right, #22a4d9, #52ac47)',
                  color: 'white',
                  border: 'none'
                }}
              >
                <LuArrowRight className="h-5 w-5 mr-2" />
                S'inscrire
              </button>
            </form>

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

export default SelectName;
