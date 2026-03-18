package controller

import (
	"context"
	"os"

	//"crypto/internal/fips140/edwards25519/field"
	"encoding/json"
	"log"
	"net/http"
	"public-service/config"
	"public-service/model"
	"public-service/service"
	"public-service/utils"
	"strconv"
	"strings"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type ApplicationController struct {
	service            *service.ApplicationService
	workflowIntegrator *service.WorkflowIntegrator
	individualService  *service.IndividualService
	enrichmentService  *service.EnrichmentService
	smsService         *service.SMSService
	indexerService     *service.IndexerService
	employeeService    *service.EmployeeService
	permissionService  *service.PermissionService
	userService        *service.UserService
}

func NewApplicationController(service *service.ApplicationService, workflowIntegrator *service.WorkflowIntegrator, individualService *service.IndividualService, enrichmentService *service.EnrichmentService, smsService *service.SMSService, indexerService *service.IndexerService, employeeService *service.EmployeeService, permissionService *service.PermissionService, userService *service.UserService) *ApplicationController {
	return &ApplicationController{service: service, workflowIntegrator: workflowIntegrator, individualService: individualService, enrichmentService: enrichmentService, smsService: smsService, indexerService: indexerService, employeeService: employeeService, permissionService: permissionService, userService: userService}
}

func (c *ApplicationController) CreateApplicationHandler(w http.ResponseWriter, r *http.Request) {
	serviceCode := mux.Vars(r)["serviceCode"]

	if serviceCode == "" {
		utils.WriteErrorResponse(w, http.StatusBadRequest, "Path variable 'serviceCode' is required")
		return
	}

	var req model.ApplicationRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusBadRequest, "Invalid request payload: "+err.Error())
		return
	}

	tenantID := r.Header.Get("X-Tenant-Id")
	if tenantID == "" {
		utils.WriteErrorResponse(w, http.StatusBadRequest, "Missing header 'X-Tenant-Id'")
		return
	}

	if req.Application.TenantId == "" {
		req.Application.TenantId = tenantID
	}
	if req.Application.ServiceCode == "" {
		req.Application.ServiceCode = serviceCode
	}
	// mdmsSearch := service.NewMDMSService(nil)
	//MDMS Search
	// fields := mdmsSearch.MdmsSearchWithFilter(req)

	// Print only the fields part
	// fmt.Printf("Fields: %+v\n", fields)

	// Validate the service details against the fields schema
	// if err := mdmsSearch.ValidateServiceDetailsWithSchema(req, fields); err != nil {
	// utils.WriteErrorResponse(w, http.StatusBadRequest, "Service details validation failed: "+err.Error())
	// return
	// }

	req, err = c.enrichmentService.EnrichApplicationsWithIdGen(req, "application")
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusBadRequest, "Enrichment failed: "+err.Error())
		return
	}

	for i := range req.Application.Applicants {
		applicant := req.Application.Applicants[i]
		mobile := strconv.FormatInt(applicant.MobileNumber, 10)

		// Log input applicant in JSON
		if data, _ := json.MarshalIndent(applicant, "", "  "); true {
			log.Println("Processing applicant:", string(data))
		}

		criteria := map[string]interface{}{
			"mobileNumber": mobile,
			"tenantId":     req.Application.TenantId,
		}

		// Check if individual exists
		resp := c.individualService.GetIndividual(req.RequestInfo, criteria)
		if data, _ := json.MarshalIndent(resp, "", "  "); true {
			log.Println("GetIndividual response:", string(data))
		}

		if len(resp.Individual) == 0 {
			// If not found, create individual
			createdResp := c.individualService.CreateUser(applicant, req.RequestInfo)
			if data, _ := json.MarshalIndent(createdResp, "", "  "); true {
				log.Println("Created individual response:", string(data))
			}

			if createdResp.Individual.IndividualId != "" {
				req.Application.Applicants[i].UserId = createdResp.Individual.IndividualId
				req.Application.Applicants[i].UserUuid = createdResp.Individual.UserUuid
			} else {
				log.Println("Failed to create individual for applicant:", applicant.Name)
				utils.WriteErrorResponse(w, http.StatusInternalServerError, "Failed to create individual")
				return
			}
		} else {
			// Individual exists, update applicant UserId and UserUuid
			req.Application.Applicants[i].UserId = resp.Individual[0].IndividualId
			req.Application.Applicants[i].UserUuid = resp.Individual[0].UserUuid
			result := map[string]string{
				"applicant": applicant.Name,
				"userId":    resp.Individual[0].IndividualId,
				"userUuid":  resp.Individual[0].UserUuid,
			}
			if data, _ := json.MarshalIndent(result, "", "  "); true {
				log.Println("Existing individual found:", string(data))
			}
		}
	}

	// Call workflow integrator on success
	err = c.workflowIntegrator.CallWorkflow(&req)
	if err != nil {
		log.Printf("Workflow integration failed: %v", err)
		// Optional: return HTTP error or log only
	}
	ctx := context.Background()
	log.Println("inside CreateApplicationHandler")
	res, err := c.service.CreateApplication(ctx, req, serviceCode)
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	_, err2 := c.smsService.SendSMS(req, req.Application.TenantId, req.Application.Applicants)
	if err2 != nil {
		log.Printf("error sending sms  %v", err2)
	}
	log.Printf("ProcessInstance enriched: %+v", res.Application.ProcessInstance)

	err = c.indexerService.SendRequestToIndexerForParallelWorkflow(res, req.RequestInfo, os.Getenv("SAVE_PUBLIC_SERVICE_APPLICATION_TOPIC_INDEXER"))
	if err != nil {
		log.Printf("error sending to indexer topic   %v", err2)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

func (c *ApplicationController) SearchApplicationHandler(w http.ResponseWriter, r *http.Request) {
	var criteria model.SearchRequest
	serviceCode := mux.Vars(r)["serviceCode"]

	if serviceCode == "" {
		utils.WriteErrorResponse(w, http.StatusBadRequest, "Path variable 'serviceCode' is required")
		return
	}

	tenantID := r.Header.Get("X-Tenant-Id")
	if tenantID == "" {
		utils.WriteErrorResponse(w, http.StatusBadRequest, "Missing header 'X-Tenant-Id'")
		return
	}

	AuthToken := r.Header.Get("auth-token")
	if AuthToken == "" {
		http.Error(w, "auth-token header is required", http.StatusBadRequest)
		return
	}

	// Resolve caller identity server-side from the auth-token.
	callerUser, err := c.userService.GetUserFromAuthToken(AuthToken, tenantID)
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusUnauthorized, "Invalid or expired auth token")
		return
	}

	if criteria.SearchCriteria.TenantId == "" {
		criteria.SearchCriteria.TenantId = tenantID
	}
	if criteria.SearchCriteria.ServiceCode == "" {
		criteria.SearchCriteria.ServiceCode = serviceCode
	}

	module := r.URL.Query().Get("module")
	businessService := r.URL.Query().Get("businessService")
	status := r.URL.Query().Get("status")
	applicationNumber := r.URL.Query().Get("applicationNumber")
	userId := r.URL.Query().Get("userId")
	sortBy := r.URL.Query().Get("sortBy")
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil {
			criteria.SearchCriteria.Limit = limit
		}
	}
	if offsetStr := r.URL.Query().Get("offset"); offsetStr != "" {
		if offset, err := strconv.Atoi(offsetStr); err == nil {
			criteria.SearchCriteria.Offset = offset
		}
	}
	if sortBy != "" {
		criteria.SearchCriteria.SortBy = sortBy
	}
	if businessService != "" {
		criteria.SearchCriteria.BusinessService = businessService
	}
	if status != "" {
		criteria.SearchCriteria.Status = status
	}
	if module != "" {
		criteria.SearchCriteria.Module = module
	}
	if applicationNumber != "" {
		criteria.SearchCriteria.ApplicationNumber = applicationNumber
	}
	if userId != "" {
		criteria.SearchCriteria.UserId = userId
	}
	if idsParam := r.URL.Query().Get("ids"); idsParam != "" {
		criteria.SearchCriteria.Ids = strings.Split(idsParam, ",")
	}
	log.Println("inside search", criteria.SearchCriteria)
	ctx := context.Background()
	res, err := c.service.SearchApplication(ctx, criteria.SearchCriteria, AuthToken)
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	// Non-admin callers may only see applications where they are the creator, an applicant,
	// or associated via workflow (current assignee for citizens; full history for employees).
	if !config.IsStudioAdmin(callerUser) && len(res.Application) > 0 {
		callerUUID := callerUser.Uuid
		isCitizenOrArchitect := config.IsCitizen(callerUser) || config.IsBPAArchitect(callerUser)

		// Resolve individual ID — only needed for CITIZEN / BPA_ARCHITECT applicant check.
		callerIndividualId := ""
		if isCitizenOrArchitect {
			callerIndividualId = c.resolveCallerIndividualId(callerUUID.String(), tenantID, AuthToken, callerUser)
		}

		// For employees, fetch full workflow history filtered by their UUID in one batch call.
		var workflowAccessible map[string]bool
		if !isCitizenOrArchitect {
			appNumbers := make([]string, 0, len(res.Application))
			for _, app := range res.Application {
				appNumbers = append(appNumbers, app.ApplicationNumber)
			}
			accessible, err := c.workflowIntegrator.SearchProcessInstancesByAssignee(
				tenantID,
				strings.Join(appNumbers, ","),
				criteria.SearchCriteria.BusinessService,
				callerUUID.String(),
				AuthToken,
			)
			if err != nil {
				log.Printf("workflow assignee search failed: %v", err)
			} else {
				workflowAccessible = accessible
			}
		}

		var filtered []model.Application
		for _, app := range res.Application {
			var accessible bool
			if isCitizenOrArchitect {
				accessible = isApplicationAccessible(app, callerUUID, callerIndividualId)
			} else {
				accessible = workflowAccessible[app.ApplicationNumber]
			}
			if accessible {
				filtered = append(filtered, app)
			}
		}

		if len(filtered) == 0 {
			log.Printf("no accessible applications found, returning 403")
			utils.WriteErrorResponse(w, http.StatusForbidden, "Access denied")
			return
		}
		res.Application = filtered
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

// resolveCallerIndividualId fetches the individual ID for the given user UUID.
func (c *ApplicationController) resolveCallerIndividualId(callerUUID, tenantID, authToken string, user *model.User) string {
	requestInfo := model.RequestInfo{AuthToken: authToken, UserInfo: user}
	indResp := c.individualService.GetIndividual(requestInfo, map[string]any{
		"userUuid": callerUUID,
		"tenantId": tenantID,
	})
	if len(indResp.Individual) > 0 {
		return indResp.Individual[0].IndividualId
	}
	return ""
}

// isApplicationAccessible returns true if the caller is the creator, an applicant,
// or a workflow actor (assignee or assigner) of the given application.
func isApplicationAccessible(app model.Application, callerUUID uuid.UUID, callerIndividualId string) bool {
	// Creator check
	if app.AuditDetails.CreatedBy == callerUUID {
		return true
	}

	// Applicant check — match by individual ID or by user UUID directly
	callerUUIDStr := callerUUID.String()
	for _, applicant := range app.Applicants {
		if applicant.UserUuid == callerUUIDStr {
			return true
		}
		if callerIndividualId != "" && applicant.UserId == callerIndividualId {
			return true
		}
	}

	// Workflow history check (assignee, assigner, or applicant across all process instances)
	if app.ProcessInstance != nil {
		callerUUIDStr := callerUUID.String()
		for _, pi := range *app.ProcessInstance {
			if pi.Assignee != nil && pi.Assignee.Uuid == callerUUID {
				return true
			}
			if pi.Assigner != nil && pi.Assigner.Uuid == callerUUID {
				return true
			}
			if pi.ApplicantUuid == callerUUIDStr {
				return true
			}
		}
	}

	return false
}

func (c *ApplicationController) UpdateApplicationHandler(w http.ResponseWriter, r *http.Request) {
	serviceCode := mux.Vars(r)["serviceCode"]

	if serviceCode == "" {
		utils.WriteErrorResponse(w, http.StatusBadRequest, "Path variable 'serviceCode' is required")
		return
	}

	tenantID := r.Header.Get("X-Tenant-Id")
	if tenantID == "" {
		utils.WriteErrorResponse(w, http.StatusBadRequest, "Missing header 'X-Tenant-Id'")
		return
	}

	AuthToken := r.Header.Get("auth-token")
	if AuthToken == "" {
		log.Println("auth-token", AuthToken)
	}

	var req model.ApplicationRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.Printf("Update Service error: %v", err)
		utils.WriteErrorResponse(w, http.StatusBadRequest, "Invalid request payload: "+err.Error())
		return
	}

	log.Println("inside update", req)

	if req.Application.TenantId == "" {
		req.Application.TenantId = tenantID
	}
	if req.Application.ServiceCode == "" {
		req.Application.ServiceCode = serviceCode
	}

	// Fetch existing application to get current state
	ctx := context.Background()
	searchCriteria := model.SearchCriteria{
		TenantId:          req.Application.TenantId,
		ApplicationNumber: req.Application.ApplicationNumber,
		ServiceCode:       serviceCode,
	}

	searchRes, err := c.service.SearchApplication(ctx, searchCriteria, AuthToken)
	if err != nil {
		log.Printf("Failed to fetch existing application: %v", err)
	}

	var currentApp *model.Application
	if len(searchRes.Application) > 0 {
		currentApp = &searchRes.Application[0]
	}

	// Validate CITIZEN update permission
	if err := c.permissionService.ValidateCitizenUpdate(&req, currentApp); err != nil {
		utils.WriteErrorResponse(w, http.StatusForbidden, err.Error())
		return
	}

	// Protect costEstimation field
	if err := c.permissionService.ProtectCostEstimation(&req, currentApp); err != nil {
		utils.WriteErrorResponse(w, http.StatusForbidden, err.Error())
		return
	}

	req, err = c.enrichmentService.EnrichApplicationsWithDemand(req)
	if err != nil {
		log.Printf("Deamnd Creation failed: %v", err)
		utils.WriteErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	if req.Application.Workflow.Action != "" {
		// Assignee mapping logic for CREATE/EDIT action and CITIZEN channel
		if (req.Application.Workflow.Action == "CREATE" || req.Application.Workflow.Action == "EDIT") && req.Application.Channel == "CITIZEN" {
			c.assignEmployeesBasedOnPermit(&req)
		}

		// Call workflow integrator on success
		err = c.workflowIntegrator.CallWorkflow(&req)
		if err != nil {
			log.Printf("Workflow integration failed: %v", err)
			utils.WriteErrorResponse(w, http.StatusInternalServerError, err.Error())
			return
		}
	}
	res, err := c.service.UpdateApplication(ctx, req, serviceCode)
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	log.Printf("ProcessInstance enriched: %+v", res.Application.ProcessInstance)
	_, err2 := c.smsService.SendSMS(req, req.Application.TenantId, req.Application.Applicants)
	if err2 != nil {
		log.Printf("error sending sms  %v", err2)
	}
	err = c.indexerService.SendRequestToIndexerForParallelWorkflow(res, req.RequestInfo, os.Getenv("UPDATE_PUBLIC_SERVICE_APPLICATION_TOPIC_INDEXER"))
	if err != nil {
		log.Printf("error sending to indexer topic   %v", err2)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

func (c *ApplicationController) SearchMyApplicationHandler(w http.ResponseWriter, r *http.Request) {
	var criteria model.SearchRequest

	tenantID := r.Header.Get("X-Tenant-Id")
	if tenantID == "" {
		utils.WriteErrorResponse(w, http.StatusBadRequest, "Missing header 'X-Tenant-Id'")
		return
	}

	AuthToken := r.Header.Get("auth-token")
	if AuthToken == "" {
		http.Error(w, "auth-token header is required", http.StatusBadRequest)
		return
	}

	// Resolve the calling user's identity server-side from the auth-token.
	callerUser, err := c.userService.GetUserFromAuthToken(AuthToken, tenantID)
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusUnauthorized, "Invalid or expired auth token")
		return
	}

	criteria.SearchCriteria.TenantId = tenantID

	if config.IsStudioAdmin(callerUser) {
		if createdBy := r.URL.Query().Get("createdBy"); createdBy != "" {
			criteria.SearchCriteria.CreatedBy = createdBy
		}
		if userId := r.URL.Query().Get("userId"); userId != "" {
			criteria.SearchCriteria.UserId = userId
		}
	} else {
		createdBy := r.URL.Query().Get("createdBy")
		userId := r.URL.Query().Get("userId")

		if createdBy == "" && userId == "" {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(model.SearchResponse{
				Application: []model.Application{},
			})
			return
		}

		atLeastOneValid := false
		// Validate createdBy against the authenticated user's UUID.
		if createdBy != "" {
			if createdBy == callerUser.Uuid.String() {
				criteria.SearchCriteria.CreatedBy = createdBy
				atLeastOneValid = true
			}
		}

		// Validate userId against the authenticated user's individual ID.
		if userId != "" {
			callerIndividualId := c.resolveCallerIndividualId(callerUser.Uuid.String(), tenantID, AuthToken, callerUser)
			if userId == callerIndividualId {
				criteria.SearchCriteria.UserId = userId
				atLeastOneValid = true
			}
		}

		if !atLeastOneValid {
			utils.WriteErrorResponse(w, http.StatusForbidden, "Access denied")
			return
		}
	}

	module := r.URL.Query().Get("module")
	businessService := r.URL.Query().Get("businessService")
	status := r.URL.Query().Get("status")
	applicationNumber := r.URL.Query().Get("applicationNumber")
	sortBy := r.URL.Query().Get("sortBy")
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil {
			criteria.SearchCriteria.Limit = limit
		}
	}
	if offsetStr := r.URL.Query().Get("offset"); offsetStr != "" {
		if offset, err := strconv.Atoi(offsetStr); err == nil {
			criteria.SearchCriteria.Offset = offset
		}
	}
	if sortBy != "" {
		criteria.SearchCriteria.SortBy = sortBy
	}
	if businessService != "" {
		criteria.SearchCriteria.BusinessService = businessService
	}
	if status != "" {
		criteria.SearchCriteria.Status = status
	}
	if module != "" {
		criteria.SearchCriteria.Module = module
	}
	if applicationNumber != "" {
		criteria.SearchCriteria.ApplicationNumber = applicationNumber
	}
	if idsParam := r.URL.Query().Get("ids"); idsParam != "" {
		criteria.SearchCriteria.Ids = strings.Split(idsParam, ",")
	}
	log.Println("inside search", criteria.SearchCriteria)
	ctx := context.Background()
	res, err := c.service.SearchApplication(ctx, criteria.SearchCriteria, AuthToken)
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

func (c *ApplicationController) CalculateHandler(w http.ResponseWriter, r *http.Request) {
	var req model.ApplicationRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusBadRequest, "Invalid request payload: "+err.Error())
		return
	}

	res, err := c.enrichmentService.GetCalculation(req)
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusInternalServerError, "Calculation error: "+err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

func (c *ApplicationController) assignEmployeesBasedOnPermit(req *model.ApplicationRequest) {
	if role, ok := config.GetRoleByPermitType(req.Application.BusinessService); ok {

		resp := c.employeeService.SearchEmployeesByRole(role, req.Application.TenantId, req.RequestInfo)
		if data, _ := json.MarshalIndent(resp, "", "  "); true {
			log.Println("SearchEmployeesByRole response:", string(data))
		}

		employees := resp.Employees

		if len(employees) > 0 {
			var users []model.User
			for _, emp := range employees {
				if emp.User.Uuid != uuid.Nil {
					users = append(users, emp.User)
				}
			}
			req.Application.Workflow.Assignees = users
			log.Printf("Assigned %d employees with role %s to application", len(users), role)
		} else {
			log.Printf("No employees found for role %s", role)
		}
	}
}