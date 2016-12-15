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

setInterval(heartbeat, 5);

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
        // console.log(data);
        if(!food) {
            // console.log('Food spawn');
            food = {
                x : data.food.x,
                y : data.food.y
            }
        }
        else {
            io.sockets.emit('foodPosition', food);
        }
        // console.log(food);
    });

    // client update
    socket.on('update', function(data) {
        var snake;
        for(var i = 0; i < snakes.length; i++) {
            if(socket.id == snakes[i].id) {
                snake = snakes[i];
            }
        }
        // console.log(socket.id + ' ' + data.x + ' ' + data.y);
        if(snake) {
            snake.x = data.x;
            snake.y = data.y;
            if(snake.tail) {
                snake.tail = data.tail;
            }
            snake.total = data.total;
            // console.log(snake);
        }
        if(food) {
            if(food.x !== data.food.x || food.y !== data.food.y) {
                food = data.food;
                io.sockets.emit('foodPosition', food);
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

    // client grows in length
    socket.on('grow', function(data) {
        console.log(socket.id + ' grew');
        // console.log(data);
        // find correct snake
        // for(var i = 0; i < snakes.length; i++) {
            // if(socket.id == snakes[i].id) {
            //     // found snake
            //     console.log(data);
            //     var s = snakes[i];
            //     s.total = data.total;
            //     for (var i = 0; i < data.total; i++) {
            //         s.tail[i] = 'x';
            //     }
                // s.tail[data.total-1] = {
                //     x: s.x,
                //     y: s.y
                // };

                // s.x = s.x + s.xspeed*scl;
                // s.y = s.y + s.yspeed*scl;
            //     console.log(s);
            // }
        // }
    });

    // client dies
    socket.on('die', function(data) {
        console.log(socket.id + ' died');
        for(var i = 0; i < snakes.length; i++) {
            if(socket.id == snakes[i].id) {
                var snake = snakes[i];
                snakes[i] = new Snake(socket.id, snake.x, snake.y);
            }
        }
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
    this.tailLength = 0;
}