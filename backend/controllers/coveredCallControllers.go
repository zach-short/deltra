package controllers

import (
	"deltra-backend/config"
	"deltra-backend/models"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type CreateCoveredCallRequest struct {
	StockID         string    `json:"stock_id" binding:"required"`
	StrikePrice     float64   `json:"strike_price" binding:"required"`
	PremiumReceived float64   `json:"premium_received" binding:"required"`
	Contracts       int       `json:"contracts" binding:"required"`
	ExpirationDate  time.Time `json:"expiration_date" binding:"required"`
}

type UpdateCoveredCallRequest struct {
	Status          string     `json:"status,omitempty"`
	AssignmentDate  *time.Time `json:"assignment_date,omitempty"`
	AssignmentPrice *float64   `json:"assignment_price,omitempty"`
	BuybackDate     *time.Time `json:"buyback_date,omitempty"`
	BuybackPremium  *float64   `json:"buyback_premium,omitempty"`
}

func CreateCoveredCall(c *gin.Context) {
	userID := c.Param("id")
	var req CreateCoveredCallRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Printf("Covered call creation binding error: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var stock models.Stock
	if err := config.DB.Where("id = ? AND user_id = ?", req.StockID, userID).First(&stock).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Stock not found"})
		return
	}

	totalPremium := req.PremiumReceived * float64(req.Contracts) * 100
	sharesCovered := req.Contracts * 100

	if float64(sharesCovered) > stock.Shares {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient shares to cover the call"})
		return
	}

	coveredCall := models.CoveredCall{
		StockID:         req.StockID,
		UserID:          userID,
		PortfolioID:     stock.PortfolioID,
		StrikePrice:     req.StrikePrice,
		PremiumReceived: req.PremiumReceived,
		Contracts:       req.Contracts,
		ExpirationDate:  req.ExpirationDate,
		Status:          "pending", // Start in pending state
		TotalPremium:    totalPremium,
		SharesCovered:   sharesCovered,
	}

	if err := config.DB.Create(&coveredCall).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create covered call"})
		return
	}

	config.DB.Preload("Stock").Preload("Portfolio").First(&coveredCall, coveredCall.ID)

	c.JSON(http.StatusCreated, coveredCall)
}

func GetCoveredCalls(c *gin.Context) {
	userID := c.Param("id")

	var coveredCalls []models.CoveredCall
	if err := config.DB.Where("user_id = ?", userID).
		Preload("Stock").
		Preload("Portfolio").
		Order("created_at DESC").
		Find(&coveredCalls).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch covered calls"})
		return
	}

	c.JSON(http.StatusOK, coveredCalls)
}

func GetCoveredCall(c *gin.Context) {
	userID := c.Param("id")
	callID := c.Param("callId")

	var coveredCall models.CoveredCall
	if err := config.DB.Where("id = ? AND user_id = ?", callID, userID).
		Preload("Stock").
		Preload("Portfolio").
		First(&coveredCall).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Covered call not found"})
		return
	}

	c.JSON(http.StatusOK, coveredCall)
}

func UpdateCoveredCall(c *gin.Context) {
	userID := c.Param("id")
	callID := c.Param("callId")
	var req UpdateCoveredCallRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var coveredCall models.CoveredCall
	if err := config.DB.Where("id = ? AND user_id = ?", callID, userID).First(&coveredCall).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Covered call not found"})
		return
	}

	if req.Status != "" {
		coveredCall.Status = req.Status
	}
	if req.AssignmentDate != nil {
		coveredCall.AssignmentDate = req.AssignmentDate
	}
	if req.AssignmentPrice != nil {
		coveredCall.AssignmentPrice = req.AssignmentPrice
	}
	if req.BuybackDate != nil {
		coveredCall.BuybackDate = req.BuybackDate
	}
	if req.BuybackPremium != nil {
		coveredCall.BuybackPremium = req.BuybackPremium
	}

	if err := config.DB.Save(&coveredCall).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update covered call"})
		return
	}

	config.DB.Preload("Stock").Preload("Portfolio").First(&coveredCall, coveredCall.ID)

	c.JSON(http.StatusOK, coveredCall)
}

func DeleteCoveredCall(c *gin.Context) {
	userID := c.Param("id")
	callID := c.Param("callId")

	var coveredCall models.CoveredCall
	if err := config.DB.Where("id = ? AND user_id = ?", callID, userID).First(&coveredCall).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Covered call not found"})
		return
	}

	if err := config.DB.Delete(&coveredCall).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete covered call"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Covered call deleted successfully"})
}

func GetStockCoveredCalls(c *gin.Context) {
	userID := c.Param("id")
	stockID := c.Param("stockId")

	var stock models.Stock
	if err := config.DB.Where("id = ? AND user_id = ?", stockID, userID).First(&stock).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Stock not found"})
		return
	}

	var coveredCalls []models.CoveredCall
	if err := config.DB.Where("stock_id = ? AND user_id = ?", stockID, userID).
		Preload("Stock").
		Preload("Portfolio").
		Order("created_at DESC").
		Find(&coveredCalls).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch covered calls"})
		return
	}

	c.JSON(http.StatusOK, coveredCalls)
}

func CreateStockCoveredCall(c *gin.Context) {
	stockID := c.Param("stockId")
	var req CreateCoveredCallRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	req.StockID = stockID

	CreateCoveredCall(c)
}

func ActivateCoveredCall(c *gin.Context) {
	userID := c.Param("id")
	callID := c.Param("callId")

	var coveredCall models.CoveredCall
	if err := config.DB.Where("id = ? AND user_id = ?", callID, userID).First(&coveredCall).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Covered call not found"})
		return
	}

	if coveredCall.Status != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only pending calls can be activated"})
		return
	}

	coveredCall.Status = "active"
	
	if err := config.DB.Save(&coveredCall).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to activate covered call"})
		return
	}

	config.DB.Preload("Stock").Preload("Portfolio").First(&coveredCall, coveredCall.ID)

	c.JSON(http.StatusOK, coveredCall)
}