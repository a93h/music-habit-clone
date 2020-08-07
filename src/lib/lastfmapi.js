var url = require('url');
var defaults = require('./defaults');
var lastfm = require('./lastfm');
var LastFmNode = require('./lastfm').LastFmNode;

var Album = require('./album');
var Artist = require('./artist');
var Auth = require('./auth');
var Chart = require('./chart');
var Geo = require('./geo');
var Library = require('./library');
var Tag = require('./tag');
var Track = require('./track');
var User = require('./user');

var LastfmAPI = module.exports = function (options) {
	this.api = new LastFmNode(options);
	this.sessionCredentials = null;

	this.album = new Album(this);
	this.artist = new Artist(this);
	this.auth = new Auth(this);
	this.chart = new Chart(this);
	this.geo = new Geo(this);
	this.library = new Library(this);
	this.tag = new Tag(this);
	this.track = new Track(this);
	this.user = new User(this);
};

LastfmAPI.prototype.getAuthenticationUrl = function (params) {
	if (!params) params = {};
	var baseUrl = 'http://www.last.fm/api/auth',
	    urlParts = url.parse(baseUrl);

	urlParts.query = {};;
	urlParts.query.api_key = this.api.api_key;
	if (params.cb) { urlParts.query.cb = params.cb; }
	if (params.token) { urlParts.query.token = params.token; }

	return url.format(urlParts);
};

LastfmAPI.prototype.setSessionCredentials = function (username, key) {
	this.sessionCredentials = {
		'username' : username,
		'key' : key
	};
};

LastfmAPI.prototype.setToken = function (token) {
	if (token.substring(0,2) === "b'") {
		token = token.substring(2,token.length - 1)
	}
	this.token = token
}

LastfmAPI.prototype.getToken = async function() {
	var self = this;
	const token = await this.auth.getToken()
	if (!token) console.warn('Token not found')
	else self.token = token.token
	return token.token
}

LastfmAPI.prototype.authenticate = async function (token) {
	var self = this;
	const session = await this.auth.getSession(token);
	if (!session) console.warn('Session not found');
	else self.setSessionCredentials(session.username, session.key);
	return session
};

LastfmAPI.prototype.authenticateMobile = async function (user, password) {
	var self = this;
	const s = await this.auth.getMobileSession(user, password);
	if (!s) console.warn('Session not found');
	else self.setSessionCredentials(s.session.name, s.session.key);
	return s
}

LastfmAPI.prototype.authenticateMobileLibreFM = async function (user, token) {
	var self = this;
	const s = await this.auth.getMobileSessionLibreFM(user, token);
	if (!s) console.warn('Session not found');
	else self.setSessionCredentials(s.session.name, s.session.key);
	return s
}