var fs = require('fs');
var client = require('socket.io-client');

var dataStream = fs.createWriteStream('data.txt', {'flags': 'a'});
var reg  = /^\w*,/;

var socket = client.connect("http://xxx", {path: '/openlocate.io', forceNew: true});
socket.on('testEvent1', (data) => {
    console.log(data.replace(reg, ''));
    dataStream.write(data.replace(reg, '') + '\n');
});


