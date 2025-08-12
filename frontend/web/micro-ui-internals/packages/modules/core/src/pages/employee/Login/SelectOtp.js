import FormStep from '../../../../../../ui-components/src/molecules/FormStep'
import OTPInput from "../../../../../../ui-components/src/atoms/OTPInput"
import CardText from "../../../../../../ui-components/src/atoms/CardText"
import CardLabelError from "../../../../../../ui-components/src/atoms/CardLabelError"
import React, { Fragment, useState, useEffect } from "react";
import useInterval from "../../../hooks/useInterval";
import {
  LuBuilding,
  LuShield,
  LuArrowRight,
  LuArrowLeft,
  LuCircleCheck,
  LuClock,
  LuMail,
} from "react-icons/lu";

const SelectOtp = ({ config, otp, onOtpChange, onResend, onSelect, t, error, canSubmit }) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [otpValue, setOtpValue] = useState(otp || "");

  // Sync with props
  useEffect(() => {
    setOtpValue(otp || "");
  }, [otp]);

  // Handle OTP input change
  const handleOtpInputChange = (value) => {
    setOtpValue(value);
    // Call parent handler
    onOtpChange(value);
  };

  useInterval(
    () => {
      setTimeLeft(timeLeft - 1);
    },
    timeLeft > 0 ? 1000 : null
  );

  const handleResendOtp = () => {
    onResend();
    setOtpValue("");
    setTimeLeft(30);
  };

  // Create a modified config with OTP-specific settings
  const modifiedConfig = {
    ...config,
    texts: {
      ...config.texts,
      header: "CS_LOGIN_OTP",
      cardText: `${config.email || ""}`,
      submitBarLabel: config.texts?.submitButtonLabel || "CS_COMMONS_VERIFY",
    }
  };


  const handleCitizenLogin = () => {
    window.location.href = `/${window?.contextPath}/citizen/login`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 to-gray-50 flex overflow-hidden">
      {/* Left side - Image and Info (Desktop only) */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-djibouti-light mix-blend-multiply z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Security and verification"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-white p-12">
          <div className="backdrop-blur-xl bg-white/20 p-12 rounded-3xl shadow-2xl max-w-xl border border-white/30 backdrop-saturate-150">
            <div className="flex items-center gap-3 mb-12">
              <div className="rounded-full bg-white/20 p-3">
                <LuShield className="w-8 h-8" />
              </div>
              <h1 className="text-4xl font-bold">Vérification</h1>
            </div>

            {/* Modern Security Content */}
            <div className="text-center">
              {/* Main Icon */}
              <div className="relative mb-8">
                <div className="w-24 h-24 mx-auto rounded-3xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center mb-6">
                  <LuShield className="w-12 h-12 text-white" />
                </div>
                {/* Floating elements */}
                <div className="absolute -top-1 -right-4 w-6 h-6 rounded-full bg-green-400 flex items-center justify-center animate-pulse">
                  <LuCircleCheck className="w-4 h-4 text-green-800" />
                </div>
                <div className="absolute -bottom-1 -left-4 w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center animate-bounce">
                  <LuMail className="w-4 h-4 text-blue-800" />
                </div>
              </div>

              {/* Main Content */}
              <h2 className="text-3xl font-bold mb-4">
                Vérification Sécurisée
              </h2>
              <p className="text-white/90 text-lg leading-relaxed mb-8">
                Votre code de vérification garantit un accès sécurisé et rapide à votre espace professionnel.
              </p>

              {/* Feature Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <LuCircleCheck className="w-6 h-6 text-green-300 mb-2 mx-auto" />
                  <h3 className="font-semibold text-sm mb-1">100% Sécurisé</h3>
                  <p className="text-xs text-white/70">Protection maximale</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <LuClock className="w-6 h-6 text-blue-300 mb-2 mx-auto" />
                  <h3 className="font-semibold text-sm mb-1">Accès Rapide</h3>
                  <p className="text-xs text-white/70">En quelques secondes</p>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-white">100%</div>
                  <div className="text-white/60 text-base">Sécurisé</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">30s</div>
                  <div className="text-white/60 text-base">Code valide</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">24/7</div>
                  <div className="text-white/60 text-base">Accès</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - OTP Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8">
        {/* Mobile Card */}
        <div className="block lg:hidden w-full max-w-md mx-auto px-2 py-8">
          <div className="relative z-10 w-full">
            <div className="backdrop-blur-xl bg-white/80 shadow-2xl rounded-3xl px-6 py-10 flex flex-col items-center">
              <div className="mb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-djibouti-primary/10 p-3">
                    <LuShield className="w-8 h-8 text-djibouti-primary" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">Vérification</h1>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Code OTP</h2>
              <p className="text-gray-600 text-base mb-2 text-center">
                Entrez le code à 6 chiffres envoyé à
              </p>
              <p className="text-djibouti-primary font-medium mb-8 text-center">
                {config.email || "votre email"}
              </p>

              <div className="w-full">
                {/* Custom OTP Input */}
                <div className="flex justify-center gap-3 mb-6">
                  {[...Array(6)].map((_, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      value={otpValue[index] || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.match(/^[0-9]*$/)) {
                          const newOtp = otpValue.split("");
                          newOtp[index] = value;
                          const updatedOtp = newOtp.join("").slice(0, 6);
                          handleOtpInputChange(updatedOtp);
                          
                          // Auto-focus next input
                          if (value && index < 5) {
                            const nextInput = e.target.parentNode.children[index + 1];
                            if (nextInput) nextInput.focus();
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !otpValue[index] && index > 0) {
                          const prevInput = e.target.parentNode.children[index - 1];
                          if (prevInput) prevInput.focus();
                        }
                      }}
                      className="w-12 h-12 text-center text-lg font-bold border-2 border-gray-200 rounded-xl focus:border-djibouti-primary focus:ring-2 focus:ring-djibouti-primary/20 bg-white/80 text-gray-900 transition-all duration-200"
                    />
                  ))}
                </div>

                {error === false && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-md mb-4">
                    <p className="text-sm text-red-700">Code OTP invalide</p>
                  </div>
                )}

                <button
                  onClick={() => onSelect(otpValue)}
                  disabled={otpValue?.length !== 6 || !canSubmit}
                  className="w-full flex justify-center items-center py-4 px-4 rounded-2xl shadow-lg text-base font-semibold text-white btn-gradient-djibouti focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-djibouti-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mb-4"
                  style={{
                    background: 'linear-gradient(to right, #006769, #cdd23e)',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  <LuArrowRight className="h-5 w-5 mr-2" />
                  Vérifier
                </button>

                {/* Resend Timer */}
                <div className="text-center">
        {timeLeft > 0 ? (
                    <p className="text-sm text-gray-500">
                      Renvoyer le code dans {timeLeft}s
                    </p>
                  ) : (
                    <button
                      onClick={handleResendOtp}
                      className="text-sm text-djibouti-primary hover:text-djibouti-secondary transition-colors duration-200"
                    >
                      Renvoyer le code
                    </button>
                  )}
                </div>
              </div>

              <div className="text-center space-y-4 mt-8">
                <button
                  onClick={handleCitizenLogin}
                  className="text-sm text-djibouti-primary hover:text-djibouti-secondary transition-colors duration-200"
                >
                  Espace citoyen
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
                  <LuShield className="w-8 h-8 text-djibouti-primary" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Vérification</h1>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Code OTP</h2>
            <p className="text-gray-600 text-base mb-2 text-center">
              Entrez le code à 6 chiffres envoyé à
            </p>
            <p className="text-djibouti-primary font-medium mb-8 text-center">
              {config.email || "votre email"}
            </p>

            <div className="w-full">
              {/* Custom OTP Input */}
              <div className="flex justify-center gap-3 mb-6">
                {[...Array(6)].map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={otpValue[index] || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.match(/^[0-9]*$/)) {
                        const newOtp = otpValue.split("");
                        newOtp[index] = value;
                        const updatedOtp = newOtp.join("").slice(0, 6);
                        handleOtpInputChange(updatedOtp);
                        
                        // Auto-focus next input
                        if (value && index < 5) {
                          const nextInput = e.target.parentNode.children[index + 1];
                          if (nextInput) nextInput.focus();
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otpValue[index] && index > 0) {
                        const prevInput = e.target.parentNode.children[index - 1];
                        if (prevInput) prevInput.focus();
                      }
                    }}
                    className="w-12 h-12 text-center text-lg font-bold border-2 border-gray-200 rounded-xl focus:border-djibouti-primary focus:ring-2 focus:ring-djibouti-primary/20 bg-white/80 text-gray-900 transition-all duration-200"
                  />
                ))}
              </div>

              {error === false && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-md mb-4">
                  <p className="text-sm text-red-700">Code OTP invalide</p>
                </div>
              )}

              <button
                onClick={() => onSelect(otpValue)}
                disabled={otpValue?.length !== 6 || !canSubmit}
                className="w-full flex justify-center items-center py-4 px-4 rounded-2xl shadow-lg text-base font-semibold text-white btn-gradient-djibouti focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-djibouti-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mb-4"
                style={{
                  background: 'linear-gradient(to right, #006769, #cdd23e)',
                  color: 'white',
                  border: 'none'
                }}
              >
                <LuArrowRight className="h-5 w-5 mr-2" />
                Vérifier
              </button>

              {/* Resend Timer */}
              <div className="text-center">
        {timeLeft > 0 ? (
                  <p className="text-sm text-gray-500">
                    Renvoyer le code dans {timeLeft}s
                  </p>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    className="text-sm text-djibouti-primary hover:text-djibouti-secondary transition-colors duration-200"
                  >
                    Renvoyer le code
                  </button>
                )}
              </div>
            </div>

            <div className="text-center space-y-4 mt-8">
              <button
                onClick={handleCitizenLogin}
                className="text-sm text-djibouti-primary hover:text-djibouti-secondary transition-colors duration-200"
              >
                Espace citoyen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectOtp;
