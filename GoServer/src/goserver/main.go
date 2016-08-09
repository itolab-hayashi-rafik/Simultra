package main

import (
	"strconv"
	"sync"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"net/http"
	. "./models"
	"math"
)

var (
	// vehicles
	vManagerHub = NewHub()
	vHubs = struct {
		sync.RWMutex
		m map[string]*Hub
	}{m: make(map[string]*Hub)}
	vehicles = struct {
		sync.RWMutex
		m map[string]*Vehicle
	}{m: make(map[string]*Vehicle)}

	// pedestrians
	pManagerHub = NewHub()
	pHubs = struct {
		sync.RWMutex
		m map[string]*Hub
	}{m: make(map[string]*Hub)}
	pedestrians = struct {
		sync.RWMutex
		m map[string]*Pedestrian
	}{m: make(map[string]*Pedestrian)}
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
				"mono": (c.DefaultQuery("mono", "true") == "true"),
			})
		})
	}

	test := r.Group("/test")
	{
		test.GET("/pedestrians", func(c *gin.Context) {
			r.LoadHTMLGlob("views/test/*.html")
			n, _ := strconv.Atoi(c.DefaultQuery("n", "35"))
			c.HTML(200, "pedestrians.html", gin.H{
				"n": n,
			})
		})

		test.GET("/pedestrians2", func(c *gin.Context) {
			r.LoadHTMLGlob("views/test/*.html")
			n, _ := strconv.Atoi(c.DefaultQuery("n", "1"))
			c.HTML(200, "pedestrians2.html", gin.H{
				"n": n,
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
				vehicles.RLock()
				values := make([]Vehicle, 0, len(vehicles.m))
				for _, v := range vehicles.m {
					values = append(values, *v)
				}
				vehicles.RUnlock()
				c.JSON(200, values)
			})

			// new vehicle
			v1.POST("/vehicles/new", func(c *gin.Context) {
				var vehicle Vehicle
				c.BindJSON(&vehicle)
				vehicles.Lock()
				vehicle.Id = strconv.Itoa(len(vehicles.m))
				vehicles.m[vehicle.Id] = &vehicle
				vehicles.Unlock()

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
				vehicles.Lock()
				vehicles.m[vehicle.Id] = &vehicle
				vehicles.Unlock()
				c.JSON(200, vehicle)
			})

			// get vehicle
			v1.GET("/vehicles/:id", func(c *gin.Context) {
				id := c.Param("id")
				vehicles.RLock()
				vehicle := vehicles.m[id]
				vehicles.RUnlock()
				c.JSON(200, vehicle)
			})

			// delete vehicle
			v1.DELETE("/vehicles/:id", func(c *gin.Context) {
				id := c.Param("id")
				vehicles.RLock()
				vehicle, ok := vehicles.m[id]
				vehicles.RUnlock()
				if ok {
					vehicles.Lock()
					delete(vehicles.m, id)
					vehicles.Unlock()

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
				pedestrians.RLock()
				values := make([]Pedestrian, 0, len(pedestrians.m))
				for _, v := range pedestrians.m {
					values = append(values, *v)
				}
				pedestrians.RUnlock()
				c.JSON(200, values)
			})

			// new vehicle
			v1.POST("/pedestrians/new", func(c *gin.Context) {
				var pedestrian Pedestrian
				c.BindJSON(&pedestrian)
				pedestrians.Lock()
				pedestrian.Id = strconv.Itoa(len(pedestrians.m))
				pedestrians.m[pedestrian.Id] = &pedestrian
				pedestrians.Unlock()

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
				pedestrians.Lock()
				pedestrians.m[pedestrian.Id] = &pedestrian
				pedestrians.Unlock()
				c.JSON(200, pedestrian)
			})

			// get vehicle
			v1.GET("/pedestrians/:id", func(c *gin.Context) {
				id := c.Param("id")
				pedestrians.RLock()
				pedestrian := pedestrians.m[id]
				pedestrians.RUnlock()
				c.JSON(200, pedestrian)
			})

			// delete vehicle
			v1.DELETE("/pedestrians/:id", func(c *gin.Context) {
				id := c.Param("id")
				pedestrians.RLock()
				pedestrian, ok := pedestrians.m[id]
				pedestrians.RUnlock()
				if ok {
					pedestrians.Lock()
					delete(pedestrians.m, id)
					pedestrians.Unlock()

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

	r.Run(":3000")
}

// serve websocket connection for the client to broadcast vehicles' creation/deletion
func vehicleManagerWsHandler(w http.ResponseWriter, r *http.Request) {
	// start serving the client
	ServeWs(vManagerHub, w, r)
}

// creates a hub if necessary and serve websocket connection for the client
func vehicleWsHandler(id string, w http.ResponseWriter, r *http.Request) {
	// create a hub if not exists
	vHubs.RLock()
	hub, ok := vHubs.m[id]
	vHubs.RUnlock()
	if !ok {
		hub = NewHub()
		vHubs.Lock()
		vHubs.m[id] = hub
		vHubs.Unlock()
		go hub.Run()
	}
	// start serving the client
	ServeWs(hub, w, r)
}

// serve websocket connection for the client to broadcast pedestrians' creation/deletion
func pedestrianManagerWsHandler(w http.ResponseWriter, r *http.Request) {
	// start serving the client
	ServeWs(pManagerHub, w, r)
}

// creates a hub if necessary and serve websocket connection for the client
func pedestrianWsHandler(id string, w http.ResponseWriter, r *http.Request) {
	// create a hub if not exists
	pHubs.RLock()
	hub, ok := pHubs.m[id]
	pHubs.RUnlock()
	if !ok {
		hub = NewHub()
		pHubs.Lock()
		pHubs.m[id] = hub
		pHubs.Unlock()
		go hub.Run()
	}
	// start serving the client
	ServeWs(hub, w, r)
}