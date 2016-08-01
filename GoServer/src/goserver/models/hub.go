package models

type Hub struct {
	// Registered clients
	clients map[*Client]bool

	// Inbound messages from the clients
	broadcast chan []byte

	// Register requests from the clients
	register chan *Client

	// Unregister requests from clients
	unregister chan *Client
}

// Create a new Hub instance
func NewHub() *Hub {
	return &Hub {
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
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