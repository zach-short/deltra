package auth

import (
	"deltra-backend/config"
	"deltra-backend/models"
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type AuthService struct {
	jwtSecret []byte
}

type OAuthUserRequest struct {
	ID    string `json:"id" binding:"required"`
	Email string `json:"email" binding:"required,email"`
	Name  string `json:"name" binding:"required"`
}

type AuthResponse struct {
	Token   string `json:"token"`
	User    User   `json:"user"`
	Expires int64  `json:"expires"`
}

type User struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
}

func NewAuthService() *AuthService {
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		panic("Missing required environment variable: JWT_SECRET")
	}

	return &AuthService{
		jwtSecret: []byte(jwtSecret),
	}
}

func (s *AuthService) SyncOAuthUser(req OAuthUserRequest) (*AuthResponse, error) {
	user := models.User{
		ID:    req.ID,
		Name:  req.Name,
		Email: req.Email,
	}

	result := config.DB.Where("id = ?", req.ID).FirstOrCreate(&user)
	if result.Error != nil {
		return nil, errors.New("failed to sync user: " + result.Error.Error())
	}

	if result.RowsAffected == 0 {
		config.DB.Model(&user).Where("id = ?", req.ID).Updates(models.User{
			Name:  req.Name,
			Email: req.Email,
		})
	}

	token, expires, err := s.generateJWT(req.ID, req.Email)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{
		Token:   token,
		Expires: expires,
		User: User{
			ID:    req.ID,
			Email: req.Email,
			Name:  req.Name,
		},
	}, nil
}

func (s *AuthService) generateJWT(userID, email string) (string, int64, error) {
	expires := time.Now().Add(24 * time.Hour)

	claims := jwt.MapClaims{
		"user_id": userID,
		"email":   email,
		"exp":     expires.Unix(),
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(s.jwtSecret)
	if err != nil {
		return "", 0, err
	}

	return tokenString, expires.Unix(), nil
}

func (s *AuthService) VerifyToken(tokenString string) (*User, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}
		return s.jwtSecret, nil
	})

	if err != nil || !token.Valid {
		return nil, errors.New("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid token claims")
	}

	userID, ok := claims["user_id"].(string)
	if !ok {
		return nil, errors.New("invalid user ID in token")
	}

	email, ok := claims["email"].(string)
	if !ok {
		return nil, errors.New("invalid email in token")
	}

	return &User{
		ID:    userID,
		Email: email,
		Name:  s.getUserName(userID),
	}, nil
}

func (s *AuthService) getUserName(userID string) string {
	var user models.User
	result := config.DB.Where("id = ?", userID).First(&user)
	if result.Error != nil {
		return ""
	}
	return user.Name
}

