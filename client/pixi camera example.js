
/*
https://jsfiddle.net/vwcns1qk/4/

example created by GERENTE for Pixi.js Forum to RENDER only objects INSCREEN
http://www.html5gamedevs.com/topic/34168-rendering-only-in-screen-objects/
USE W,A,S,D to move
*/

var screenW = 600;
var screenH = 600;
var renderer = PIXI.autoDetectRenderer(screenW, screenH, {
	backgroundColor: 0xAA7F39,
	antialias: true,
	transparent: false,
	resolution: 1
});
document.body.appendChild(renderer.view);

//LAYER
renderer.stage = new PIXI.Container()
renderer.stage.position.set(screenW / 2, screenH / 2)

var layerPlayer = new PIXI.Container()
var layerEnemies = new PIXI.Container()
renderer.stage.addChild(layerEnemies)
renderer.stage.addChild(layerPlayer)

//CREATE CIRCLE GRAPHIC
var createGraphic = function (x, y, color) {
	var graphic = new PIXI.DisplayObjectContainer();
	graphic.position.set(x, y)

	//BODY
	var body = new PIXI.Graphics();
	body.name = 'body'
	body.lineStyle(2, 0x000000, 1);
	body.beginFill(color ? color : 0xff0000);
	body.drawCircle(0, 0, 15);
	graphic.addChild(body)

	//FACE
	var face = new PIXI.Graphics();
	face.name = 'face'
	face.lineStyle(2, 0x000000, 1);
	face.beginFill(0x000000);
	face.drawCircle(15, 0, 5);
	graphic.addChild(face)


	return graphic
}

var random = function (min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}
var clamp = function (number, min, max) {
	return Math.min(Math.max(min, number), max)
}

//ADDING PLAYER
var player = createGraphic(0, 0, 0x0000FF)
player.xPos = player.yPos = 0
layerPlayer.addChild(player)

//ADDING ENEMIES
for(var i = 0; i < 3001; i++) {
	var pos = { x: random(0, 10000), y: random(0, 10000) }
	var enemy = createGraphic(pos.x, pos.y)
	enemy.xPos = pos.x
	enemy.yPos = pos.y
	layerEnemies.addChild(enemy)
}


//INPUT LISTENERS
document.addEventListener("keydown", function (event) {
	setKeyPressed(event.keyCode, true);
})
document.addEventListener("keyup", function (event) {
	setKeyPressed(event.keyCode, false);
})
document.addEventListener("mousemove", function (event) {
	player.rotation = Math.atan2((event.clientY - screenH / 2), (event.clientX - screenW / 2))



})


var input = { dx: 0, dy: 0 }
var setKeyPressed = function (keyCode, isKeyDown) {
	switch(true) {
		case keyCode == 68:
			input.dx += (isKeyDown ? 1 : -1)
			break
		case keyCode == 65:
			input.dx += (isKeyDown ? -1 : 1)
			break
		case keyCode == 83:
			input.dy += (isKeyDown ? 1 : -1)
			break
		case keyCode == 87:
			input.dy += (isKeyDown ? -1 : 1)
			break
	}
	input.dx = clamp(input.dx, -1, 1)
	input.dy = clamp(input.dy, -1, 1)
}


var processInputs = function (dt) {

	var inputData = { hasChanges: false, dx: 0, dy: 0, type: 'move' };
	if(input.dx == 1) {
		inputData = Object.assign(inputData, { hasChanges: true, dx: dt })
	}
	else if(input.dx == -1) {
		inputData = Object.assign(inputData, { hasChanges: true, dx: -dt })
	}

	if(input.dy == -1) {
		inputData = Object.assign(inputData, { hasChanges: true, dy: -dt });
	}
	else if(input.dy == 1) {
		inputData = Object.assign(inputData, { hasChanges: true, dy: dt });
	}
	if(inputData.hasChanges) {
		var speed = 10
		var vMove = { x: (inputData.dx * speed), y: (inputData.dy * speed) }
		player.xPos += vMove.x
		player.yPos += vMove.y
		layerEnemies.position.set(-player.xPos, -player.yPos)

		//look at the player
		for(let k in layerEnemies.children) {
			var enemy = layerEnemies.children[ k ]
			var vDistance = { x: player.xPos - enemy.xPos, y: player.yPos - enemy.yPos }
			//console.log('vDistance',vDistance)
			enemy.rotation = Math.atan2(vDistance.y, vDistance.x)
		}
	}
}



//TEXT LABEL FOR FPS
var txtFPS = new PIXI.Text('', { fontFamily: "Arial", fontSize: 14, fill: "white" });
txtFPS.name = 'fps'
txtFPS.position.set(-screenW / 2 + 10, -screenH / 2 + 10);
renderer.stage.addChild(txtFPS)
renderer.fps = txtFPS



//CREATE TICKER
var ticker = PIXI.ticker.shared;
ticker.autoStart = true;
ticker.stop();
ticker.add(function (dt) {
	processInputs(dt)

	//THIS PIECE OF CODE SET AS "NOT RENDERABLE" EVERY OBJECT IN SCREEN
	//COMMENT THIS AND SEE THE DIFFERENCE
	var loopChildsDisableRenderablesOffScreen = function (children) {
		for(let k in children) {
			var child = children[ k ]
			var pos = child.toGlobal(new PIXI.Point(0, 0))
			child.renderable = (pos.x > 0 && pos.y > 0 && pos.x < screenW && pos.y < screenH)
			if(child.children.length > 0) loopChildsDisableRenderablesOffScreen(child.children)
		}
	}
	loopChildsDisableRenderablesOffScreen(layerEnemies.children)

	renderer.render(renderer.stage)
	renderer.fps.text = parseInt(ticker.FPS) + ' FPS'
})
ticker.start()
