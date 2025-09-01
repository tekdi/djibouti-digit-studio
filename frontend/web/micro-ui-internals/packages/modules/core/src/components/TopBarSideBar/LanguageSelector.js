import React, { useState, useRef, useEffect } from "react";
import { LuChevronDown } from "react-icons/lu";

const LanguageSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Use the same business logic as the old ChangeLanguage component
  const { data: storeData, isLoading } = Digit.Hooks.useStore.getInitData();
  const { languages, stateInfo } = storeData || {};
  const selectedLanguage = Digit.StoreData.getCurrentLanguage();
  const [selected, setselected] = useState(selectedLanguage);

  // Map the languages to include flags
  const languagesWithFlags = languages?.map(lang => {
    return {
      ...lang,
      flag: lang.value === "fr_FR_IN" ? "🇫🇷" : lang.value === "en_IN" ? "🇬🇧" : "🌐"
    };
  }) || [];

  const currentLanguage = languagesWithFlags.find(lang => lang.value === selected);

  // Sync selected state with current language
  useEffect(() => {
    setselected(selectedLanguage);
  }, [selectedLanguage]);

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

  const handleLanguageChange = (language) => {
    // Use the same business logic as the old ChangeLanguage component
    Digit.LocalizationService.changeLanguage(language.value, stateInfo.code);
    
    // Update state after language change
    setselected(language.value);
    setIsOpen(false);
  };

  // Show loading state
  if (isLoading) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-djibouti-primary focus:border-transparent"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >

        <span className="text-lg mr-1">{currentLanguage?.flag}</span>
        <span className="hidden sm:inline">{currentLanguage?.label}</span>
        <LuChevronDown 
          className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`} 
        />
      </button>

             {isOpen && (
         <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
           <div className="py-1">
             {languagesWithFlags.map((language) => (
               <button
                 key={language.value}
                 onClick={() => handleLanguageChange(language)}
                 className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150 ${
                   selected === language.value
                     ? "bg-djibouti-primary text-white"
                     : "text-gray-700 hover:bg-gray-50"
                 }`}
               >
                 <span className="text-lg">{language.flag}</span>
                 <span className="font-medium">{language.label}</span>
                 {selected === language.value && (
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
