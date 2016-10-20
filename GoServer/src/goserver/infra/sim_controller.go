package infra

import (
	"net"
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
}

func NewSimController(remoteAddr string) *SimController {
	// instantiate
	s := &SimController{
		remoteAddr: remoteAddr,
	}

	return s
}

func (s *SimController) connect() (*net.TCPConn, error) {
	// connect to the remote
	tcpAddr, err := net.ResolveTCPAddr("tcp", s.remoteAddr)
	if err != nil {
		return nil, err
	}
	return net.DialTCP("tcp", nil, tcpAddr)
}

func (s *SimController) StartSimulation() error {
	conn, err := s.connect()
	if (err != nil) {
		return err
	}
	defer conn.Close()

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
	_, err = conn.Write([]byte(outdata))
	if err != nil {
		return err
	}

	// read reply
	reply := make([]byte, 1024)
	_, err = conn.Read(reply)
	if err != nil {
		return err
	}

	return nil
}

func (s *SimController) CheckState() (State, error) {
	conn, err := s.connect()
	if (err != nil) {
		return SIMULATOR_STATE_UNKNOWN, err
	}
	defer conn.Close()

	// prepare data to send
	payload := &payload{
		Command: int(COMMAND_CHECK_STATE),
	}

	// payload to json string
	outdata, err := json.Marshal(payload)
	if err != nil {
		return SIMULATOR_STATE_UNKNOWN, err
	}

	// send data
	println("write to server = ", string(outdata))
	_, err = conn.Write([]byte(outdata))
	if err != nil {
		return SIMULATOR_STATE_UNKNOWN, err
	}

	// read reply
	reply := make([]byte, 1024)
	_, err = conn.Read(reply)
	if err != nil {
		return SIMULATOR_STATE_UNKNOWN, err
	}

	str := strings.ToLower(strings.Trim(string(reply), ""))
	var state State = SIMULATOR_STATE_UNKNOWN
	if (str == "0") {
		state = SIMULATOR_STATE_NOT_RUNNING
	} else if (str == "1") {
		state = SIMULATOR_STATE_RUNNING
	}

	return state, nil
}

func (s *SimController) StopSimulation() error {
	conn, err := s.connect()
	if (err != nil) {
		return err
	}
	defer conn.Close()

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
	_, err = conn.Write([]byte(outdata))
	if err != nil {
		return err
	}

	// read reply
	reply := make([]byte, 1024)
	_, err = conn.Read(reply)
	if err != nil {
		return err
	}

	return nil
}