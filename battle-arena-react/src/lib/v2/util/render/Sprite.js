export class Sprite {
    constructor(score, { width = 0, height = 0 } = {}) {
        this.score = [];

        this.canvas = document.createElement("canvas");        
        this.canvas.width = width;
        this.canvas.height = height;

        const ctx = this.canvas.getContext("2d");
        score.forEach(([ frame, duration, hash ], i) => {
            ctx.drawImage(frame, frame.width * i, 0);
            
            this.score.push([ duration, [ frame.width * i, 0 ], [ frame.width, frame.height ], hash ]);
        });

        this.__duration = this.score.reduce((a, [ dur ]) => {
            return a + dur;
        }, 0);
        this.__indexes = Object.fromEntries(score.map(([ ,,,hash ], i) => [ hash, i ]));
    }

    get duration() {
        return this.__duration;
    }
    
    find(hash) {
        const index = this.__indexes[ hash ];

        return this.score[ index ];
    }

    get(elapsed) {
        elapsed = elapsed % this.duration;  // Loop pattern

        let time = 0;
        for(let i = 0; i < this.score.length; i++) {
            const [ dur, [ x, y ], [ w, h ] ] = this.score[ i ];

            if(elapsed <= time + dur) {
                return [ this.canvas, x, y, w, h ];
            }

            time += dur;
        }

        return [];
    }
}

export default Sprite;