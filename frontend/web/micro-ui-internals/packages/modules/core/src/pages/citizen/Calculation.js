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

  const [plotArea, setPlotArea] = useState(0);
  const [calculatedFees, setCalculatedFees] = useState({
    buildingPermitFees: 0,
    seismicFees: 0,
    totalTax: 0,
    totalTaxWithService: 0,
    totalProjectValue: 0
  });

  const [plotInfo, setPlotInfo] = useState({
    seismicFeesCalculated: 0,
    cos: 0
  });

  const [calculationResponse, setCalculationResponse] = useState();

  const [costBreakdown, setCostBreakdown] = useState([
    { name: t('CALCULATION_TERRASSEMENT'), percentage: 8, amount: 0, id:"Earthwork" },
    { name: t('CALCULATION_FONDATION'), percentage: 8, amount: 0, id:"Foundation" },
    { name: t('CALCULATION_MACONNERIE'), percentage: 8, amount: 0, id:"Masonry" },
    { name: t('CALCULATION_BETON_ARME'), percentage: 8, amount: 0, id: "Reinforced concrete in elevation" },
    { name: t('CALCULATION_REVETEMENTS'), percentage: 8, amount: 0, id: "Floor and wall coverings/Paints"},
    { name: t('CALCULATION_MENUISERIES'), percentage: 8, amount: 0, id:"Carpentry" },
    { name: t('CALCULATION_ELECTRICITE'), percentage: 8, amount: 0, id:"Electricity" },
    { name: t('CALCULATION_PLOMBERIE'), percentage: 8, amount: 0, id:"Plumbing/Sanitation" },
    { name: t('CALCULATION_ASSAINISSEMENT'), percentage: 8, amount: 0, id:"Sanitation" }
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

  const request2 = {
    url: "/calculator-service/v1/BPA_PCO/estimate_calculate",
    params: {},
    // body: {'Application':[payload]},
    method: "POST",
    headers: {},
    config: {
        enable: false,
    },
}
const mutation = Digit.Hooks.useCustomAPIMutationHook(request2);

  const calculateTotalCost = () => {
    return costBreakdown.reduce((total, item) => total + item.amount, 0);
  };

  const calculateTotalPercentage = () => {
    return costBreakdown.reduce((total, item) => total + item.percentage, 0);
  };

  const addFloor = () => {
    const newFloor = { 
      name: `${t('CALCULATION_ETAGE')} ${floorData.length - 1}`, 
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
      ...request2,
      body: {'Application': [updatedPayload]}
    },
    {
        onSuccess: (res) => {
            setCalculationResponse(res?.Application?.[0]?.additionalDetails?.costEstimation)
        },
        onError: () => {
            console.log("Error occured");
        },
    }
)
   
  };

  useEffect(()=>{

    setCostBreakdown(prev => 
      prev.map(item => {
        // Find matching entry in API response
        const matched = calculationResponse?.totalCostBreakdown?.find(apiItem => 
          apiItem.designationOfWorks === item.id
        );
        
        // Update if match found, otherwise keep original values
        return matched 
          ? { 
              ...item, 
              amount: matched.amount,
              percentage: matched.percentage 
            }
          : item;
      })
    );

    setCalculatedFees({
      buildingPermitFees: calculationResponse?.eqResistanceCost || 0,
      seismicFees: calculationResponse?.royaltyFee || 0,
      totalTax: calculationResponse?.totalTax || 0,
      totalTaxWithService: calculationResponse?.totalTaxWithServiceCharge || 0,
      totalProjectValue: calculationResponse?.totalBuildingCost || 0
    })

    setFloorData(prevFloors => 
      prevFloors.map(floor => {
        // Find matching floor in API response
        const matchingApiFloor = calculationResponse?.floors?.find(
          apiFloor => apiFloor.floorNo === floor.floorNo
        );
        
        // If found, update the cost and areas, otherwise keep original values
        return matchingApiFloor 
          ? {
              ...floor,
              cost: matchingApiFloor.floorCost,
            }
          : floor;
      })
    );



  },[calculationResponse])


  return (
    <div className="calculation-container">
      <div className="calculation-wrapper">
        <h1 className="page-title">{t('CALCULATION_TITLE')}</h1>

        <div className="fee-rates">
          <div className="fee-rate-card">
            <h3 className='fee-rate-card-title'>{t('CALCULATION_COST_RESIDENTIAL')}</h3>
            <p className='fee-rate-card-value disabled'>FDj {feeRates.residentialCost.toLocaleString()}</p>
          </div>

          <div className="fee-rate-card">
            <h3 className='fee-rate-card-title'>{t('CALCULATION_COST_COMMERCIAL')}</h3>
            <p className='fee-rate-card-value disabled'>FDj {feeRates.commercialCost.toLocaleString()}</p>
          </div>

          <div className="fee-rate-card">
            <h3 className='fee-rate-card-title'>{t('CALCULATION_ROYALTY_FEES')}</h3>
            <p className='fee-rate-card-value disabled'>{`${feeRates.royaltyFeePercentage} % ${t("OF_ESTIMATED_QUOTE")}`}</p>
          </div>

          <div className="fee-rate-card">
            <h3 className='fee-rate-card-title'>{t('CALCULATION_SEISMIC_FEES')}</h3>
            <p className='fee-rate-card-value disabled'>{`${feeRates.seismicFeePercentage} % ${t("OF_ESTIMATED_QUOTE")}`}</p>
          </div>

          <div className="fee-rate-card">
            <h3 className='fee-rate-card-title'>{t('CALCULATION_REGISTRY_SERVICE_FEE')}</h3>
            <p className='fee-rate-card-value disabled'>FDj {feeRates.registryServiceFee.toLocaleString()}</p>
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
                    {floor.cost ? floor.cost.toLocaleString() : 0}
                    </td>
                  </tr>
                ))}
                <tr className="button-row">
                  <td colSpan="5">
                    <div className="button-container">
                      <button className="add-floor-button" onClick={addFloor}>
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
            <h3>{t('CALCULATION_COEFFICIENTS_SOL')}</h3>
            <div className="info-content">
              <div className="fee-rate-card">
                <span className='fee-rate-card-title'>{t('CALCULATION_SURFACE_PARCELLE')}</span>
                <span className='fee-rate-card-value disabled'>{plotArea}</span>
              </div>
              <div className="fee-rate-card">
                <span className='fee-rate-card-title'>{t('CALCULATION_SEISMIC_FEES_CALCULATED')}</span>
                <span className='fee-rate-card-value disabled'>{plotInfo.seismicFeesCalculated}</span>
              </div>
              <div className="fee-rate-card">
                <span className='fee-rate-card-title'>{t('CALCULATION_COS')}</span>
                <span className='fee-rate-card-value disabled'>{plotInfo.cos}</span>
              </div>
              <div className="fee-rate-card">
                <span className='fee-rate-card-title'>{t('CALCULATION_BUILDING_PERMIT_TAXES')}</span>
                <span className='fee-rate-card-value disabled'>{calculatedFees.buildingPermitFees.toLocaleString()} FDj</span>
              </div>
              <div className="fee-rate-card">
                <span className='fee-rate-card-title'>{t('CALCULATION_SEISMIC_FEES_CALCULATED')}</span>
                <span className='fee-rate-card-value disabled'>{calculatedFees.seismicFees.toLocaleString()} FDj</span>
              </div>
              <div className="fee-rate-card">
                <span className='fee-rate-card-title'>{t('CALCULATION_TOTAL_TAXES')}</span>
                <span className='fee-rate-card-value disabled'>{calculatedFees.totalTax.toLocaleString()} FDj</span>
              </div>
              <div className="fee-rate-card">
                <span className='fee-rate-card-title'>{t('CALCULATION_TOTAL_TAXES_WITH_SERVICE')}</span>
                <span className='fee-rate-card-value disabled'>{calculatedFees.totalTaxWithService.toLocaleString()} FDj</span>
              </div>
              <div className="fee-rate-card">
                <span className='fee-rate-card-title'>{t('CALCULATION_PROJECT_TOTAL_VALUE')}</span>
                <span className='fee-rate-card-value disabled'>{calculatedFees.totalProjectValue.toLocaleString()} FDj</span>
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
                    <td className="amount-col">{item.amount === 0 ? "0 FDj" : `${item.amount.toLocaleString()} FDj`}</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td className="work-col">{t('CALCULATION_TOTAL')}</td>
                  <td className="percentage-col">{calculateTotalPercentage()}%</td>
                  <td className="amount-col">{calculateTotalCost() === 0 ? "0 FDj" : `${calculateTotalCost().toLocaleString()} FDj`}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <button className="action-button">
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
          margin-bottom: 20px;
        }

        .fee-rates {
          margin-bottom: 30px;
          gap: 20px;
        }

        .fee-rate-card {
          display: flex;
          padding: 15px;
          border-radius: 4px;
          align-items: center;
        }

        .fee-rate-card-title {
          font-size: 16px;
          font-weight: 400;
          width: 50%;
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
          border: 1px solid grey;
          border-top-left-radius: 10px;
          border-top-right-radius: 10px;
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
          border: 1px solid black;
          padding: 16px;
          border-radius: 12px;
          width: 100%;
          box-sizing: border-box;
          font-size: 16px;
          text-align: center;
        }

        .button-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
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
          border: 2px solid #006769;
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
          padding: 15px;
          border-radius: 4px;
        }

        .info-content {
          margin-top: 10px;
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
          padding-right: 20px;
          font-size: 16px;
          text-align: center;
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
          right: 20px;
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
      `}</style>
    </div>
  );
};

export default Calculation;
