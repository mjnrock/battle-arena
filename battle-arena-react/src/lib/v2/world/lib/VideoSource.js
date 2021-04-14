import LayeredCanvas from "../../render/LayeredCanvas";

export class VideoSource extends LayeredCanvas {
    constructor(game, world, { pixel = {}, tile = {}, subject } = {}) {
        super({
            width: 500,
            height: 500,
        });

        this.video = document.createElement("video");
        this.video.autoplay = true;
        this.video.onplay = () => {
            // this.width = this.video.width;
            // this.height = this.video.height;
            
            this.animator.start();
            // console.log(this)
            // console.log(this.canvas)
            // console.log(this.video.src)
            // console.log(this.video.srcObject)
            // console.log(this.stream)
        }
        
        this.game = game;
        this.world = world;

        if(Object.keys(pixel).length) {
            let { x, y, w, h } = pixel;
        } else if(Object.keys(tile).length) {
            let { tx, ty, tw, th } = tile;
        } else {
            this.subject = subject;
        }

        this.meta = {};
    }

    drawAnimationFrame(dt, now) {
        this.ctx.drawImage(this.video, 0, 0);
    }

    getRenderStream() {
        const fps = 60;
        this.stream = this.game.render._canvas.captureStream(fps);

        // console.log(this.game.render._canvas.toDataURL())

        return this.stream;
    }

    stream() {
        this.getRenderStream();

        this.video.srcObject = this.stream;
        // console.log(this.stream);
    }
};

export default VideoSource;