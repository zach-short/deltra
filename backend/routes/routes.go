package routes

import (
	"deltra-backend/controllers"
	"deltra-backend/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/v1")

	auth := api.Group("/auth")
	{
		auth.POST("/oauth", controllers.CreateOrFindOAuthUser)
	}

	api.Use(middleware.AuthMiddleware())
	{
		api.GET("/profile", controllers.GetProfile)

		users := api.Group("/users")
		{
			users.POST("", controllers.AddUser)

			user := users.Group("/:id")
			{
				user.GET("", controllers.GetUser)

				portfolios := user.Group("/portfolios")
				{
					portfolios.GET("", controllers.GetPortfolios)
					portfolios.POST("", controllers.AddPortfolio)
				}

				stocks := user.Group("/stocks")
				{
					stocks.GET("", controllers.GetStocks)
					stocks.POST("", controllers.AddStock)
				}
			}
		}
	}
}
