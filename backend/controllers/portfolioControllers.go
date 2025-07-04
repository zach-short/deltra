package controllers

import (
	"deltra-backend/config"
	"deltra-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetPortfolios(c *gin.Context) {
	userID := c.Param("id")
	var portfolios []models.Portfolio
	config.DB.Where("user_id = ?", userID).
		Preload("User").
		Preload("Stocks.CoveredCalls").
		Find(&portfolios)

	for i := range portfolios {
		for j := range portfolios[i].Stocks {
			portfolios[i].Stocks[j].CalculateMetrics()
		}
	}

	c.JSON(http.StatusOK, portfolios)
}

func AddPortfolio(c *gin.Context) {
	userID := c.Param("id")

	var user models.User
	if err := config.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var portfolio models.Portfolio
	if err := c.ShouldBindJSON(&portfolio); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	portfolio.UserID = userID

	if err := config.DB.Create(&portfolio).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create portfolio"})
		return
	}

	c.JSON(http.StatusCreated, portfolio)
}

func UpdatePortfolio(c *gin.Context) {
	userID := c.Param("id")
	portfolioID := c.Param("portfolioId")

	var portfolio models.Portfolio
	if err := config.DB.Where("id = ? AND user_id = ?", portfolioID, userID).First(&portfolio).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Portfolio not found"})
		return
	}

	var updateData struct {
		Name string `json:"name" binding:"required"`
	}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	portfolio.Name = updateData.Name

	if err := config.DB.Save(&portfolio).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update portfolio"})
		return
	}

	c.JSON(http.StatusOK, portfolio)
}

func DeletePortfolio(c *gin.Context) {
	userID := c.Param("id")
	portfolioID := c.Param("portfolioId")

	var portfolio models.Portfolio
	if err := config.DB.Where("id = ? AND user_id = ?", portfolioID, userID).First(&portfolio).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Portfolio not found"})
		return
	}

	if err := config.DB.Delete(&portfolio).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete portfolio"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Portfolio deleted successfully"})
}
