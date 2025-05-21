package service

import (
	"context"
	"encoding/json"
	"log"
	"public-service/model"
	"public-service/repository"
)

type ApplicationService struct {
	repo              *repository.ApplicationRepository
	enrichmentService *EnrichmentService
}

func NewApplicationService(repo *repository.ApplicationRepository, enrichmentService *EnrichmentService) *ApplicationService {
	return &ApplicationService{repo: repo, enrichmentService: enrichmentService}
}

func (s *ApplicationService) CreateApplication(ctx context.Context, req model.ApplicationRequest, ServiceCode string) (model.ApplicationResponse, error) {
	return s.repo.CreateUsingKafka(ctx, req, ServiceCode)
}

func (s *ApplicationService) SearchApplication(ctx context.Context, criteria model.SearchCriteria) (model.SearchResponse, error) {
	resp, err := s.repo.SearchWithIndividual(ctx, criteria)
	log.Println(resp)
	if err != nil {
		return resp, err
	}
	if jsonBytes, err := json.MarshalIndent(resp, "", "  "); err == nil {
		log.Printf("Search Application response:\n%s\n", string(jsonBytes))
	} else {
		log.Printf("Search Application respons (raw): %+v\n", resp)
	}
	resp.Application = s.enrichmentService.EnrichApplicationsWithIndividuals(resp.Application, criteria)
	return resp, nil
}

func (s *ApplicationService) UpdateApplication(ctx context.Context, req model.ApplicationRequest, serviceCode string) (model.ApplicationResponse, error) {

	return s.repo.UpdateUsingKafka(ctx, req, serviceCode)

}
