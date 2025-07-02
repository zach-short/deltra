package controllers

import (
	"deltra-backend/auth"
	"net/http"

	"github.com/gin-gonic/gin"
)

var authService = auth.NewAuthService()

func SyncOAuthUser(c *gin.Context) {
	var req auth.OAuthUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := authService.SyncOAuthUser(req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

func GetProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user_id": userID,
		"message": "Profile endpoint - implement user lookup",
	})
}
