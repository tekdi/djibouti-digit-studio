import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LuTrash2 } from "react-icons/lu";
import TextInput from "../../../../../ui-components/src/atoms/TextInput";
import Loader from "../../../../../ui-components/src/atoms/Loader";
import { Toast } from "@egovernments/digit-ui-react-components";

const Calculation = ({ isCitizen, isViewOnly = false }) => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const queryStrings = Digit.Hooks.useQueryParams();
  const userDetails = Digit.UserService.getUser();
  const checklistStatus = localStorage.getItem("checklistStatus");
  const isHODorAGENT = userDetails?.info?.roles?.some((role) => role.code === "BPA_HOD" || role.code === "BPA_AGENTS");
  const isHOD = userDetails?.info?.roles?.some((role) => role.code === "BPA_HOD");

  // BPA_PF has a simplified fee structure: no commercial cost, no seismic fee, no registry service fee,
  // and its own work-designation breakdown (Terrassement / Fondation / Maçonnerie / Béton armé /
  // Électricité / Revêtement / Portail).
  const isPF = queryStrings?.serviceCode === "BPA_PF" || queryStrings?.businessService === "BPA_PF";

  // BPA_PCS: residential only (no commercial column / no commercial cost),
  // residential rate defaults to 25 000 FDJ/m², single 2.5% fee on project value
  // (no split into 1.5% royalty + 1% seismic, no registry service fee), and only
  // the ground floor (RDC) is allowed — no extra floors.
  const isPCS = queryStrings?.serviceCode === "BPA_PCS" || queryStrings?.businessService === "BPA_PCS";

  // BPA_ATARR: single 1.5% royalty fee on project value. No 1% seismic, no 5 000 FDj
  // registry service fee. Floor table and commercial column stay as the default.
  const isATARR = queryStrings?.serviceCode === "BPA_ATARR" || queryStrings?.businessService === "BPA_ATARR";

  const PF_COST_BREAKDOWN = [
    { name: "CALCULATION_TERRASSEMENT", percentage: 8, amount: 0, id: "CALCULATION_TERRASSEMENT" },
    { name: "CALCULATION_FONDATION", percentage: 10, amount: 0, id: "CALCULATION_FONDATION" },
    { name: "CALCULATION_MACONNERIE", percentage: 28, amount: 0, id: "CALCULATION_MACONNERIE" },
    { name: "CALCULATION_BETON_ARME", percentage: 10, amount: 0, id: "CALCULATION_BETON_ARME" },
    { name: "CALCULATION_ELECTRICITE", percentage: 9, amount: 0, id: "CALCULATION_ELECTRICITE" },
    // PF-specific label: "Revêtement des murs / Peintures" (own translation key so we
    // don't globally override the PCO/PCO_SIMPLE/PS/etc. "Revêtements" line).
    { name: "CALCULATION_REVETEMENTS_PF", percentage: 20, amount: 0, id: "CALCULATION_REVETEMENTS_PF" },
    { name: "CALCULATION_PORTAIL", percentage: 15, amount: 0, id: "CALCULATION_PORTAIL" },
  ];
  const DEFAULT_COST_BREAKDOWN = [
    { name: "CALCULATION_TERRASSEMENT", percentage: 8, amount: 0, id: "CALCULATION_TERRASSEMENT" },
    { name: "CALCULATION_FONDATION", percentage: 10, amount: 0, id: "CALCULATION_FONDATION" },
    { name: "CALCULATION_MACONNERIE", percentage: 9, amount: 0, id: "CALCULATION_MACONNERIE" },
    { name: "CALCULATION_BETON_ARME", percentage: 28, amount: 0, id: "CALCULATION_BETON_ARME" },
    { name: "CALCULATION_REVETEMENTS", percentage: 20, amount: 0, id: "CALCULATION_REVETEMENTS" },
    { name: "CALCULATION_MENUISERIES", percentage: 11, amount: 0, id: "CALCULATION_MENUISERIES" },
    { name: "CALCULATION_ELECTRICITE", percentage: 6, amount: 0, id: "CALCULATION_ELECTRICITE" },
    { name: "CALCULATION_PLOMBERIE", percentage: 3, amount: 0, id: "CALCULATION_PLOMBERIE" },
    { name: "CALCULATION_ASSAINISSEMENT", percentage: 5, amount: 0, id: "CALCULATION_ASSAINISSEMENT" },
  ];

  // HOD + Agents can edit, calculate, and save
  const isEditDisabled = isViewOnly || !isHODorAGENT;
  const isSaveDisabled = isEditDisabled;

  const [floorData, setFloorData] = useState(
    isPCS
      ? [
          // PCS: ground floor only, residential use.
          { name: "CALCULATION_RDC", residentialArea: 0, commercialArea: 0, totalArea: 0, cost: 0, floorNo: 0 },
        ]
      : isPF
      ? [
          // PF (clôture): single row representing the total plot perimeter in linear meters.
          // residentialArea is repurposed as the perimeter, residentialCost as the cost/ml,
          // so the existing floor cost formula (residentialArea × residentialCost) gives the
          // project value directly. commercial column is hidden.
          { name: "CALCULATION_PF_PERIMETER_ROW", residentialArea: 0, commercialArea: 0, totalArea: 0, cost: 0, floorNo: 0 },
        ]
      : [
          { name: t("CALCULATION_RDC"), residentialArea: 0, commercialArea: 0, totalArea: 0, cost: 0, floorNo: 0 },
          { name: t("CALCULATION_1ER_ETAGE"), residentialArea: 0, commercialArea: 0, totalArea: 0, cost: 0, floorNo: 1 },
          { name: t("CALCULATION_TERRASSE"), residentialArea: 0, commercialArea: 0, totalArea: 0, cost: 0, floorNo: 2 },
        ]
  );

  const [feeRates, setFeeRates] = useState({
    // PCS: 25 000 FDJ/m² | PF: 30 000 FDJ/ml (repurposed as cost per linear meter) | default: 50 000 FDJ/m²
    residentialCost: isPCS ? 25000 : isPF ? 30000 : 50000,
    commercialCost: 30000,
    // PCS: single 2.5% fee | PF/ATARR: single 1.5% fee | default: 1.5% royalty split with 1% seismic.
    // (seismic row is hidden via the render filter for PCS/PF/ATARR.)
    royaltyFeePercentage: isPCS ? 2.5 : 1.5,
    // ATARR, PCS and PF don't have a seismic charge — force the rate to 0 so the
    // backend doesn't add it to the total.
    seismicFeePercentage: isPCS || isPF || isATARR ? 0 : 1,
    // Same for the registry service fee (5 000 FDj) — not applicable for PCS/PF/ATARR.
    registryServiceFee: isPCS || isPF || isATARR ? 0 : 5000,
  });

  const [calculatedFees, setCalculatedFees] = useState({
    royaltyFee: 0,
    seismicFees: 0,
    totalTax: 0,
    totalTaxWithService: 0,
    totalProjectValue: 0,
  });

  const [plotInfo, setPlotInfo] = useState({ plotArea: 0, cos: 0 });
  const [calculationResponse, setCalculationResponse] = useState();
  const [response, setResponse] = useState();
  const [isSaveBtnDisable, setIsSaveBtnDisable] = useState(true);
  const [showToast, setShowToast] = useState(null);
  const [onSubmitLoading, setOnSubmitLoading] = useState(false);
  const [revisedTotalTaxWithService, setRevisedTotalTaxWithService] = useState(calculatedFees?.totalTaxWithService?.toLocaleString());
  const [taxChangeReason, setTaxChangeReason] = useState("");
  const isTotalTaxEditable = queryStrings?.state === "AWAITING_ON_COMMISSIONER";

  const [costBreakdown, setCostBreakdown] = useState(isPF ? PF_COST_BREAKDOWN : DEFAULT_COST_BREAKDOWN);

  const request = {
    url: `/public-service/v1/application/${queryStrings?.serviceCode}`,
    headers: { "X-Tenant-Id": tenantId, "auth-token": Digit.UserService.getUser()?.access_token },
    method: "GET",
    params: { applicationNumber: queryStrings?.applicationNumber, tenantId },
  };
  const { isLoading, data } = Digit.Hooks.useCustomAPIHook(request);

  const getValue = (primary, fallback, defaultValue) => {
    if (primary !== undefined && primary !== null) return primary;
    if (fallback !== undefined && fallback !== null) return fallback;
    return defaultValue;
  };

  useEffect(() => { if (data) setResponse(data?.Application?.[0] || {}); }, [data]);

  const calReq = {
    url: "/calculator-service/v1/BPA_PCO/estimate_calculate",
    params: {}, method: "POST", headers: {}, config: { enable: false },
  };
  const mutation = Digit.Hooks.useCustomAPIMutationHook(calReq);

  const updateRequest = {
    url: `/public-service/v1/application/${queryStrings?.serviceCode}`,
    method: "PUT",
    headers: { "X-Tenant-Id": tenantId, "auth-token": Digit.UserService.getUser()?.access_token },
    config: { enable: true },
  };
  const mutationPut = Digit.Hooks.useCustomAPIMutationHook(updateRequest);

  const calculateTotalCost = () => costBreakdown.reduce((total, item) => total + item.amount, 0);
  const calculateTotalPercentage = () => costBreakdown.reduce((total, item) => total + item.percentage, 0);

  const addFloor = () => {
    if (floorData.length >= 10) return;
    const newFloor = {
      name: t(`CALCULATION_${floorData.length - 1}ER_ETAGE`),
      residentialArea: 0, commercialArea: 0, totalArea: 0, cost: 0, floorNo: floorData.length - 1,
    };
    const newFloorData = [...floorData];
    newFloorData.splice(floorData.length - 1, 0, newFloor);
    setFloorData(newFloorData);
  };

  const removeFloor = (index) => {
    if (floorData.length <= 1) return;
    const updated = floorData.filter((_, i) => i !== index);
    // Re-index floorNo to stay sequential
    const reindexed = updated.map((floor, i) => ({ ...floor, floorNo: i }));
    setFloorData(reindexed);
  };

  const calculateFees = async () => {
    const updatedCostEstimation = {
      costPerSqmLivingSpace: feeRates.residentialCost,
      costPerSqmCommercialSpace: feeRates.commercialCost,
      royaltyPer: feeRates.royaltyFeePercentage,
      eqResistancePer: feeRates.seismicFeePercentage,
      eqResistanceCost: 0, royaltyFee: 0,
      registryServiceFee: feeRates.registryServiceFee,
      totalBuildingCost: 0, totalTax: 0, totalTaxWithServiceCharge: 0,
      floors: floorData.map((floor, index) => ({
        floorNo: index,
        builtUpAreaLiving: floor.residentialArea,
        builtupAreaCommercial: floor.commercialArea,
        totalAreaPerLevel: floor.totalArea,
        floorCost: floor.cost,
      })),
      totalCostBreakdown: costBreakdown.map((item) => ({
        designationOfWorks: item.id, percentage: item.percentage, amount: item.amount,
      })),
    };

    const clonedPayload = JSON.parse(JSON.stringify(response));
    const updatedPayload = {
      ...clonedPayload,
      additionalDetails: { ...(clonedPayload.additionalDetails || {}), costEstimation: updatedCostEstimation || {} },
    };

    await mutation.mutate(
      { ...calReq, body: { Application: [updatedPayload] } },
      {
        onSuccess: (res) => { setCalculationResponse(res?.Application?.[0]); setIsSaveBtnDisable(false); },
        onError: () => { console.log("Error occured"); },
      }
    );
  };

  const calculationSubmit = async () => {
    setOnSubmitLoading(true);
    const source = isTotalTaxEditable ? response : calculationResponse;
    const cloned = JSON.parse(JSON.stringify(source));

    // Strip workflow and processInstance to avoid triggering workflow actions or auth checks
    var workflow = cloned.workflow;
    var processInstance = cloned.processInstance;
    var workflowStatus = cloned.workflowStatus;
    var status = cloned.status;
    delete cloned.workflow;
    delete cloned.processInstance;
    delete cloned.workflowStatus;
    delete cloned.status;

    if (isTotalTaxEditable) {
      if (!cloned.additionalDetails.totalTaxWithServiceChargeWithoutConcession) {
        cloned.additionalDetails.totalTaxWithServiceChargeWithoutConcession =
          cloned.additionalDetails.costEstimation.totalTaxWithServiceCharge;
      }
      cloned.additionalDetails.taxChangeReason = taxChangeReason;
      cloned.additionalDetails.costEstimation.totalTaxWithServiceCharge = revisedTotalTaxWithService;
    }

    await mutationPut.mutate(
      {
        ...updateRequest,
        body: {
          Application: cloned,
          RequestInfo: {
            apiId: "Rainmaker",
            authToken: Digit.UserService.getUser()?.access_token,
            userInfo: Digit.UserService.getUser()?.info,
            msgId: `${Date.now()}|${Digit.StoreData.getCurrentLanguage()}`,
          },
        },
      },
      {
        onSuccess: (res) => {
          setCalculationResponse(res?.Application);
          setResponse(res?.Application || {});
          setIsSaveBtnDisable(true);
          setOnSubmitLoading(false);
          setShowToast({ label: t("CALCULATION_SAVE_SUCCESS"), type: "success" });
          setTimeout(() => { setShowToast(null); }, 3000);
        },
        onError: () => {
          setIsSaveBtnDisable(false);
          setOnSubmitLoading(false);
          setShowToast({ label: t("CALCULATION_SAVE_ERROR"), type: "error" });
          setTimeout(() => { setShowToast(null); window.history.back(); }, 3000);
        },
      }
    );
  };

  useEffect(() => {
    const estimation = calculationResponse?.additionalDetails?.costEstimation;
    const fallbackEstimation = response?.additionalDetails?.costEstimation;

    setFeeRates({
      residentialCost: getValue(estimation?.costPerSqmLivingSpace, fallbackEstimation?.costPerSqmLivingSpace, 50000),
      commercialCost: getValue(estimation?.costPerSqmCommercialSpace, fallbackEstimation?.costPerSqmCommercialSpace, 30000),
      royaltyFeePercentage: getValue(estimation?.royaltyPer, fallbackEstimation?.royaltyPer, 1.5),
      seismicFeePercentage: getValue(estimation?.eqResistancePer, fallbackEstimation?.eqResistancePer, 1),
      registryServiceFee: getValue(estimation?.registryServiceFee, fallbackEstimation?.registryServiceFee, 5000),
    });

    setCostBreakdown((prev) =>
      prev.map((item) => {
        const matched = estimation?.totalCostBreakdown?.find((apiItem) => apiItem.designationOfWorks === item.id);
        const fallbackMatch = !matched && fallbackEstimation?.totalCostBreakdown?.find((apiItem) => apiItem.designationOfWorks === item.id);
        return matched || fallbackMatch ? { ...item, amount: (matched || fallbackMatch).amount, percentage: (matched || fallbackMatch).percentage } : item;
      })
    );

    setCalculatedFees({
      royaltyFee: estimation?.royaltyFee || fallbackEstimation?.royaltyFee || 0,
      seismicFees: estimation?.eqResistanceCost || fallbackEstimation?.eqResistanceCost || 0,
      totalTax: estimation?.totalTax || fallbackEstimation?.totalTax || 0,
      totalTaxWithService: estimation?.totalTaxWithServiceCharge || fallbackEstimation?.totalTaxWithServiceCharge || 0,
      totalProjectValue: estimation?.totalBuildingCost || fallbackEstimation?.totalBuildingCost || 0,
    });

    const loadFloors = (src) => {
      if (!src?.floors?.length) return;
      setFloorData(src.floors.map((item) => {
        const total = src.floors.length;
        var key;
        if (item.floorNo === 0) key = "CALCULATION_RDC";
        else if (item.floorNo === total - 1) key = "CALCULATION_TERRASSE";
        else key = "CALCULATION_" + item.floorNo + "ER_ETAGE";
        return { name: key, residentialArea: item.builtUpAreaLiving, commercialArea: item.builtupAreaCommercial, totalArea: item.totalAreaPerLevel, cost: item.floorCost, floorNo: item.floorNo };
      }));
    };

    if (fallbackEstimation?.floors?.length > 0 && !estimation) loadFloors(fallbackEstimation);
    else if (estimation?.floors?.length > 0) loadFloors(estimation);

    setPlotInfo({
      plotArea: calculationResponse?.serviceDetails?.landandProjectDesignDetails?.[0]?.area || response?.serviceDetails?.landandProjectDesignDetails?.[0]?.area || 0,
      cos: calculationResponse?.serviceDetails?.landandProjectDesignDetails?.[0]?.projectedCos || response?.serviceDetails?.landandProjectDesignDetails?.[0]?.projectedCos || 0,
    });
    setTaxChangeReason(response?.additionalDetails?.taxChangeReason);
  }, [calculationResponse, response]);

  useEffect(() => { setRevisedTotalTaxWithService(calculatedFees?.totalTaxWithService); }, [calculatedFees?.totalTaxWithService]);

  var disabledStyle = isEditDisabled ? "pointer-events-none opacity-60" : "";

  return (
    <div className="w-full">
      {showToast && <Toast error={showToast.type === "error"} label={showToast.label} onClose={() => setShowToast(null)} />}

      <div className="flex items-center gap-2 mb-6">
        <div className="w-1 h-6 bg-djibouti-primary rounded-full" />
        <h3 className="text-lg font-bold text-gray-900">{t("CALCULATION_TITLE")}</h3>
      </div>

      {/* Fee Rates */}
      <div className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 " + disabledStyle}>
        {[
          {
            key: "residentialCost",
            // PF repurposes this rate as cost per linear meter of perimeter.
            label: isPF ? t("CALCULATION_COST_PER_LINEAR_METER") : t("CALCULATION_COST_RESIDENTIAL"),
            unit: isPF ? "FDJ/ml" : "FDJ",
            ph: isPF ? "30000" : "50000",
          },
          { key: "commercialCost", label: t("CALCULATION_COST_COMMERCIAL"), unit: "FDJ", ph: "30000" },
          { key: "royaltyFeePercentage", label: t("CALCULATION_ROYALTY_FEES"), unit: "% " + t("OF_ESTIMATED_QUOTE"), ph: "1.5" },
          { key: "seismicFeePercentage", label: t("CALCULATION_SEISMIC_FEES"), unit: "% " + t("OF_ESTIMATED_QUOTE"), ph: "1" },
          { key: "registryServiceFee", label: t("CALCULATION_REGISTRY_SERVICE_FEE"), unit: "FDJ", ph: "5000" },
        ].filter(function (item) {
          // BPA_PF: hide commercial cost, seismic fee and registry service fee rate inputs.
          if (isPF && (item.key === "commercialCost" || item.key === "seismicFeePercentage" || item.key === "registryServiceFee")) return false;
          // BPA_PCS: residential only + single 2.5% fee (modelled on the royalty line).
          if (isPCS && (item.key === "commercialCost" || item.key === "seismicFeePercentage" || item.key === "registryServiceFee")) return false;
          // BPA_ATARR: keep residential + commercial cost, drop seismic and registry service fee.
          if (isATARR && (item.key === "seismicFeePercentage" || item.key === "registryServiceFee")) return false;
          return true;
        }).map(function (item) {
          return (
            <div key={item.key} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <label className="block text-xs font-medium text-gray-500 mb-2">{item.label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={feeRates[item.key]}
                  onChange={function (e) { setFeeRates(function (prev) { var n = {}; for (var k in prev) n[k] = prev[k]; n[item.key] = Number(e.target.value); return n; }); }}
                  placeholder={item.ph}
                  onWheel={function (e) { e.target.blur(); }}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 outline-none focus:border-djibouti-primary focus:ring-2 focus:ring-djibouti-primary/20 transition-all"
                />
                <span className="text-xs font-medium text-gray-400 whitespace-nowrap">{item.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floor Table */}
      <div className={"mb-6 " + disabledStyle}>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-djibouti-primary/10 to-djibouti-primary/5">
                <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide w-40">
                  {isPF ? t("CALCULATION_PF_PERIMETER_HEADER") : t("CALCULATION_NIVEAU")}
                </th>
                <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  {isPF ? t("CALCULATION_PF_PERIMETER_ML") : t("CALCULATION_SURFACE_HABITATION")}
                </th>
                {!isPCS && !isPF && (
                  <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{t("CALCULATION_SURFACE_COMMERCIALE")}</th>
                )}
                <th className="border border-gray-200 p-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  {isPF ? t("CALCULATION_PF_PERIMETER_TOTAL_ML") : t("CALCULATION_TOTAL_SUPERFICIE")}
                </th>
                <th className="border border-gray-200 p-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">{t("CALCULATION_ESTIMATION_COUTS")}</th>
                {!isEditDisabled && !isPCS && !isPF && (
                  <th className="border border-gray-200 p-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide w-16">Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {floorData.map(function (floor, index) {
                return (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="border border-gray-200 p-3">
                      {isEditDisabled ? (
                        <span className="text-sm font-medium text-gray-700">{floor.name && floor.name.startsWith("CALCULATION_") ? t(floor.name) : floor.name}</span>
                      ) : (
                        <input
                          type="text"
                          value={floor.name && floor.name.startsWith("CALCULATION_") ? t(floor.name) : floor.name}
                          onChange={function (e) { var u = floorData.slice(); u[index] = Object.assign({}, u[index], { name: e.target.value }); setFloorData(u); }}
                          className="w-full px-2 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg outline-none focus:border-djibouti-primary transition-all"
                        />
                      )}
                    </td>
                    <td className="border border-gray-200 p-3">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={floor.residentialArea === 0 ? "" : floor.residentialArea}
                          onChange={function (e) {
                            var u = floorData.slice(); u[index] = Object.assign({}, u[index]);
                            u[index].residentialArea = e.target.value ? Number(e.target.value) : 0;
                            u[index].totalArea = u[index].residentialArea + u[index].commercialArea;
                            setFloorData(u);
                          }}
                          onWheel={function (e) { e.target.blur(); }}
                          className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-djibouti-primary transition-all"
                        />
                        <span className="text-xs text-gray-400">{isPF ? "ml" : "m²"}</span>
                      </div>
                    </td>
                    {!isPCS && !isPF && (
                      <td className="border border-gray-200 p-3">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={floor.commercialArea === 0 ? "" : floor.commercialArea}
                            onChange={function (e) {
                              var u = floorData.slice(); u[index] = Object.assign({}, u[index]);
                              u[index].commercialArea = e.target.value ? Number(e.target.value) : 0;
                              u[index].totalArea = u[index].residentialArea + u[index].commercialArea;
                              setFloorData(u);
                            }}
                            onWheel={function (e) { e.target.blur(); }}
                            className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-djibouti-primary transition-all"
                          />
                          <span className="text-xs text-gray-400">m²</span>
                        </div>
                      </td>
                    )}
                    <td className="border border-gray-200 p-3 text-center text-sm font-semibold text-gray-700">
                      {floor.totalArea > 0
                        ? floor.totalArea + (isPF ? " ml" : " m²")
                        : isPF ? "0 ml" : "0 m²"}
                    </td>
                    <td className="border border-gray-200 p-3 text-right text-sm font-semibold text-gray-900">
                      {floor.cost ? floor.cost.toLocaleString() : 0}
                    </td>
                    {!isEditDisabled && !isPCS && !isPF && (
                      <td className="border border-gray-200 p-3 text-center">
                        <button
                          onClick={function () { removeFloor(index); }}
                          disabled={floorData.length <= 1}
                          title="Supprimer ce niveau"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        >
                          <LuTrash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!isEditDisabled && (
          <div className="flex items-center justify-between mt-4">
            {isPCS || isPF ? (
              // PCS: ground floor only. PF: single "perimeter" row. No additional rows.
              <span />
            ) : (
              <button
                onClick={addFloor}
                disabled={floorData.length >= 10}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-djibouti-primary border border-djibouti-primary/30 bg-djibouti-primary/5 hover:bg-djibouti-primary/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t("CALCULATION_AJOUTER_ETAGE")}
                <span className="text-lg leading-none">+</span>
              </button>
            )}
            <button
              onClick={calculateFees}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-djibouti-primary text-white rounded-xl font-semibold hover:bg-djibouti-primary-dark transition-all shadow-sm"
            >
              {t("CALCULATION_CALCULER_REDEVANCE")}
            </button>
          </div>
        )}
      </div>

      {/* Commissioner-only: editable total tax + justification (kept here because it's a
          write-back flow, not just a display). Everyone else sees the computed results in
          the "Détails du paiement" card at the top of the payment tab. */}
      {isTotalTaxEditable && (
        <div className={"mb-8 " + disabledStyle}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-amber-500 rounded-full" />
            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
              {t("CALCULATION_TOTAL_TAXES_WITH_SERVICE")}
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-xs text-amber-700 mb-1 font-medium">{t("CALCULATION_TOTAL_TAXES_WITH_SERVICE")}</p>
              <input
                className="w-full px-3 py-2 text-base font-bold text-amber-900 bg-white border border-amber-300 rounded-lg outline-none focus:border-amber-500 transition-all"
                value={revisedTotalTaxWithService}
                onChange={function (e) { var v = e.target.value; if (Number(v) !== 0 || v === "") setRevisedTotalTaxWithService(v); }}
              />
              {Number(revisedTotalTaxWithService) === 0 && <p className="text-xs text-red-500 mt-1">Le montant ne peut pas être 0</p>}
            </div>

            {(revisedTotalTaxWithService != response?.additionalDetails?.costEstimation?.totalTaxWithServiceCharge || taxChangeReason !== "") && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-xs text-amber-700 mb-1 font-medium">Justification du changement <span className="text-red-500">*</span></p>
                <input
                  className="w-full px-3 py-2 text-sm bg-white border border-amber-300 rounded-lg outline-none focus:border-amber-500 transition-all"
                  placeholder="Raison du changement de montant..."
                  value={taxChangeReason || ""}
                  onChange={function (e) { setTaxChangeReason(e.target.value); }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cost Breakdown Table */}
      <div className={"mb-6 " + disabledStyle}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-djibouti-primary rounded-full" />
          <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{t("CALCULATION_ESTIMATION_TOTALE_COUT")}</h4>
          <span className="text-sm font-bold text-gray-900 ml-2">{(calculatedFees.totalProjectValue || 0).toLocaleString()} FDj</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-djibouti-primary/10 to-djibouti-primary/5">
                <th className="border border-gray-200 p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{t("CALCULATION_WORK_DESIGNATION")}</th>
                <th className="border border-gray-200 p-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide w-52">{t("CALCULATION_WORK_PERCENTAGES")}</th>
                <th className="border border-gray-200 p-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide w-40">{t("CALCULATION_AMOUNT")}</th>
              </tr>
            </thead>
            <tbody>
              {costBreakdown.map(function (item, index) {
                return (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="border border-gray-200 p-3 text-sm text-gray-700">{t(item.name)}</td>
                    <td className="border border-gray-200 p-3 text-center text-sm text-gray-600">{item.percentage}%</td>
                    <td className="border border-gray-200 p-3 text-right text-sm font-semibold text-gray-900">{item.amount === 0 ? "0 FDj" : item.amount.toLocaleString() + " FDj"}</td>
                  </tr>
                );
              })}
              <tr className="bg-gray-50 font-bold">
                <td className="border border-gray-200 p-3 text-sm text-gray-900">{t("CALCULATION_TOTAL")}</td>
                <td className="border border-gray-200 p-3 text-center text-sm text-gray-900">{calculateTotalPercentage()}%</td>
                <td className="border border-gray-200 p-3 text-right text-sm text-gray-900">{calculateTotalCost() === 0 ? "0 FDj" : calculateTotalCost().toLocaleString() + " FDj"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Button — only HOD can save (backend rejects agents for costEstimation) */}
      {!isSaveDisabled && (
        <div className="flex justify-end">
          <button
            onClick={calculationSubmit}
            disabled={isSaveBtnDisable && !isTotalTaxEditable}
            className="inline-flex items-center gap-2 px-8 py-3 bg-djibouti-primary text-white rounded-xl font-semibold hover:bg-djibouti-primary-dark transition-all shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t("CALCULATION_SAVE")}
          </button>
        </div>
      )}

      {onSubmitLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default Calculation;
