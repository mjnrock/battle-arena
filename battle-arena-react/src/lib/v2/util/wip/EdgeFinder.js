//TODO  Bake the terrain on World load and rebake tiles/neighbors if something changes in game (e.g. player plows the land)
                // if (terrain.terrain.type === DictTerrain.DIRT.type) {
                //     function drawImage(ctx, image, x, y, scale, rotation){
                //         ctx.save();
                //         ctx.setTransform(scale, 0, 0, scale, x, y);
                //         ctx.rotate(rotation);
                //         ctx.drawImage(image, 0, 0);
                //         ctx.restore();
                //     } 

                //     let edgeSprite = renderTerrain.sprite("dirt", 1, 0);
                //     let edgeSpriteCorner = renderTerrain.sprite("dirt", 2, 0);

                //     if (edgeSprite && edgeSpriteCorner) {
                //         const edgeImage = edgeSprite.get(elapsed);
                //         const edgeImageCorner = edgeSpriteCorner.get(elapsed);
                //         const canvas = document.createElement("canvas");
                //         const ctx = canvas.getContext("2d");

                //         canvas.width = edgeImage.width;
                //         canvas.height = edgeImage.height;

                //         //  Base Image
                //         ctx.drawImage(image, 0, 0);
                        
                //         let neighbors = dirs.map(([ dx, dy, theta ]) => {
                //             let neigh = game.world.terrain[ `${ terrain.position.x + dx }.${ terrain.position.y + dy }` ];
    
                //             if(neigh && neigh.terrain.type === DictTerrain.GRASS.type) {
                //                 if(theta === 0) {
                //                     return [ !(dx === 0 || dy === 0), image => [ 0, 0, 1, 0 ] ];
                //                 } else if(theta === 90) {
                //                     return [ !(dx === 0 || dy === 0), image => [ image.width, 0, 1, Math.PI / 2 ] ];
                //                 } else if(theta === 180) {
                //                     return [ !(dx === 0 || dy === 0), image => [ image.width, image.height, 1, Math.PI ] ];
                //                 } else if(theta === 270) {
                //                     return [ !(dx === 0 || dy === 0), image => [  0, image.height, 1, -Math.PI / 2 ] ];
                //                 }
                //             }
    
                //             return false;
                //         }).filter(n => n !== false);

                //         //  Edge Image(s)
                //         for(let [ isCorner, fn ] of neighbors) {
                //             const image = isCorner ? edgeImageCorner : edgeImage;
                            
                //             drawImage(ctx, image, ...fn(image));
                //         }

                //         renderTerrain.image(
                //             canvas,
                //             0,
                //             0,
                //             renderTerrain.tw,
                //             renderTerrain.th,
                //             terrain.position.x * renderTerrain.tw,
                //             terrain.position.y * renderTerrain.th,
                //             renderTerrain.tw,
                //             renderTerrain.th,
                //         );
                //     }
                // }