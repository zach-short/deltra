package models

import "time"

type User struct {
	ID         string `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name       string `json:"name"`
	Email      string `gorm:"unique" json:"email"`
	Provider   string `gorm:"uniqueIndex:idx_provider_user" json:"provider"`
	ProviderID string `gorm:"uniqueIndex:idx_provider_user" json:"provider_id"`
	Picture    string `json:"picture"`
	CreatedAt  time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt  time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}
