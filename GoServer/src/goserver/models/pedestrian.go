package models

type Pedestrian struct {
	Id string `json:"id"`
	Type string `json:"type"`
	Location Location `json:"location"`
	Velocity float64 `json:"velocity"`
	Acceleration float64 `json:"acceleration"`
	Angle float64 `json:"angle"`
}
