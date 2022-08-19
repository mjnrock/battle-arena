import initKeys from "./key";
import initMouse from "./mouse";

export async function init(game) {
    await initKeys(game);
    await initMouse(game);

    return game;
}

export default init;