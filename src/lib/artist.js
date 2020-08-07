var defaults = require('./defaults');

var Artist = module.exports = function (lastfm) {
	this.lastfm = lastfm;
};

Artist.prototype.addTags = async function (artist, tags) {
	if (!Array.isArray(tags)) { tags = [ tags ]; }
	var options = defaults.defaultOptions({
		'artist' : artist,
		'tags' : tags.join(','),
		'sk' : this.lastfm.sessionCredentials.key
	});
	return await this.lastfm.api.request('artist.addTags', options);
};

Artist.prototype.getCorrection = async function (artist) {
	var options = defaults.defaultOptions({ 'artist' : artist }, 'corrections');
	return await this.lastfm.api.request('artist.getCorrection', options);
};

Artist.prototype.getInfo = async function (params) {
	var options = defaults.defaultOptions(params, 'artist');
	return await this.lastfm.api.request('artist.getInfo', options);
};

Artist.prototype.getSimilar = async function (params) {
	var options = defaults.defaultOptions(params, 'similarartists');
	return await this.lastfm.api.request('artist.getSimilar', options);
};

Artist.prototype.getTags = async function (params) {
	if (!params.user) { params.user = this.lastfm.sessionCredentials.username; } 
	var options = defaults.defaultOptions(params, 'tags');
	return await this.lastfm.api.request('artist.getTags', options);
};

Artist.prototype.getTopAlbums = async function (params) {
	var options = defaults.defaultOptions(params, 'topalbums');
	return await this.lastfm.api.request('artist.getTopAlbums', options);
};

Artist.prototype.getTopTags = async function (params) {
	var options = defaults.defaultOptions(params, 'toptags');
	return await this.lastfm.api.request('artist.getTopTags', options);
};

Artist.prototype.getTopTracks = async function (params) {
	var options = defaults.defaultOptions(params, 'toptracks');
	return await this.lastfm.api.request('artist.getTopTracks', options);
};

Artist.prototype.removeTag = async function (artist, tag) {
	var options = defaults.defaultOptions({
		'artist' : artist,
		'tag' : tag,
		'sk' : this.lastfm.sessionCredentials.key
	});
	return await this.lastfm.api.request('artist.removeTag', options);
};

Artist.prototype.search = async function (params) {
	var options = defaults.defaultOptions(params, 'results');
	return await this.lastfm.api.request('artist.search', options);
};
