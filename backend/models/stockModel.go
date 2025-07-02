package models

type Stock struct {
	ID          string `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID      string `gorm:"type:uuid"`
	PortfolioID uint
	Symbol      string
	Basis       float64
	Portfolio   Portfolio `gorm:"foreignKey:PortfolioID"`
	User        User      `gorm:"foreignKey:UserID"`
}
