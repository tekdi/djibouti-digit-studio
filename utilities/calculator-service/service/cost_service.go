package service

import (
	"buildingcost/config"
	"buildingcost/model"
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"
)

func ProcessApplications(code string, request map[string]interface{}) error {
	switch code {
	case "BPA_PCO":
		return processBpaCalculation(request)
	// Add more cases like "land", "buildingcost" here
	default:
		return errors.New("unsupported calculation code in request url: " + code)
	}
}

func processBpaCalculation(request map[string]interface{}) error {
	apps, ok := request["Application"].([]interface{})
	if !ok {
		return errors.New("invalid Application array")
	}

	for _, raw := range apps {
		app, ok := raw.(map[string]interface{})
		if !ok {
			continue
		}

		addDetails, ok := app["additionalDetails"].(map[string]interface{})
		if !ok {
			continue
		}

		costData, ok := addDetails["costEstimation"].(map[string]interface{})
		if !ok {
			continue
		}
		costJson, _ := json.Marshal(costData)

		var ce model.CostEstimation
		if err := json.Unmarshal(costJson, &ce); err != nil {
			continue
		}

		var total float64
		for i := range ce.Floors {
			f := &ce.Floors[i]
			f.TotalAreaPerLevel = f.BuiltUpAreaLiving + f.BuiltupAreaCommercial
			f.FloorCost = (f.BuiltUpAreaLiving * ce.CostPerSqmLivingSpace) + (f.BuiltupAreaCommercial * ce.CostPerSqmCommercialSpace)
			total += f.FloorCost
		}

		ce.TotalBuildingCost = total
		ce.RoyaltyFee = total * ce.RoyaltyPer / 100
		ce.EqResistanceCost = total * ce.EqResistancePer / 100

		ce.TotalTax = ce.RoyaltyFee + ce.EqResistanceCost
		ce.TotalTaxWithServiceCharge = ce.TotalTax + ce.RegistryServiceFee

		var updatedBreakdowns []model.TotalCostBreakdown
		for _, wb := range ce.TotalCostBreakdown {
			wb.Amount = roundTo2Decimal(total * wb.Percentage / 100)
			updatedBreakdowns = append(updatedBreakdowns, wb)
		}
		ce.TotalCostBreakdown = updatedBreakdowns

		updatedJson, _ := json.Marshal(ce)
		var updatedMap map[string]interface{}
		json.Unmarshal(updatedJson, &updatedMap)

		addDetails["costEstimation"] = updatedMap
		app["additionalDetails"] = addDetails
	}
	return nil
}
func roundTo2Decimal(value float64) float64 {
	str := fmt.Sprintf("%.2f", value)   // format as string with 2 decimals
	f, _ := strconv.ParseFloat(str, 64) // parse back to float64
	return f
}

func CreateDemands(code string, request map[string]interface{}) (map[string]interface{}, error) {
	switch code {
	case "BPA_PCO":
		return createDemandsForPco(code, request)
	default:
		return nil, fmt.Errorf("unsupported code in request url: %s", code)
	}
}

func createDemandsForPco(code string, request map[string]interface{}) (map[string]interface{}, error) {

	var taxAmount float64
	var businessService string

	if app, ok := request["Application"].(map[string]interface{}); ok {
		businessService = app["businessService"].(string)
		if additionalDetails, ok := app["additionalDetails"].(map[string]interface{}); ok {
			if costEstimation, ok := additionalDetails["costEstimation"].(map[string]interface{}); ok {
				if val, ok := costEstimation["totalTaxWithServiceCharge"].(float64); ok {
					taxAmount = val
				}
			}
		}
	}

	log.Println("Calling MDMS......")
	host := config.GetEnv("EGOV_MDMS_HOST")
	endpoint := config.GetEnv("EGOV_MDMS_SEARCH_ENDPOINT")

	if host == "" || endpoint == "" {
		return nil, errors.New("host or endpoint not set in environment variables")
	}

	url := host + endpoint
	payload := mapDemandPayload(businessService, code, request)

	// Call external API
	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(bodyBytes))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var apiResponse map[string]interface{}
	if err := json.Unmarshal(respBody, &apiResponse); err != nil {
		return nil, err
	}

	demandDetails := []map[string]interface{}{}

	mdmsRes := apiResponse["MdmsRes"].(map[string]interface{})

	log.Println("MDMS response : ", mdmsRes)

	studio := mdmsRes["Studio"].(map[string]interface{})
	serviceConfigs := studio["ServiceConfiguration"].([]interface{})

	first := true

	for _, item := range serviceConfigs {
		conf := item.(map[string]interface{})
		if bill, ok := conf["bill"].(map[string]interface{}); ok {
			if taxHeads, ok := bill["taxHead"].([]interface{}); ok {
				for _, th := range taxHeads {
					thMap := th.(map[string]interface{})
					taxCode := thMap["code"].(string)

					amount := 0.0
					if first {
						amount = taxAmount
						first = false
					}

					// Add sample amount or logic to calculate
					demandDetails = append(demandDetails, map[string]interface{}{
						"taxhead": taxCode,
						"amount":  amount, // Replace with real calculation logic if needed
					})
				}
			}
		}
	}

	// Build final response with demand details
	finalResponse := map[string]interface{}{

		"demandDetails": demandDetails,
	}

	log.Println("Demand details : ", finalResponse)

	return finalResponse, nil
}

func mapDemandPayload(businessService string, code string, request map[string]interface{}) map[string]interface{} {
	// Default RequestInfo
	requestInfo := map[string]interface{}{
		"apiId":              "Rainmaker",
		"authToken":          nil,
		"msgId":              "default-msg-id",
		"plainAccessRequest": map[string]interface{}{},
	}

	// Try to copy msgId and authToken from incoming request if present
	if ri, ok := request["RequestInfo"].(map[string]interface{}); ok {
		if apiId, exists := ri["apiId"]; exists {
			requestInfo["apiId"] = apiId
		}
		if msgId, exists := ri["msgId"]; exists {
			requestInfo["msgId"] = msgId
		}
		if authToken, exists := ri["authToken"]; exists {
			requestInfo["authToken"] = authToken
		}
		if plainAccess, exists := ri["plainAccessRequest"]; exists {
			requestInfo["plainAccessRequest"] = plainAccess
		}
	}

	// Default tenantId
	tenantId := "dj"
	if criteria, ok := request["MdmsCriteria"].(map[string]interface{}); ok {
		if tid, exists := criteria["tenantId"].(string); exists {
			tenantId = tid
		}
	}
	filter := fmt.Sprintf(`$[?(@.service == '%s')]`, businessService)

	// Construct and return mapped payload
	return map[string]interface{}{
		"RequestInfo": requestInfo,
		"MdmsCriteria": map[string]interface{}{
			"tenantId": tenantId,
			"moduleDetails": []map[string]interface{}{
				{
					"moduleName": "Studio",
					"masterDetails": []map[string]interface{}{
						{"name": "ServiceConfiguration",
							"filter": filter},
					},
				},
			},
		},
	}
}
