import React, { useState, useRef, useEffect } from "react";
import { LuChevronDown, LuGlobe } from "react-icons/lu";

const LanguageSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("fr");
  const dropdownRef = useRef(null);

  const languages = [
    {
      code: "fr",
      name: "Français",
      flag: "🇫🇷",
      label: "French"
    },
    {
      code: "en",
      name: "English", 
      flag: "🇬🇧",
      label: "English"
    }
  ];

  const currentLanguage = languages.find(lang => lang.code === selectedLanguage);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (languageCode) => {
    setSelectedLanguage(languageCode);
    setIsOpen(false);
    
    // Change the language using Digit's localization service
    const stateInfo = Digit.StoreData.getStateInfo();
    Digit.LocalizationService.changeLanguage(languageCode, stateInfo?.code);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-djibouti-primary focus:border-transparent"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <LuGlobe className="h-4 w-4 text-gray-500" />
        <span className="text-lg mr-1">{currentLanguage?.flag}</span>
        <span className="hidden sm:inline">{currentLanguage?.name}</span>
        <LuChevronDown 
          className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`} 
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150 ${
                  selectedLanguage === language.code
                    ? "bg-djibouti-primary text-white"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <span className="font-medium">{language.name}</span>
                {selectedLanguage === language.code && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
