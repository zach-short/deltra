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

					portfolio := portfolios.Group("/:portfolioId")
					{
						portfolio.PATCH("", controllers.UpdatePortfolio)
						portfolio.DELETE("", controllers.DeletePortfolio)
					}
				}

				stocks := user.Group("/stocks")
				{
					stocks.GET("", controllers.GetStocks)
					stocks.POST("", controllers.AddStock)

					stock := stocks.Group("/:stockId")
					{
						stock.GET("", controllers.GetStock)
						stock.PATCH("", controllers.UpdateStock)
						stock.DELETE("", controllers.DeleteStock)

						stockCalls := stock.Group("/covered-calls")
						{
							stockCalls.GET("", controllers.GetStockCoveredCalls)
							stockCalls.POST("", controllers.CreateStockCoveredCall)
						}
					}
				}

				coveredCalls := user.Group("/covered-calls")
				{
					coveredCalls.GET("", controllers.GetCoveredCalls)
					coveredCalls.POST("", controllers.CreateCoveredCall)

					call := coveredCalls.Group("/:callId")
					{
						call.GET("", controllers.GetCoveredCall)
						call.PATCH("", controllers.UpdateCoveredCall)
						call.DELETE("", controllers.DeleteCoveredCall)
						call.POST("/activate", controllers.ActivateCoveredCall)
					}
				}
			}
		}
	}
}
