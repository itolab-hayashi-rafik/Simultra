var express = require('express');
var router = express.Router();

// vehicleManager
var vehicleManager = require('../../../models/vehicle-manager');
var pedestrianManager = require('../../../models/pedestrian-manager');

// ---------------------------------------------------------------------------------------------------

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({});
});

/* GET vehicles */
router.get('/vehicles', function(req, res, next) {
  var vehicles = vehicleManager.getAll();
  res.json(vehicles);
});

/* GET a vehicle */
router.get('/vehicles/:id(\\d+)', function(req, res, next) {
  var vehicle = vehicleManager.get(req.params.id);
  if (vehicle) {
    res.json(vehicle);
  } else {
    res.status(400).json({message: 'vehicle not found with id='+req.params.id});
  }
});

/* ADD a new vehicle */
router.post('/vehicles/new', function(req, res, next) {
  console.log('create');
  console.log(req.body);

  // add
  var vehicle = vehicleManager.createNew(req.body);

  // return
  res.json(vehicle);
});

/* UPDATE a vehicle */
router.put('/vehicles/:id(\\d+)', function(req, res, next) {
  console.log('update: '+req.params.id);
  console.log(req.body);

  // update
  var vehicle = vehicleManager.update(req.params.id, req.body);

  // return
  if (vehicle) {
    res.json(vehicle);
  } else {
    res.status(400).json({message: 'vehicle not found with id='+req.params.id});
  }
});

/* GET pedestrians */
router.get('/pedestrians', function(req, res, next) {
  var pedestrian = pedestrianManager.getAll();
  res.json(pedestrian);
});

/* GET a pedestrian */
router.get('/pedestrians/:id(\\d+)', function(req, res, next) {
  var pedestrian = pedestrianManager.get(req.params.id);
  if (pedestrian) {
    res.json(pedestrian);
  } else {
    res.status(400).json({message: 'vehicle not found with id='+req.params.id});
  }
});

/* ADD a new pedestrian */
router.post('/pedestrians/new', function(req, res, next) {
  console.log('create');
  console.log(req.body);

  // add
  var pedestrian = pedestrianManager.createNew(req.body);

  // return
  res.json(pedestrian);
});

/* UPDATE a pedestrian */
router.put('/pedestrians/:id(\\d+)', function(req, res, next) {
  console.log('update: '+req.params.id);
  console.log(req.body);

  // update
  var pedestrian = pedestrianManager.update(req.params.id, req.body);

  // return
  if (pedestrian) {
    res.json(pedestrian);
  } else {
    res.status(400).json({message: 'vehicle not found with id='+req.params.id});
  }
});


// ---------------------------------------------------------------------------------------------------

/* Websocket interface */
router.ws('/vehicles', function(ws, req) {
  ws.on('message', function(msg) {
    var data = JSON.parse(msg);
    console.log(data);

    // action
    if (data.action) {

      // getAll action
      if (data.action === 'getAll') {
        var vehicles = vehicleManager.getAll();
        ws.send(JSON.stringify(vehicles));
      }

      // get action
      else if (data.action === 'get') {
        if (data.params && data.params.id) {
          var vehicle = vehicleManager.get(data.params.id);
          ws.send(JSON.stringify(vehicle));
        } else {
          var errMsg = '';
          errMsg += (!data.params || !data.params.id) ? 'param.id property not found.' : '';
          console.error(errMsg);
          ws.send(JSON.stringify({'message': errMsg}));
        }
      }

      // new action
      else if (data.action === 'new') {
        if (data.data) {
          var vehicle = vehicleManager.createNew(data.data);
          ws.send(JSON.stringify(vehicle));
        } else {
          var errMsg = '';
          errMsg += (!data.data) ? 'data property not found.' : '';
          console.error(errMsg);
          ws.send(JSON.stringify({'message': errMsg}));
        }
      }

      // update action
      else if (data.action === 'update') {
        if (data.params && data.params.id && data.data) {
          var vehicle = vehicleManager.update(data.params.id, data.data);
          ws.send(JSON.stringify(vehicle));
        } else {
          var errMsg = '';
          errMsg += (!data.params || !data.params.id) ? 'param.id property not found.' : '';
          errMsg += (!data.data) ? 'data property not found.' : '';
          console.error(errMsg);
          ws.send(JSON.stringify({'message': errMsg}));
        }
      }

      // unknown action
      else {
        console.error('unknown action '+data.action);
        ws.send(JSON.stringify({message: 'unknown action'+data.action}));
      }

    }

    // no action
    else {
      console.error('action property not contained!');
      ws.send(JSON.stringify({message: 'action property not contained.'}));
    }

  });
});


// ---------------------------------------------------------------------------------------------------

module.exports = router;
