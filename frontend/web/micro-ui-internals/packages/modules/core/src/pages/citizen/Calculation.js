import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import TextInput from "../../../../../ui-components/src/atoms/TextInput";
import Loader from "../../../../../ui-components/src/atoms/Loader";
import { Toast } from "@egovernments/digit-ui-react-components";

const Calculation = () => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const queryStrings = Digit.Hooks.useQueryParams();
  const userDetails = Digit.UserService.getUser();
  const checklistStatus = localStorage.getItem("checklistStatus");
  const isHODorAGENT = userDetails?.info?.roles?.some((role) => role.code === "BPA_HOD" || role.code === "BPA_AGENTS");

  let styleCondition = {};
  if (!isHODorAGENT && queryStrings?.state !== checklistStatus?.split(".")[1]) {
    styleCondition = { pointerEvents: "none", opacity: 0.7 };
  }

  const [floorData, setFloorData] = useState([
    { name: t("CALCULATION_RDC"), residentialArea: 0, commercialArea: 0, totalArea: 0, cost: 0, floorNo: 0 },
    { name: t("CALCULATION_1ER_ETAGE"), residentialArea: 0, commercialArea: 0, totalArea: 0, cost: 0, floorNo: 1 },
    { name: t("CALCULATION_TERRASSE"), residentialArea: 0, commercialArea: 0, totalArea: 0, cost: 0, floorNo: 2 },
  ]);

  const [feeRates, setFeeRates] = useState({
    residentialCost: 50000,
    commercialCost: 30000,
    royaltyFeePercentage: 1.5,
    seismicFeePercentage: 1,
    registryServiceFee: 5000,
  });

  const [calculatedFees, setCalculatedFees] = useState({
    royaltyFee: 0,
    seismicFees: 0,
    totalTax: 0,
    totalTaxWithService: 0,
    totalProjectValue: 0,
  });

  const [plotInfo, setPlotInfo] = useState({
    plotArea: 0,
    cos: 0,
  });

  const [calculationResponse, setCalculationResponse] = useState();
  const [response, setResponse] = useState();
  const [isSaveBtnDisable, setIsSaveBtnDisable] = useState(true);

  const [costBreakdown, setCostBreakdown] = useState([
    { name: "CALCULATION_TERRASSEMENT", percentage: 8, amount: 0, id: "CALCULATION_TERRASSEMENT" },
    { name: "CALCULATION_FONDATION", percentage: 10, amount: 0, id: "CALCULATION_FONDATION" },
    { name: "CALCULATION_MACONNERIE", percentage: 9, amount: 0, id: "CALCULATION_MACONNERIE" },
    { name: "CALCULATION_BETON_ARME", percentage: 28, amount: 0, id: "CALCULATION_BETON_ARME" },
    { name: "CALCULATION_REVETEMENTS", percentage: 20, amount: 0, id: "CALCULATION_REVETEMENTS" },
    { name: "CALCULATION_MENUISERIES", percentage: 11, amount: 0, id: "CALCULATION_MENUISERIES" },
    { name: "CALCULATION_ELECTRICITE", percentage: 6, amount: 0, id: "CALCULATION_ELECTRICITE" },
    { name: "CALCULATION_PLOMBERIE", percentage: 3, amount: 0, id: "CALCULATION_PLOMBERIE" },
    { name: "CALCULATION_ASSAINISSEMENT", percentage: 5, amount: 0, id: "CALCULATION_ASSAINISSEMENT" },
  ]);
  const [revisedTotalTaxWithService, setRevisedTotalTaxWithService] = useState(calculatedFees?.totalTaxWithService?.toLocaleString());
  const [taxChangeReason, setTaxChangeReason] = useState("");
  const [onSubmitLoading, setOnSubmitLoading] = useState(false);
  const isTotalTaxEditable = queryStrings?.state === "AWAITING_ON_COMMISSIONER";

  const request = {
    url: `/public-service/v1/application/${queryStrings?.serviceCode}`,
    headers: {
      "X-Tenant-Id": tenantId,
      "auth-token": Digit.UserService.getUser()?.access_token,
    },
    method: "GET",
    params: {
      applicationNumber: queryStrings?.applicationNumber,
      tenantId: tenantId,
    },
  };
  const { isLoading, data } = Digit.Hooks.useCustomAPIHook(request);

  const getValue = (primary, fallback, defaultValue) => {
    return primary !== undefined && primary !== null
      ? primary
      : fallback !== undefined && fallback !== null
        ? fallback
        : defaultValue;
  };

  useEffect(() => {
    if (data) {
      setResponse(data?.Application?.[0] || {});
    }
  }, [data]);

  const calReq = {
    url: "/calculator-service/v1/BPA_PCO/estimate_calculate",
    params: {},
    // body: {'Application':[payload]},
    method: "POST",
    headers: {},
    config: {
      enable: false,
    },
  };
  const mutation = Digit.Hooks.useCustomAPIMutationHook(calReq);

  const updateRequest = {
    url: `/public-service/v1/application/${queryStrings?.serviceCode}`,
    method: "PUT",
    headers: {
      "X-Tenant-Id": tenantId,
      "auth-token": Digit.UserService.getUser()?.access_token,
    },
    config: {
      enable: true,
    },
  };

  const mutationPut = Digit.Hooks.useCustomAPIMutationHook(updateRequest);

  const calculateTotalCost = () => {
    return costBreakdown.reduce((total, item) => total + item.amount, 0);
  };

  const calculateTotalPercentage = () => {
    return costBreakdown.reduce((total, item) => total + item.percentage, 0);
  };

  const addFloor = () => {
    if (floorData.length >= 10) {
      return;
    }
    const newFloor = {
      name: t(`CALCULATION_${floorData.length - 1}ER_ETAGE`),
      residentialArea: 0,
      commercialArea: 0,
      totalArea: 0,
      cost: 0,
      floorNo: floorData.length - 1,
    };

    const newFloorData = [...floorData];
    // Insert at the second-to-last position (last position is terrace)
    newFloorData.splice(floorData.length - 1, 0, newFloor);
    setFloorData(newFloorData);
  };

  const calculateFees = async () => {
    const updatedCostEstimation = {
      costPerSqmLivingSpace: feeRates.residentialCost,
      costPerSqmCommercialSpace: feeRates.commercialCost,
      royaltyPer: feeRates.royaltyFeePercentage,
      eqResistancePer: feeRates.seismicFeePercentage,
      eqResistanceCost: 0,
      royaltyFee: 0,
      registryServiceFee: feeRates.registryServiceFee,
      totalBuildingCost: 0,
      totalTax: 0,
      totalTaxWithServiceCharge: 0,
      floors: floorData.map((floor, index) => ({
        floorNo: index,
        builtUpAreaLiving: floor.residentialArea,
        builtupAreaCommercial: floor.commercialArea,
        totalAreaPerLevel: floor.totalArea,
        floorCost: floor.cost,
      })),
      totalCostBreakdown: costBreakdown.map((item) => ({
        designationOfWorks: item.id,
        percentage: item.percentage,
        amount: item.amount,
      })),
    };

    const clonedPayload = JSON.parse(JSON.stringify(response));
    const updatedPayload = {
      ...clonedPayload,
      additionalDetails: {
        ...(clonedPayload.additionalDetails || {}),
        costEstimation: updatedCostEstimation || {},
      },
    };

    await mutation.mutate(
      {
        ...calReq,
        body: { Application: [updatedPayload] },
      },
      {
        onSuccess: (res) => {
          setCalculationResponse(res?.Application?.[0]);
          setIsSaveBtnDisable(false);
        },
        onError: () => {
          console.log("Error occured");
        },
      }
    );
  };

  const [showToast, setShowToast] = useState(null);

  const calculationSubmit = async () => {
    setOnSubmitLoading(true);
    // Create a deep copy of calculationResponse to avoid mutating the original
    const modifiedCalculationResponse = JSON.parse(JSON.stringify(isTotalTaxEditable ? response : calculationResponse));

    // Modify the workflow.action in the copy
    if (modifiedCalculationResponse?.workflow) {
      modifiedCalculationResponse.workflow.action = "";
    }

    if (isTotalTaxEditable) {
      if (!modifiedCalculationResponse.additionalDetails.totalTaxWithServiceChargeWithoutConcession) {
        modifiedCalculationResponse.additionalDetails.totalTaxWithServiceChargeWithoutConcession =
          modifiedCalculationResponse.additionalDetails.costEstimation.totalTaxWithServiceCharge;
      }
      modifiedCalculationResponse.additionalDetails.taxChangeReason = taxChangeReason;
      modifiedCalculationResponse.additionalDetails.costEstimation.totalTaxWithServiceCharge = revisedTotalTaxWithService;
    }

    await mutationPut.mutate(
      {
        ...updateRequest,
        body: {
          Application: modifiedCalculationResponse,
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
          setTimeout(() => {
            setShowToast(null);
          }, 3000);
        },
        onError: (err) => {
          console.log("Error occurred");
          setIsSaveBtnDisable(false);
          setOnSubmitLoading(false);
          setShowToast({ label: t("CALCULATION_SAVE_ERROR"), type: "error" });
          setTimeout(() => {
            setShowToast(null);
            window.history.back();
          }, 3000);
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
        // First try to find in current estimation
        const matched = estimation?.totalCostBreakdown?.find((apiItem) => apiItem.designationOfWorks === item.id);

        // If not found in current estimation, try fallback estimation
        const fallbackMatch = !matched && fallbackEstimation?.totalCostBreakdown?.find((apiItem) => apiItem.designationOfWorks === item.id);

        // Update if match found in either source, otherwise keep original values
        return matched || fallbackMatch
          ? {
              ...item,
              amount: (matched || fallbackMatch).amount,
              percentage: (matched || fallbackMatch).percentage,
            }
          : item;
      })
    );

    setCalculatedFees({
      royaltyFee: estimation?.royaltyFee || fallbackEstimation?.royaltyFee || 0,
      seismicFees: estimation?.eqResistanceCost || fallbackEstimation?.eqResistanceCost || 0,
      totalTax: estimation?.totalTax || fallbackEstimation?.totalTax || 0,
      totalTaxWithService: estimation?.totalTaxWithServiceCharge || fallbackEstimation?.totalTaxWithServiceCharge || 0,
      totalProjectValue: estimation?.totalBuildingCost || fallbackEstimation?.totalBuildingCost || 0,
    });

    if (fallbackEstimation?.floors?.length > 0 && fallbackEstimation?.floors?.length >= (estimation?.floors?.length || 0) && !estimation) {
      const floor = fallbackEstimation.floors.map((item, index) => {
        const totalFloors = fallbackEstimation.floors.length;
        let floorKey;

        if (item.floorNo === 0) {
          floorKey = "CALCULATION_RDC";
        } else if (item.floorNo === totalFloors - 1) {
          floorKey = "CALCULATION_TERRASSE";
        } else {
          floorKey = `CALCULATION_${item.floorNo}ER_ETAGE`;
        }

        return {
          name: floorKey,
          residentialArea: item.builtUpAreaLiving,
          commercialArea: item.builtupAreaCommercial,
          totalArea: item.totalAreaPerLevel,
          cost: item.floorCost,
          floorNo: item.floorNo,
        };
      });

      setFloorData(floor);
    } else if (estimation?.floors?.length > 0) {
      const floor = estimation.floors.map((item, index) => {
        const totalFloors = estimation.floors.length;
        let floorKey;

        if (item.floorNo === 0) {
          floorKey = "CALCULATION_RDC";
        } else if (item.floorNo === totalFloors - 1) {
          floorKey = "CALCULATION_TERRASSE";
        } else {
          floorKey = `CALCULATION_${item.floorNo}ER_ETAGE`;
        }

        return {
          name: floorKey,
          residentialArea: item.builtUpAreaLiving,
          commercialArea: item.builtupAreaCommercial,
          totalArea: item.totalAreaPerLevel,
          cost: item.floorCost,
          floorNo: item.floorNo,
        };
      });

      setFloorData(floor);
    }

    setPlotInfo({
      plotArea:
        calculationResponse?.serviceDetails?.landandProjectDesignDetails?.[0]?.area ||
        response?.serviceDetails?.landandProjectDesignDetails?.[0]?.area ||
        0,
      cos:
        calculationResponse?.serviceDetails?.landandProjectDesignDetails?.[0].projectedCos ||
        response?.serviceDetails?.landandProjectDesignDetails?.[0].projectedCos ||
        0,
    });

    setTaxChangeReason(response?.additionalDetails?.taxChangeReason);
  }, [calculationResponse, response]);

  useEffect(() => {
    setRevisedTotalTaxWithService(calculatedFees?.totalTaxWithService);
  }, [calculatedFees?.totalTaxWithService]);

  return (
    <div className="calculation-container">
      {showToast && <Toast error={showToast.type === "error"} label={showToast.label} onClose={() => setShowToast(null)} />}
      <div className="calculation-wrapper">
        <h1 className="page-title">{t("CALCULATION_TITLE")}</h1>

        <div className="fee-rates" style={styleCondition}>
          <div className="fee-rate-card">
            <h3 className="fee-rate-card-title">{t("CALCULATION_COST_RESIDENTIAL")}</h3>
            <div className="input-with-unit">
              <input
                type="number"
                value={feeRates?.residentialCost}
                onChange={(e) => setFeeRates(prev => ({ ...prev, residentialCost: Number(e.target.value) }))}
                placeholder="50000"
                onWheel={(e) => e.target.blur()}
              />
              <span className="unit">FDJ</span>
            </div>
          </div>

          <div className="fee-rate-card">
            <h3 className="fee-rate-card-title">{t("CALCULATION_COST_COMMERCIAL")}</h3>
            <div className="input-with-unit">
              <input
                type="number"
                value={feeRates?.commercialCost}
                onChange={(e) => setFeeRates(prev => ({ ...prev, commercialCost: Number(e.target.value) }))}
                placeholder="30000"
                onWheel={(e) => e.target.blur()}
              />
              <span className="unit">FDJ</span>
            </div>
          </div>

          <div className="fee-rate-card">
            <h3 className="fee-rate-card-title">{t("CALCULATION_ROYALTY_FEES")}</h3>
            <div className="input-with-unit">
              <input
                type="number"
                value={feeRates?.royaltyFeePercentage}
                onChange={(e) => setFeeRates(prev => ({ ...prev, royaltyFeePercentage: Number(e.target.value) }))}
                placeholder="1.5"
                onWheel={(e) => e.target.blur()}
              />
              <span className="unit">% {t("OF_ESTIMATED_QUOTE")}</span>
            </div>
          </div>

          <div className="fee-rate-card">
            <h3 className="fee-rate-card-title">{t("CALCULATION_SEISMIC_FEES")}</h3>
            <div className="input-with-unit">
              <input
                value={feeRates?.seismicFeePercentage}
                onChange={(e) => setFeeRates(prev => ({ ...prev, seismicFeePercentage: Number(e.target.value) }))}
                placeholder="1"
                onWheel={(e) => e.target.blur()}
              />
              <span className="unit">% {t("OF_ESTIMATED_QUOTE")}</span>
            </div>
          </div>

          <div className="fee-rate-card">
            <h3 className="fee-rate-card-title">{t("CALCULATION_REGISTRY_SERVICE_FEE")}</h3>
            <div className="input-with-unit">
              <input
                type="number"
                value={feeRates?.registryServiceFee}
                onChange={(e) => setFeeRates(prev => ({ ...prev, registryServiceFee: Number(e.target.value) }))}
                placeholder="5000"
                onWheel={(e) => e.target.blur()}
              />
              <span className="unit">FDJ</span>
            </div>
          </div>
        </div>

        <div className="floor-table" style={styleCondition}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th className="niveau-col">{t("CALCULATION_NIVEAU")}</th>
                  <th className="area-col">{t("CALCULATION_SURFACE_HABITATION")}</th>
                  <th className="area-col">{t("CALCULATION_SURFACE_COMMERCIALE")}</th>
                  <th className="total-col">{t("CALCULATION_TOTAL_SUPERFICIE")}</th>
                  <th className="cost-col">{t("CALCULATION_ESTIMATION_COUTS")}</th>
                </tr>
              </thead>
              <tbody>
                {floorData.map((floor, index) => (
                  <tr key={index}>
                    <td className="niveau-col">{t(floor.name)}</td>
                    <td className="area-col">
                      <div className="input-with-unit">
                        <input
                          type="number"
                          value={floor.residentialArea === 0 ? "" : floor.residentialArea}
                          onChange={(e) => {
                            const updatedFloors = [...floorData];
                            updatedFloors[index].residentialArea = e.target.value ? Number(e.target.value) : 0;
                            updatedFloors[index].totalArea = updatedFloors[index].residentialArea + updatedFloors[index].commercialArea;
                            setFloorData(updatedFloors);
                          }}
                          placeholder=""
                          onWheel={(e) => e.target.blur()}
                        />
                        <span className="unit">m²</span>
                      </div>
                    </td>
                    <td className="area-col">
                      <div className="input-with-unit">
                        <input
                          type="number"
                          value={floor.commercialArea === 0 ? "" : floor.commercialArea}
                          onChange={(e) => {
                            const updatedFloors = [...floorData];
                            updatedFloors[index].commercialArea = e.target.value ? Number(e.target.value) : 0;
                            updatedFloors[index].totalArea = updatedFloors[index].residentialArea + updatedFloors[index].commercialArea;
                            setFloorData(updatedFloors);
                          }}
                          placeholder=""
                          onWheel={(e) => e.target.blur()}
                        />
                        <span className="unit">m²</span>
                      </div>
                    </td>
                    <td className="total-col">{floor.totalArea > 0 ? `${floor.totalArea} m²` : "0 m²"}</td>
                    <td className="cost-col">{floor.cost ? floor?.cost?.toLocaleString() : 0}</td>
                  </tr>
                ))}
                <tr className="button-row">
                  <td colSpan="5">
                    <div className="button-container">
                      <button className={`add-floor-button ${floorData?.length >= 10 ? "disable-floor-btn" : ""}`} onClick={addFloor}>
                        <h1 className="add-floor-button-title">{t("CALCULATION_AJOUTER_ETAGE")}</h1>
                        <span className="add-floor-button-icon">+</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <button className="action-button" onClick={calculateFees}>
            {t("CALCULATION_CALCULER_REDEVANCE")}
          </button>
        </div>

        <div className="calculations-section" style={styleCondition}>
          <div className="plot-info">
            <h3 className="plot-info-title">{t("CALCULATION_COEFFICIENTS_SOL")}</h3>
            <div className="info-content">
              <div className="fee-rate-card">
                <span className="fee-rate-card-title">{t("CALCULATION_SURFACE_PARCELLE")}</span>
                <span className="fee-rate-card-value disabled">{plotInfo?.plotArea}</span>
              </div>
              <div className="fee-rate-card">
                <span className="fee-rate-card-title">{t("CALCULATION_COS")}</span>
                <span className="fee-rate-card-value disabled">{plotInfo?.cos}</span>
              </div>
              <div className="fee-rate-card">
                <span className="fee-rate-card-title">{t("CALCULATION_ROYALTY_FEES_CALCULATED")}</span>
                <span className="fee-rate-card-value disabled">{calculatedFees?.royaltyFee} FDj</span>
              </div>
              <div className="fee-rate-card">
                <span className="fee-rate-card-title">{t("CALCULATION_SEISMIC_FEES_CALCULATED")}</span>
                <span className="fee-rate-card-value disabled">{calculatedFees?.seismicFees?.toLocaleString()} FDj</span>
              </div>
              <div className="fee-rate-card">
                <span className="fee-rate-card-title">{t("CALCULATION_TOTAL_TAXES")}</span>
                <span className="fee-rate-card-value disabled">{calculatedFees?.totalTax?.toLocaleString()} FDj</span>
              </div>
              {isTotalTaxEditable ? (
                <React.Fragment>
                  <div className="fee-rate-card">
                    <span className="fee-rate-card-title">{t("CALCULATION_TOTAL_TAXES_WITH_SERVICE")}</span>

                    <div className="edit-tax-input-wrapper fee-rate-card-value">
                      <input
                        className="editable"
                        value={revisedTotalTaxWithService}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (Number(value) !== 0 || value === "") {
                            setRevisedTotalTaxWithService(value);
                          }
                        }}
                      />
                      {Number(revisedTotalTaxWithService) === 0 && <div className="digit-error-message">{t("ERROR_TOTAL_TAX_CANNOT_BE_ZERO")}</div>}
                    </div>
                  </div>
                  {(revisedTotalTaxWithService != response?.additionalDetails?.costEstimation?.totalTaxWithServiceCharge ||
                    taxChangeReason !== "") && (
                    <div className="fee-rate-card">
                      <span className="fee-rate-card-title">
                        {t("FEE_ADJUSTMENT_JUSTIFICATION")}
                        <span className="star">*</span>
                      </span>
                      <TextInput
                        className="fee-rate-card-value editable no-padding text-left reason-input-wrapper"
                        placeholder="ENTER_FEE_CHANGE_REASON"
                        required
                        onChange={(e) => setTaxChangeReason(e.target.value)}
                        value={taxChangeReason}
                      />
                    </div>
                  )}
                </React.Fragment>
              ) : (
                <div className="fee-rate-card">
                  <span className="fee-rate-card-title">{t("CALCULATION_TOTAL_TAXES_WITH_SERVICE")}</span>
                  <span className="fee-rate-card-value disabled">{calculatedFees?.totalTaxWithService?.toLocaleString()} FDj</span>
                </div>
              )}
              <div className="fee-rate-card">
                <span className="fee-rate-card-title">{t("CALCULATION_PROJECT_TOTAL_VALUE")}</span>
                <span className="fee-rate-card-value disabled">{calculatedFees?.totalProjectValue?.toLocaleString()} FDj</span>
              </div>
            </div>
          </div>
        </div>

        <div className="cost-breakdown" style={styleCondition}>
          <div className="table-wrapper cost-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th className="work-col">{t("CALCULATION_WORK_DESIGNATION")}</th>
                  <th className="percentage-col">{t("CALCULATION_WORK_PERCENTAGES")}</th>
                  <th className="amount-col">{t("CALCULATION_AMOUNT")}</th>
                </tr>
              </thead>
              <tbody>
                {costBreakdown.map((item, index) => (
                  <tr key={index}>
                    <td className="work-col">{t(item.name)}</td>
                    <td className="percentage-col">{item.percentage}%</td>
                    <td className="amount-col">{item.amount === 0 ? "0 FDj" : `${item?.amount?.toLocaleString()} FDj`}</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td className="work-col">{t("CALCULATION_TOTAL")}</td>
                  <td className="percentage-col">{calculateTotalPercentage()}%</td>
                  <td className="amount-col">{calculateTotalCost() === 0 ? "0 FDj" : `${calculateTotalCost()?.toLocaleString()} FDj`}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <button className={`action-button ${isSaveBtnDisable && !isTotalTaxEditable ? "disabled-btn" : ""}`} onClick={calculationSubmit}>
          {t("CALCULATION_SAVE")}
        </button>

        {onSubmitLoading && (
          <div className="loader">
            <Loader />
          </div>
        )}
      </div>
    </div>
  );
};

export default Calculation;
