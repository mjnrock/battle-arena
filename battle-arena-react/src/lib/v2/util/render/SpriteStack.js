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
        });

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
        const results = [];
        for(let sprite of this.sprites) {
            results.push(sprite.get(elapsed));
        }

        return results;
    }
    paint(elapsed, canvas, px, py, opts = {}) {
        const results = [];
        for(let sprite of this.sprites) {
            results.push(sprite.paint(elapsed, canvas, px, py, opts));
        }

        return results;
    }
}

export default SpriteStack;