package main

import (
	"strconv"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	. "./models"
	"math"
)

var (
	// vehicles
	vehicleManager = GetVehicleManager()
	// pedestrians
	pedestrianManager = GetPedestrianManager()
)

func main() {

	// setup gin http server
	r := gin.Default()
	r.Use(static.Serve("/", static.LocalFile("../../public", true)))

	wsdebug := r.Group("/wsdebug")
	{
		wsdebug.GET("/vehicles", func(c *gin.Context) {
			r.LoadHTMLGlob("views/wsdebug/*.html")
			c.HTML(200, "index.html", gin.H{
				"path": "/api/v1/vehicles-ws",
			})
		})

		wsdebug.GET("/vehicles/:id", func(c *gin.Context) {
			id := c.Param("id")
			r.LoadHTMLGlob("views/wsdebug/*.html")
			c.HTML(200, "index.html", gin.H{
				"path": "/api/v1/vehicles/"+id+"/ws",
			})
		})
	}

	maps := r.Group("/maps")
	{
		maps.GET("/", func(c *gin.Context) {
			r.LoadHTMLGlob("views/maps/*.html")
			c.HTML(200, "index.html", gin.H{
				"debug": (c.DefaultQuery("debug", "false") == "true"),
				"renderer": c.DefaultQuery("renderer", "cpu"),
				"dynamic": (c.DefaultQuery("dynamic", "true") == "true"),
			})
		})

		maps.GET("/test", func(c *gin.Context) {
			r.LoadHTMLGlob("views/maps/*.html")
			n, _ := strconv.Atoi(c.DefaultQuery("n", "100"))
			sn := int(math.Floor(math.Sqrt(float64(n))))
			c.HTML(200, "index.html", gin.H{
				"debug": (c.DefaultQuery("debug", "true") == "true"),
				"renderer": c.DefaultQuery("renderer", "cpu"),
				"dynamic": (c.DefaultQuery("dynamic", "false") == "true"),
				"test": true,
				"n": n,
				"sn": sn,
			})
		})
	}

	api := r.Group("/api")
	{
		v1 := api.Group("/v1")
		{
			// ---------------------------------------------------------------
			// Vehicles
			// ---------------------------------------------------------------
			// vehicle list
			v1.GET("/vehicles", func(c *gin.Context) {
				values := vehicleManager.List()
				c.JSON(200, values)
			})

			// new vehicle
			v1.POST("/vehicles/new", func(c *gin.Context) {
				var vehicle Vehicle
				c.BindJSON(&vehicle)
				vehicle = vehicleManager.Add(vehicle)
				c.JSON(200, vehicle)
			})

			// update vehicle
			v1.PUT("/vehicles/:id", func(c *gin.Context) {
				id := c.Param("id")
				var vehicle Vehicle
				c.BindJSON(&vehicle)
				vehicle = vehicleManager.Update(id, vehicle)
				c.JSON(200, vehicle)
			})

			// get vehicle
			v1.GET("/vehicles/:id", func(c *gin.Context) {
				id := c.Param("id")
				vehicle := vehicleManager.Get(id)
				c.JSON(200, vehicle)
			})

			// delete vehicle
			v1.DELETE("/vehicles/:id", func(c *gin.Context) {
				id := c.Param("id")
				vehicle := vehicleManager.Delete(id)
				c.JSON(200, vehicle)
			})

			// websocket endpoint for a vehicle manager
			v1.GET("/vehicles-ws", func(c *gin.Context) {
				vehicleManager.WsManagerHandler(c.Writer, c.Request)
			})

			// websocket endpoint for a vehicle
			v1.GET("/vehicles/:id/ws", func(c *gin.Context) {
				id := c.Param("id")
				vehicleManager.WsHandler(id, c.Writer, c.Request)
			})



			// ---------------------------------------------------------------
			// Pedestrians
			// ---------------------------------------------------------------
			// pedestrian list
			v1.GET("/pedestrians", func(c *gin.Context) {
				values := pedestrianManager.List()
				c.JSON(200, values)
			})

			// new vehicle
			v1.POST("/pedestrians/new", func(c *gin.Context) {
				var pedestrian Pedestrian
				c.BindJSON(&pedestrian)
				pedestrian = pedestrianManager.Add(pedestrian)
				c.JSON(200, pedestrian)
			})

			// update vehicle
			v1.PUT("/pedestrians/:id", func(c *gin.Context) {
				id := c.Param("id")
				var pedestrian Pedestrian
				c.BindJSON(&pedestrian)
				pedestrian = pedestrianManager.Update(id, pedestrian)
				c.JSON(200, pedestrian)
			})

			// get vehicle
			v1.GET("/pedestrians/:id", func(c *gin.Context) {
				id := c.Param("id")
				pedestrian := pedestrianManager.Get(id)
				c.JSON(200, pedestrian)
			})

			// delete vehicle
			v1.DELETE("/pedestrians/:id", func(c *gin.Context) {
				id := c.Param("id")
				pedestrian := pedestrianManager.Delete(id)
				c.JSON(200, pedestrian)
			})

			// websocket endpoint for a vehicle manager
			v1.GET("/pedestrians-ws", func(c *gin.Context) {
				pedestrianManager.WsManagerHandler(c.Writer, c.Request)
			})

			// websocket endpoint for a vehicle
			v1.GET("/pedestrians/:id/ws", func(c *gin.Context) {
				id := c.Param("id")
				pedestrianManager.WsHandler(id, c.Writer, c.Request)
			})
		}
	}

	r.Run(":3000")
}