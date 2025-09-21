import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LuFileText,
  LuPhone,
  LuMail,
  LuMapPin,
  LuBuilding,
  LuClipboardCheck,
  LuFileSearch,
  LuSettings,
  LuX,
  LuChevronRight,
  LuInfo,
  LuCheck,
  LuClock,
  LuCreditCard,
  LuBookOpen,
  LuFileQuestion,
  LuMessageSquare
} from "react-icons/lu";

const CitizenHelp = () => {
  const { t } = useTranslation();
  const [activeModal, setActiveModal] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const quickLinks = [
    {
      icon: LuBuilding,
      title: "Demander un permis",
      description: "Guide pour soumettre une nouvelle demande de permis",
      color: "from-blue-500 to-blue-600",
      content: {
        questions: [
          {
            question: "Quels documents sont nécessaires pour une demande de permis ?",
            answer: "Pour soumettre une demande de permis, vous aurez besoin de :\n\n• Plan de construction détaillé (échelle 1:100)\n• Carte d'identité ou passeport valide\n• Titre foncier ou contrat de bail\n• Étude technique (obligatoire pour les bâtiments > 2 étages)\n• Attestation de conformité électrique\n• Attestation de conformité sanitaire",
            icon: LuFileText
          },
          {
            question: "Comment soumettre une demande de permis en ligne ?",
            answer: "Pour soumettre votre demande :\n\n1. Créez un compte sur la plateforme e-permit\n2. Remplissez le formulaire en ligne avec vos informations\n3. Téléchargez les documents requis en format PDF\n4. Vérifiez que tous les documents sont lisibles\n5. Payez les frais de dossier en ligne\n6. Recevez votre numéro de suivi par email",
            icon: LuInfo
          },
          {
            question: "Quels sont les délais de traitement ?",
            answer: "Le processus de traitement comprend :\n\n• Examen initial sous 48h\n• Email de confirmation automatique\n• Visite du site par un agent\n• Délai maximum de traitement : 30 jours\n• Suivi en ligne disponible\n• Permis disponible en ligne après approbation",
            icon: LuClock
          }
        ]
      }
    },
    {
      icon: LuFileSearch,
      title: "Suivre une demande",
      description: "Vérifier l'état d'avancement de votre demande",
      color: "from-purple-500 to-purple-600",
      content: {
        questions: [
          {
            question: "Comment suivre l'état de ma demande ?",
            answer: "Vous pouvez suivre votre demande de plusieurs façons :\n\n• Consultez le tableau de bord en ligne\n• Activez les notifications dans vos paramètres\n• Vérifiez votre boîte mail régulièrement\n• Utilisez l'application mobile\n• Recevez des SMS pour les étapes importantes\n• Contactez le support si pas de mise à jour",
            icon: LuInfo
          },
          {
            question: "Quels sont les différents statuts possibles ?",
            answer: "Votre demande peut avoir les statuts suivants :\n\n• En attente de paiement\n• En cours d'examen\n• Visite technique programmée\n• Documents supplémentaires requis\n• En attente d'approbation\n• Approuvé/Refusé",
            icon: LuClock
          },
          {
            question: "Que faire si on me demande des documents supplémentaires ?",
            answer: "En cas de demande de documents supplémentaires :\n\n• Vous avez 7 jours pour répondre\n• Téléchargez les documents en format PDF\n• Vérifiez la lisibilité des documents\n• Attendez la confirmation de réception\n• Le délai de traitement est suspendu\n• Contactez le support si vous avez des difficultés",
            icon: LuFileText
          }
        ]
      }
    },
    {
      icon: LuClipboardCheck,
      title: "Mes demandes",
      description: "Consulter l'historique de vos demandes",
      color: "from-green-500 to-green-600",
      content: {
        questions: [
          {
            question: "Comment gérer mes demandes efficacement ?",
            answer: "Pour une gestion efficace de vos demandes :\n\n• Filtrez par statut, date ou type de permis\n• Exportez l'historique en PDF\n• Téléchargez les documents à tout moment\n• Consultez les commentaires des agents\n• Vérifiez les dates importantes\n• Renouvelez les permis expirés",
            icon: LuInfo
          },
          {
            question: "Quels documents dois-je conserver ?",
            answer: "Documents importants à conserver :\n\n• Permis de construire original\n• Plans approuvés\n• Attestations de conformité\n• Factures de paiement\n• Rapports de visite technique\n• Certificats de fin de travaux",
            icon: LuFileText
          },
          {
            question: "Comment renouveler un permis expiré ?",
            answer: "Pour renouveler un permis expiré :\n\n• Connectez-vous à votre compte\n• Accédez à la section 'Mes demandes'\n• Sélectionnez le permis à renouveler\n• Vérifiez les documents requis\n• Soumettez la demande de renouvellement\n• Payez les frais de renouvellement",
            icon: LuClock
          }
        ]
      }
    },
    {
      icon: LuSettings,
      title: "Paramètres du compte",
      description: "Gérer vos informations personnelles",
      color: "from-orange-500 to-orange-600",
      content: {
        questions: [
          {
            question: "Comment sécuriser mon compte ?",
            answer: "Pour sécuriser votre compte :\n\n• Changez votre mot de passe régulièrement\n• Activez l'authentification à deux facteurs\n• Vérifiez l'historique des connexions\n• Mettez à jour vos informations de contact\n• Gérez les appareils connectés\n• Signalez toute activité suspecte",
            icon: LuInfo
          },
          {
            question: "Comment gérer mes méthodes de paiement ?",
            answer: "Pour gérer vos paiements :\n\n• Ajoutez plusieurs cartes de paiement\n• Consultez l'historique des transactions\n• Téléchargez les reçus de paiement\n• Configurez les notifications de paiement\n• Gérez les factures récurrentes\n• Contactez le support pour les remboursements",
            icon: LuCreditCard
          },
          {
            question: "Comment personnaliser mes notifications ?",
            answer: "Pour personnaliser vos notifications :\n\n• Choisissez la langue de communication\n• Sélectionnez les types de notifications\n• Définissez la fréquence des rappels\n• Choisissez le format des documents\n• Activez/désactivez les SMS\n• Gérez les préférences d'email",
            icon: LuCheck
          }
        ]
      }
    }
  ];

  const commonQuestions = [
    {
      question: "Comment soumettre une demande de permis ?",
      answer: "Pour soumettre une demande de permis, connectez-vous à votre compte, cliquez sur 'Nouvelle demande' et suivez les étapes indiquées. Assurez-vous d'avoir tous les documents requis avant de commencer.",
      icon: LuFileQuestion
    },
    {
      question: "Quels sont les délais de traitement ?",
      answer: "Les délais de traitement varient selon le type de permis. Un permis de construire ordinaire prend généralement 30 jours, tandis qu'un permis de remblai peut être traité en 15 jours. Les certificats de conformité sont généralement délivrés dans un délai de 10 jours.",
      icon: LuClock
    },
    {
      question: "Comment suivre l'état de ma demande ?",
      answer: "Vous pouvez suivre l'état de votre demande en vous connectant à votre compte et en accédant à la section 'Mes demandes'. Vous recevrez également des notifications par email à chaque étape importante du processus.",
      icon: LuFileSearch
    },
    {
      question: "Comment payer les frais de permis ?",
      answer: "Une fois votre demande approuvée, vous recevrez un avis de paiement. Vous pouvez effectuer le paiement en ligne via notre plateforme ou vous rendre au guichet de la DATUH.",
      icon: LuCreditCard
    }
  ];

  const supportOptions = [
    {
      icon: LuPhone,
      title: "Téléphone",
      description: "Appelez-nous du lundi au vendredi, de 8h à 16h",
      contact: "+253 21 35 00 00",
      color: "from-red-500 to-red-600"
    },
    {
      icon: LuMail,
      title: "Email",
      description: "Envoyez-nous un email à tout moment",
      contact: "support@epermit.dj",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      icon: LuMapPin,
      title: "Bureau",
      description: "Visitez notre bureau pour une assistance en personne",
      contact: "DATUH, Avenue de la République, Djibouti",
      color: "from-teal-500 to-teal-600"
    }
  ];

  const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        style={{ backdropFilter: "blur(4px)" }}
        onClick={onClose} 
      />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl transform transition-all">
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-2xl font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <LuX className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-6xl font-black mb-6 bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            Centre d'aide
          </h1>
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
            Trouvez des réponses à vos questions et apprenez à utiliser notre plateforme
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {quickLinks.map((link, index) => (
            <button
              key={index}
              onClick={() => setActiveModal(link.title)}
              className="group relative overflow-hidden rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white"
            >
              <div 
                className="absolute inset-0 bg-gradient-to-br opacity-90 group-hover:opacity-100 transition-opacity duration-300"

              />
              <div className="relative z-10">
                <div 
                  className="p-3 rounded-xl mb-4 inline-block"
                  style={{
                    backgroundColor: "rgba(0, 103, 105, 0.1)"
                  }}
                >
                  <link.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {link.title}
                </h3>
                <p className="text-gray-600 text-sm" >
                  {link.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Common Questions */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div 
              className="p-3 rounded-xl"
              style={{
                background: "linear-gradient(135deg, #22a4d9, #1978a0)"
              }}
            >
              <LuBookOpen className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Questions fréquentes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {commonQuestions.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <button
                  onClick={() => toggleSection(`question-${index}`)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 rounded-2xl"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="p-2 rounded-lg"
                      style={{
                        backgroundColor: "rgba(0, 103, 105, 0.1)"
                      }}
                    >
                      <item.icon className="w-5 h-5" style={{ color: "#22a4d9" }} />
                    </div>
                    <span className="font-medium text-gray-900">{item.question}</span>
                  </div>
                  <LuChevronRight
                    className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${
                      expandedSection === `question-${index}` ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {expandedSection === `question-${index}` && (
                  <div className="px-6 py-4 bg-gray-50 rounded-b-2xl">
                    <p className="text-gray-600">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Support Options */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div 
              className="p-3 rounded-xl"
              style={{
                background: "linear-gradient(135deg, #22a4d9, #1978a0)"
              }}
            >
              <LuMessageSquare className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Contactez-nous</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {supportOptions.map((option, index) => (
              
              <div
                key={index}
                className="relative overflow-hidden rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white"
              >
                <div 
                  className="absolute inset-0 opacity-90 hover:opacity-100 transition-opacity duration-300 bg-djibouti-primary"
                />
                
                <div className="relative z-10">
                  <div 
                    className="p-3 rounded-xl mb-4 inline-block"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(4px)"
                    }}
                  >
                    <option.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{option.title}</h3>
                  <p className="text-white text-sm mb-4" style={{ opacity: 0.9 }}>
                    {option.description}
                  </p>
                  <p className="text-white font-medium">{option.contact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeModal && (
        <Modal title={activeModal} onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            {quickLinks.find(link => link.title === activeModal)?.content?.questions.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                <button
                  onClick={() => toggleSection(`modal-${index}`)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="p-2 rounded-lg"
                      style={{
                        backgroundColor: "rgba(0, 103, 105, 0.1)"
                      }}
                    >
                      <item.icon className="w-5 h-5" style={{ color: "#22a4d9" }} />
                    </div>
                    <span className="font-medium text-gray-900">{item.question}</span>
                  </div>
                  <LuChevronRight
                    className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${
                      expandedSection === `modal-${index}` ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {expandedSection === `modal-${index}` && (
                  <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
                    <div className="prose prose-sm max-w-none">
                      {item.answer.split('\n').map((line, idx) => (
                        <p key={idx} className="text-gray-600 mb-2">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CitizenHelp;

