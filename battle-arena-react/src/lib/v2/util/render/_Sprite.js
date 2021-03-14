export class Sprite {
    constructor(score = []) {
        this.score = score;

        this.__duration = this.score.reduce((a, [ ,dur ]) => {
            return a + dur;
        }, 0);
        this.__indexes = Object.fromEntries(score.map(([ ,,key ], i) => [ key, i ]));
    }

    get duration() {
        return this.__duration;
    }
    
    find(key) {
        const index = this.__indexes[ key ];

        return (this.score[ index !== void 0 ? index : key ] || [])[ 0 ];
    }

    get(elapsed) {
        elapsed = elapsed % this.duration;  // Loop pattern

        let time = 0;
        for(let i = 0; i < this.score.length; i++) {
            const [ canvas, dur ] = this.score[ i ];

            if(elapsed <= time + dur) {
                return canvas;
            }

            time += dur;
        }

        return this.score[ 0 ][ 0 ];
    }
}

export default Sprite;