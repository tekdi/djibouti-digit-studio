import React, { useState, useEffect } from "react";
import {
  LuBuilding,
  LuMail,
  LuInfo,
  LuRocket,
  LuSparkles,
  LuZap,
  LuArrowRight,
  LuArrowLeft,
  LuSmartphone,
} from "react-icons/lu";

const features = [
  {
    icon: LuRocket,
    title: "Accélérez vos démarches",
    description:
      "Obtenez votre permis en un temps record grâce à notre processus optimisé",
    color: "text-djibouti-primary",
  },
  {
    icon: LuSparkles,
    title: "Expérience intuitive",
    description:
      "Une interface moderne qui simplifie chaque étape de votre projet",
    color: "text-djibouti-secondary",
  },
  {
    icon: LuZap,
    title: "Suivi en direct",
    description:
      "Restez informé de l'avancement de votre dossier en temps réel",
    color: "text-djibouti-primary",
  },
];

const SelectEmail = ({ t, onSelect, email, onEmailChange, config, canSubmit, onForgotPassword, isDisabled, disable }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValidEmail = (email) => {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Auto slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  const handleCitizenLogin = () => {
    window.location.href = `/${window?.contextPath}/citizen/login`;
  };

  const handleBackToProfileSelection = () => {
    window.location.href = `/${window?.contextPath}/profile-selection`;
  };

  const handleSubmit = (data) => {
    onSelect(data);
  };

  const handleEmailChange = (e) => {
    onEmailChange(e);
    if (error && e.target.value) {
      setError("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 to-gray-50 flex overflow-hidden">
      {/* Left side - Image and Info (Desktop only) */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-djibouti-light mix-blend-multiply z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Modern architecture"
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
                  <div className="text-white/60 text-base">Projets</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">98%</div>
                  <div className="text-white/60 text-base">Satisfaction</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">24h</div>
                  <div className="text-white/60 text-base">Réponse</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form (Desktop) & Fancy Card (Mobile) */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8">
        {/* Fancy Mobile Card */}
        <div className="block lg:hidden w-full max-w-md mx-auto px-2 py-8">
          <div className="relative z-10 w-full">
            <div className="backdrop-blur-xl bg-white/80 shadow-2xl rounded-3xl px-6 py-10 flex flex-col items-center">
              <div className="mb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-djibouti-primary/10 p-3">
                    <LuBuilding className="w-8 h-8 text-djibouti-primary" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">E-Permis</h1>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Connexion Email
              </h2>
              <p className="text-gray-600 text-base mb-8 text-center">
                Entrez votre adresse email pour continuer
              </p>
              
                             <form onSubmit={(e) => {
                 e.preventDefault();
                 if (!email || !isValidEmail(email)) {
                   setError("Veuillez entrer une adresse email valide");
                   return;
                 }
                 setError("");
                 setIsSubmitting(true);
                 onSelect({ username: email });
               }} className="w-full space-y-6">
                 {error && (
                   <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-md flex items-start">
                     <LuInfo className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                     <p className="text-sm text-red-700">{error}</p>
                   </div>
                 )}
                
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Adresse email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LuMail className="h-5 w-5 text-djibouti-primary" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email || ""}
                      onChange={handleEmailChange}
                      className="block w-full pl-10 pr-3 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-djibouti-primary focus:border-djibouti-primary bg-white/80 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200"
                      placeholder="exemple@email.com"
                      disabled={isDisabled || disable}
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={(!email || !isValidEmail(email)) || !canSubmit || isDisabled || disable}
                  className="w-full flex justify-center items-center py-4 px-4 rounded-2xl shadow-lg text-base font-semibold text-white btn-gradient-djibouti focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-djibouti-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mt-2"
                  style={{
                    background: 'linear-gradient(to right, #22a4d9, #52ac47)',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  <LuArrowRight className="h-5 w-5 mr-2" />
                  Continuer
                </button>
              </form>
              
              <div className="text-center space-y-4 mt-8">
                <button
                  onClick={handleBackToProfileSelection}
                  className="flex items-center justify-center w-full text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 mb-2"
                >
                  <LuArrowLeft className="h-4 w-4 mr-2" />
                  Retour à la sélection de profil
                </button>
           
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Form (hidden on mobile) */}
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connexion Email</h2>
            <p className="text-gray-600 text-base mb-8 text-center">
              Entrez votre adresse email pour continuer
            </p>
            
                         <form onSubmit={(e) => {
               e.preventDefault();
               if (!email || !isValidEmail(email)) {
                 setError("Veuillez entrer une adresse email valide");
                 return;
               }
               setError("");
               onSelect({ username: email });
             }} className="w-full space-y-6">
               {error && (
                 <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
                   <LuInfo className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                   <p className="text-sm text-red-700">{error}</p>
                 </div>
               )}
              
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LuMail className="h-5 w-5 text-djibouti-primary" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email || ""}
                    onChange={handleEmailChange}
                    className="block w-full pl-10 pr-3 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-djibouti-primary focus:border-djibouti-primary bg-white/80 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200"
                    placeholder="exemple@email.com"
                    disabled={isDisabled || disable}
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={(!email || !isValidEmail(email)) || !canSubmit || isDisabled || disable}
                className="w-full flex justify-center items-center py-4 px-4 rounded-2xl shadow-lg text-base font-semibold text-white btn-gradient-djibouti focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-djibouti-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mt-2"
                style={{
                  background: 'linear-gradient(to right, #22a4d9, #52ac47)',
                  color: 'white',
                  border: 'none'
                }}
              >
                <LuArrowRight className="h-5 w-5 mr-2" />
                Continuer
              </button>
            </form>
            
            <div className="text-center space-y-4 mt-8">
              <button
                onClick={handleBackToProfileSelection}
                className="flex items-center justify-center w-full text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 mb-2"
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

export default SelectEmail;
