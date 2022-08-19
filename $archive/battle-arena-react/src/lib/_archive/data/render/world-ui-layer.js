import Agency from "@lespantsfancy/agency";
import Player, { EnumMovement } from "../../entity/component/Player";

export async function drawAnimationFrame(dt, now, ...drawImageArgs) {
    //STUB  This should be performed at the <RenderManager> response to a <World> swap
    [ this.width, this.height ] = [ this.game.render.width, this.game.render.height ];

    if(this.game.config.SHOW_UI) {
        drawMouseHighlighter.call(this);

        if(this.game.config.SHOW_DEBUG) {
            for(let entity of this.game.world.current.entities) {
                drawMovementPath.call(this, entity);
                drawEntityData.call(this, entity)
            }
        } else {
            drawMovementPath.call(this, this.game.players.player);
        }
    }

    if(this.game.config.SHOW_HEATMAP) {
        drawNodeFrequency.call(this, dt, now)
    }

    return this;
};

function entityDataCoords(x, y, row, rowHeight) {
    return [
        ~~(x * this.tw),
        ~~(y * this.th + this.th / 2 + row * rowHeight),
    ];
}
export function drawEntityData(entity) {
    let x = entity.world.x,
        y = entity.world.y,
        vx = entity.world.vx,
        vy = entity.world.vy,
        row = 1,
        rowHeight = 8;

    let rows = [
        [ `${ x.toFixed(2) } ${ y.toFixed(2) }`, { color: `#fff`, font: `6pt monospace` } ],
        [ `${ vx.toFixed(2) } ${ vy.toFixed(2) }`, { color: `#ed0`, font: `6pt monospace` } ],
        [ `${ entity.world.facing.toFixed(0) }`, { color: `#ea0`, font: `6pt monospace` } ],
    ];

    if(Player.Has(entity)) {
        let zero = `-`;
        let mask = [ zero, zero, zero, zero ];

        if(Agency.Util.Bitwise.has(entity.player.movement, EnumMovement.LEFT)) {
            // mask[ 0 ] = 1;
            // mask[ 0 ] = "←";
            mask[ 0 ] = "◁";
        }
        if(Agency.Util.Bitwise.has(entity.player.movement, EnumMovement.UP)) {
            // mask[ 1 ] = 1;
            // mask[ 1 ] = "↑";
            mask[ 1 ] = "△";
        }
        if(Agency.Util.Bitwise.has(entity.player.movement, EnumMovement.DOWN)) {
            // mask[ 2 ] = 1;
            // mask[ 2 ] = "↓";
            mask[ 2 ] = "▽";
        }
        if(Agency.Util.Bitwise.has(entity.player.movement, EnumMovement.RIGHT)) {
            // mask[ 3 ] = 1;
            // mask[ 3 ] = "→";
            mask[ 3 ] = "▷";
        }

        rows.push([ mask.join(""), { color: `#fff`, font: `6pt monospace` } ]);
    }

    for(let [ text, args ] of rows) {
        this.text(text, ...entityDataCoords.call(this, x, y, row, rowHeight), args);
        ++row;
    }
}

export function drawNodeFrequency(dt, now) {
    if(this.game.config.SHOW_HEATMAP) {
        const factor = 1000;
        const world = this.game.world.current;

        for(let node of world) {
            if(node.terrain.terrain.cost < Infinity) {
                const frequency = Math.min(node.frequency / factor, 1.0);
                this.prop({ fillStyle: heatMapColorforValue(frequency) }).tRect(
                    node.x,
                    node.y,
                    1,
                    1,
                    { isFilled: true },
                );
                this.text((node.frequency / factor).toFixed(3), node.x * this.tw + this.tw / 2, node.y * this.th + this.th / 2, { color: `#fff`, font: `8pt mono` });
            }
        }
    }
};
function heatMapColorforValue(value){
    var h = (1.0 - value) * 240
    return `hsl(${ h }, 100%, 50%)`;
};

export function drawMouseHighlighter() {
    this.save();
        let mouse = {
            tx: ((this.game.config.MOUSE_POSITION || [])[ 0 ] || 0),
            ty: ((this.game.config.MOUSE_POSITION || [])[ 1 ] || 0),
        };
        mouse.x = mouse.tx * this.tw;
        mouse.y = mouse.ty * this.th;

        this.ctx.strokeStyle = `rgba(180, 180, 180, 0.25)`;
        let r = 5;
        for(let dx = -r; dx <= r; dx++) {
            for(let dy = -r; dy <= r; dy++) {
                this.tRect(
                    mouse.tx + dx,
                    mouse.ty + dy,
                    1,
                    1,
                    { isFilled: false },
                );
            }
        }

        this.ctx.strokeStyle = `rgba(210, 210, 210, 0.25)`;
        this.prop({ lineWidth: 5 }).tRect(
            mouse.tx,
            mouse.ty,
            1,
            1,
            { isFilled: false },
        );

        let feather = 32,
            radius = 128;

        this.ctx.globalCompositeOperation = "destination-in";
        this.ctx.filter = `blur(${ feather }px)`;  // "feather"

        this.ctx.beginPath();
        this.ctx.arc(mouse.x + this.tw / 2, mouse.y + this.th / 2, radius, 0, 2 * Math.PI);
        this.ctx.fill();

        this.ctx.globalCompositeOperation = "destination-out";
        this.ctx.filter = "none";

    this.restore();
};

export function drawPlayerPath() {
    this.save();
        const entity = this.game.players.player;
        for(let i = 0; i < entity.world.wayfinder.paths.length; i++) {
            const path = entity.world.wayfinder.paths[ i ];

            if(path) {
                const steps = path.remaining || [];
                const [ x, y ] = path.destination || [];
        
                //!GRID-NUDGE
                for(let [ tx, ty ] of steps) {
                    this.prop({ fillStyle: `rgba(0, 0, 155, ${ i === 0 ? 0.20 : 0.10 })` }).tRect(
                        ~~tx,
                        ~~ty,
                        1,
                        1,
                        { isFilled: true },
                    );
                }
                
                if(!(entity.world.x === x && entity.world.y === y)) {
                    this.prop({ fillStyle: `rgba(0, 0, 155, ${ i === 0 ? 0.20 : 0.10 })` }).tRect(
                        ~~x,
                        ~~y,
                        1,
                        1,
                        { isFilled: true },
                    );
                }
            }
        }

        
    this.restore();
};
export function drawMovementPath(entity) {
    this.save();
        for(let i = 0; i < entity.world.wayfinder.paths.length; i++) {
            const path = entity.world.wayfinder.paths[ i ];

            if(path) {
                const steps = path.remaining || [];
                const [ x, y ] = path.destination || [];
        
                //!GRID-NUDGE
                for(let [ tx, ty ] of steps) {
                    this.prop({ fillStyle: `rgba(0, 45, 155, 0.1` }).tRect(
                        ~~tx,
                        ~~ty,
                        1,
                        1,
                        { isFilled: true },
                    );
                }
                
                if(!(entity.world.x === x && entity.world.y === y)) {
                    this.prop({ fillStyle: `rgba(0, 45, 155, 0.1` }).tRect(
                        ~~x,
                        ~~y,
                        1,
                        1,
                        { isFilled: true },
                    );
                }
            }
        }

        
    this.restore();
};

export default drawAnimationFrame;