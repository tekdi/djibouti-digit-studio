package service

import (
	"fmt"
	"log"
	"public-service/config"
	"public-service/model"
	"public-service/repository"
	"public-service/model/employee"
)

type EmployeeService struct {
	restCallRepo repository.RestCallRepository
}

func NewEmployeeService(repo repository.RestCallRepository) *EmployeeService {
	return &EmployeeService{
		restCallRepo: repo,
	}
}

func (s *EmployeeService) SearchEmployeesByRole(role string, tenantId string, requestInfo model.RequestInfo) employee.EmployeeSearchResponse {
	// Ensure UserInfo is not nil to avoid panic in downstream code/logs
	if requestInfo.UserInfo == nil {
		requestInfo.UserInfo = &model.User{}
	}
	
	host := config.GetEnv("HRMS_HOST")
	path := config.GetEnv("HRMS_SEARCH_PATH")

	url := fmt.Sprintf("%s%s?roles=%s&tenantId=%s&isActive=true", host, path, role, tenantId)
	log.Println("Employee service url: " + url)

	body := map[string]interface{}{
		"RequestInfo": requestInfo,
	}
	
	var resp employee.EmployeeSearchResponse
	err := s.restCallRepo.Post(url, body, &resp)
	if err != nil {
		log.Printf("Error fetching employees: %v", err)
		return employee.EmployeeSearchResponse{}
	}	
	
	return resp
}
