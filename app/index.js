'use strict';

const app = require('app');
const BrowserWindow = require('browser-window');
const Menu = require('menu');
const MenuItem = require('menu-item');
const ipc = require('ipc');
const pg = require('pg');
// report crashes to the Electron project
require('crash-reporter').start();

// prevent window being GC'd
let mainWindow = null;
var menu = null;

app.on('window-all-closed', function () {
  app.quit();
});

var connectionString = process.env.DATABASE_URL || 'postgres://f18-db.bring.out.ba:5432/bringout_2012';

console.log( "connection string:", connectionString);

// Get a Postgres client from the connection pool
true || pg.connect(connectionString, function(err, client, done) {

        var results = [];
        var query = client.query("SELECT * from fmk.roba WHERE id>($1)", ['']);

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
            console.log( "row:", row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            client.end();
            console.log( results );
        });

        // Handle Errors
        if(err) {
          console.log(err);
        }

});


ipc.on('asynchronous-message', function(event, arg) {
  console.log(arg);  // prints "ping"
  event.sender.send('asynchronous-reply', 'pong');
});

ipc.on('synchronous-message', function(event, arg) {
  console.log(arg);  // prints "ping"
  event.returnValue = 'pong';
});


app.on('ready', function () {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 768,
    resizable: true
  });

  mainWindow.loadUrl(`file://${__dirname}/index.html`);

  try {
    var bs = require("browser-sync").create();
    bs.watch(`${__dirname}/**/*`, function (event, file) {
      if (event == "change" && file.match(/(.css|.html|.js)$/g)) {
        mainWindow.reloadIgnoringCache();
      }
    });
  } catch (e) {
  }


  var githubBugs = {
        label: 'Prijava bug-a na github',
         click: function () {
              var issuesWindow = new BrowserWindow({
                  width: 1024, height: 768, resizable: true, show: true
              });
              issuesWindow.loadUrl( 'https://github.com/hernad/electron-erp/issues' );
              //require('shell').openExternal('https://github.com/atom/electron/issues')
         }
  };


  var terminalWindow = {
        label: 'Terminal',
         click: function () {
              var terminalWindow = new BrowserWindow({
                  width: 1280, height: 768, resizable: true, show: true
              });
              terminalWindow.loadUrl( 'http://127.0.0.1:3000' );
         }
  };


  if (process.platform == 'darwin') {
    var darwinTmpl = [
      {
        label: 'Electron',
        submenu: [
          {
            label: 'About Electron',
            selector: 'orderFrontStandardAboutPanel:'
          },
          {
            type: 'separator'
          },
          {
            label: 'Services',
            submenu: []
          },
          {
            type: 'separator'
          },
          {
            label: 'Hide Electron',
            accelerator: 'Command+H',
            selector: 'hide:'
          },
          {
            label: 'Hide Others',
            accelerator: 'Command+Shift+H',
            selector: 'hideOtherApplications:'
          },
          {
            label: 'Show All',
            selector: 'unhideAllApplications:'
          },
          {
            type: 'separator'
          },
          {
            label: 'Quit',
            accelerator: 'Command+Q',
            click: function () {
              app.quit();
            }
          }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          {
            label: 'Undo',
            accelerator: 'Command+Z',
            selector: 'undo:'
          },
          {
            label: 'Redo',
            accelerator: 'Shift+Command+Z',
            selector: 'redo:'
          },
          {
            type: 'separator'
          },
          {
            label: 'Cut',
            accelerator: 'Command+X',
            selector: 'cut:'
          },
          {
            label: 'Copy',
            accelerator: 'Command+C',
            selector: 'copy:'
          },
          {
            label: 'Paste',
            accelerator: 'Command+V',
            selector: 'paste:'
          },
          {
            label: 'Select All',
            accelerator: 'Command+A',
            selector: 'selectAll:'
          }
        ]
      },
      {
        label: 'View',
        submenu: [
          {
            label: 'Reload',
            accelerator: 'Command+R',
            click: function () {
              mainWindow.restart();
            }
          },
          {
            label: 'Toggle Full Screen',
            accelerator: 'Ctrl+Command+F',
            click: function () {
              mainWindow.setFullScreen(!mainWindow.isFullScreen());
            }
          },
          {
            label: 'Toggle Developer Tools',
            accelerator: 'Alt+Command+I',
            click: function () {
              mainWindow.toggleDevTools();
            }
          }
        ]
      },
      {
        label: 'Window',
        submenu: [
          terminalWindow,
          {
            label: 'Minimize',
            accelerator: 'Command+M',
            selector: 'performMiniaturize:'
          },
          {
            label: 'Close',
            accelerator: 'Command+W',
            selector: 'performClose:'
          },
          {
            type: 'separator'
          },
          {
            label: 'Bring All to Front',
            selector: 'arrangeInFront:'
          }
        ]
      },
      {
        label: 'Pomoć',
        submenu: [
          {
            label: 'Learn More',
            click: function () {
              require('shell').openExternal('http://electron.atom.io')
            }
          },
          {
            label: 'Documentation',
            click: function () {
              require('shell').openExternal('https://github.com/atom/electron/tree/master/docs#readme')
            }
          },
          {
            label: 'Community Discussions',
            click: function () {
              require('shell').openExternal('https://discuss.atom.io/c/electron')
            }
          },
          githubBugs
        ]
      }
    ];

    menu = Menu.buildFromTemplate(darwinTmpl);
    Menu.setApplicationMenu(menu);
  } else {
    var template = [
      {
        label: '&File',
        submenu: [
          {
            label: '&Open',
            accelerator: 'Ctrl+O'
          },
          {
            label: '&Close',
            accelerator: 'Ctrl+W',
            click: function () {
              mainWindow.close();
            }
          }
        ]
      },
      {
        label: '&View',
        submenu: [
          {
            label: '&Reload',
            accelerator: 'Ctrl+R',
            click: function () {
              mainWindow.restart();
            }
          },
          {
            label: 'Toggle &Full Screen',
            accelerator: 'F11',
            click: function () {
              mainWindow.setFullScreen(!mainWindow.isFullScreen());
            }
          },
          {
            label: 'Toggle &Developer Tools',
            accelerator: 'Alt+Ctrl+I',
            click: function () {
              mainWindow.toggleDevTools();
            }
          }
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Learn More',
            click: function () {
              require('shell').openExternal('http://electron.atom.io')
            }
          },
          {
            label: 'Documentation',
            click: function () {
              require('shell').openExternal('https://github.com/atom/electron/tree/master/docs#readme')
            }
          },
          {
            label: 'Community Discussions',
            click: function () {
              require('shell').openExternal('https://discuss.atom.io/c/electron')
            }
          },
          githubBugs
        ]
      }
    ];

    menu = Menu.buildFromTemplate(template);
    mainWindow.setMenu(menu);
  }


  mainWindow.on('closed', function () {
    // deref the window
    // for multiple windows store them in an array
    mainWindow = null;
  });



  //var config = require( `file://${__dirname}/config.json` );
  //console.log('Listening on ' + config.interface + ':' + config.port);

const http = require('http');
const fs = require('fs');

const termSocketio = require('socket.io');
const child_pty = require('child_pty');
const ss = require('socket.io-stream');

var termServer = http.createServer()
	.listen( 3000 , '127.0.0.1');

var ptys = {};

termServer.on('request', function(req, res) {
		var file = null;
		console.log(req.url);
		switch(req.url) {
		case '/':
		case '/terminal.html':
			file = '/terminal.html';
			break;
		case '/terminal.js':
			file = '/terminal.js';
			break;
		case '/socket.io-stream.js':
			file = '/socket.io-stream.js';
			break;
		default:
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.end('404 Not Found');
			return;
		}
		fs.createReadStream(__dirname + file).pipe(res);
	});

termSocketio(termServer).of('pty').on('connection', function(socket) {
	// receives a bidirectional pipe from the client see index.html
	// for the client-side
	ss(socket).on('new', function(stream, options) {
		var name = options.name;
                var cmd = "echo \"Hello from electron-erp web terminal\"; w3m https://www.google.ba"

		var pty = child_pty.spawn('/bin/sh', ['-c', cmd ], options);
		pty.stdout.pipe(stream).pipe(pty.stdin);
		ptys[name] = pty;
		socket.on('disconnect', function() {
			console.log("end");
			pty.kill('SIGHUP');
			delete ptys[name];
		});
	});
});

process.on('exit', function() {
	var k = Object.keys(ptys);
	var i;

	for(i = 0; i < k.length; i++) {
		ptys[k].kill('SIGHUP');
	}
});



});


