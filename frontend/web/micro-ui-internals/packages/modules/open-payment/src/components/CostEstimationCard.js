import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
  LuCalculator, 
  LuBuilding2, 
  LuBadgePercent,
  LuShield,
  LuLayers,
  LuHouse,
  LuTrendingUp,
  LuChevronDown,
  LuChevronUp,
  LuCoins,
  LuReceipt
} from "react-icons/lu";

const CostEstimationCard = ({ costEstimation, applicationData }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);

  const calculateTotalPercentage = () => {
    return costEstimation?.totalCostBreakdown?.reduce((total, item) => total + item.percentage, 0);
  };

  const calculateTotalCost = () => {
    return costEstimation?.totalCostBreakdown?.reduce((total, item) => total + item.amount, 0);
  };

  if (!costEstimation) return null;

  // Fee rates data for table
  const feeRates = [
    {
      icon: <LuHouse className="w-5 h-5" />,
      description: t("CALCULATION_COST_RESIDENTIAL"),
      value: `FDj ${costEstimation?.costPerSqmLivingSpace?.toLocaleString() || 0}`,
      unit: "par m²"
    },
    {
      icon: <LuBuilding2 className="w-5 h-5" />,
      description: t("CALCULATION_COST_COMMERCIAL"),
      value: `FDj ${costEstimation?.costPerSqmCommercialSpace?.toLocaleString() || 0}`,
      unit: "par m²"
    },
    {
      icon: <LuBadgePercent className="w-5 h-5" />,
      description: t("CALCULATION_ROYALTY_FEES"),
      value: `${costEstimation?.royaltyPer || 0}%`,
      unit: "du devis estimé"
    },
    {
      icon: <LuShield className="w-5 h-5" />,
      description: t("CALCULATION_SEISMIC_FEES"),
      value: `${costEstimation?.eqResistancePer || 0}%`,
      unit: "du devis estimé"
    },
    {
      icon: <LuReceipt className="w-5 h-5" />,
      description: t("CALCULATION_REGISTRY_SERVICE_FEE"),
      value: `FDj ${costEstimation?.registryServiceFee?.toLocaleString() || 0}`,
      unit: "frais fixes"
    }
  ];

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header with Toggle */}
      <div 
        className="px-6 py-5 cursor-pointer bg-primary"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <LuCalculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{t("CALCULATION_TITLE")}</h2>
              <p className="text-white/70 text-sm mt-0.5">Détails de l'estimation des coûts</p>
            </div>
          </div>
          <button className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors">
            {isExpanded ? (
              <LuChevronUp className="w-5 h-5 text-white" />
            ) : (
              <LuChevronDown className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-8">
          {/* Fee Rates Table */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <LuCoins className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-gray-900">Tarifs de Base</h3>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-1 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary/10">
                    <tr>
                      <th className="px-5 py-4 text-left text-sm font-semibold  rounded-tl-xl bg-primary/10">Description</th>
                      <th className="px-5 py-4 text-center text-sm font-semibold  bg-primary/10">Valeur</th>
                      <th className="px-5 py-4 text-right text-sm font-semibold  rounded-tr-xl bg-primary/10">Unité</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {feeRates.map((rate, index) => (
                      <tr 
                        key={index} 
                        className={`border-b border-gray-100 hover:bg-gray-100 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
                              {rate.icon}
                            </div>
                            <span className="font-medium text-gray-900">{rate.description}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center px-4 py-2 rounded-xl font-bold bg-primary/10 text-primary">
                            {rate.value}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right text-gray-500 text-sm">
                          {rate.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Floor Breakdown Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <LuLayers className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-gray-900">Détail par Niveau</h3>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-1 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary/10">
                    <tr>
                      <th className="px-5 py-4 text-left text-sm font-semibold  rounded-tl-xl bg-primary/10 ">{t("CALCULATION_NIVEAU")}</th>
                      <th className="px-5 py-4 text-center text-sm font-semibold  bg-primary/10">{t("CALCULATION_SURFACE_HABITATION")}</th>
                      <th className="px-5 py-4 text-center text-sm font-semibold  bg-primary/10">{t("CALCULATION_SURFACE_COMMERCIALE")}</th>
                      <th className="px-5 py-4 text-center text-sm font-semibold  bg-primary/10">{t("CALCULATION_TOTAL_SUPERFICIE")}</th>
                      <th className="px-5 py-4 text-right text-sm font-semibold  rounded-tr-xl bg-primary/10">{t("CALCULATION_ESTIMATION_COUTS")}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {costEstimation?.floors?.map((floor, index) => (
                      <tr 
                        key={index} 
                        className={`border-b border-gray-100 hover:bg-gray-100 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary text-white font-bold text-sm">
                              {index === 0 ? 'RDC' : index === costEstimation?.floors.length - 1 ? 'T' : index}
                            </div>
                            <span className="font-medium text-gray-900">
                              {index === 0 ? t("CALCULATION_RDC") : ""}
                              {index === costEstimation?.floors.length - 1 ? t("CALCULATION_TERRASSE") : ""}
                              {index !== 0 && index !== costEstimation?.floors.length - 1 && t(`CALCULATION_${index}ER_ETAGE`)}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${floor?.builtUpAreaLiving > 0 ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                            {floor?.builtUpAreaLiving === 0 ? "-" : `${floor?.builtUpAreaLiving} m²`}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${floor?.builtupAreaCommercial > 0 ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                            {floor?.builtupAreaCommercial === 0 ? "-" : `${floor?.builtupAreaCommercial} m²`}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center font-semibold text-gray-900">
                          {floor?.totalAreaPerLevel > 0 ? `${floor?.totalAreaPerLevel} m²` : "0 m²"}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="inline-flex items-center px-4 py-2 rounded-xl font-bold bg-primary/10 text-primary">
                            {floor?.floorCost ? `FDj ${floor?.floorCost?.toLocaleString()}` : "0"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-semibold text-gray-900">Résumé des Coûts</h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="group bg-white border-2 border-primary/10 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10">
                    <LuLayers className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm text-gray-500">{t("CALCULATION_SURFACE_PARCELLE")}</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {applicationData?.serviceDetails?.landandProjectDesignDetails?.[0]?.area || "N/A"}
                </p>
              </div>

              <div className="group bg-white border-2 border-primary/10 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10">
                    <LuBadgePercent className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm text-gray-500">{t("CALCULATION_ROYALTY_FEES_CALCULATED")}</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">FDj {costEstimation?.royaltyFee?.toLocaleString()}</p>
              </div>

              <div className="group bg-white border-2 border-primary/10 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10">
                    <LuShield className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm text-gray-500">{t("CALCULATION_SEISMIC_FEES_CALCULATED")}</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">FDj {costEstimation?.eqResistanceCost?.toLocaleString()}</p>
              </div>

              <div className="group bg-white border-2 border-primary/10 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10">
                    <LuReceipt className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm text-gray-500">{t("CALCULATION_TOTAL_TAXES")}</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">FDj {costEstimation?.totalTax?.toLocaleString()}</p>
              </div>

              <div className="group bg-white border-2 border-primary/10 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10">
                    <LuCoins className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm text-gray-500">{t("CALCULATION_TOTAL_TAXES_WITH_SERVICE")}</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">FDj {costEstimation?.totalTaxWithServiceCharge?.toLocaleString()}</p>
              </div>

              <div className="group rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 bg-primary">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <LuBuilding2 className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm text-white/80">{t("CALCULATION_PROJECT_TOTAL_VALUE")}</p>
                </div>
                <p className="text-2xl font-bold text-white">FDj {costEstimation?.totalBuildingCost?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Cost Breakdown Table */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <LuTrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-gray-900">Ventilation des Coûts par Travaux</h3>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-1 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary/10">
                    <tr>
                      <th className="px-5 py-4 text-left text-sm font-semibold  rounded-tl-xl bg-primary/10">{t("CALCULATION_WORK_DESIGNATION")}</th>
                      <th className="px-5 py-4 text-center text-sm font-semibold  bg-primary/10">{t("CALCULATION_WORK_PERCENTAGES")}</th>
                      <th className="px-5 py-4 text-right text-sm font-semibold  rounded-tr-xl bg-primary/10">{t("CALCULATION_AMOUNT")}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {costEstimation?.totalCostBreakdown?.map((item, index) => (
                      <tr 
                        key={index} 
                        className={`border-b border-gray-100 hover:bg-gray-100 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm">
                              {index + 1}
                            </div>
                            <span className="font-medium text-gray-900">{t(item?.designationOfWorks)}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="inline-flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-500 bg-primary"
                                style={{ width: `${Math.min(item?.percentage * 2, 100)}%` }}
                              />
                            </div>
                            <span className="font-semibold text-gray-700 w-12 text-right">{item?.percentage}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right font-bold text-gray-900">
                          {item?.amount === 0 ? "0 FDj" : `${item?.amount?.toLocaleString()} FDj`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-primary/10">
                    <tr>
                      <td className="px-5 py-4  font-bold rounded-bl-xl bg-primary/10">
                        <div className="flex items-center gap-3">
                          {t("CALCULATION_TOTAL")}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center font-bold bg-primary/10">{calculateTotalPercentage()}%</td>
                      <td className="px-5 py-4 text-right font-bold text-lg rounded-br-xl bg-primary/10">
                        {calculateTotalCost() === 0 ? "0 FDj" : `FDj ${calculateTotalCost()?.toLocaleString()}`}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostEstimationCard;
