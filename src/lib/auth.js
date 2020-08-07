var defaults = require('./defaults');

var Auth = module.exports = function (lastfm) {
	this.lastfm = lastfm;
};

Auth.prototype.getMobileSession = async function (username, password) {
	var options = defaults.defaultOptions({
		'username' : username,
		'password' : password
	});
	return await this.lastfm.api.request('auth.getMobileSession', options);
};

Auth.prototype.getMobileSessionLibreFM = async function (username, token) {
	var options = defaults.defaultOptions({
		'username' : username,
		'authtoken' : token
	});
	return await this.lastfm.api.request('auth.getMobileSession', options);
};

Auth.prototype.getSession = async function (token) {
	var options = defaults.defaultOptions({ 'token' : token }, 'session');
	return await this.lastfm.api.request('auth.getSession', options);
};

Auth.prototype.getToken = async function () {
	var options = defaults.defaultOptions({}, 'token');
	return await this.lastfm.api.request('auth.getToken', options);
};
