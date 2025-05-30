import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import axios from 'axios';

const Calculation = () => {
  const { t } = useTranslation();
  const [floorData, setFloorData] = useState([
    { name: t('CALCULATION_RDC'), residentialArea: 0, commercialArea: 0, totalArea: 0, cost: 0 },
    { name: t('CALCULATION_1ER_ETAGE'), residentialArea: 0, commercialArea: 0, totalArea: 0, cost: 0 },
    { name: t('CALCULATION_TERRASSE'), residentialArea: 0, commercialArea: 0, totalArea: 0, cost: 0 }
  ]);

  const [feeRates, setFeeRates] = useState({
    residentialCost: 0,
    commercialCost: 0,
    royaltyFeePercentage: 0,
    seismicFeePercentage: 0,
    registryServiceFee: 0
  });

  const [plotArea, setPlotArea] = useState(0);
  const [calculatedFees, setCalculatedFees] = useState({
    buildingPermitFees: 0,
    seismicFees: 0,
    totalFees: 0,
    totalFeesWithService: 0,
    totalProjectValue: 0
  });

  const [plotInfo, setPlotInfo] = useState({
    seismicFeesCalculated: 0,
    cos: 0
  });

  const [costBreakdown, setCostBreakdown] = useState([
    { name: t('CALCULATION_TERRASSEMENT'), percentage: 0, amount: 0 },
    { name: t('CALCULATION_FONDATION'), percentage: 0, amount: 0 },
    { name: t('CALCULATION_MACONNERIE'), percentage: 0, amount: 0 },
    { name: t('CALCULATION_BETON_ARME'), percentage: 0, amount: 0 },
    { name: t('CALCULATION_REVETEMENTS'), percentage: 0, amount: 0 },
    { name: t('CALCULATION_MENUISERIES'), percentage: 0, amount: 0 },
    { name: t('CALCULATION_ELECTRICITE'), percentage: 0, amount: 0 },
    { name: t('CALCULATION_PLOMBERIE'), percentage: 0, amount: 0 },
    { name: t('CALCULATION_ASSAINISSEMENT'), percentage: 0, amount: 0 }
  ]);

  useEffect(() => {
    // Function to fetch data from API
    const fetchData = async () => {
      try {
        // API endpoint will need to be updated when it's available
        const response = await axios.get('/api/bpa/application/latest');

        // Extract fee rates from response
        const costEstimation = response.data.Application[0].additionalDetails.costEstimation;
        setFeeRates({
          residentialCost: costEstimation?.costPerSqmLivingSpace,
          commercialCost: costEstimation?.costPerSqmCommercialSpace,
          royaltyFeePercentage: costEstimation?.royaltyPer,
          seismicFeePercentage: costEstimation?.eqResistancePer,
          registryServiceFee: costEstimation?.registryServiceFee
        });

        // Extract floor data from response
        const apiFloors = costEstimation.floors;
        if (apiFloors && apiFloors.length > 0) {
          const mappedFloors = apiFloors.map((floor, index) => {
            let floorName;
            if (index === 0) {
              floorName = t('CALCULATION_RDC');
            } else if (index === 1) {
              floorName = t('CALCULATION_1ER_ETAGE');
            } else if (index === 2) {
              floorName = t('CALCULATION_TERRASSE');
            } else {
              floorName = `${t('CALCULATION_ETAGE')} ${index}`;
            }

            return {
              name: floorName,
              residentialArea: floor?.builtUpAreaLiving || 0,
              commercialArea: floor?.builtupAreaCommercial || 0,
              totalArea: floor?.totalAreaPerLevel || 0,
              cost: floor?.floorCost || 0
            };
          });
          setFloorData(mappedFloors);
        }

        // Extract total values
        setCalculatedFees({
          buildingPermitFees: costEstimation?.royaltyFee || 0,
          seismicFees: costEstimation?.eqResistanceCost || 0,
          totalFees: costEstimation?.totalTax || 0,
          totalFeesWithService: costEstimation?.totalTaxWithServiceCharge || 0,
          totalProjectValue: costEstimation?.totalBuildingCost || 0
        });

        // Update cost breakdown from API when available
        // This is placeholder logic - replace with actual API data mapping
        if (costEstimation?.totalBuildingCost) {
          const total = costEstimation.totalBuildingCost;
          const updatedBreakdown = costBreakdown.map(item => ({
            ...item,
            amount: Math.round(total * (item.percentage / 100))
          }));
          setCostBreakdown(updatedBreakdown);
        }

        // Update plot area and info values
        const landandProjectDetails = response.data.Application[0].serviceDetails.landandProjectDesignDetails?.[0];
        if (landandProjectDetails) {
          setPlotArea(landandProjectDetails.area ? Number(landandProjectDetails.area) : 0);

          // Update plot info (these fields might be differently named in the API)
          setPlotInfo({
            seismicFeesCalculated: landandProjectDetails.seismicFeesCalculated || 0,
            cos: landandProjectDetails.projectedCos || 0
          });
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // Uncomment this when the API is ready
    // fetchData();
  }, [t]);

  const calculateTotalCost = () => {
    return costBreakdown.reduce((total, item) => total + item.amount, 0);
  };

  const calculateTotalPercentage = () => {
    return costBreakdown.reduce((total, item) => total + item.percentage, 0);
  };

  const addFloor = () => {
    setFloorData([...floorData, { name: `${t('CALCULATION_ETAGE')} ${floorData.length}`, residentialArea: 0, commercialArea: 0, totalArea: 0, cost: 0 }]);
  };

  const calculateFees = async () => {
    // When API is ready, we'll call it here
    try {
      // Mock API call for now - replace with actual API call when ready
      // const response = await axios.post('/api/bpa/application/calculate', {
      //   floors: floorData.map(floor => ({
      //     builtUpAreaLiving: floor.residentialArea,
      //     builtupAreaCommercial: floor.commercialArea
      //   }))
      // });

      // For now, just update the UI with calculated values
      const updatedFloors = [...floorData];
      updatedFloors.forEach((floor, index) => {
        updatedFloors[index].cost = Math.round(
          (floor.residentialArea * feeRates.residentialCost) +
          (floor.commercialArea * feeRates.commercialCost)
        );
      });
      setFloorData(updatedFloors);

      alert(t('CALCULATION_CALCUL_EFFECTUE'));
    } catch (error) {
      console.error('Error calculating fees:', error);
      alert('Error calculating fees');
    }
  };

  return (
    <div className="calculation-container">
      <div className="calculation-wrapper">
        <h1 className="page-title">{t('CALCULATION_TITLE')}</h1>

        <div className="fee-rates">
          <div className="fee-rate-card">
            <h3 className='fee-rate-card-title'>{t('CALCULATION_COST_RESIDENTIAL')}</h3>
            <p className='fee-rate-card-value'>FDj {feeRates.residentialCost.toLocaleString()}</p>
          </div>

          <div className="fee-rate-card">
            <h3 className='fee-rate-card-title'>{t('CALCULATION_COST_COMMERCIAL')}</h3>
            <p className='fee-rate-card-value'>FDj {feeRates.commercialCost.toLocaleString()}</p>
          </div>

          <div className="fee-rate-card">
            <h3 className='fee-rate-card-title'>{t('CALCULATION_ROYALTY_FEES')}</h3>
            <p className='fee-rate-card-value'>{feeRates.royaltyFeePercentage} % du devis estimatif</p>
          </div>

          <div className="fee-rate-card">
            <h3 className='fee-rate-card-title'>{t('CALCULATION_SEISMIC_FEES')}</h3>
            <p className='fee-rate-card-value'>{feeRates.seismicFeePercentage} % du devis estimatif</p>
          </div>

          <div className="fee-rate-card">
            <h3 className='fee-rate-card-title'>{t('CALCULATION_REGISTRY_SERVICE_FEE')}</h3>
            <p className='fee-rate-card-value'>FDj {feeRates.registryServiceFee.toLocaleString()}</p>
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
                      {floor.name === t('CALCULATION_TERRASSE') ? (
                        <div className="input-with-unit">
                          <input
                            type="number"
                            value={floor.totalArea === 0 ? "" : floor.totalArea}
                            onChange={(e) => {
                              const updatedFloors = [...floorData];
                              updatedFloors[index].totalArea = e.target.value ? Number(e.target.value) : 0;
                              setFloorData(updatedFloors);
                            }}
                            placeholder=""
                          />
                          <span className="unit">m</span>
                        </div>
                      ) : (
                        floor.totalArea > 0 ? `${floor.totalArea}m` : "m"
                      )}
                    </td>
                    <td className="cost-col">
                      {floor.name === t('CALCULATION_TERRASSE') ? (
                        <input
                          type="number"
                          value={floor.cost === 0 ? "" : floor.cost}
                          onChange={(e) => {
                            const updatedFloors = [...floorData];
                            updatedFloors[index].cost = e.target.value ? Number(e.target.value) : 0;
                            setFloorData(updatedFloors);
                          }}
                          className="cost-input"
                        />
                      ) : (
                        floor.cost ? floor.cost.toLocaleString() : 0
                      )}
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
                <span className='fee-rate-card-value'>{plotArea}</span>
              </div>
              <div className="fee-rate-card">
                <span className='fee-rate-card-title'>{t('CALCULATION_SEISMIC_FEES_CALCULATED')}</span>
                <span className='fee-rate-card-value'>{plotInfo.seismicFeesCalculated}</span>
              </div>
              <div className="fee-rate-card">
                <span className='fee-rate-card-title'>{t('CALCULATION_COS')}</span>
                <span className='fee-rate-card-value'>{plotInfo.cos}</span>
              </div>
              <div className="fee-rate-card">
                <span className='fee-rate-card-title'>{t('CALCULATION_BUILDING_PERMIT_TAXES')}</span>
                <span className='fee-rate-card-value'>{calculatedFees.buildingPermitFees.toLocaleString()} FDj</span>
              </div>
              <div className="fee-rate-card">
                <span className='fee-rate-card-title'>{t('CALCULATION_SEISMIC_FEES_CALCULATED')}</span>
                <span className='fee-rate-card-value'>{calculatedFees.seismicFees.toLocaleString()} FDj</span>
              </div>
              <div className="fee-rate-card">
                <span className='fee-rate-card-title'>{t('CALCULATION_TOTAL_TAXES')}</span>
                <span className='fee-rate-card-value'>{calculatedFees.totalFees.toLocaleString()} FDj</span>
              </div>
              <div className="fee-rate-card">
                <span className='fee-rate-card-title'>{t('CALCULATION_TOTAL_TAXES_WITH_SERVICE')}</span>
                <span className='fee-rate-card-value'>{calculatedFees.totalFeesWithService.toLocaleString()} FDj</span>
              </div>
              <div className="fee-rate-card">
                <span className='fee-rate-card-title'>{t('CALCULATION_PROJECT_TOTAL_VALUE')}</span>
                <span className='fee-rate-card-value'>{calculatedFees.totalProjectValue.toLocaleString()} FDj</span>
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
          padding: 20px;
          margin: 50px;
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
      `}</style>
    </div>
  );
};

export default Calculation;
