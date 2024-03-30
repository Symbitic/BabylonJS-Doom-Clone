import { SpriteManager } from "@babylonjs/core/Sprites/spriteManager.js";

import { scene } from "./globals.js";

export class Sprites {
    readonly Imp = new SpriteManager(
        "SpriteManagerImp",
        "sprites/imp.png",
        10000,
        70,
        scene,
    );
    readonly Cacodemon = new SpriteManager(
        "SpriteManagerCacodemon",
        "sprites/cacodemon.png",
        1000,
        100,
        scene,
    );
    readonly Explosion = new SpriteManager(
        "SpriteManagerExplosion",
        "sprites/explosion.png",
        20,
        120,
        scene,
    );
    readonly Rocket = new SpriteManager(
        "SpriteManagerRocket",
        "sprites/playerRocket.png",
        500,
        55,
        scene,
    );
}

export const sprites = new Sprites();
