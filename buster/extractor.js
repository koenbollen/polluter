
var cheerio = require( "cheerio" );

var Extractor = (function(){

	function Extractor( data ) {
		this.data = data;
		this.polls = [];
		return this;
	}

	Extractor.prototype = {
		detect: function() {
			this.polls = [];
			var $ = cheerio.load( this.data );
			var forms = $("form");
			$(forms).each(function(i, form){
				var poll = this.parse( $, form );
				if( poll !== undefined )
					this.polls.push( poll );
			}.bind(this));
			return this.polls;
		},
		parse: function($, form) {
			var result = {
				id: $(form).attr("id"),
				name: $(form).attr("name"),
				method: $(form).attr("method") || "get",
				action: $(form).attr("action") || "",

				choices: [],
				hiddens: [],
				specials: [],
				submit: null
			}
			result.method = result.method.trim().toLowerCase();

			var names = [];
			var radios = $("input[type=radio]", $(form));
			radios.each(function(i,radio) {
				var n = $(radio).attr("name");
				if( names.indexOf( n ) < 0 )
					names.push( n );
			});
			if( names.length != 1 )
				return; // Only supporting one radio-groupname.

			var groupname = names.pop();

			radios = radios.toArray().filter(function(r) { return r.attribs.name == groupname });
			if( radios.length < 2 )
				return; // Less than two choices, not a poll.
			$(radios, {ignoreWhitespace:true}).each(function(i,radio) {
				var value = $(radio).attr("value");
				if( value === undefined )
					return;
				var text = null;
				var id = $(radio).attr("id");
				if( id ) {
					var label = $(form).find("label[for="+id+"]");
					if( label )
						text = $(label).text();
				}
				if( !text )
					text = radio.next.data;
				if( !text )
					text = value;
				result.choices.push( [value, text.trim()] );
			});

			$(form).find("input[type=hidden]").each(function(i,hid) {
				var name = hid.attribs.name;
				var value = hid.attribs.value;
				if( name && value )
					result.hiddens.push( [name, value] );
			});

			var submit = $(form).find("input[type=submit]");
			if( submit )
				result.submit = [submit.attr("name"), submit.attr("value")];

			//console.log( result );
			return result;
		}
	};
	return Extractor;
})();

exports.Extractor = Extractor;
