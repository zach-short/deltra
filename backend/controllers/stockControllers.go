package controllers

import (
	"deltra-backend/config"
	"deltra-backend/models"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetStocks(c *gin.Context) {
	userID := c.Param("id")

	var stocks []models.Stock
	config.DB.Where("user_id = ?", userID).Preload("User").Find(&stocks)
	c.JSON(http.StatusOK, stocks)
}

func GetStock(c *gin.Context) {
	userID := c.Param("id")
	stockID := c.Param("stockId")

	var stock models.Stock
	if err := config.DB.Where("id = ? AND user_id = ?", stockID, userID).
		Preload("CoveredCalls").
		Preload("Portfolio").
		Preload("User").
		First(&stock).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Stock not found"})
		return
	}

	stock.CalculateMetrics()

	c.JSON(http.StatusOK, stock)
}

func AddStock(c *gin.Context) {
	userID := c.Param("id")

	var user models.User
	if err := config.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var stock models.Stock
	if err := c.ShouldBindJSON(&stock); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	stock.UserID = userID

	if stock.PortfolioID != "" {
		var portfolio models.Portfolio
		if err := config.DB.Where("id = ? AND user_id = ?", stock.PortfolioID, userID).First(&portfolio).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Portfolio not found or doesn't belong to user"})
			return
		}
	}

	if err := config.DB.Create(&stock).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create stock"})
		return
	}

	c.JSON(http.StatusCreated, stock)
}

func UpdateStock(c *gin.Context) {
	userID := c.Param("id")
	stockID := c.Param("stockId")

	var stock models.Stock
	if err := config.DB.Where("id = ? AND user_id = ?", stockID, userID).First(&stock).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "stock not found"})
		return
	}

	var updateData map[string]any
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fields := map[string]*float64{
		"shares": &stock.Shares,
		"basis":  &stock.Basis,
	}

	for fieldName, stockField := range fields {
		if value, ok := updateData[fieldName]; ok {
			if floatValue, ok := value.(float64); ok {
				*stockField = floatValue
			} else {
				c.JSON(http.StatusBadRequest, gin.H{
					"error": fmt.Sprintf("Field '%s' must be a number", fieldName),
				})
				return
			}
		}
	}

	if err := config.DB.Save(&stock).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update stock"})
		return
	}

	c.JSON(http.StatusOK, stock)
}

func DeleteStock(c *gin.Context) {
	userID := c.Param("id")
	stockID := c.Param("stockId")

	var stock models.Stock
	if err := config.DB.Where("id = ? AND user_id = ?", stockID, userID).First(&stock).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Stock not found"})
		return
	}

	if err := config.DB.Delete(&stock).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete stock"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Stock deleted successfully"})
}
