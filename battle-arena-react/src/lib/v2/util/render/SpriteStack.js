import { v4 as uuidv4, validate } from "uuid";

import Sprite from "./Sprite";

export class SpriteStack {
    constructor(sprites = []) {
        this.__id = uuidv4();
        
        this.sprites = sprites;

        this.__calcDuration();
    }

    __calcDuration() {
        this.__duration = this.sprites.reduce((a, sprite) => {
            return Math.max(a, sprite.duration);
        }, 0);

        return this;
    }

    add(...sprites) {
        this.sprites.push(...sprites);

        this.__calcDuration();

        return this;
    }
    remove(...idsSpritesOrIndexes) {
        for(let entry of idsSpritesOrIndexes) {
            if(typeof entry === "number") {
                this.sprites.splice(entry, 1);
            } else if(entry instanceof Sprite) {
                this.sprites = this.sprites.filter(sprite => sprite !== entry);
            } else if(validate(entry)) {
                this.sprites = this.sprites.filter(sprite => sprite.__id !== entry);
            } else if(typeof entry === "function") {
                this.sprites = this.sprites.filter(sprite => entry(sprite) !== false);
            } 
        }

        this.__calcDuration();

        return this;
    }
    swap(i1, i2) {
        [ this.sprites[ i1 ], this.sprites[ i2 ] ] = [ this.sprites[ i2 ], this.sprites[ i1 ] ];

        return this;
    }

    get duration() {
        return this.__duration;
    }

    get(elapsed) {
        return SpriteStack.Get(this.sprites, elapsed);
    }
    paint(elapsed, canvas, px, py, opts = {}) {
        return SpriteStack.Paint(this.sprites, elapsed, canvas, px, py, opts);
    }
}

//? Extracted core methods to allow for dynamic <Sprite> manipulation, if needed
export function Duration(sprites) {
    return sprites.reduce((a, sprite) => {
        return Math.max(a, sprite.duration);
    }, 0);
};
export function Get(sprites, elapsed) {
    const results = [];
    for(let sprite of sprites) {
        results.push(sprite.get(elapsed));
    }

    return results;
};
export function Paint(sprites, elapsed, canvas, px, py, opts = {}) {
    const obj = {
        data: [],   // This will contain the <Sprite>.paint return data, in order
        width: 0,   // This will become the MAX <Sprite>.canvas.width
        height: 0,  // This will become the MAX <Sprite>.canvas.height
    };

    for(let sprite of sprites) {
        const res = sprite.paint(elapsed, canvas, px, py, opts);            
        obj.data.push(res);
        obj.width = Math.max(res.width, obj.width);
        obj.height = Math.max(res.height, obj.height);
    }

    return obj;
};

export function Flatten(spriteStack, { canvas, ctxType = "2d" } = {}) {
    if(!(canvas instanceof HTMLCanvasElement)) {
        canvas = document.createElement("canvas");
    }

    let width = 0,
        height = 0;
    for(let sprite of spriteStack) {
        const [ w, h ] = sprite.size;

        width = Math.max(width, w);
        height = Math.max(height, h);
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext(ctxType);
    for(let sprite of spriteStack) {
        ctx.drawImage(sprite, 0, 0);
    }

    return canvas;
};

SpriteStack.Duration = Duration;
SpriteStack.Get = Get;
SpriteStack.Paint = Paint;

SpriteStack.Flatten = Flatten;

export default SpriteStack;