package models

type Message struct {
	Sender string `json:"sender"`
	Data interface{} `json:"data"`
}
