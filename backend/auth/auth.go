package auth

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/supabase-community/supabase-go"
)

type AuthService struct {
	supabase  *supabase.Client
	jwtSecret []byte
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type SignupRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Name     string `json:"name" binding:"required,min=2"`
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
	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_ANON_KEY")
	jwtSecret := os.Getenv("JWT_SECRET")

	if supabaseURL == "" || supabaseKey == "" || jwtSecret == "" {
		panic("Missing required environment variables: SUPABASE_URL, SUPABASE_ANON_KEY, JWT_SECRET")
	}

	client, err := supabase.NewClient(supabaseURL, supabaseKey, &supabase.ClientOptions{})
	if err != nil {
		panic("Failed to create Supabase client: " + err.Error())
	}

	return &AuthService{
		supabase:  client,
		jwtSecret: []byte(jwtSecret),
	}
}

func (s *AuthService) Login(req LoginRequest) (*AuthResponse, error) {
	// Authenticate with Supabase
	resp, err := s.supabase.Auth.SignInWithEmailPassword(supabase.UserCredentials{
		Email:    req.Email,
		Password: req.Password,
	})
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	if resp.User.ID == uuid.Nil {
		return nil, errors.New("authentication failed")
	}

	// Convert UUID to string
	userID := resp.User.ID.String()

	// Create our own JWT token
	token, expires, err := s.generateJWT(userID, resp.User.Email)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{
		Token:   token,
		Expires: expires,
		User: User{
			ID:    userID,
			Email: resp.User.Email,
			Name:  s.getUserName(userID), // Get from your users table
		},
	}, nil
}

func (s *AuthService) Signup(req SignupRequest) (*AuthResponse, error) {
	// Sign up with Supabase using the correct struct
	resp, err := s.supabase.Auth.Signup(supabase.UserCredentials{
		Email:    req.Email,
		Password: req.Password,
	})
	if err != nil {
		return nil, errors.New("signup failed: " + err.Error())
	}

	if resp.User.ID == uuid.Nil {
		return nil, errors.New("signup failed")
	}

	// Convert UUID to string
	userID := resp.User.ID.String()

	// Create user in your database
	// TODO: Add this to your user controller
	// user := models.User{
	//     ID: userID, // Use Supabase UUID string as your user ID
	//     Name: req.Name,
	//     Email: req.Email,
	// }
	// config.DB.Create(&user)

	// Create JWT token
	token, expires, err := s.generateJWT(userID, resp.User.Email)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{
		Token:   token,
		Expires: expires,
		User: User{
			ID:    userID,
			Email: resp.User.Email,
			Name:  req.Name,
		},
	}, nil
}

func (s *AuthService) generateJWT(userID, email string) (string, int64, error) {
	expires := time.Now().Add(24 * time.Hour) // 24 hour expiry

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
	// TODO: Query your users table to get the name
	// var user models.User
	// config.DB.Where("id = ?", userID).First(&user)
	// return user.Name
	return "" // Placeholder
}
