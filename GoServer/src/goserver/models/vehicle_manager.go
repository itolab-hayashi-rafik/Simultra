package models

import (
	"strconv"
	"net/http"
)

type VehicleManager struct {
	managerHub *Hub
	hubs concurrentHubMap
	vehicles concurrentVehicleMap
}

func (vm *VehicleManager) List() []Vehicle {
	vm.vehicles.RLock()
	values := make([]Vehicle, 0, len(vm.vehicles.m))
	for _, v := range vm.vehicles.m {
		values = append(values, *v)
	}
	vm.vehicles.RUnlock()
	return values
}

func (vm *VehicleManager) Add(vehicle Vehicle) Vehicle {
	vm.vehicles.Lock()
	vehicle.Id = strconv.Itoa(len(vm.vehicles.m))
	vm.vehicles.m[vehicle.Id] = &vehicle
	vm.vehicles.Unlock()

	// broadcast this creation action to vehicle managers
	vm.managerHub.Broadcast("creation")

	return vehicle
}

func (vm *VehicleManager) Get(id string) Vehicle {
	vm.vehicles.RLock()
	vehicle, _ := vm.vehicles.m[id]
	vm.vehicles.RUnlock()

	return *vehicle
}

func (vm *VehicleManager) Update(id string, vehicle Vehicle) Vehicle {
	vehicle.Id = id
	vm.vehicles.Lock()
	vm.vehicles.m[id] = &vehicle
	vm.vehicles.Unlock()

	return vehicle
}

func (vm *VehicleManager) Delete(id string) Vehicle {
	vm.vehicles.RLock()
	vehicle, ok := vm.vehicles.m[id]
	vm.vehicles.RUnlock()
	if ok {
		vm.vehicles.Lock()
		delete(vm.vehicles.m, id)
		vm.vehicles.Unlock()

		// broadcast this creation action to vehicle managers
		vm.managerHub.Broadcast("deletion")
	}
	return *vehicle
}

func (vm *VehicleManager) WsHandler(id string, w http.ResponseWriter, r *http.Request) {
	// create a hub if not exists
	vm.hubs.RLock()
	hub, ok := vm.hubs.m[id]
	vm.hubs.RUnlock()
	if !ok {
		hub = NewHub()
		vm.hubs.Lock()
		vm.hubs.m[id] = hub
		vm.hubs.Unlock()
		go hub.Run()
	}
	// start serving the client
	ServeWs(hub, w, r)
}

func (vm *VehicleManager) WsManagerHandler(w http.ResponseWriter, r *http.Request) {
	// start serving the client
	ServeWs(vm.managerHub, w, r)
}

var sharedVehicleManager *VehicleManager = newVehicleManager()

func newVehicleManager() *VehicleManager {
	managerHub := NewHub()
	go managerHub.Run()
	return &VehicleManager{
		managerHub: managerHub,
		hubs: concurrentHubMap{m: make(map[string]*Hub)},
		vehicles: concurrentVehicleMap{m: make(map[string]*Vehicle)},
	}
}

func GetVehicleManager() *VehicleManager {
	return sharedVehicleManager
}
