var defaults = require('./defaults');

var User = module.exports = function (lastfm) {
	this.lastfm = lastfm;
};

User.prototype.getArtistTracks = async function (params) {
	var options = defaults.defaultOptions(params, 'artisttracks');
	return await this.lastfm.api.request('user.getArtistTracks', options);
};

User.prototype.getFriends = async function (params) {
	var options = defaults.defaultOptions(params, 'friends');
	return await this.lastfm.api.request('user.getFriends', options);
};

User.prototype.getInfo = async function (user) {
	if (typeof callback !== 'function') { callback = user; user = null; }
	var params = (user) ? { 'user' : user } : null;
	var options = defaults.defaultOptions(params, 'user');
	if (!params) { options.sk = this.lastfm.sessionCredentials.key; }
	return await this.lastfm.api.request('user.getInfo', options);
};

User.prototype.getLovedTracks = async function (params) {
	var options = defaults.defaultOptions(params, 'lovedtracks');
	return await this.lastfm.api.request('user.getLovedTracks', options);
};

User.prototype.getPersonalTags = async function (params) {
	var options = defaults.defaultOptions(params, 'taggings');
	return await this.lastfm.api.request('user.getPersonalTags', options);
};

User.prototype.getRecentTracks = async function (params) {
	var options = defaults.defaultOptions(params, 'recenttracks');
	return await this.lastfm.api.request('user.getRecentTracks', options);
};

User.prototype.getTopAlbums = async function (params) {
	var options = defaults.defaultOptions(params, 'topalbums');
	return await this.lastfm.api.request('user.getTopAlbums', options);
};

User.prototype.getTopArtists = async function (params) {
	var options = defaults.defaultOptions(params, 'topartists');
	return await this.lastfm.api.request('user.getTopArtists', options);
};

User.prototype.getTopTags = async function (user, limit) {
	if (typeof callback !== 'function') { callback = limit; limit = null; }
	var options = defaults.defaultOptions({
		'user' : user,
		'limit' : limit
	}, 'toptags');
	return await this.lastfm.api.request('user.getTopTags', options);
};

User.prototype.getTopTracks = async function (params) {
	var options = defaults.defaultOptions(params, 'toptracks');
	return await this.lastfm.api.request('user.getTopTracks', options);
};

User.prototype.getWeeklyAlbumChart = async function (params) {
	var options = defaults.defaultOptions(params, 'weeklyalbumchart');
	return await this.lastfm.api.request('user.getWeeklyAlbumChart', options);
};

User.prototype.getWeeklyArtistChart = async function (params) {
	var options = defaults.defaultOptions(params, 'weeklyartistchart');
	return await this.lastfm.api.request('user.getWeeklyArtistChart', options);
};

User.prototype.getWeeklyChartList = async function (user) {
	var options = defaults.defaultOptions({ 'user' : user }, 'weeklychartlist');
	return await this.lastfm.api.request('user.getWeeklyChartList', options);
};

User.prototype.getWeeklyTrackChart = async function (params) {
	var options = defaults.defaultOptions(params, 'weeklytrackchart');
	return await this.lastfm.api.request('user.getWeeklyTrackChart', options);
};
