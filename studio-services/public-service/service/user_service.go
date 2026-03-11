package service

import (
	"errors"
	"log"
	"public-service/config"
	"public-service/model"
	"public-service/repository"

	"github.com/google/uuid"
)

type UserService struct {
	restCallRepo repository.RestCallRepository
}

func NewUserService(repo repository.RestCallRepository) *UserService {
	return &UserService{restCallRepo: repo}
}

// GetUserFromAuthToken resolves an auth-token to a User by calling the DIGIT user service.
// Returns an error if the token is invalid or the user cannot be found.
func (s *UserService) GetUserFromAuthToken(authToken, tenantId string) (*model.User, error) {
	host := config.GetEnv("USER_SERVICE_HOST")
	endpoint := config.GetEnv("USER_DETAILS_ENDPOINT")
	url := host + endpoint + "?access_token=" + authToken + "&tenantId=" + tenantId

	var user model.User
	err := s.restCallRepo.Post(url, map[string]interface{}{}, &user)
	if err != nil {
		log.Printf("UserService: failed to resolve auth-token: %v", err)
		return nil, err
	}

	if user.Uuid == (uuid.UUID{}) {
		return nil, errors.New("no user found for the provided auth token")
	}

	return &user, nil
}