package models

import (
	"log"
	"net/http"
	"github.com/gorilla/websocket"
	"time"
	"encoding/json"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second
	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second
	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10
	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

// The client structure
type Client struct {
	// the hub
	hub *Hub

	// The identification
	id string

	// The websocket connection
	conn *websocket.Conn

	// Buffered channel of outbound messages
	send chan []byte
}

// Create a new Client instance
func NewClient(hub *Hub, id string, conn *websocket.Conn) *Client {
	return &Client{
		hub: hub,
		id: id,
		conn: conn,
		send: make(chan []byte, 256),
	}
}

// readPump pumps messages from websocket connection to the hub.
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(appData string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})
	for {
		// read message from the client
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
				log.Printf("error: %v", err)
			}
			break
		}

		// unmarshall json and construct a message to broadcast
		var data interface{}
		json.Unmarshal(message, &data)
		msg := &Message{
			Sender: c.id,
			Data: data,
		}

		// marshall
		message, err = json.Marshal(&msg)
		if err != nil {
			log.Printf("error: %v", err)
			break
		}
		c.hub.broadcast <- message
	}
}

// write writes a message with the given type and payload.
func (c *Client) write(mt int, payload []byte) error {
	c.conn.SetWriteDeadline(time.Now().Add(writeWait))
	return c.conn.WriteMessage(mt, payload)
}

// writePump pumps messages from hub to the websocket connection.
func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case message, ok := <- c.send:
			if !ok {
				// The hub closed the channel
				c.write(websocket.CloseMessage, []byte{})
				return
			}

			// open a writer
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// send queued messages if exists
			//n := len(c.send)
			//for i := 0; i < n; i++ {
			//	w.Write(<-c.send)
			//}

			// close the writer
			if err := w.Close(); err != nil {
				return
			}
		case <- ticker.C:
			err := c.write(websocket.PingMessage, []byte{})
			if err != nil {
				return
			}
		}
	}
}

// Serve the websocket handler
func ServeWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	id := ""
	if ids, ok := r.URL.Query()["id"]; ok {
		id = ids[0]
	}
	client := NewClient(hub, id, conn)
	client.hub.register <- client
	go client.writePump()
	client.readPump()
}
