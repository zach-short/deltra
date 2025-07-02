package controllers

import (
	"deltra-backend/config"
	"deltra-backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetStocks(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var stocks []models.Stock
	config.DB.Where("user_id = ?", userID).Preload("User").Find(&stocks)
	c.JSON(http.StatusOK, stocks)
}

func AddStock(c *gin.Context) {
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

	var stock models.Stock
	if err := c.ShouldBindJSON(&stock); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	stock.UserID = userIDStr

	if stock.PortfolioID != 0 {
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

	c.JSON(http.StatusCreated, gin.H{
		"ID":          stock.ID,
		"Symbol":      stock.Symbol,
		"Basis":       stock.Basis,
		"UserID":      stock.UserID,
		"PortfolioID": stock.PortfolioID,
	})
}
