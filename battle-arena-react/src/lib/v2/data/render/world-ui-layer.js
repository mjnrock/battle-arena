export async function drawAnimationFrame(dt, elapsed) {
    //STUB  This should be performed at the <RenderManager> response to a <World> swap
    [ this.width, this.height ] = [ this.game.render.width, this.game.render.height ];

    if(this.game.config.SHOW_UI) {
        drawMouseHighlighter.call(this);
        // drawPlayerPath.call(this);

        for(let entity of this.game.world.current.entities) {
            drawMovementPath.call(this, entity);
        }
    }

    return this;
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
        for(let i = 0; i < entity.movement.wayfinder.paths.length; i++) {
            const path = entity.movement.wayfinder.paths[ i ];

            if(path) {
                const steps = path.remaining || [];
                const [ x, y ] = path.destination || [];
        
                for(let [ tx, ty ] of steps) {
                    this.prop({ fillStyle: `rgba(0, 0, 155, ${ i === 0 ? 0.20 : 0.10 })` }).tRect(
                        tx,
                        ty,
                        1,
                        1,
                        { isFilled: true },
                    );
                }
                
                if(!(entity.world.x === x && entity.world.y === y)) {
                    this.prop({ fillStyle: `rgba(0, 0, 155, ${ i === 0 ? 0.20 : 0.10 })` }).tRect(
                        x,
                        y,
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
        for(let i = 0; i < entity.movement.wayfinder.paths.length; i++) {
            const path = entity.movement.wayfinder.paths[ i ];

            if(path) {
                const steps = path.remaining || [];
                const [ x, y ] = path.destination || [];
        
                for(let [ tx, ty ] of steps) {
                    this.prop({ fillStyle: `rgba(0, 45, 155, 0.1` }).tRect(
                        tx,
                        ty,
                        1,
                        1,
                        { isFilled: true },
                    );
                }
                
                if(!(entity.world.x === x && entity.world.y === y)) {
                    this.prop({ fillStyle: `rgba(0, 45, 155, 0.1` }).tRect(
                        x,
                        y,
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