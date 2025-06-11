package main

import (
	"buildingcost/config"
	"buildingcost/controller"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

func main() {

	config.LoadEnv()
	r := mux.NewRouter()

	api := r.PathPrefix("/calculator-service/v1").Subrouter()

	// Register routes
	api.HandleFunc("/{code}/estimate_calculate", controller.CalculateCost).Methods("POST")
	api.HandleFunc("/{code}/demand", controller.GeneratetDemands).Methods("POST")

	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf(" Server started at :%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
