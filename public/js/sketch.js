var canvas;
var s;
var snakes = [];
var scl = 20;
var initialFps = 10;
var fps = initialFps;
var fpsText;
var score;
var highScoreText;
var highScore = 0;
var food;

var socket;

function setup() {
    canvas = createCanvas(600, 600);
	canvas.position(0, 0);

	s = new Snake(255, 0, 0);
	frameRate(fps);
	spawnFood();

	fpsText = createDiv('speed: '+fps, 0, 605);
	fpsText.position(0, 605);
	score = createDiv('score: '+s.total, 540, 605)
	score.position(540, 605);

    socket = io.connect('http://localhost:3000');

	var data = {
		x: s.x,
		y: s.y,
		total: s.total,
		tail: [],
		food: {
			x: food.x,
			y: food.y
		}
	};
	
	// console.log(data);
	socket.emit('start', data);

	socket.on('heartbeat', function(data) {
        snakes = data;
    });
	socket.on('foodPosition', function(data) {
		// console.log(data);
		spawnFood(data.x, data.y);
	});
}

function spawnFood(x,y) {
	if(!x && !y) {
		var cols = this.floor(width/scl);
		var rows = this.floor(height/scl);
		food = createVector(floor(random(rows)), floor(random(cols)));
		food.mult(scl);
	}
	else {
		food = createVector(x, y);
	}
}

function draw() {
    background(51);
	if (s.eat(food)) {
		spawnFood();
	}
	s.death();
	s.update();
	s.show();

	for(var i = snakes.length - 1; i >= 0; i--) {
		if(snakes[i].id !== socket.id) {
			// draw external snake
			var snake = snakes[i];
			fill(0,0,255);
			rect(snake.x, snake.y, scl, scl);

			// draw tail
			if(snake.total > 0 && snake.tail) {
				fill(0,0,255);
				for(var i = 0; i < snake.total; i++) {
					rect(snake.tail[i].x, snake.tail[i].y, scl, scl);
					var tail = {
						x: s.tail[i].x,
						y: s.tail[i].y
					}
					data.tail.push(tail);
				}
			}

			// show user id below snake
			fill(255);
			textAlign(CENTER);
			textSize(12);
			text(snake.id, snake.x, snake.y);
		}
	}

	fill(255, 0, 100);
	rect(food.x, food.y, scl, scl)

	var data = {
		x: s.x,
		y: s.y,
		total: s.total,
		tail: [],
		food: {
			x: food.x,
			y: food.y
		}
	};

	socket.emit('update', data);
}

function keyPressed() {
    if(keyCode === UP_ARROW && s.yspeed !== 1) {
        s.dir(0, -1);
        x = true;
	}
	else if ( keyCode === DOWN_ARROW && s.yspeed !== -1) {
        s.dir(0, 1);
        x = true;
	}
	else if ( keyCode === RIGHT_ARROW && s.xspeed !== -1) {
        s.dir(1, 0);
        x = true;
	}
	else if ( keyCode === LEFT_ARROW && s.xspeed !== 1) {
        s.dir(-1, 0);
        x = true;
	}

}