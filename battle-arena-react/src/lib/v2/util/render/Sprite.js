import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

import Canvas from "./Canvas";

export class Sprite {
    constructor(score, { width = 0, height = 0, __inherit = false }) {
        this.__id = uuidv4();

        if(__inherit) {
            return this;
        }

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

        this.__hash = Sprite.Hash(this.canvas, { algorithm: "md5" });
    }

    get ctx() {
        return this.canvas.getContext("2d");
    }
    get hash() {
        return this.__hash;
    }
    get duration() {
        return this.__duration;
    }
    get size() {
        return [ this.canvas.width, this.canvas.height ];
    }
    
    find(hash) {
        const index = this.__indexes[ hash ];

        return this.score[ index ];
    }

    get(elapsed) {
        elapsed = elapsed % this.duration;  // Loop pattern

        let time = 0;
        for(let i = 0; i < this.score.length; i++) {
            const [ dur, [ x, y ], [ w, h ], hash ] = this.score[ i ];

            if(elapsed <= time + dur) {
                return [ hash, [ this.canvas, x, y, w, h ] ];
            }

            time += dur;
        }

        return [];
    }
    /**
     * Same as .get(elapsed), but paints to a passed @canvas at [ @px, @py ]
     */
    paint(elapsed, canvas, px, py, { ctxType = "2d" } = {}) {        
        const [ hash, [ image, x, y, width, height ] ] = this.get(elapsed);

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

        return { x, y, width, height, hash };
    }
};

export function Hash(canvas, { algorithm = "md5" } = {}) {
    if(canvas instanceof HTMLCanvasElement) {
        const base64 = canvas.toDataURL("image/png", 1.0);
        
        return crypto.createHash(algorithm).update(base64).digest("hex");
    }

    return false;
};

export function Generate(score, opts = {}) {
    return new Sprite(score, opts);
};

Sprite.Hash = Hash;
Sprite.Generate = Generate;

export default Sprite;