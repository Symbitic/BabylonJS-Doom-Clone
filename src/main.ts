import { Material, StandardMaterial, Texture } from "@babylonjs/core";
import { scene, assetsManager } from "./globals";
import { options } from "./options";
import { Game } from "./game";

const { debug, verbose } = options;

if (import.meta.env.DEV || debug) {
    await import("@babylonjs/inspector");
    // Hide/show the Inspector
    window.addEventListener("keydown", (ev) => {
        // Ctrl+I
        if (ev.ctrlKey && ev.key === "I") {
            if (scene.debugLayer.isVisible()) {
                scene.debugLayer.hide();
            } else {
                scene.debugLayer.show();
            }
        }
    });
}

export interface IAssets {
    materials: Record<string, Material>;
}

const assets: IAssets = {
    materials: {}
};

interface ITexture {
    type: string;
    fileName: string;
    for?: string;
}

const textures: Record<string, ITexture> = {
    "wireFrame": { type: "diffuse", fileName: "woodenCrate.jpg" }, // change in the future
    "bulletHoleMaterial": { type: "diffuse", fileName: "impact.png" },
    "woodenCrate": { type: "diffuse", fileName: "woodenCrate.jpg" },
    "e1m1wall": { type: "diffuse", fileName: "e1m1wall.png" },
    //"e1m1wallBump": { type: "bump", for: "e1m1wall", fileName: "NormalMap.png" },
    "e1m1floor": { type: "diffuse", fileName: "e1m1floor.png" },
    "e1m1floorBump": { type: "bump", for: "e1m1floor", fileName: "bump_e1m1floor.png" },
    "e1m1ceil": { type: "diffuse", fileName: "e1m1ceil.png" },
    //"e1m1ceilBump": { type: "bump", for: "e1m1ceil", fileName: "bump_e1m1ceil.png" },
    "test": { type: "diffuse", fileName: "test.png" },
    "testBump": { type: "bump", for: "test", fileName: "bump_test.png" }
};

const numberOfTextures = Object.keys(textures).length;
let loadedTextures = 0;

for (let textureName in textures) {
    if (verbose) {
        console.log(`loading ${textureName}`)
    }
    const imageTask = assetsManager.addImageTask(textureName, "textures/" + textures[textureName].fileName);
    imageTask.onSuccess = () => {
        if (verbose) {
            console.log(`Loaded ${textureName}`);
        }
        loadedTextures++;
        if (textures[textureName].for) {
            (assets.materials[textures[textureName].for!] as any).bumpTexture = new Texture("textures/" + textures[textureName].fileName);
        } else {
            assets.materials[textureName] = new StandardMaterial(textureName, scene);
            (assets.materials[textureName] as any)[textures[textureName].type + "Texture"] = new Texture("textures/" + textures[textureName].fileName);
        }
        if (loadedTextures == numberOfTextures) {
            (assets.materials.bulletHoleMaterial as any).diffuseTexture.hasAlpha = true;
            assets.materials.bulletHoleMaterial.zOffset = -2;
            assets.materials.wireFrame.wireframe = false;
            // Shotgun Material
            //assets.materials.shotgunMaterial = new StandardMaterial(name, scene);
            assets.materials.shotgunMaterial = new StandardMaterial("", scene);
            const shotgunTexture = new Texture("sprites/shotgun.png", scene);
            shotgunTexture.uScale = 1 / 7;
            shotgunTexture.hasAlpha = true;
            (assets.materials.shotgunMaterial as any).diffuseTexture = shotgunTexture;

            (assets.materials.test as any).diffuseTexture.hasAlpha = true;
            assets.materials.test.zOffset = -2;
        }
    }
};

assetsManager.onFinish = () => {
    const game = new Game();
    game.init(assets.materials);
}

assetsManager.load();

/*
window.addEventListener("DOMContentLoaded", () => {
    console.log("Loaded");
    console.log(typeof canvas);
    console.log(typeof assetsManager)
    //let canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    //let app = new App(canvas);
    //app.run();
});
*/
