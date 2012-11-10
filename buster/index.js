
var request = require( "request" );
var cheerio = require( "cheerio" );

var extractor = require( "./extractor" );


function bust( url, pollInfo, callback ) {
	var urlinfo = url.parse( pollInfo.url );
	console.log( "Busting on", urlinfo );
	var requestInfo = {
		host: urlinfo.host,
		port: urlinfo.port,
		path: urlinfo.path
	};

	var req = http.request( requestInfo, function(data) {
		var result = true;
		callback(undefined, result);
	}).on( "error", callback );

}

function crawl( url, callback ) {

	request( url, function(err, response, data) {
		if(err) return;

		var ex = new extractor.Extractor(data);
		var polls = ex.detect();
		console.log( JSON.stringify(polls, null, " ") );
	});

}

crawl( process.argv[2], console.log );
