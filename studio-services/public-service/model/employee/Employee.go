package employee

import "public-service/model"

type Employee struct {
	Id           int64      `json:"id"`
	Uuid         string     `json:"uuid"`
	Code         string     `json:"code"`
	EmployeeType string     `json:"employeeType"`
	User         model.User `json:"user"`
	IsActive     bool       `json:"isActive"`
}
