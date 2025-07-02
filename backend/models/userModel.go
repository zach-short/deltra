package models

import "time"

type User struct {
	ID         string `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Name       string
	Email      string `gorm:"unique"`
	Provider   string
	ProviderID string `gorm:"unique"`
	Picture    string
	CreatedAt  time.Time `gorm:"autoCreateTime"`
	UpdatedAt  time.Time `gorm:"autoUpdateTime"`
}
