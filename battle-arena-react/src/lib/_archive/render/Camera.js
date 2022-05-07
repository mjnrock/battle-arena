// import LayeredCanvas from "./LayeredCanvas";

// export class Camera extends LayeredCanvas {
export class Camera {
    static EnumType = {
        PIXEL: 0,
        TILE: 1,
        SUBJECT: 2,
    };

    constructor(game, world, { pixel = {}, tile = {}, subject = {} } = {}) {
        this._game = game;
        this._world = world;

        this.data = {};
        if(Object.keys(pixel).length) {
            this.data = {
                type: Camera.EnumType.PIXEL,
                ...pixel,
            };
        } else if(Object.keys(tile).length) {
            this.data = {
                type: Camera.EnumType.TILE,
                ...tile,
            };
        } else if(Object.keys(subject).length) {
            this.data = {
                type: Camera.EnumType.SUBJECT,
                ...subject,
            };
        }
    }

    get game() {
        return this._game;
    }
    get world() {
        if(this._world) {
            return this._world;
        }

        return this._game.world.current;
    }

    get drawArgs() {
        if(this.data.type === Camera.EnumType.PIXEL) {
            let { x, y, w, h } = this.data;
            let xw = x + w;
            let yh = y + h;
            
            return [
                x, y, xw, yh,
                0, 0, xw, yh,
            ];
        } else if(this.data.type === Camera.EnumType.TILE) {
            let { tx, ty, tw, th } = this.data;
                tx *= this.game.render.tw;
                tw *= this.game.render.tw;
                ty *= this.game.render.th;
                th *= this.game.render.th;
            
            let txw = tx + tw;
            let tyh = ty + th;
            
            return [
                tx, ty, txw, tyh,
                0, 0, txw, tyh,
            ];
            
        } else if(this.data.type === Camera.EnumType.SUBJECT) {
            let { entity, txr, tyr } = this.data;
                txr *= this.game.render.tw;
                tyr *= this.game.render.th;

            let { x, y } = entity.world,
                tx = x * this.game.render.tw,
                ty = y * this.game.render.th;
            
            return [                
                Math.max(0, tx - txr), Math.max(0, ty - tyr), txr * 2, tyr * 2,
                0, 0, txr * 2, tyr * 2,
            ];
        }

        return [ 0, 0 ];
    }
}