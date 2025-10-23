package main

import (
	"github.com/gin-gonic/gin"
	"github.com/heliotristao/ComprasGov.AI-NEXORA/backend/dispute-service/internal/handlers"
	"github.com/heliotristao/ComprasGov.AI-NEXORA/backend/dispute-service/internal/hub"
)

func main() {
	hub := hub.NewHub()
	go hub.Run()

	r := gin.Default()
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	r.GET("/ws", func(c *gin.Context) {
		handlers.ServeWs(hub, c)
	})

	r.Run() // listen and serve on 0.0.0.0:8080
}
