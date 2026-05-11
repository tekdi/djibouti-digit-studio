import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  LuBuilding,
  LuPhone,
  LuUser,
  LuHouse,
  LuBriefcase,
  LuBuilding2,
  LuShield,
  LuGavel,
  LuArrowLeft
} from "react-icons/lu";
import AnimatedLogo from "../../components/TopBarSideBar/AnimatedLogo";

const ProfileSelection = () => {
  const history = useHistory();

  const profileTypes = [
    {
      type: 'citizen',
      icon: LuUser,
      title: 'Citoyen (ne)',
      description: 'Pour les particuliers souhaitant effectuer des démarches'
    },
    {
      type: 'professional',
      icon: LuBriefcase,
      title: 'Cabinet d’Architecture/Bureau d’Étude',
      description: 'Pour les professionnels du bâtiment et de l\'immobilier'
    },
    {
      type: 'promoter',
      icon: LuBuilding2,
      title: 'Promoteur Immobilier',
      description: 'Pour les promoteurs immobiliers et les entreprises de construction'
    },
    {
      type: 'instructor',
      icon: LuShield,
      title: 'Instructeur Technique',
      description: 'Pour les agents chargés d\'instruire les dossiers'
    },
    {
      type: 'authority',
      icon: LuGavel,
      title: 'Responsable Décisionnaire',
      description: 'Pour les autorités habilitées à prendre des décisions'
    }
  ];

  const handleProfileSelection = (type) => {
    // Determine if it's citizen or employee based on type
    const isCitizen = ['citizen', 'professional', 'promoter'].includes(type);
    
    if (isCitizen) {
      // Redirect to citizen login with type parameter
      history.push(`/${window?.contextPath}/citizen/login?type=${type}`, { 
        userType: type,
        profileType: 'citizen'
      });
    } else {
      // Redirect to employee login with type parameter
      history.push(`/${window?.contextPath}/employee/user/login?type=${type}`, { 
        userType: type,
        profileType: 'employee'
      });
    }
  };

  const renderProfileSelection = () => (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center">
        <h2 className="text-2xl sm:text-4xl font-black text-gray-900 mb-2 sm:mb-3">Choisissez votre profil</h2>
        <p className="text-gray-600 text-sm sm:text-lg">Sélectionnez le type de compte qui vous correspond</p>
      </div>

      <div className="grid gap-3 sm:gap-4">
        {profileTypes.map((type) => (
          <button
            key={type.type}
            onClick={() => handleProfileSelection(type.type)}
            className="p-3 sm:p-3 rounded-xl border-2 bg-white transition-all hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5 border-gray-200 text-left"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 rounded-lg bg-primary/10 flex-shrink-0">
                <type.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-black text-gray-900 leading-tight">{type.title}</h3>
                <p className="text-xs sm:text-base text-gray-600 mt-0.5 sm:mt-1 leading-relaxed">{type.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative flex overflow-hidden">
      {/* Soft gradient backdrop with djibouti-primary tint and decorative blobs */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-djibouti-primary/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-djibouti-primary/10 blur-3xl pointer-events-none" />

      {/* Left side - Image and Info (desktop only) */}
      <div className="hidden lg:block lg:w-1/3 relative z-10">
        <div className="absolute inset-0 bg-gradient-djibouti-light mix-blend-multiply z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Modern architecture"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-white p-8">
          <div className="backdrop-blur-sm bg-white/10 p-8 rounded-3xl shadow-2xl max-w-sm border border-white/20">
            <div className="flex items-center gap-3 mb-8">
              <div className="rounded-full bg-white/20 p-3">
                <LuBuilding className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold">E-Permis</h1>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Connexion</h2>
              <p className="text-white/90 text-base leading-relaxed">
                Accédez à votre espace personnel et gérez vos démarches administratives
              </p>
            </div>

            {/* Stats Section */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">10k+</div>
                  <div className="text-white/60 text-sm">Utilisateurs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">98%</div>
                  <div className="text-white/60 text-sm">Satisfaction</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">24h</div>
                  <div className="text-white/60 text-sm">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Profile Selection */}
      <div className="w-full lg:w-2/3 flex flex-col items-center justify-center p-4 sm:p-8 relative z-10">
        <div className="w-full max-w-2xl">
          {/* Mobile Header — animated logo + subtitle */}
          <div className="block lg:hidden mb-6 sm:mb-8 text-center">
            <div className="flex justify-center mb-2">
              <AnimatedLogo />
            </div>
            <p className="text-gray-600 text-sm">Connexion</p>
          </div>

          {renderProfileSelection()}
        </div>
      </div>
    </div>
  );
};

export default ProfileSelection;
