package models

type Portfolio struct {
	ID     string `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Name   string
	UserID string `gorm:"type:uuid"`
	User   User   `gorm:"foreignKey:UserID"`
}
