package main

import (
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"net/http"
	. "./models"
	"strconv"
)

var (
	// vehicles
	vManagerHub = NewHub()
	vHubs = make(map[string]*Hub)
	vehicles = make(map[string]*Vehicle)

	// pedestrians
	pManagerHub = NewHub()
	pHubs = make(map[string]*Hub)
	pedestrians = make(map[string]*Pedestrian)
)

func main() {

	// start running the manager hub on a new thread
	go vManagerHub.Run()
	go pManagerHub.Run()

	// setup gin http server
	r := gin.Default()
	r.Use(static.Serve("/", static.LocalFile("../../public", true)))

	wsdebug := r.Group("/wsdebug")
	{
		wsdebug.GET("/vehicles", func(c *gin.Context) {
			r.LoadHTMLGlob("views/wsdebug/*.html")
			c.HTML(200, "index.html", gin.H{
				"url": "ws://localhost:3000/api/v1/vehicles-ws",
			})
		})

		wsdebug.GET("/vehicles/:id", func(c *gin.Context) {
			id := c.Param("id")
			r.LoadHTMLGlob("views/wsdebug/*.html")
			c.HTML(200, "index.html", gin.H{
				"url": "ws://localhost:3000/api/v1/vehicles/"+id+"/ws",
			})
		})
	}

	maps := r.Group("/maps")
	{
		maps.GET("/", func(c *gin.Context) {
			r.LoadHTMLGlob("views/maps/*.html")
			c.HTML(200, "index.html", gin.H{
				"key1": "value1",
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
				values := make([]Vehicle, 0, len(vehicles))
				for _, v := range vehicles {
					values = append(values, *v)
				}
				c.JSON(200, values)
			})

			// new vehicle
			v1.POST("/vehicles/new", func(c *gin.Context) {
				var vehicle Vehicle
				c.BindJSON(&vehicle)
				vehicle.Id = strconv.Itoa(len(vehicles))
				vehicles[vehicle.Id] = &vehicle

				// broadcast this creation action to vehicle managers
				vManagerHub.Broadcast("creation")

				c.JSON(200, vehicle)
			})

			// update vehicle
			v1.PUT("/vehicles/:id", func(c *gin.Context) {
				id := c.Param("id")
				var vehicle Vehicle
				c.BindJSON(&vehicle)
				vehicle.Id = id
				vehicles[vehicle.Id] = &vehicle
				c.JSON(200, vehicle)
			})

			// get vehicle
			v1.GET("/vehicles/:id", func(c *gin.Context) {
				id := c.Param("id")
				c.JSON(200, vehicles[id])
			})

			// delete vehicle
			v1.DELETE("/vehicles/:id", func(c *gin.Context) {
				id := c.Param("id")
				vehicle, ok := vehicles[id]
				if ok {
					delete(vehicles, id)

					// broadcast this creation action to vehicle managers
					vManagerHub.Broadcast("deletion")
				}
				c.JSON(200, vehicle)
			})

			// websocket endpoint for a vehicle manager
			v1.GET("/vehicles-ws", func(c *gin.Context) {
				vehicleManagerWsHandler(c.Writer, c.Request)
			})

			// websocket endpoint for a vehicle
			v1.GET("/vehicles/:id/ws", func(c *gin.Context) {
				id := c.Param("id")
				vehicleWsHandler(id, c.Writer, c.Request)
			})



			// ---------------------------------------------------------------
			// Pedestrians
			// ---------------------------------------------------------------
			// pedestrian list
			v1.GET("/pedestrians", func(c *gin.Context) {
				values := make([]Pedestrian, 0, len(pedestrians))
				for _, v := range pedestrians {
					values = append(values, *v)
				}
				c.JSON(200, values)
			})

			// new vehicle
			v1.POST("/pedestrians/new", func(c *gin.Context) {
				var pedestrian Pedestrian
				c.BindJSON(&pedestrian)
				pedestrian.Id = strconv.Itoa(len(pedestrians))
				pedestrians[pedestrian.Id] = &pedestrian

				// broadcast this creation action to vehicle managers
				pManagerHub.Broadcast("creation")

				c.JSON(200, pedestrian)
			})

			// update vehicle
			v1.PUT("/pedestrians/:id", func(c *gin.Context) {
				id := c.Param("id")
				var pedestrian Pedestrian
				c.BindJSON(&pedestrian)
				pedestrian.Id = id
				pedestrians[pedestrian.Id] = &pedestrian
				c.JSON(200, pedestrian)
			})

			// get vehicle
			v1.GET("/pedestrians/:id", func(c *gin.Context) {
				id := c.Param("id")
				c.JSON(200, pedestrians[id])
			})

			// delete vehicle
			v1.DELETE("/pedestrians/:id", func(c *gin.Context) {
				id := c.Param("id")
				pedestrian, ok := pedestrians[id]
				if ok {
					delete(pedestrians, id)

					// broadcast this creation action to vehicle managers
					pManagerHub.Broadcast("deletion")
				}
				c.JSON(200, pedestrian)
			})

			// websocket endpoint for a vehicle manager
			v1.GET("/pedestrians-ws", func(c *gin.Context) {
				pedestrianManagerWsHandler(c.Writer, c.Request)
			})

			// websocket endpoint for a vehicle
			v1.GET("/pedestrians/:id/ws", func(c *gin.Context) {
				id := c.Param("id")
				pedestrianWsHandler(id, c.Writer, c.Request)
			})
		}
	}

	r.Run("localhost:3000")
}

// serve websocket connection for the client to broadcast vehicles' creation/deletion
func vehicleManagerWsHandler(w http.ResponseWriter, r *http.Request) {
	// start serving the client
	ServeWs(vManagerHub, w, r)
}

// creates a hub if necessary and serve websocket connection for the client
func vehicleWsHandler(id string, w http.ResponseWriter, r *http.Request) {
	// create a hub if not exists
	if _, ok := vHubs[id]; !ok {
		vHubs[id] = NewHub()
		go vHubs[id].Run()
	}
	// start serving the client
	ServeWs(vHubs[id], w, r)
}

// serve websocket connection for the client to broadcast pedestrians' creation/deletion
func pedestrianManagerWsHandler(w http.ResponseWriter, r *http.Request) {
	// start serving the client
	ServeWs(pManagerHub, w, r)
}

// creates a hub if necessary and serve websocket connection for the client
func pedestrianWsHandler(id string, w http.ResponseWriter, r *http.Request) {
	// create a hub if not exists
	if _, ok := pHubs[id]; !ok {
		pHubs[id] = NewHub()
		go pHubs[id].Run()
	}
	// start serving the client
	ServeWs(pHubs[id], w, r)
}