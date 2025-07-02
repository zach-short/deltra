package models

type Portfolio struct {
	ID     uint   `gorm:"primaryKey"`
	Name   string
	UserID string `gorm:"type:uuid"`
	User   User   `gorm:"foreignKey:UserID"`
}
