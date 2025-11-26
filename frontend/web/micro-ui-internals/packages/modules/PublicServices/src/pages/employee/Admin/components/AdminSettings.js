import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { 
  LuUser, 
  LuMail, 
  LuPhone, 
  LuPencil, 
  LuSave, 
  LuX,
  LuShield
} from "react-icons/lu";

const AdminSettings = () => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userDetails, setUserDetails] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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
          phone: user?.info?.mobileNumber || ""
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
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const userInfo = Digit.UserService.getUser();
      const tenantId = Digit.ULBService.getCurrentTenantId();

      const requestBody = {
        RequestInfo: {
          apiId: "Rainmaker",
          authToken: userInfo?.access_token,
          userInfo: {
            id: userInfo?.info?.id,
            uuid: userInfo?.info?.uuid,
            userName: userInfo?.info?.userName,
            name: userInfo?.info?.name,
            mobileNumber: userInfo?.info?.mobileNumber,
            emailId: userInfo?.info?.emailId,
            locale: userInfo?.info?.locale,
            type: userInfo?.info?.type,
            roles: userInfo?.info?.roles,
            active: userInfo?.info?.active,
            tenantId: userInfo?.info?.tenantId,
            permanentCity: userInfo?.info?.permanentCity,
          },
        },
        user: {
          ...userDetails?.info,
          name: formData.fullName,
          emailId: formData.email,
          mobileNumber: formData.phone,
        },
      };

      const endpoint = "/user/profile/_update";

      await axios.post(endpoint, requestBody, {
        headers: {
          "X-Tenant-Id": tenantId,
          "auth-token": userInfo?.access_token,
        },
      });

      // Update local state
      setUserDetails(prev => ({
        ...prev,
        info: {
          ...prev.info,
          name: formData.fullName,
          emailId: formData.email,
          mobileNumber: formData.phone,
        }
      }));

      setSuccess("Profil mis à jour avec succès");
      setIsEditing(false);
      
      // Refresh user data
      const updatedUser = Digit.UserService.getUser();
      setUserDetails(updatedUser);
    } catch (error) {
      console.error("Error saving user details:", error);
      setError(
        error.response?.data?.Error?.message ||
          error.response?.data?.Errors?.[0]?.message ||
          "Erreur lors de la mise à jour du profil"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      fullName: userDetails?.info?.name || "",
      email: userDetails?.info?.emailId || "",
      phone: userDetails?.info?.mobileNumber || ""
    });
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#22a4d9]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-[#22a4d9] to-[#1978a0] rounded-3xl p-8 border border-[#22a4d9]/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl shadow-lg">
                  <LuShield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Paramètres du Compte</h1>
                  <p className="text-lg text-white/90">Gérez vos informations personnelles et vos préférences</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="bg-white rounded-3xl shadow-lg border border-[#22a4d9]/20 p-8">
          {/* Profile Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Informations Personnelles</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#22a4d9] to-[#1978a0] text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
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
                      className="w-full pl-10 pr-4 py-3 border-2 border-[#22a4d9]/30 rounded-xl focus:ring-2 focus:ring-[#22a4d9] focus:border-[#22a4d9] transition-all duration-200"
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
                      className="w-full pl-10 pr-4 py-3 border-2 border-[#22a4d9]/30 rounded-xl focus:ring-2 focus:ring-[#22a4d9] focus:border-[#22a4d9] transition-all duration-200"
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
                      className="w-full pl-10 pr-4 py-3 border-2 border-[#22a4d9]/30 rounded-xl focus:ring-2 focus:ring-[#22a4d9] focus:border-[#22a4d9] transition-all duration-200"
                      placeholder="+253 XX XX XX XX"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700">
                    {error}
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl text-green-700">
                    {success}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <LuSave className="w-4 h-4" />
                    {isSubmitting ? "Enregistrement..." : "Enregistrer"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-[#22a4d9]/5 to-transparent rounded-xl border border-[#22a4d9]/20">
                  <div className="p-2 bg-[#22a4d9]/10 rounded-lg">
                    <LuUser className="w-5 h-5 text-[#22a4d9]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nom Complet</p>
                    <p className="font-medium text-gray-900">{userDetails?.info?.name || "Non renseigné"}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-[#22a4d9]/5 to-transparent rounded-xl border border-[#22a4d9]/20">
                  <div className="p-2 bg-[#22a4d9]/10 rounded-lg">
                    <LuMail className="w-5 h-5 text-[#22a4d9]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Adresse Email</p>
                    <p className="font-medium text-gray-900">{userDetails?.info?.emailId || "Non renseigné"}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-[#22a4d9]/5 to-transparent rounded-xl border border-[#22a4d9]/20">
                  <div className="p-2 bg-[#22a4d9]/10 rounded-lg">
                    <LuPhone className="w-5 h-5 text-[#22a4d9]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Numéro de Téléphone</p>
                    <p className="font-medium text-gray-900">{userDetails?.info?.mobileNumber || "Non renseigné"}</p>
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

export default AdminSettings;

