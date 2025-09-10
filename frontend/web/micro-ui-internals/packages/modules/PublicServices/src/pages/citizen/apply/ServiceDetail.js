import React, { useState } from "react";
import { LuClock, LuDollarSign, LuUsers, LuDownload, LuCircleCheck, LuArrowLeft } from "react-icons/lu";

const TABS = [
  { key: 'steps', label: 'Étapes' },
  { key: 'documents', label: 'Documents requis' },
  { key: 'commission', label: 'Membres de commission' },
  { key: 'delivered', label: 'Documents délivrés' },
];

const ServiceDetail = ({ service, product, userType, onBack }) => {
  const [activeTab, setActiveTab] = useState('steps');

  const handleStartRequest = () => {
    // Navigate to the actual application form
    window.location.href = `/${window.contextPath}/${userType}/publicservices/${product.module}/${service.businessService}/Apply?serviceCode=${service.serviceCode}`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <LuArrowLeft className="w-4 h-4" />
          <span>Retour aux services</span>
        </button>
      </div>

      {/* Service Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700 mb-2">
              Réf. {service.ref || service.serviceInfo?.ref || service.businessService}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{service.title}</h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">{service.description}</p>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                <LuClock className="w-4 h-4 text-blue-600" />
                <span className="text-blue-800 font-medium">{service.delaiTraitement}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
                <LuDollarSign className="w-4 h-4 text-green-600" />
                <span className="text-green-800 font-medium">{service.frais}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={handleStartRequest}
              className="px-6 py-3 bg-djibouti-primary text-white rounded-xl hover:bg-djibouti-primary-dark transition-colors font-medium"
            >
              Commencer la demande
            </button>
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
              <LuDownload className="w-4 h-4 inline mr-2" />
              Télécharger le guide
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <nav className="flex">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-djibouti-primary border-b-2 border-djibouti-primary bg-djibouti-primary/5'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-8">
          {activeTab === 'steps' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Étapes de traitement</h2>
              <div className="space-y-6">
                {service.etapeCles.map((etape, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-djibouti-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{etape.titre}</h3>
                      <p className="text-gray-600 mb-2">{etape.description}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {etape.acteur}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2 italic">{etape.systeme}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Documents requis</h2>
              <div className="space-y-4">
                {service.documentsRequis.map((doc) => (
                  <div key={doc.numero} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {doc.numero}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-gray-900">{doc.nom}</h3>
                        {doc.obligatoire ? (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Obligatoire</span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Optionnel</span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">{doc.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'commission' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Membres de la commission</h2>
              <div className="grid gap-4">
                {service.membresCommission.map((membre, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                    <LuUsers className="w-5 h-5 text-djibouti-primary mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">{membre.nom}</h3>
                      <p className="text-gray-600 text-sm">{membre.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'delivered' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Documents délivrés</h2>
              <div className="grid gap-4">
                {service.documentsDelivres.map((document, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <LuCircleCheck className="w-5 h-5 text-green-600" />
                    <span className="text-gray-900">{document}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
