package models

import "sync"

type Pedestrian struct {
	Id string `json:"id"`
	Type string `json:"type"`
	Location Location `json:"location"`
	Velocity float64 `json:"velocity"`
	Acceleration float64 `json:"acceleration"`
	Angle float64 `json:"angle"`
}

type concurrentPedestrianMap struct {
	sync.RWMutex
	m map[string]*Pedestrian
}