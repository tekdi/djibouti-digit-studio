package model

type Floor struct {
	FloorNo               int     `json:"floorNo"`
	BuiltUpAreaLiving     float64 `json:"builtUpAreaLiving"`
	BuiltupAreaCommercial float64 `json:"builtupAreaCommercial"`
	TotalAreaPerLevel     float64 `json:"totalAreaPerLevel"`
	FloorCost             float64 `json:"floorCost,omitempty"`
}

type TotalCostBreakdown struct {
	DesignationOfWorks string  `json:"designationOfWorks"`
	Percentage         float64 `json:"percentage"`
	Amount             float64 `json:"amount,omitempty"`
}

type CostEstimation struct {
	CostPerSqmLivingSpace     float64              `json:"costPerSqmLivingSpace"`
	CostPerSqmCommercialSpace float64              `json:"costPerSqmCommercialSpace"`
	RoyaltyPer                float64              `json:"royaltyPer"`
	EqResistancePer           float64              `json:"eqResistancePer"`
	Floors                    []Floor              `json:"floors"`
	TotalBuildingCost         float64              `json:"totalBuildingCost,omitempty"`
	RoyaltyFee                float64              `json:"royaltyFee,omitempty"`
	EqResistanceCost          float64              `json:"eqResistanceCost,omitempty"`
	RegistryServiceFee        float64              `json:"registryServiceFee"`
	TotalTax                  float64              `json:"totalTax,omitempty"`
	TotalTaxWithServiceCharge float64              `json:"totalTaxWithServiceCharge,omitempty"`
	TotalCostBreakdown        []TotalCostBreakdown `json:"totalCostBreakdown,omitempty"`
}
