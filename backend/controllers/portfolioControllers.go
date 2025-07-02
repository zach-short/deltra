package controllers

import (
	"deltra-backend/config"
	"deltra-backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetPortfolios(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var portfolios []models.Portfolio
	config.DB.Where("user_id = ?", userID).Preload("User").Find(&portfolios)
	c.JSON(http.StatusOK, portfolios)
}

func AddPortfolio(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var portfolio models.Portfolio
	if err := c.ShouldBindJSON(&portfolio); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	portfolio.UserID = uint(userID)

	if err := config.DB.Create(&portfolio).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create portfolio"})
		return
	}

	config.DB.Preload("User").First(&portfolio, portfolio.ID)

	c.JSON(http.StatusCreated, portfolio)
}
