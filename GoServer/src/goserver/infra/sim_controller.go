package infra

import (
	"net"
	"errors"
	"encoding/json"
	"strings"
)

type Indexing int
const (
	COMMAND_INI Indexing = iota
	COMMAND_START_SIMULATION
	COMMAND_CHECK_STATE
	COMMAND_STOP_SIMULATION
)

type State int
const (
	SIMULATOR_STATE_UNKNOWN State = iota
	SIMULATOR_STATE_RUNNING
	SIMULATOR_STATE_NOT_RUNNING
)

type payload struct {
	Command int `json:"Command"`
	Data string `json:"Data"`
}

type SimController struct {
	// address of the remote host
	remoteAddr string

	// tcp connection
	connection *net.TCPConn
}

func NewSimController(remoteAddr string) (*SimController, error) {
	// instantiate
	s := &SimController{
		remoteAddr: remoteAddr,
		connection: nil,
	}

	err := s.connect()
	return s, err
}

func (s *SimController) connect() error {
	// connect to the remote
	tcpAddr, err := net.ResolveTCPAddr("tcp", s.remoteAddr)
	if err != nil {
		return err
	}

	s.connection, err = net.DialTCP("tcp", nil, tcpAddr)
	if err != nil {
		return err
	}

	return nil
}

func (s *SimController) disconnect() error {
	// disconnect from the remote
	if (s.connection == nil) {
		return errors.New("Connection not established")
	}

	s.connection.Close()
}

func (s *SimController) StartSimulation() error {
	if (s.connection == nil) {
		return errors.New("Not connected")
	}

	// prepare data to send
	payload := &payload{
		Command: int(COMMAND_START_SIMULATION),
	}

	// payload to json string
	outdata, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	// send data
	println("write to server = ", string(outdata))
	_, err = s.connection.Write([]byte(outdata))
	if err != nil {
		return err
	}

	// read reply
	reply := make([]byte, 1024)
	_, err = s.connection.Read(reply)
	if err != nil {
		return err
	}

	return nil
}

func (s *SimController) CheckState() (State, error) {
	if (s.connection == nil) {
		return errors.New("Not connected")
	}

	// prepare data to send
	payload := &payload{
		Command: int(COMMAND_CHECK_STATE),
	}

	// payload to json string
	outdata, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	// send data
	println("write to server = ", string(outdata))
	_, err = s.connection.Write([]byte(outdata))
	if err != nil {
		return nil, err
	}

	// read reply
	reply := make([]byte, 1024)
	res, err := s.connection.Read(reply)
	if err != nil {
		return nil, err
	}

	res = strings.ToLower(strings.Trim(res, ""))
	var state State = SIMULATOR_STATE_UNKNOWN
	if (res == "0") {
		state = SIMULATOR_STATE_NOT_RUNNING
	} else if (res == "1") {
		state = SIMULATOR_STATE_RUNNING
	}

	return state, nil
}

func (s *SimController) StopSimulation() error {
	if (s.connection == nil) {
		return errors.New("Not connected")
	}

	// prepare data to send
	payload := &payload{
		Command: int(COMMAND_STOP_SIMULATION),
	}

	// payload to json string
	outdata, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	// send data
	println("write to server = ", string(outdata))
	_, err = s.connection.Write([]byte(outdata))
	if err != nil {
		return err
	}

	// read reply
	reply := make([]byte, 1024)
	_, err = s.connection.Read(reply)
	if err != nil {
		return err
	}

	return nil
}