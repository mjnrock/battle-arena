export default class Grid {
    constructor({ width, height, seed } = {}) {
        this.tiles = new Map();

        if(width > 0 && height > 0) {
            this.width = width;
            this.height = height;

            for(let x = 0; x < width; x++) {
                for(let y = 0; y < height; y++) {
                    if(typeof seed === "function") {
                        this.tiles.set(this.__key(x, y), seed(x, y));
                    } else {
                        this.tiles.set(this.__key(x, y), null);
                    }
                }
            }
        }
    }

    __key(x, y) {
        return `${ x }.${ y }`;
    }

    get size() {
        return this.width * this.height;
    }

    get(x, y) {
        return this.tiles.get(this.__key(x, y));
    }
    set(x, y, value) {
        return this.tiles.set(this.__key(x, y), value);
    }
    empty(x, y) {
        this.set(x, y, null);

        return this;
    }
    
    reset(failSafe = false) {
        if(failSafe === true) {
            for(let x = 0; x < this.width; x++) {
                for(let y = 0; y < this.height; y++) {
                    this.tiles.set(this.__key(x, y), null);
                }
            }

            return true;
        }

        return false;
    }
    swap(x1, y1, x2, y2) {
        const temp = this.get(x1, y1);

        this.set(x1, y1, this.get(x2, y2));
        this.set(x2, y2, temp);

        return this;
    }
    range(x1, y1, x2w, y2h, { asWidthHeight = false, encodeXY = true } = {}) {
        const tiles = {};

        if(asWidthHeight === true) {        
            for(let x = x1; x <= x1 + x2w; x++) {
                for(let y = y1; y <= y1 + y2h; y++) {
                    tiles[ this.__key(x, y) ] = encodeXY === true ? [ x, y, this.get(x, y) ] : this.get(x, y);
                }
            }
    
            return tiles;
        }

        for(let x = x1; x <= x2w; x++) {
            for(let y = y1; y <= y2h; y++) {
                tiles[ this.__key(x, y) ] = encodeXY === true ? [ x, y, this.get(x, y) ] : this.get(x, y);
            }
        }

        return tiles;
    }

    isEdge(x, y) {
        return x === 0 || y === 0 || x === this.width - 1 || y === this.height - 1;
    }
    isWithinBounds(x, y) {
        return x >= 0 && x <= this.width - 1 && y >= 0 && y <= this.height - 1;
    }
    
    n4(x, y, diagonals = false) {
        const neighbors = {};

        let dirs;
        if(diagonals === true) {
            dirs = [
                [ -1, -1 ],     //  NW
                [ 1, -1 ],      //  NE
                [ -1, 1 ],      //  SW
                [ 1, 1 ],       //  SE
            ];
        } else {
            dirs = [
                [ 0, -1 ],      //  N
                [ 0, 1 ],       //  S
                [ 1, 0 ],       //  E
                [ -1, 0 ],      //  W
            ];
        }

        for(let [ dx, dy ] of dirs) {
            neighbors[ this.__key(x + dx, y + dy) ] = this.get(x + dx, y + dy);
        }

        return neighbors;
    }
    n8(x, y) {
        return {
            ...this.n4(x, y),
            ...this.n4(x, y, true),
        };
    }

    toArray() {
        const arr = [];
        
        for(let y = 0; y < this.height; y++) {
            const row = [];
            for(let x = 0; x < this.width; x++) {
                row.push(this.get(x, y));
            }

            arr.push(row);
        }

        return arr;
    }
    toObject() {
        return Object.fromEntries(this.tiles);
    }
    toJson() {
        return JSON.stringify(this.toObject());
    }
};