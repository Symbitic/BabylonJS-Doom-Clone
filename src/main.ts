/// <reference types="vite/types/import-meta" />
import { Material } from "@babylonjs/core/Materials/material.js";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial.js";
import { Texture } from "@babylonjs/core/Materials/Textures/texture.js";

import { scene, assetsManager } from "./globals.js";
import { options } from "./options.js";
import { Game } from "./game.js";

const { verbose } = options;

if (import.meta.env.DEV) {
    import("@babylonjs/inspector")
        .then(() => {
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
        })
        .catch((e) => {
            console.log(`Failed to load inspector: ${e.message}`);
        });
}

export interface IAssets {
    materials: Record<string, Material>;
}

const assets: IAssets = {
    materials: {},
};

interface ITexture {
    type: string;
    fileName: string;
    for?: string;
}

const textures: Record<string, ITexture> = {
    wireFrame: { type: "diffuse", fileName: "woodenCrate.jpg" }, // change in the future
    bulletHoleMaterial: { type: "diffuse", fileName: "impact.png" },
    woodenCrate: { type: "diffuse", fileName: "woodenCrate.jpg" },
    e1m1wall: { type: "diffuse", fileName: "e1m1wall.png" },
    //"e1m1wallBump": { type: "bump", for: "e1m1wall", fileName: "NormalMap.png" },
    e1m1floor: { type: "diffuse", fileName: "e1m1floor.png" },
    e1m1floorBump: {
        type: "bump",
        for: "e1m1floor",
        fileName: "bump_e1m1floor.png",
    },
    e1m1ceil: { type: "diffuse", fileName: "e1m1ceil.png" },
    //"e1m1ceilBump": { type: "bump", for: "e1m1ceil", fileName: "bump_e1m1ceil.png" },
    test: { type: "diffuse", fileName: "test.png" },
    testBump: { type: "bump", for: "test", fileName: "bump_test.png" },
};

const numberOfTextures = Object.keys(textures).length;
let loadedTextures = 0;

for (let textureName in textures) {
    if (verbose) {
        console.log(`loading ${textureName}`);
    }
    const imageTask = assetsManager.addImageTask(
        textureName,
        "textures/" + textures[textureName].fileName,
    );
    imageTask.onSuccess = () => {
        if (verbose) {
            console.log(`Loaded ${textureName}`);
        }
        loadedTextures++;
        if (textures[textureName].for) {
            (assets.materials[textures[textureName].for!] as any).bumpTexture =
                new Texture("textures/" + textures[textureName].fileName);
        } else {
            assets.materials[textureName] = new StandardMaterial(
                textureName,
                scene,
            );
            (assets.materials[textureName] as any)[
                textures[textureName].type + "Texture"
            ] = new Texture("textures/" + textures[textureName].fileName);
        }
        if (loadedTextures == numberOfTextures) {
            (
                assets.materials.bulletHoleMaterial as any
            ).diffuseTexture.hasAlpha = true;
            assets.materials.bulletHoleMaterial.zOffset = -2;
            assets.materials.wireFrame.wireframe = false;
            // Shotgun Material
            //assets.materials.shotgunMaterial = new StandardMaterial(name, scene);
            assets.materials.shotgunMaterial = new StandardMaterial("", scene);
            const shotgunTexture = new Texture("sprites/shotgun.png", scene);
            shotgunTexture.uScale = 1 / 7;
            shotgunTexture.hasAlpha = true;
            (assets.materials.shotgunMaterial as StandardMaterial).diffuseTexture =
                shotgunTexture;

            (assets.materials.test as StandardMaterial).diffuseTexture!.hasAlpha = true;
            assets.materials.test.zOffset = -2;
        }
    };
}

assetsManager.onFinish = () => {
    const game = new Game();
    game.init(assets.materials);
};

assetsManager.load();
