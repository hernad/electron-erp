var child_pty = require('child_pty');
var child = child_pty.spawn('/bin/sh', []);
child.stdout.on('resize', function() {
    console.log('New columns: ' + this.columns);
    console.log('New rows:    ' + this.rows);
}).pipe(process.stdout);
child.stdout.resize({ columns: 80, rows: 48 });
child.stdin.write('ls -l\n');
child.stdin.write('exit\n');
