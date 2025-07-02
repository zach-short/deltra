package models

type Portfolio struct {
	ID     uint `gorm:"primaryKey"`
	Name   string
	UserID uint
	User   User `gorm:"foreignKey:UserID"`
}
