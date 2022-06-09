function SnakeGame(canvas, options) {
	var self = this;

	// Set default options
	var defaultOptions = {
		width: 1000,
		height: 1000,
		speed: 100,
		apple: {
			color: 'red',
			size: 10
		},
		snake: {
			color: 'green',
			size: 10,
			speed: 100
		},
		score: {
			color: 'blue',
			size: 20
		},
		background: 'white'
	};

	// Merge options
	this.options = {
		...defaultOptions,
		...options,
	};

	// Set canvas
	this.canvas = canvas || document.createElement('canvas');
	this.ctx = this.canvas.getContext('2d');

	// remove all children from body element
	while (document.body.firstChild) {
		document.body.removeChild(document.body.firstChild);
	}

	// append canvas to dom
	document.body.appendChild(this.canvas);

	// Set canvas size
	this.canvas.width = this.options.width;
	this.canvas.height = this.options.height;

	// Set game state
	this.state = 'init';

	// Set score
	this.score = 0;

	// Set apple
	this.apple = {
		x: 0,
		y: 0
	};

	// Set snake
	this.snake = {
		x: 0,
		y: 0,
		direction: 'right',
		body: [
			{
				x: 0,
				y: 0
			},
		]
	};

	// Set key state
	this.keyState = {
		left: false,
		up: false,
		right: false,
		down: false
	};

	// Set key map
	this.keyMap = {
		37: 'left',
		38: 'up',
		39: 'right',
		40: 'down'
	};

	// Set key down event
	window.onkeydown = function(e) {
		if (self.state == 'init') {
			self.state = 'play';
		}

		if (self.keyMap[e.keyCode]) {
			self.keyState[self.keyMap[e.keyCode]] = true;
		}

		e.preventDefault();
	};

	// Set key up event
	window.onkeyup = function(e) {
		if (self.keyMap[e.keyCode]) {
			self.keyState[self.keyMap[e.keyCode]] = false;
		}
	};

	// Set game loop
	this.loop = setInterval(function() {
		self.update();
		self.draw();
	}, this.options.speed);

	// Set game over
	this.gameOver = function() {
		self.state = 'gameover';
	};

	// Set update
	this.update = function() {
		if (self.state == 'play') {
			self.updatePlay();
		}
	};
	

	this.updatePlay = function() {
		var newHead = {
			x: this.snake.body[0].x,
			y: this.snake.body[0].y
		};

		if (this.keyState.left) {
			newHead.x -= this.options.snake.size;
			this.snake.direction = 'left';
		} else if (this.keyState.up) {
			newHead.y -= this.options.snake.size;
			this.snake.direction = 'up';
		} else if (this.keyState.right) {
			newHead.x += this.options.snake.size;
			this.snake.direction = 'right';
		} else if (this.keyState.down) {
			newHead.y += this.options.snake.size;
			this.snake.direction = 'down';
		}

		this.snake.body.unshift(newHead);

		if (this.snake.body[0].x == this.apple.x && this.snake.body[0].y == this.apple.y) {
			this.score++;
			this.apple.x = Math.floor(Math.random() * (this.canvas.width / this.options.snake.size)) * this.options.snake.size;
			this.apple.y = Math.floor(Math.random() * (this.canvas.height / this.options.snake.size)) * this.options.snake.size;
		} else {
			this.snake.body.pop();
		}

		if (this.snake.body[0].x < 0 || this.snake.body[0].x >= this.canvas.width || this.snake.body[0].y < 0 || this.snake.body[0].y >= this.canvas.height) {
			this.gameOver();
		}

		// for (var i = 1; i < this.snake.body.length; i++) {
		// 	if (this.snake.body[0].x == this.snake.body[i].x && this.snake.body[0].y == this.snake.body[i].y) {
		// 		this.gameOver();
		// 	}
		// }
	};
	
	this.draw = function() {
		if (self.state == 'init') {
			self.drawInit();
		} else if (self.state == 'play') {
			self.drawPlay();
		} else if (self.state == 'gameover') {
			self.drawGameOver();
		}
	};

	this.drawInit = function() {
		this.ctx.fillStyle = this.options.background;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.ctx.fillStyle = this.options.apple.color;
		this.ctx.fillRect(this.apple.x, this.apple.y, this.options.apple.size, this.options.apple.size);

		this.ctx.fillStyle = this.options.snake.color;
		for (var i = 0; i < this.snake.body.length; i++) {
			this.ctx.fillRect(this.snake.body[i].x, this.snake.body[i].y, this.options.snake.size, this.options.snake.size);
		}
	};

	this.drawPlay = function() {
		this.ctx.fillStyle = this.options.background;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.ctx.fillStyle = this.options.apple.color;
		this.ctx.fillRect(this.apple.x, this.apple.y, this.options.apple.size, this.options.apple.size);

		this.ctx.fillStyle = this.options.snake.color;
		for (var i = 0; i < this.snake.body.length; i++) {
			this.ctx.fillRect(this.snake.body[i].x, this.snake.body[i].y, this.options.snake.size, this.options.snake.size);
		}

		this.ctx.fillStyle = this.options.score.color;
		this.ctx.font = this.options.score.size + 'px Arial';
		this.ctx.fillText(this.score, 10, this.options.score.size);
	};

	this.drawGameOver = function() {
		this.ctx.fillStyle = this.options.background;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.ctx.fillStyle = this.options.apple.color;
		this.ctx.fillRect(this.apple.x, this.apple.y, this.options.apple.size, this.options.apple.size);

		this.ctx.fillStyle = this.options.snake.color;
		for (var i = 0; i < this.snake.body.length; i++) {
			this.ctx.fillRect(this.snake.body[i].x, this.snake.body[i].y, this.options.snake.size, this.options.snake.size);
		}

		this.ctx.fillStyle = this.options.score.color;
		this.ctx.font = this.options.score.size + 'px Arial';
		this.ctx.fillText(this.score, 10, this.options.score.size);

		this.ctx.fillStyle = 'red';
		this.ctx.font = '50px Arial';
		this.ctx.fillText('Game Over', this.canvas.width / 2 - 100, this.canvas.height / 2);
	};
}