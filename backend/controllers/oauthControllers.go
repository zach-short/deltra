package controllers

import (
	"deltra-backend/config"
	"deltra-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

type OAuthRequest struct {
	ProviderID string `json:"providerId" binding:"required"`
	Provider   string `json:"provider" binding:"required"`
	Email      string `json:"email" binding:"required"`
	Name       string `json:"name" binding:"required"`
	Picture    string `json:"picture"`
}

type OAuthResponse struct {
	ID        string `json:"id"`
	Email     string `json:"email"`
	Name      string `json:"name"`
	Picture   string `json:"picture"`
	IsNewUser bool   `json:"isNewUser"`
}

func CreateOrFindOAuthUser(c *gin.Context) {
	var req OAuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Provider != "google" && req.Provider != "apple" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid provider. Must be 'google' or 'apple'"})
		return
	}

	var user models.User
	var isNewUser bool

	result := config.DB.Where("provider_id = ? AND provider = ?", req.ProviderID, req.Provider).First(&user)

	if result.Error != nil {
		user = models.User{
			Name:       req.Name,
			Email:      req.Email,
			Provider:   req.Provider,
			ProviderID: req.ProviderID,
			Picture:    req.Picture,
		}

		if err := config.DB.Create(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
			return
		}
		isNewUser = true
	} else {
		user.Name = req.Name
		user.Email = req.Email
		user.Picture = req.Picture

		if err := config.DB.Save(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
			return
		}
		isNewUser = false
	}

	response := OAuthResponse{
		ID:        user.ID,
		Email:     user.Email,
		Name:      user.Name,
		Picture:   user.Picture,
		IsNewUser: isNewUser,
	}

	c.JSON(http.StatusOK, response)
}

