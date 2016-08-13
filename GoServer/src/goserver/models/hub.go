package models

import "sync"

type Hub struct {
	// connected hubs
	hubs map[*Hub]bool

	// Registered clients
	clients map[*Client]bool

	// Inbound messages from the clients
	broadcast chan []byte

	// Register requests from the clients
	register chan *Client

	// Unregister requests from clients
	unregister chan *Client
}

type concurrentHubMap struct {
	sync.RWMutex
	m map[string]*Hub
}

// Create a new Hub instance
func NewHub() *Hub {
	return &Hub {
		hubs:	    make(map[*Hub]bool),
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (h *Hub) ConnectTo(hub Hub) {
	h.hubs[&hub] = true
}

// Hub broadcast
func (h *Hub) Broadcast(msg string) {
	h.broadcast <- []byte(msg)
}

// Hub handler
func (h *Hub) Run() {
	for {
		select {
		case client := <- h.register:
			h.clients[client] = true
		case client := <- h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
		case message := <- h.broadcast:
			for hub := range h.hubs {
				hub.broadcast <- message
			}
			for client := range h.clients {
				select {
				case client.send <- message:
					// message successfully sent
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}