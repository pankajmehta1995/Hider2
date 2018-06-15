var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Hider' });
});
router.get('/index', function(req, res) {
  res.render('index', { title: 'Hider' });
});

module.exports = router;
