package main

import (
	"net"
	"os"
	"encoding/json"
)

type Indexing int
const (
	COMMAND_INI Indexing = iota
	COMMAND_START_SIMULATION
	COMMAND_STOP_SIMULATION
)

type Payload struct {
	Command int `json:"Command"`
	Data string `json:"Data"`
}

func main() {
	// connect to server
	servAddr := "localhost:8033"
	tcpAddr, err := net.ResolveTCPAddr("tcp", servAddr)
	if err != nil {
		println("ResolveTCPAddr failed:", err.Error())
		os.Exit(1)
	}

	conn, err := net.DialTCP("tcp", nil, tcpAddr)
	if err != nil {
		println("Dial failed:", err.Error())
		os.Exit(1)
	}

	// prepare data to send
	payload := &Payload{
		Command: int(COMMAND_START_SIMULATION),
	}

	outdata, err := json.Marshal(payload)
	if err != nil {
		println("Json Marshal failed: ", err.Error())
		return
	}
	println("sending: ", string(outdata))

	// send data
	_, err = conn.Write([]byte(outdata))
	if err != nil {
		println("Write to server failed: ", err.Error())
		os.Exit(1)
	}

	println("write to server = ", string(outdata))

	reply := make([]byte, 1024)

	_, err = conn.Read(reply)
	if err != nil {
		println("Write to server failed: ", err.Error())
		os.Exit(1)
	}

	println("reply from server=", string(reply))

	conn.Close()
}