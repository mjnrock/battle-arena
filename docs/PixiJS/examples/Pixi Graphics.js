//? https://www.youtube.com/watch?v=mCbyr8mGNRE

import * as PIXI from "pixi.js";

const canvas = document.getElementById("canvas");

const app = new PIXI.Application({
	view: canvas,
	width: window.innerWidth,
	height: window.innerHeight,
});

const graphic = new PIXI.Graphics();
graphic.x = app.renderer.screen.width / 2;
graphic.y = app.renderer.screen.height / 2;
app.stage.addChild(graphic);

// graphic.lineStyle(5, 0x00ff00);
// graphic.beginFill(0xFF0000);

//? Shapes
// graphic.drawCircle(0, 0, 100);
// graphic.drawRect(0, 0, 100, 200);
// graphic.drawRoundedRect(0, 0, 100, 200, 10);
// graphic.drawEllipse(0, 0, 100, 200);
// graphic.drawPolygon([0, 0, 100, 0, 100, 100, 0, 100]);
// graphic.drawPolygon([ new PIXI.Point(0, 0), new PIXI.Point(100, 0), new PIXI.Point(100, 100), new PIXI.Point(0, 100) ]);
// graphic.drawStar(0, 0, 100, 100, 5);
// graphic.drawDot(0, 0);
// graphic.drawDashedLine(0, 0, 100, 100, 10);

//? Passing Shapes
// graphic.drawShape(new PIXI.Circle(0, 0, 100));
// graphic.drawShape(new PIXI.Rectangle(0, 0, 100, 200));
// graphic.closePath();

//? Lines
// graphic.moveTo(0, 0);
// graphic.lineTo(100, 100);
// graphic.lineTo(100, 200);
// graphic.lineTo(0, 200);
// graphic.bezierCurveTo(100, 100, 200, 100, 200, 200);
// graphic.quadraticCurveTo(200, 200, 100, 200);

// graphic.endFill();

app.ticker.add(animate);

let radius = 50;
let delta = 0;
function animate() {
	delta += 0.01;
	radius = 50 + Math.sin(delta) * 25;

	graphic.clear();
	graphic.beginFill(0xFF0000);
	graphic.arc(0, 0, radius, 0, Math.PI * 2);
	graphic.endFill();
};