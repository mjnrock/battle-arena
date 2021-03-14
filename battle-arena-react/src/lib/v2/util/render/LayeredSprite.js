import Sprite from "./Sprite";

import Canvas from "./Canvas";

export class LayeredSprite extends Sprite {
    constructor(scores, opts) {
        super(scores, { __inherit: true, ...opts });

        this.score = [];
        this.canvas = document.createElement("canvas");
        this.__indexes = {};
        
        const ctx = this.canvas.getContext("2d");
        let width = 0,
            height = 0,
            fns = [];
            
        for(let i = 0; i < scores.length; i++) {
            const score = scores[ i ];
            let rwidth = 0,
                rheight = 0,
                row;

            if(score instanceof Sprite) {
                row = [ score, 0, height ];

                rwidth = score.canvas.width;
                rheight = score.canvas.height;
            } else {
                row = score.map(([ frame, duration, hash ], j) => {
                    let x = frame.width * j,
                        y = height + frame.height * i;
    
                    rwidth += frame.width;
                    rheight = Math.max(rheight, frame.height);
    
                    this.__indexes[ hash ] = [ i, j ];
    
                    return [ frame, duration, [ x, y ], [ frame.width, frame.height ], hash ];
                });
            }

            width = Math.max(rwidth, width);
            height += rheight;

            this.score.push(row);
        }

        this.canvas.width = width;
        this.canvas.height = height;
        
        this.score = this.score.map(score => {
            if(score[ 0 ] instanceof Sprite) {
                let [ sprite, x, y ] = score;

                this.ctx.drawImage(sprite.canvas, x, y);
                
                return sprite.score.map(([ duration, [ px, py ], ...args ]) => [ duration, [ x + px, y + py ], ...args ]);
            }

            return score.map(arr => {
                const [ frame, duration, [ x, y ] ] = arr;

                this.ctx.drawImage(frame, x, y);

                return arr.slice(1);
            });
        });

        this.__duration = scores.reduce((a, { duration }) => {
            return Math.max(a, duration);
        }, 0);
    }

    get(elapsed) {
        elapsed = elapsed % this.duration;  // Loop pattern

        let results = [];
        for(let i = 0; i < this.score.length; i++) {
            const score = this.score[ i ];
            let time = 0;
            for(let j = 0; j < score.length; j++) {
                const [ dur, [ x, y ], [ w, h ], hash ] = score[ j ];
    
                time += dur;
    
                if(elapsed <= time) {
                    results.push([ hash, [ this.canvas, x, y, w, h ] ]);
                    
                    break;
                }
            }
        }

        return results;
    }

    paint(elapsed, canvas, px, py, { ctxType = "2d" } = {}) {
        const scores = this.get(elapsed);
        const obj = {};

        let maxWidth = 0,
            maxHeight = 0;

        for(let i = 0; i < scores.length; i++) {
            const score = scores[ i ];
            const [ hash, [ image, x, y, width, height ] ] = score;
    
            if(canvas instanceof Canvas) {
                canvas.image(
                    image,
                    x,
                    y,
                    width,
                    height,
                    px,
                    py,
                    width,
                    height,
                );
            } else {
                const ctx = canvas.getContext(ctxType);
                ctx.drawImage(
                    image,
                    x,
                    y,
                    width,
                    height,
                    px,
                    py,
                    width,
                    height,
                );
            }
    
            maxWidth = Math.max(width, maxWidth);
            maxHeight = Math.max(height, maxHeight);

            obj[ i ] = { x, y, width, height, hash };
        }

        return {
            width: maxWidth,
            height: maxHeight,
            ...obj,
        };
    }
}

export default LayeredSprite;