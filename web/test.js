var config = { 
        "login": "echo \"Please don't use this in productive environments as all keystrokes are sent in plain text!\"; /bin/sh",
	"port": 3001,
	"interface": "127.0.0.1"
};

var http = require('http'),
    fs = require('fs'),
    socketio = require('socket.io'),
    child_pty = require('child_pty'),
    ss = require('socket.io-stream');


var server = http.createServer()
	.listen(config.port, config.interface);

var ptys = {};

server.on('request', function(req, res) {
		var file = null;
		console.log(req.url);
		switch(req.url) {
		case '/':
		case '/index.html':
			file = '/terminal.html';
			break;
		case '/terminal.js':
			file = '/node_modules/terminal.js/dist/terminal.js';
			break;
		case '/socket.io-stream.js':
			file = '/node_modules/socket.io-stream/socket.io-stream.js';
			break;
		default:
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.end('404 Not Found');
			return;
		}
		fs.createReadStream(__dirname + file).pipe(res);
	});

socketio(server).of('pty').on('connection', function(socket) {

	// receives a bidirectional pipe from the client see index.html
	// for the client-side
	ss(socket).on('new', function(stream, options) {
		var name = options.name;

		var term = child_pty.spawn('/bin/sh', ['-c', config.login], options);
		term.stdout.pipe(stream).pipe(term.stdin);
                //pty.stdout.on( 'data', function(data) {
                //  console.log( "stdout data:", data.toString() );
                //});
                term.stdin.write( './test\n' );
                term.stdin.write( 'Hello\n' );

                term.stdout.on('data', function(data) {
			if ( data.toString().search( /Heeloo:/ ) > 0 ) {
                            pty.stdin.write( 'EH#' );
                        };
	        });


		ptys[name] = term;
		socket.on('disconnect', function() {
			console.log("end");
			term.kill('SIGHUP');
			delete ptys[name];
		});
               
                //stream.push( "./test\n" );
                console.log( "pushiram test");
	});

        

});

process.on('exit', function() {
	var k = Object.keys(ptys);
	var i;

        console.log( "exit process !!");
	for(i = 0; i < k.length; i++) {
		ptys[k].kill('SIGHUP');
	}
});

console.log('Listening on ' + config.interface + ':' + config.port);
