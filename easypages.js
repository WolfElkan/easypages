if (!http) {
	var http = require('http');
}
if (!fs) {
	var fs = require('fs');
}
var APP = {
	'Apages': {},
	'Rpages': {},
	'404': {
		'url':	null,
		'file':	null,
		'ct':	'text/html',
		'utf8':	true,
		'code':	404,
	}
};
APP.page = function(url,file,ct=null,code=null){
	this.url = url;
	this.file = file;
	var ctx = {
		'html':	[true, 'text/html'],
		'css':	[true, 'text/css'],
		'js':	[true, 'text/javascript'],
		'png':	[false,'image/png'],
		'jpeg':	[false,'image/jpeg'],
		'jpg':	[false,'image/jpeg'],
		'gif':	[false,'image/gif'],
		'bmp':	[false,'image/bmp']
	}
	if (ct != null){
		if (ct in ctx) {
			this.ct = ctx[ct][1];
		} else {
			this.ct = ct;
		}
	} else {
		var ext = new RegExp("\\..+$");
		var rematch = ext.exec(file);
		// console.log('rematch:',rematch);
		if (rematch != null) {
			rematch = rematch[0];		
		}
		rematch = rematch.slice(1);
		if (rematch == null || !(rematch in ctx)){
			console.log('Error: Could not determine content type for file',file);
			console.log('Please enter a type manually as 3rd argument.')
		} else {
			this.ct = ctx[rematch][1];
		}
	}
	this.utf8 = (this.ct[0] == 't');
	if (code != null){
		this.code = code;
	} else {
		if (file == null) {
			this.code = 204;
		} else {
			this.code = 200;
		}
	}
}
APP.Page = function(url,file,ct=null,code=null){
	var newpage = new APP.page(url,file,ct,code);
	if (typeof(url) == 'string'){
		APP['Apages'][url] = newpage;
	} else {
		APP['Rpages'][url] = newpage;
	}
}
APP.run = function(port){
	var server = http.createServer(function (request, response){
		if (request.url in APP.Apages) {
			var page = APP.Apages[request.url];
		} else {
			var flag = false;
			for (var key in APP.Rpages) {
				if ((APP.Rpages[key].url).test(request.url)) {
					flag = true;
					var page = APP[key];
					break;
				}
			} 
			if (!flag) {
				var page = APP['404'];
			}
		}
		var utf8 = null;
		if (page.utf8) {
			utf8 = 'utf8';
		}
		if (page.ct == 'text/html') {
			console.log('Request:', request.url);
		} else {
			console.log('aux:','       ', request.url);
		}
		fs.readFile(page.file, utf8, function(errors,contents){
			response.writeHead(page.code, {'Content-Type':page.ct});
			response.write(contents);
			response.end();
		});
	});
server.listen(port);
console.log("Running in LOCALHOST Port:",port);
}
module.exports = APP;