var url = require('url');
var rexec = require('remote-exec');
var messaging = require('./messaging');
var webrouter = require('./webrouter');
var fs = require('fs');
var lazy = require("lazy");
var Q = require("q");
/*
 * GET users listing.
 */

function render_cluster(req, res){
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	var config = req.app.get('configuration');
	
	res.render('cluster', { title: 'HOOP Resources Administration', redirect_url: config.zookeeper["zookeeper-exhibitor"]});
}

exports.load_cluster = function(req, res){
	render_cluster(req,res);
};