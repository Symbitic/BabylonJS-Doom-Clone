import { Color4 } from "@babylonjs/core/Maths/math.color.js";
import { Material } from "@babylonjs/core/Materials/material.js";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder.js";
import { ParticleSystem } from "@babylonjs/core/Particles/particleSystem.js";
import { Texture } from "@babylonjs/core/Materials/Textures/texture.js";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";

import { scene, cambox } from "./globals.js";
import { sounds } from "./sounds.js";
import { monsterManager } from "./MonsterManager.js";
import { uiManager } from "./UIManager.js";
import { getCameraRayCastPickInfoWithOffset } from "./utils.js";

export interface Gun {
    shoot(): void;
    hasAmmo(): boolean;
    update(): void;
}

class Shotgun implements Gun {
    ammo = 50;
    pallets = 5;
    timer = 0;
    offset = 0;
    waveTick = 0;
    canShoot = true;
    animationFrame: number[] = [0, 1, 2, 3, 4, 5, 6, 5, 4];
    mesh = MeshBuilder.CreatePlane("weapon", { width: 1 }, scene);
    currentPosition = new Vector3();
    previousPosition = new Vector3();

    constructor(private bulletHoleMaterial: Material) {}

    shoot() {
        this.ammo--;
        uiManager.reduceAmmo(1);
        sounds.shotgunBlast.play();
        this.timer = 55;

        for (let i = 0; i < this.pallets; i++) {
            const pickInfo = getCameraRayCastPickInfoWithOffset();
            if (pickInfo && pickInfo.pickedMesh) {
                const decalSize = new Vector3(0.1, 0.1, 0.1);
                const decal = MeshBuilder.CreateDecal(
                    "decal",
                    pickInfo.pickedMesh,
                    {
                        position: pickInfo.pickedPoint!,
                        normal: pickInfo.getNormal(true)!,
                        size: decalSize,
                    },
                );

                decal.material = this.bulletHoleMaterial;
                if (
                    pickInfo &&
                    pickInfo.pickedMesh &&
                    pickInfo.pickedMesh.name === "imp"
                ) {
                    const particleSystem = new ParticleSystem(
                        "particles",
                        400,
                        scene,
                    );
                    particleSystem.particleTexture = new Texture(
                        "textures/Flare.png",
                        scene,
                    );
                    particleSystem.emitter = pickInfo.pickedPoint;
                    particleSystem.minSize = 0.1;
                    particleSystem.maxSize = 0.3;
                    particleSystem.emitRate = 6000;
                    particleSystem.targetStopDuration = 1;
                    particleSystem.minEmitPower = 1;
                    particleSystem.maxEmitPower = 1;
                    particleSystem.color1 = new Color4(0.1, 0, 0, 1);
                    particleSystem.color2 = new Color4(0.1, 0, 0, 1);
                    particleSystem.gravity = new Vector3(0, -150.81, 0);
                    particleSystem.disposeOnStop = true;
                    particleSystem.direction1 = new Vector3(-7, 8, 3);
                    particleSystem.direction2 = new Vector3(7, 8, -3);

                    particleSystem.start();
                    // find the monster in the list, play the death animation, then dispose
                    monsterManager.list[pickInfo.pickedMesh.id].die();
                }
            }
        }
    }

    hasAmmo() {
        return this.ammo >= 1;
    }

    update() {
        this.currentPosition = cambox.absolutePosition.clone();

        if (this.currentPosition.x != this.previousPosition.x) {
            this.waveTick++;
            this.mesh.position.y =
                (1 / 50) * Math.sin(this.waveTick * 0.3) - 0.115;
            this.mesh.position.x = (1 / 100) * Math.cos(this.waveTick * 0.2);
        }
        this.previousPosition = this.currentPosition;
        if (this.timer > 0) {
            this.canShoot = false;
            this.timer--;
        }

        if (this.timer % 6 == 0) {
            (this.mesh.material as any).diffuseTexture.uOffset =
                this.animationFrame[this.offset] / 7;
            this.offset++;
        }

        if (this.timer == 0) {
            this.offset = 0;
            this.canShoot = true;
            (this.mesh.material as any).diffuseTexture.uOffset =
                this.animationFrame[3] / 7;
        }
    }
}

export class WeaponsManager {
    materials: Record<string, Material> = {};
    weapons: Record<string, Gun> = {};

    init(materials: Record<string, Material>) {
        this.materials = materials;
        this.run();
    }

    run() {
        this.weapons["shotgun"] = this.initShotgun();
    }

    initShotgun() {
        const shotgun = new Shotgun(this.materials.bulletHoleMaterial);

        shotgun.mesh.material = this.materials.shotgunMaterial;
        shotgun.mesh.position.z += 2;
        shotgun.mesh.position.y -= 0.115;
        shotgun.mesh.isPickable = false;
        shotgun.mesh.parent = cambox;
        (shotgun.mesh.material as any).hasAlpha = true;
        shotgun.mesh.material.alpha = 1;

        shotgun.previousPosition = cambox.absolutePosition.clone();

        // Set UI Manager to show shotgun ammo
        uiManager.ammo = shotgun.ammo;

        return shotgun;
    }

    update() {
        for (let weaponName in this.weapons) {
            this.weapons[weaponName].update();
        }
    }
}

export const weaponsManager = new WeaponsManager();
