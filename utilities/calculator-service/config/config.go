package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func LoadEnv() {
	if os.Getenv("KUBERNETES_SERVICE_HOST") == "" {
		err := godotenv.Load()
		if err != nil {
			log.Println("⚠️ No .env file found or failed to load")
		} else {
			log.Println("✅ .env loaded successfully")
		}
	} else {
		log.Println("⛔ Skipping .env load (Kubernetes environment)")
	}
}

// GetEnv safely gets the environment variable
func GetEnv(key string) string {
	return os.Getenv(key)
}
