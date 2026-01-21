package config

import (
	"os"
	"strings"
	"public-service/model"
)

// GetAllowedStatesForCitizen returns the list of states where CITIZEN users can update applications
func GetAllowedStatesForCitizen() []string {
	states := os.Getenv("CITIZEN_ALLOWED_STATES")
	if states == "" {
		return []string{"INITIATED", "PENDING_ACTION_BY_ARCHITECT", "PENDING_ACTION_BY_SOURCE", "AWAITING_CITIZEN_PAYMENT"}
	}
	return strings.Split(states, ",")
}

// GetAllowedStatesForCostEstimationUpdate returns the list of states where cost estimation can be updated
func GetAllowedStatesForCostEstimationUpdate() []string {
	states := os.Getenv("COST_ESTIMATION_UPDATE_STATES")
	if states == "" {
		return []string{"PENDING_ACTION_BY_AGENT", "AWAITING_ON_CALCULATION_FEE_BY_SRA_AGENT", "UNDER_REVIEW_BY_DIRECTOR", "PENDING_REVIEW_BY_DIRECTOR", "AWAITING_ON_DIRECTOR_REVIEW"}
	}
	return strings.Split(states, ",")
}

// IsCitizen checks if the user has only CITIZEN role
func IsCitizen(userInfo *model.User) bool {
	if userInfo == nil || len(userInfo.Roles) == 0 {
		return false
	}
	for _, role := range userInfo.Roles {
		if role.Code == "CITIZEN" {
			return true
		}
	}
	return false
}

// IsStateAllowed checks if a state is in the allowed list
func IsStateAllowed(state string, allowedStates []string) bool {
	for _, s := range allowedStates {
		if s == state {
			return true
		}
	}
	return false
}
