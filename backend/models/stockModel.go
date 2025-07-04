package models

import "time"

type Stock struct {
	ID           string        `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID       string        `gorm:"type:uuid" json:"user_id"`
	PortfolioID  string        `gorm:"type:uuid" json:"portfolio_id"`
	Symbol       string        `json:"symbol"`
	Basis        float64       `json:"basis"`
	Shares       float64       `json:"shares"`
	Portfolio    Portfolio     `gorm:"foreignKey:PortfolioID" json:"portfolio,omitempty"`
	User         User          `gorm:"foreignKey:UserID" json:"user,omitempty"`
	CoveredCalls []CoveredCall `gorm:"foreignKey:StockID;constraint:OnDelete:CASCADE" json:"covered_calls,omitempty"`
	CreatedAt    time.Time     `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time     `gorm:"autoUpdateTime" json:"updated_at"`

	AdjustedBasis    float64 `gorm:"-" json:"adjusted_basis"`
	TotalPremium     float64 `gorm:"-" json:"total_premium"`
	ActiveCalls      int     `gorm:"-" json:"active_calls"`
	SharesCovered    int     `gorm:"-" json:"shares_covered"`
	SharesAvailable  int     `gorm:"-" json:"shares_available"`
}

func (s *Stock) CalculateMetrics() {
	s.TotalPremium = 0
	s.ActiveCalls = 0
	s.SharesCovered = 0

	for _, call := range s.CoveredCalls {
		s.TotalPremium += call.TotalPremium
		if call.Status == "active" {
			s.ActiveCalls++
			s.SharesCovered += call.SharesCovered
		}
	}

	s.SharesAvailable = int(s.Shares) - s.SharesCovered
	s.AdjustedBasis = s.Basis - (s.TotalPremium / s.Shares)
}
