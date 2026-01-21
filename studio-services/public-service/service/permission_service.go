package service

import (
	"fmt"
	"log"
	"reflect"
	"public-service/config"
	"public-service/model"
)

type PermissionService struct{}

func NewPermissionService() *PermissionService {
	return &PermissionService{}
}

// ValidateCitizenUpdate checks if a CITIZEN user is allowed to update the application based on its current state
func (s *PermissionService) ValidateCitizenUpdate(req *model.ApplicationRequest, currentApp *model.Application) error {
	log.Println("Starting ValidateCitizenUpdate")
	if config.IsCitizen(req.RequestInfo.UserInfo) {
		if currentApp != nil && currentApp.ProcessInstance != nil && len(*currentApp.ProcessInstance) > 0 {
			// Check if State is not nil
			if (*currentApp.ProcessInstance)[0].State != nil {
				currentState := (*currentApp.ProcessInstance)[0].State.State
				allowedStates := config.GetAllowedStatesForCitizen()

				log.Printf("ValidateCitizenUpdate: Checking state '%s' against allowed %v", currentState, allowedStates)

				if !config.IsStateAllowed(currentState, allowedStates) {
					log.Printf("CITIZEN user attempted to update application in state '%s'. Allowed states: %v", currentState, allowedStates)
					return fmt.Errorf("CITIZEN users cannot update application in current state")
				}
			}
		}
	}
	return nil
}

// ProtectCostEstimation ensures that costEstimation field is handled correctly based on user role and state
func (s *PermissionService) ProtectCostEstimation(req *model.ApplicationRequest, currentApp *model.Application) error {
	log.Println("Starting ProtectCostEstimation")

	isCitizen := config.IsCitizen(req.RequestInfo.UserInfo)
	var currentState string
	if currentApp != nil && currentApp.ProcessInstance != nil && len(*currentApp.ProcessInstance) > 0 {
		if (*currentApp.ProcessInstance)[0].State != nil {
			currentState = (*currentApp.ProcessInstance)[0].State.State
		}
	}
	log.Printf("ProtectCostEstimation: User isCitizen=%v, CurrentState=%s", isCitizen, currentState)

	isRestricted := false
	if isCitizen {
		isRestricted = true
		log.Println("ProtectCostEstimation: User is CITIZEN, restricting access")
	} else {
		allowedStates := config.GetAllowedStatesForCostEstimationUpdate()
		if !config.IsStateAllowed(currentState, allowedStates) {
			isRestricted = true
			log.Printf("ProtectCostEstimation: Employee restricted. State '%s' not in allowed states: %v", currentState, allowedStates)
		} else {
			log.Printf("ProtectCostEstimation: Employee allowed to update in state '%s'", currentState)
		}
	}

	// If user is restricted, enforce the DB state of costEstimation
	if isRestricted {
		log.Println("ProtectCostEstimation: Enforcing DB state for restricted user")
		// Ensure map exists
		if req.Application.AdditionalDetails == nil {
			req.Application.AdditionalDetails = make(map[string]interface{})
		}

		var existingCost interface{}
		var dbHasCost bool
		if currentApp != nil && currentApp.AdditionalDetails != nil {
			existingCost, dbHasCost = currentApp.AdditionalDetails["costEstimation"]
		}

		incomingCost, reqHasCost := req.Application.AdditionalDetails["costEstimation"]

		if reqHasCost {
			if !dbHasCost {
				// Trying to add new cost
				log.Println("ProtectCostEstimation: User attempted to add costEstimation")
				return fmt.Errorf("User is not authorized to add costEstimation")
			}
			// Both have it. Compare.
			if !reflect.DeepEqual(existingCost, incomingCost) {
				log.Println("ProtectCostEstimation: User attempted to modify costEstimation")
				return fmt.Errorf("User is not authorized to update costEstimation")
			}
			// They are equal. Do nothing (allow).
			log.Println("ProtectCostEstimation: costEstimation matches DB, allowing")
		} else {
			// Req doesn't have it.
			if dbHasCost {
				// Restore it.
				req.Application.AdditionalDetails["costEstimation"] = existingCost
				log.Println("ProtectCostEstimation: Restored costEstimation from DB")
			}
		}
	} else {
		log.Println("ProtectCostEstimation: User allowed to modify costEstimation")
	}
	return nil
}
