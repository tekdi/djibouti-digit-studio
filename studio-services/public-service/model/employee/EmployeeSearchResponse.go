package employee

import "public-service/model"

type EmployeeSearchResponse struct {
	ResponseInfo model.ResponseInfo `json:"ResponseInfo"`
	Employees []Employee `json:"Employees"`
}
