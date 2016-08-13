package models

import "sync"

type Vehicle struct {
	Id string `json:"id"`
	Type string `json:"type"`
	Location Location `json:"location"`
	Velocity float64 `json:"velocity"`
	Acceleration float64 `json:"acceleration"`
	Angle float64 `json:"angle"`
	Wheel float64 `json:"wheel"`
	L float64 `json:"L"`
}

type concurrentVehicleMap struct {
	sync.RWMutex
	m map[string]*Vehicle
}
