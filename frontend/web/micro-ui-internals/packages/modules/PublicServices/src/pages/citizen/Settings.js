import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  LuUser, 
  LuMail, 
  LuPhone, 
  LuMapPin, 
  LuPencil, 
  LuSave, 
  LuX,
  LuShield,
  LuCalendar
} from "react-icons/lu";

const Settings = () => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userDetails, setUserDetails] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: ""
  });

  // Fetch user details on component mount
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const user = Digit.UserService.getUser();
        setUserDetails(user);
        
        // Set form data with user details
        setFormData({
          fullName: user?.info?.name || "",
          email: user?.info?.emailId || "",
          phone: user?.info?.mobileNumber || "",
          address: user?.info?.address || "",
          dateOfBirth: user?.info?.dateOfBirth || ""
        });
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Here you would typically make an API call to update user details
      console.log("Saving user details:", formData);
      
      // For now, just update the local state
      setUserDetails(prev => ({
        ...prev,
        info: {
          ...prev.info,
          name: formData.fullName,
          emailId: formData.email,
          mobileNumber: formData.phone,
          address: formData.address,
          dateOfBirth: formData.dateOfBirth
        }
      }));
      
      setIsEditing(false);
      // You could add a success toast here
    } catch (error) {
      console.error("Error saving user details:", error);
      // You could add an error toast here
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      fullName: userDetails?.info?.name || "",
      email: userDetails?.info?.emailId || "",
      phone: userDetails?.info?.mobileNumber || "",
      address: userDetails?.info?.address || "",
      dateOfBirth: userDetails?.info?.dateOfBirth || ""
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-djibouti-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-djibouti-light rounded-3xl p-8 border border-purple-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-[#006769] to-[#006769] p-3 rounded-2xl shadow-lg">
                  <LuShield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Paramètres du Compte</h1>
                  <p className="text-lg text-gray-200">Gérez vos informations personnelles et vos préférences</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          {/* Profile Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Informations Personnelles</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-djibouti-primary text-white rounded-xl hover:bg-djibouti-primary-dark transition-colors duration-200"
                >
                  <LuPencil className="w-4 h-4" />
                  Modifier
                </button>
              )}
            </div>

            {isEditing ? (
              /* Edit Form */
              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom Complet
                  </label>
                  <div className="relative">
                    <LuUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-djibouti-primary focus:border-transparent transition-all duration-200"
                      placeholder="Votre nom complet"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse Email
                  </label>
                  <div className="relative">
                    <LuMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-djibouti-primary focus:border-transparent transition-all duration-200"
                      placeholder="votre.email@exemple.com"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de Téléphone
                  </label>
                  <div className="relative">
                    <LuPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-djibouti-primary focus:border-transparent transition-all duration-200"
                      placeholder="+253 XX XX XX XX"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  <div className="relative">
                    <LuMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-djibouti-primary focus:border-transparent transition-all duration-200"
                      placeholder="Votre adresse complète"
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de Naissance
                  </label>
                  <div className="relative">
                    <LuCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-djibouti-primary focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200"
                  >
                    <LuSave className="w-4 h-4" />
                    Enregistrer
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors duration-200"
                  >
                    <LuX className="w-4 h-4" />
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              /* Display Mode */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-djibouti-primary/10 rounded-lg">
                    <LuUser className="w-5 h-5 text-djibouti-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nom Complet</p>
                    <p className="font-medium text-gray-900">{userDetails?.info?.name || "Non renseigné"}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-djibouti-primary/10 rounded-lg">
                    <LuMail className="w-5 h-5 text-djibouti-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Adresse Email</p>
                    <p className="font-medium text-gray-900">{userDetails?.info?.emailId || "Non renseigné"}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-djibouti-primary/10 rounded-lg">
                    <LuPhone className="w-5 h-5 text-djibouti-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Numéro de Téléphone</p>
                    <p className="font-medium text-gray-900">{userDetails?.info?.mobileNumber || "Non renseigné"}</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-djibouti-primary/10 rounded-lg">
                    <LuMapPin className="w-5 h-5 text-djibouti-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Adresse</p>
                    <p className="font-medium text-gray-900">{userDetails?.info?.address || "Non renseigné"}</p>
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-djibouti-primary/10 rounded-lg">
                    <LuCalendar className="w-5 h-5 text-djibouti-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date de Naissance</p>
                    <p className="font-medium text-gray-900">
                      {userDetails?.info?.dateOfBirth ? 
                        new Date(userDetails.info.dateOfBirth).toLocaleDateString('fr-FR') : 
                        "Non renseigné"
                      }
                    </p>
                  </div>
                </div>

                {/* User ID */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-djibouti-primary/10 rounded-lg">
                    <LuShield className="w-5 h-5 text-djibouti-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Identifiant Utilisateur</p>
                    <p className="font-medium text-gray-900">{userDetails?.info?.uuid || "Non disponible"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
