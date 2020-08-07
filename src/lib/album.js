var defaults = require('./defaults');

var Album = module.exports = function (lastfm) {
	this.lastfm = lastfm;
};

Album.prototype.addTags = async function (artist, album, tags) {
	if (!Array.isArray(tags)) { tags = [ tags ]; }
	var options = defaults.defaultOptions({
		'artist' : artist,
		'album' : album,
		'tags' : tags.join(','),
		'sk' : this.lastfm.sessionCredentials.key
	});
	return await this.lastfm.api.request('album.addTags', options);
};

Album.prototype.getInfo = async function (params) {
	var options = defaults.defaultOptions(params, 'album');
	return await this.lastfm.api.request('album.getInfo', options);
};

Album.prototype.getTags = async function (params) {
	if (!params.user) { params.user = this.lastfm.sessionCredentials.username; } 
	var options = defaults.defaultOptions(params, 'tags');
	return await this.lastfm.api.request('album.getTags', options);
};

Album.prototype.getTopTags = async function (params) {
	var options = defaults.defaultOptions(params, 'toptags');
	return await this.lastfm.api.request('album.getTopTags', options);
};

Album.prototype.removeTag = async function (artist, album, tag) {
	var options = defaults.defaultOptions({
		'artist' : artist,
		'album' : album,
		'tag' : tag,
		'sk' : this.lastfm.sessionCredentials.key
	});
	return await this.lastfm.api.request('album.removeTag', options);
};

Album.prototype.search = async function (params) {
	var options = defaults.defaultOptions(params, 'results');
	return await this.lastfm.api.request('album.search', options);
};
