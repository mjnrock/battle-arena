//? https://www.youtube.com/watch?v=GuY_PROTr0I

//? Filters: https://www.youtube.com/watch?v=wIC-CqsUplw
<script id="vertShader" type="x-shader/x-vertex">
	attribute vec2 aVertexPosition;
	attribute vec2 aTextureCoord;

	uniform mat3 projectionMatrix;

	varying vec2 vTextureCoord;

	void main(void) {
		gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
		vTextureCoord = aTextureCoord;
	}
</script>

<script id="fragShader" type="x-shader/x-fragment">
	varying vec2 vTextureCoord;

	uniform sampler2D uSampler;

	void main(void) {
		gl_FragColor = texture2D(uSampler, vTextureCoord);
	}
</script>

let vertexShader = vertexShader.innerHTML;
let fragmentShader = fragmentShader.innerHTML;
let uniforms = {};
const myFilter = new PIXI.Filter(vertexShader, fragmentShader, uniforms);

sprite.filters = [
	new PIXI.filters.BlurFilter(),
	myFilter,
];




import * as PIXI from "pixi.js";

const canvas = document.getElementById("canvas");

const app = new PIXI.Application({
	view: canvas,
	width: window.innerWidth,
	height: window.innerHeight,
});

const container = new PIXI.Container();

const texture = PIXI.Texture.from("assets/images/player.png");
const sprite = new PIXI.Sprite(texture);
sprite.x = app.screen.width / 2;
sprite.y = app.screen.height / 2;
sprite.anchor.set(0.5);

container.addChild(sprite);

app.stage.addChild(container);

app.ticker.add(animate);

function animate() {
	sprite.rotation += 0.01;
};