import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";

const Calculation = () => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const queryStrings = Digit.Hooks.useQueryParams();

  const [floorData, setFloorData] = useState([
    { name: t('CALCULATION_RDC'), residentialArea: 0, commercialArea: 0, totalArea: 0, cost: 0, floorNo:0 },
    { name: t('CALCULATION_1ER_ETAGE'), residentialArea: 0, commercialArea: 0, totalArea: 0, cost: 0, floorNo:1 },
    { name: t('CALCULATION_TERRASSE'), residentialArea: 0, commercialArea: 0, totalArea: 0, cost: 0, floorNo:2 }
  ]);


  const [feeRates, setFeeRates] = useState({
    residentialCost: 50000,
    commercialCost: 30000,
    royaltyFeePercentage: 1.5,
    seismicFeePercentage: 1,
    registryServiceFee: 5000
  });

  const [calculatedFees, setCalculatedFees] = useState({
    royaltyFee: 0,
    seismicFees: 0,
    totalTax: 0,
    totalTaxWithService: 0,
    totalProjectValue: 0
  });

  const [plotInfo, setPlotInfo] = useState({
    plotArea:0,
    cos: 0
  });

  const [calculationResponse, setCalculationResponse] = useState();

  const [costBreakdown, setCostBreakdown] = useState([
    { name: t('CALCULATION_TERRASSEMENT'), percentage: 8, amount: 0, id:"Earthwork" },
    { name: t('CALCULATION_FONDATION'), percentage: 10, amount: 0, id:"Foundation" },
    { name: t('CALCULATION_MACONNERIE'), percentage: 9, amount: 0, id:"Masonry" },
    { name: t('CALCULATION_BETON_ARME'), percentage: 28, amount: 0, id: "Reinforced concrete in elevation" },
    { name: t('CALCULATION_REVETEMENTS'), percentage: 20, amount: 0, id: "Floor and wall coverings/Paints"},
    { name: t('CALCULATION_MENUISERIES'), percentage: 11, amount: 0, id:"Carpentry" },
    { name: t('CALCULATION_ELECTRICITE'), percentage: 6, amount: 0, id:"Electricity" },
    { name: t('CALCULATION_PLOMBERIE'), percentage: 3, amount: 0, id:"Plumbing/Sanitation" },
    { name: t('CALCULATION_ASSAINISSEMENT'), percentage: 5, amount: 0, id:"Sanitation" }
  ]);


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
  let response = data ? data?.Application?.[0] : {};

  const calReq = {
    url: "/calculator-service/v1/BPA_PCO/estimate_calculate",
    params: {},
    // body: {'Application':[payload]},
    method: "POST",
    headers: {},
    config: {
        enable: false,
    },
}
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
const checklistStatus = localStorage.getItem('checklistStatus')

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
      floorNo: floorData.length - 1
    };
    
    const newFloorData = [...floorData];
    // Insert at the second-to-last position (last position is terrace)
    newFloorData.splice(floorData.length - 1, 0, newFloor);
    setFloorData(newFloorData);
  };

  const calculateFees = async () => {

    const updatedCostEstimation = {
      "costPerSqmLivingSpace": feeRates.residentialCost,
      "costPerSqmCommercialSpace": feeRates.commercialCost,
      "royaltyPer": feeRates.royaltyFeePercentage,
      "eqResistancePer": feeRates.seismicFeePercentage,
      "eqResistanceCost": 0,
      "royaltyFee": 0,
      "registryServiceFee": 5000,
      "totalBuildingCost": 0,
      "totalTax": 0,
      "totalTaxWithServiceCharge": 0,
      "floors": floorData.map((floor, index) => ({
        floorNo: index,
        builtUpAreaLiving: floor.residentialArea,
        builtupAreaCommercial: floor.commercialArea,
        totalAreaPerLevel: floor.totalArea,
        floorCost: floor.cost
      })),
      "totalCostBreakdown": costBreakdown.map(item => ({
        designationOfWorks: item.id,
        percentage: item.percentage,
        amount: item.amount
      }))
    };
  
    const clonedPayload = JSON.parse(JSON.stringify(response));
    const updatedPayload = {
      ...clonedPayload,
      additionalDetails: {
        ...(clonedPayload.additionalDetails || {}),
        costEstimation: updatedCostEstimation || {}
      }
    };
 
  await mutation.mutate(
    {
      ...calReq,
      body: {'Application': [updatedPayload]}
    },
    {
        onSuccess: (res) => {
            setCalculationResponse(res?.Application?.[0])
        },
        onError: () => {
            console.log("Error occured");
        },
    }
)
   
  };

  const calculationSubmit = async () => {
    if (!calculationResponse) return;

    // Create a deep copy of calculationResponse to avoid mutating the original
    const modifiedCalculationResponse = JSON.parse(JSON.stringify(calculationResponse));

    // Modify the workflow.action in the copys
    if (modifiedCalculationResponse?.workflow) {
      modifiedCalculationResponse.workflow.action = "";
    }

    await mutationPut.mutate(
      {
        ...updateRequest,
        body: {
          'Application': modifiedCalculationResponse,
          "RequestInfo":{
          apiId: "Rainmaker",
          authToken: Digit.UserService.getUser()?.access_token,
          userInfo: Digit.UserService.getUser()?.info,
          msgId: `${Date.now()}|${Digit.StoreData.getCurrentLanguage()}`,
        }
         }
      },
      {
        onSuccess: (res) => {
          setCalculationResponse(res?.Application?.[0])
        },
        onError: () => {
          console.log("Error occured");
        },
      }
    )

  }

  useEffect(()=>{

    const estimation = calculationResponse?.additionalDetails?.costEstimation;
    const fallbackEstimation = response?.additionalDetails?.costEstimation;
    
    setCostBreakdown(prev => 
      prev.map(item => {
        // First try to find in current estimation
        const matched = estimation?.totalCostBreakdown?.find(apiItem => 
          apiItem.designationOfWorks === item.id
        );
        
        // If not found in current estimation, try fallback estimation
        const fallbackMatch = !matched && fallbackEstimation?.totalCostBreakdown?.find(apiItem => 
          apiItem.designationOfWorks === item.id
        );
        
        // Update if match found in either source, otherwise keep original values
        return matched || fallbackMatch
          ? { 
              ...item, 
              amount: (matched || fallbackMatch).amount,
              percentage: (matched || fallbackMatch).percentage 
            }
          : item;
      })
    );

    setCalculatedFees({
      royaltyFee: estimation?.royaltyFee || fallbackEstimation?.royaltyFee || 0,
      seismicFees: estimation?.eqResistanceCost || fallbackEstimation?.eqResistanceCost || 0,
      totalTax: estimation?.totalTax || fallbackEstimation?.totalTax || 0,
      totalTaxWithService: estimation?.totalTaxWithServiceCharge || fallbackEstimation?.totalTaxWithServiceCharge || 0,
      totalProjectValue: estimation?.totalBuildingCost || fallbackEstimation?.totalBuildingCost || 0
    })

    setFloorData(prevFloors => 
      prevFloors.map(floor => {
        // First try to find in current estimation
        const matchingApiFloor = estimation?.floors?.find(
          apiFloor => apiFloor.floorNo === floor.floorNo
        );
        
        // If not found in estimation, try fallback response
        const fallbackFloor = !matchingApiFloor && fallbackEstimation?.floors?.find(
          apiFloor => apiFloor.floorNo === floor.floorNo
        );
        
        // Update if match found in either source, otherwise keep original values
        return matchingApiFloor || fallbackFloor
          ? {
              ...floor,
              cost: (matchingApiFloor || fallbackFloor).floorCost,
              residentialArea: (matchingApiFloor || fallbackFloor).builtUpAreaLiving, 
              commercialArea: (matchingApiFloor || fallbackFloor).builtupAreaCommercial, 
              totalArea: (matchingApiFloor || fallbackFloor).totalAreaPerLevel, 
            }
          : floor;
      })
    );

    setPlotInfo({
      plotArea:(calculationResponse?.serviceDetails?.landandProjectDesignDetails?.[0]?.area || response?.serviceDetails?.landandProjectDesignDetails?.[0]?.area || 0),
      cos: (calculationResponse?.serviceDetails?.landandProjectDesignDetails?.[0].projectedCos || response?.serviceDetails?.landandProjectDesignDetails?.[0].projectedCos || 0)
    })

  },[calculationResponse, response])


  return (
    <div className="calculation-container" style={queryStrings?.state !== checklistStatus?.split(".")[1] ? { pointerEvents: "none", opacity:0.7 } : {}}>
      <div className="calculation-wrapper">
        <h1 className="page-title">{t('CALCULATION_TITLE')}</h1>

        <div className="fee-rates">
          <div className="fee-rate-card">
            <h3 className='fee-rate-card-title'>{t('CALCULATION_COST_RESIDENTIAL')}</h3>
            <p className='fee-rate-card-value disabled'>FDj {feeRates?.residentialCost?.toLocaleString()}</p>
          </div>

          <div className="fee-rate-card">
            <h3 className='fee-rate-card-title'>{t('CALCULATION_COST_COMMERCIAL')}</h3>
            <p className='fee-rate-card-value disabled'>FDj {feeRates?.commercialCost?.toLocaleString()}</p>
          </div>

          <div className="fee-rate-card">
            <h3 className='fee-rate-card-title'>{t('CALCULATION_ROYALTY_FEES')}</h3>
            <p className='fee-rate-card-value disabled'>{`${feeRates?.royaltyFeePercentage} % ${t("OF_ESTIMATED_QUOTE")}`}</p>
          </div>

          <div className="fee-rate-card">
            <h3 className='fee-rate-card-title'>{t('CALCULATION_SEISMIC_FEES')}</h3>
            <p className='fee-rate-card-value disabled'>{`${feeRates?.seismicFeePercentage} % ${t("OF_ESTIMATED_QUOTE")}`}</p>
          </div>

          <div className="fee-rate-card">
            <h3 className='fee-rate-card-title'>{t('CALCULATION_REGISTRY_SERVICE_FEE')}</h3>
            <p className='fee-rate-card-value disabled'>FDj {feeRates?.registryServiceFee?.toLocaleString()}</p>
          </div>
        </div>

        <div className="floor-table">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th className="niveau-col">{t('CALCULATION_NIVEAU')}</th>
                  <th className="area-col">{t('CALCULATION_SURFACE_HABITATION')}</th>
                  <th className="area-col">{t('CALCULATION_SURFACE_COMMERCIALE')}</th>
                  <th className="total-col">{t('CALCULATION_TOTAL_SUPERFICIE')}</th>
                  <th className="cost-col">{t('CALCULATION_ESTIMATION_COUTS')}</th>
                </tr>
              </thead>
              <tbody>
                {floorData.map((floor, index) => (
                  <tr key={index}>
                    <td className="niveau-col">{floor.name}</td>
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
                        />
                        <span className="unit">m²</span>
                      </div>
                    </td>
                    <td className="total-col">
                       { floor.totalArea > 0 ? `${floor.totalArea} m²` : "0 m²"}
                    </td>
                    <td className="cost-col">
                    {floor.cost ? floor?.cost?.toLocaleString() : 0}
                    </td>
                  </tr>
                ))}
                <tr className="button-row">
                  <td colSpan="5">
                    <div className="button-container">
                      <button className={`add-floor-button ${floorData?.length >=10 ? "disable-floor-btn" : ""}`} onClick={addFloor}>
                        <h1 className='add-floor-button-title'>{t('CALCULATION_AJOUTER_ETAGE')}</h1>
                        <span className="add-floor-button-icon">+</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <button className="action-button" onClick={calculateFees}>
            {t('CALCULATION_CALCULER_REDEVANCE')}
          </button>
        </div>

        <div className="calculations-section">
          <div className="plot-info">
            <h3 className='plot-info-title'>{t('CALCULATION_COEFFICIENTS_SOL')}</h3>
            <div className="info-content">
              <div className="fee-rate-card">
                <span className='fee-rate-card-title'>{t('CALCULATION_SURFACE_PARCELLE')}</span>
                <span className='fee-rate-card-value disabled'>{plotInfo?.plotArea}</span>
              </div>
              <div className="fee-rate-card">
                <span className='fee-rate-card-title'>{t('CALCULATION_COS')}</span>
                <span className='fee-rate-card-value disabled'>{plotInfo?.cos}</span>
              </div>
              <div className="fee-rate-card">
                <span className='fee-rate-card-title'>{t('CALCULATION_ROYALTY_FEES_CALCULATED')}</span>
                <span className='fee-rate-card-value disabled'>{calculatedFees?.royaltyFee} FDj</span>
              </div>
              <div className="fee-rate-card">
                <span className='fee-rate-card-title'>{t('CALCULATION_SEISMIC_FEES_CALCULATED')}</span>
                <span className='fee-rate-card-value disabled'>{calculatedFees?.seismicFees?.toLocaleString()} FDj</span>
              </div>
              <div className="fee-rate-card">
                <span className='fee-rate-card-title'>{t('CALCULATION_TOTAL_TAXES')}</span>
                <span className='fee-rate-card-value disabled'>{calculatedFees?.totalTax?.toLocaleString()} FDj</span>
              </div>
              <div className="fee-rate-card">
                <span className='fee-rate-card-title'>{t('CALCULATION_TOTAL_TAXES_WITH_SERVICE')}</span>
                <span className='fee-rate-card-value disabled'>{calculatedFees?.totalTaxWithService?.toLocaleString()} FDj</span>
              </div>
              <div className="fee-rate-card">
                <span className='fee-rate-card-title'>{t('CALCULATION_PROJECT_TOTAL_VALUE')}</span>
                <span className='fee-rate-card-value disabled'>{calculatedFees?.totalProjectValue?.toLocaleString()} FDj</span>
              </div>
            </div>
          </div>
        </div>

        <div className="cost-breakdown">
          <div className="table-wrapper cost-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th className="work-col">{t('CALCULATION_WORK_DESIGNATION')}</th>
                  <th className="percentage-col">{t('CALCULATION_WORK_PERCENTAGES')}</th>
                  <th className="amount-col">{t('CALCULATION_AMOUNT')}</th>
                </tr>
              </thead>
              <tbody>
                {costBreakdown.map((item, index) => (
                  <tr key={index}>
                    <td className="work-col">{item.name}</td>
                    <td className="percentage-col">{item.percentage}%</td>
                    <td className="amount-col">{item.amount === 0 ? "0 FDj" : `${item?.amount?.toLocaleString()} FDj`}</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td className="work-col">{t('CALCULATION_TOTAL')}</td>
                  <td className="percentage-col">{calculateTotalPercentage()}%</td>
                  <td className="amount-col">{calculateTotalCost() === 0 ? "0 FDj" : `${calculateTotalCost()?.toLocaleString()} FDj`}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <button className={`action-button ${!calculationResponse ? "disabled-btn" : ""}`} onClick={calculationSubmit}>
            {t('CALCULATION_SAVE')}
          </button>
        </div>
      </div>

      <style jsx>{`
        .calculation-container {
          padding: 24px;
          border-radius: 15px;
          background-color: #fff;
          width: 100%;
          box-shadow: 1px 5px 7px 2px #adadad;
        }

        .calculation-wrapper {
          max-width: 1000px;
        }

        .page-title {
          font-size: 40px;
          font-weight: 700;
          margin: 0;
        }

        .fee-rates {
          margin-bottom: 24px;
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .fee-rate-card {
          display: flex;
          padding: 15px;
          border-radius: 4px;
          align-items: center;
          padding:0
        }

        .fee-rate-card-title {
          font-size: 16px;
          font-weight: 400;
          width: 50%;
          margin:0;
        }

        .fee-rate-card-value {
          font-size: 16px;
          font-weight: 400;
          background: #EEEEEE;
          padding: 13px;
          width: 80%;
          border-radius: 10px;
        }

        .floor-table {
          margin-bottom: 30px;
          max-width: 1000px;
        }

        .table-wrapper {
          border: 1px solid #D6D5D4;
          border-top-left-radius: 12px;
          border-top-right-radius: 12px;
          overflow: hidden;
        }

        table {
          width: 100%;
          max-width: 1000px;
          border-collapse: collapse;
          border-spacing: 0;
          table-layout: fixed;
        }

        th, td {
          border: none;
          border-bottom: 1px solid #ddd;
          padding: 12px 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          vertical-align: middle;
        }

        .button-row td {
          border-bottom: none;
          padding: 15px;
        }

        th {
          background-color: #f2f2f2;
          color: #006769;
          text-wrap: wrap;
          font-weight: 600;
          height: 60px;
        }

        .niveau-col {
          width: 15%;
          text-align: left;
        }

        .area-col {
          width: 25%;
          text-align: left;
        }

        .total-col {
          width: 22%;
          text-align: center;
        }

        .cost-col {
          width: 13%;
          text-align: center;
        }

        input {
          border: 1px solid #D4D4D4;;
          padding: 10px;
          border-radius: 8px;
          width: 100%;
          box-sizing: border-box;
          font-size: 16px;
          text-align: center;
        }

        input:active,
        input:focus,
        input:focus-visible{
        border: 1px solid #006769 !important;
        outline: none !important;
        box-shadow: none !important;
        }

        .button-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding:0;
        }

        .action-button {
          margin-top: 15px;
          padding: 12px;
          background-color: #006769;
          color: white;
          border-radius: 10px;
          cursor: pointer;
          border: none;
          width: 100%;
          text-align: center;
          font-size: 16px;
        }

        .add-floor-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background-color: rgb(255, 255, 255);
          border: 1px solid #006769;
          border-radius: 15px;
          margin-left: auto;

          padding: 8px 40px;
          cursor: pointer;
        }

        .add-floor-button-title {
          font-size: 16px;
          font-weight: 400;
          color: #006769;
          margin: 0;
        }

        .add-floor-button-icon {
          font-size: 16px;
          font-weight: 400;
          color: #006769;
          border: 2px solid #006769;
          border-radius: 100%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .calculations-section {
          margin-bottom: 30px;
        }

        .plot-info, .fees-summary {
          border-radius: 4px;
          padding-left:0
        }

        .plot-info-title{
          margin:0
          margin-bottom:24px;
        }

        .info-content {
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .total-value {
          font-weight: bold;
        }

        .total-row {
          font-weight: bold;
          background-color: #f2f2f2;
        }

        .cost-breakdown {
          margin-top: 20px;
        }

        .input-with-unit {
          position: relative;
          display: inline-block;
          width: 60%;
        }

        .input-with-unit input {
          width: 100%;
          font-size: 16px;
          text-align: center;
          color:"#363636";
          padding-right: 40px;
          box-sizing: border-box;
        }

        .text-input, .cost-input {
          border: 1px solid black;
          padding: 10px;
          border-radius: 12px;
          width: 100%;
          font-size: 16px;
          text-align: center;
        }

        .cost-input {
          width: 80%;
        }

        .unit {
          position: absolute;
          right: 10px;
          font-size: 16px;
          font-weight: 500;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #B1B4B6;
        }

        .cost-table-wrapper {
          margin-bottom: 15px;
        }

        .work-col {
          width: 40%;
          text-align: left;
        }

        .percentage-col {
          width: 20%;
          text-align: center;
        }

        .amount-col {
          width: 40%;
          text-align: center;
        }

        .disabled{
         color:"#848484"
        }
        .disabled-btn{
          background-color: #d4d4d4;
          pointer-events: none;
        }
        .disable-floor-btn{
          opacity: 0.5;
          pointer-events: none;
          }
      `}</style>
    </div>
  );
};

export default Calculation;
