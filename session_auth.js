var session = require('express-session');

// Authentication and Authorization Middleware //
var session_auth = function (data) {
	this.data = data;
}
session_auth.prototype.data = {}
session_auth.prototype.changeName = function (name) {
	this.data.name = name;
}
session_auth.auth =function(req, res, next) {
  if (req.session && req.session.username!=undefined)
    return next();
  else
    res.redirect('/admin/login');
}
session_auth.frontend =function(req, res, next) {
  if (req.session && req.session.currentUser!=undefined)
    return next();
  else
    res.redirect('/users/login');
}
module.exports = session_auth;

