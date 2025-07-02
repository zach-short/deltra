package models

type Stock struct {
	ID          uint `gorm:"primaryKey"`
	UserID      uint
	PortfolioID uint
	Symbol      string
	Basis       float64
	Portfolio   Portfolio `gorm:"foreignKey:PortfolioID"`
	User        User      `gorm:"foreignKey:UserID"`
}
