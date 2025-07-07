package models

import "time"

type CoveredCall struct {
	ID          string `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	StockID     string `gorm:"type:uuid" json:"stock_id"`
	UserID      string `gorm:"type:uuid" json:"user_id"`
	PortfolioID string `gorm:"type:uuid" json:"portfolio_id"`

	StrikePrice     float64   `json:"strike_price"`
	PremiumReceived float64   `json:"premium_received"`
	Contracts       int       `json:"contracts"`
	ExpirationDate  time.Time `json:"expiration_date"`

	Status string `json:"status"`

	AssignmentDate  *time.Time `json:"assignment_date,omitempty"`
	AssignmentPrice *float64   `json:"assignment_price,omitempty"`
	BuybackDate     *time.Time `json:"buyback_date,omitempty"`
	BuybackPremium  *float64   `json:"buyback_premium,omitempty"`

	TotalPremium  float64 `json:"total_premium"`
	SharesCovered int     `json:"shares_covered"`

	Stock     Stock     `gorm:"foreignKey:StockID" json:"stock"`
	Portfolio Portfolio `gorm:"foreignKey:PortfolioID" json:"portfolio"`
	User      User      `gorm:"foreignKey:UserID" json:"user"`

	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

