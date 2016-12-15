var snakes = [];
var food;
var scl = 20;

var express = require('express');
var app = express();
var server = app.listen(3000);

app.use(express.static('public'));

console.log('Socket server running');

var socket = require('socket.io');

var io = socket(server);

setInterval(heartbeat, 100);

function heartbeat() {
    io.sockets.emit('heartbeat', snakes);
}

io.sockets.on('connection', newConnection);

function newConnection(socket) {
    console.log('New connection: ' + socket.id);
    
    // client connect
    socket.on('start', function(data) {
        console.log('New client: ' + socket.id + ' ' + data.x + ' ' + data.y);
        var snake = new Snake(socket.id, data.x, data.y);
        snakes.push(snake);
        if(!food) {
            food = {
                x : data.food.x,
                y : data.food.y
            }
        }
        else {
            io.sockets.emit('foodPosition', food);
        }
    });

    // client update
    socket.on('update', function(data) {
        var snake;
        for(var i = 0; i < snakes.length; i++) {
            if(socket.id == snakes[i].id) {
                snakes[i].x = data.x;
                snakes[i].y = data.y;
                snakes[i].total = data.total;
                snakes[i].tail = data.tail;
            }
        }
        if(food.x !== data.food.x || food.y !== data.food.y) {
            food = data.food;
            io.sockets.emit('foodPosition', food);
        }
    });

    // snake dies
    socket.on('die', function(data) {
        console.log(socket.id + ' died');
        for(var i = 0; i < snakes.length; i++) {
            if(socket.id == snakes[i].id) {
                var snake = snakes[i];
                // reset snake
                snakes[i] = new Snake(socket.id, snake.x, snake.y);
            }
        }
    });

    // client disconnect
    socket.on('disconnect', function(data) {
        for(var i = 0; i < snakes.length; i++) {
            if(socket.id == snakes[i].id) {
                snakes.splice(i, 1);
            }
        }
      console.log('Client ' + socket.id + ' has disconnected');
    });
}

function Snake(id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.xspeed = 1;
    this.yspeed = 0;
    this.total = 0;
    this.tail = [];
}