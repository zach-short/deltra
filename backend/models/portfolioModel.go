package models

import "time"

type Portfolio struct {
	ID        string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name      string    `json:"name"`
	UserID    string    `gorm:"type:uuid" json:"user_id"`
	User      User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Stocks    []Stock   `gorm:"foreignKey:PortfolioID;constraint:OnDelete:CASCADE" json:"stocks,omitempty"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}
