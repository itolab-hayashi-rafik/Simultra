package models

import (
	"strconv"
	"net/http"
)

type PedestrianManager struct {
	managerHub *Hub
	hubs concurrentHubMap
	pedestrians concurrentPedestrianMap
}

func (pm *PedestrianManager) List() []Pedestrian {
	pm.pedestrians.RLock()
	values := make([]Pedestrian, 0, len(pm.pedestrians.m))
	for _, v := range pm.pedestrians.m {
		values = append(values, *v)
	}
	pm.pedestrians.RUnlock()
	return values
}

func (pm *PedestrianManager) Add(pedestrian Pedestrian) Pedestrian {
	pm.pedestrians.Lock()
	pedestrian.Id = strconv.Itoa(len(pm.pedestrians.m))
	pm.pedestrians.m[pedestrian.Id] = &pedestrian
	pm.pedestrians.Unlock()

	// broadcast this creation action to vehicle managers
	pm.managerHub.Broadcast("creation")

	return pedestrian
}

func (pm *PedestrianManager) Get(id string) Pedestrian {
	pm.pedestrians.RLock()
	pedestrian := pm.pedestrians.m[id]
	pm.pedestrians.RUnlock()

	return *pedestrian
}

func (pm *PedestrianManager) Update(id string, pedestrian Pedestrian) Pedestrian {
	pedestrian.Id = id
	pm.pedestrians.Lock()
	pm.pedestrians.m[id] = &pedestrian
	pm.pedestrians.Unlock()

	return pedestrian
}

func (pm *PedestrianManager) Delete(id string) Pedestrian {
	pm.pedestrians.RLock()
	pedestrian, ok := pm.pedestrians.m[id]
	pm.pedestrians.RUnlock()
	if ok {
		pm.pedestrians.Lock()
		delete(pm.pedestrians.m, id)
		pm.pedestrians.Unlock()

		// broadcast this creation action to vehicle managers
		pm.managerHub.Broadcast("deletion")
	}
	return *pedestrian
}

func (pm *PedestrianManager) WsHandler(id string, w http.ResponseWriter, r *http.Request) {
	// create a hub if not exists
	pm.hubs.RLock()
	hub, ok := pm.hubs.m[id]
	pm.hubs.RUnlock()
	if !ok {
		hub = NewHub()
		pm.hubs.Lock()
		pm.hubs.m[id] = hub
		pm.hubs.Unlock()
		go hub.Run()
	}
	// start serving the client
	ServeWs(hub, w, r)
}

func (pm *PedestrianManager) WsManagerHandler(w http.ResponseWriter, r *http.Request) {
	// start serving the client
	ServeWs(pm.managerHub, w, r)
}

var sharedPedestrianManager *PedestrianManager = newPedestrianManager()

func newPedestrianManager() *PedestrianManager {
	managerHub := NewHub()
	go managerHub.Run()

	return &PedestrianManager{
		managerHub: managerHub,
		hubs: concurrentHubMap{m: make(map[string]*Hub)},
		pedestrians: concurrentPedestrianMap{m: make(map[string]*Pedestrian)},
	}
}

func GetPedestrianManager() *PedestrianManager {
	return sharedPedestrianManager
}