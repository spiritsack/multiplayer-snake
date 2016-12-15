function Snake(color, x, y) {
	this.x = x;
	this.y = y;
	this.color = color;
	this.xspeed = 1;
	this.yspeed = 0;
	this.total = 0;
	this.tail = [];

	this.eat = function(pos) {
		var d = dist(this.x, this.y, pos.x, pos.y);
		if (d < 1) {
			this.total++;
			if(fps < 20) {
				frameRate(++fps);
			}
			fpsText.remove();
			fpsText = createDiv('speed: '+fps, 0, 605);
			fpsText.position(0, 605);
			score.remove();
			score = createDiv('score: '+s.total, 540, 605)
			score.position(540, 605);

			var data = {
				x: s.x,
				y: s.y,
				food: {
					x: food.x,
					y: food.y
				},
				total: s.total,
				tail: []
			};
			for (var i = 0; i < this.tail.length - 1; i++) {
				var tail = {
					x: this.tail[i].x,
					y: this.tail[i].y,
				};
				data.tail.push(tail) 
			}
			socket.emit('update', data);
			return true;
		}
		else {
			return false;
		}
	}

	this.dir = function(x, y) {
		this.xspeed = x;
		this.yspeed = y;
	}

	this.death = function() {
		for (var i = 0; i < this.tail.length; i++) {
			var pos = this.tail[i];
			var d = dist(this.x, this.y, pos.x, pos.y);
			if(d < 1) {
				if(s.total > highScore) {
					highScore = s.total;
					if(highScoreText !== undefined) {
						highScoreText.remove();
					}
					highScoreText = createDiv('high score: '+s.total, 260, 605)
					highScoreText.position(260, 605);
				}

				this.total = 0;
				this.tail = [];
				fps = initialFps;
				frameRate(fps);

				fpsText.remove();
				fpsText = createDiv('speed: '+fps, 0, 605);
				fpsText.position(0, 605);
				score.remove();
				score = createDiv('score: '+s.total, 540, 605)
				score.position(540, 605);

				socket.emit('die');

				spawnFood();
			}
		}
	}

	this.update = function() {
		if(this.total === this.tail.length) {
			// update tail position
			for (var i = 0; i < this.tail.length - 1; i++) {
				this.tail[i] = this.tail[i+1];
			}
		}
		this.tail[this.total-1] = createVector(this.x, this.y);

		this.x = this.x + this.xspeed*scl;
		this.y = this.y + this.yspeed*scl;

		this.x = constrain(this.x, 0, width-scl);
		this.y = constrain(this.y, 0, height-scl);
	}

	this.show = function() {
		fill(color);
		for(var i = 0; i < this.total; i++) {
			rect(this.tail[i].x, this.tail[i].y, scl, scl);
		}
		rect(this.x, this.y, scl, scl);
	}
}
