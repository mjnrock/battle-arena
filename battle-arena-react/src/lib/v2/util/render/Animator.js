export default class Animator {
    constructor(canvas) {
        this.canvas = canvas;

        this.stats = {
            startTime: null,
            lastDraw: null,
        };

        this.isAnimating = false;
        this.isPaused = false;
    }

    onAnimationFrame(elapsed) {
        if(this.isAnimating) {
            if(!this.isPaused) {
                this.canvas.drawFrame(elapsed - (this.stats.lastDraw || 0), elapsed);
            }
            this.stats.lastDraw = elapsed;

            requestAnimationFrame(this.onAnimationFrame.bind(this));
        }
    }

    start() {
        this.isAnimating = true;
        this.stats.startTime = Date.now();

        requestAnimationFrame(this.onAnimationFrame.bind(this));

        return this;
    }
    stop() {
        this.isAnimating = false;        
        this.stats.lastDraw = null;

        return this;
    }

    play() {
        this.isPaused = false;

        return this;
    }
    pause() {
        this.isPaused = true;

        return this;
    }
};