var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('maps/index');
});

/* GET static map page */
router.get('/static', function(req, res, next) {
  res.render('maps/static');
});

module.exports = router;
