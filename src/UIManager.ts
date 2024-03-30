import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture.js";
import { Image } from "@babylonjs/gui/2D/controls/image.js";
import { Material } from "@babylonjs/core/Materials/material.js";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder.js";
import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle.js";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";

import { getCameraRayCastPickInfoWithOffset } from "./utils.js";
import { monsterManager } from "./MonsterManager.js";
import { particleManager } from "./ParticleManager.js";
import { sounds } from "./sounds.js";

function createGunImage(
    gunName: string,
    sourceWidth: number,
    width: number,
    height: number,
    top: number,
) {
    const image = new Image(gunName, `sprites/${gunName}.png`);
    image.sourceWidth = sourceWidth;
    image.width = width + "%";
    image.height = height + "%";
    image.top = top + "%";
    image.isVisible = false;
    return image;
}

interface Gun {
    init(): void;
    shoot(): void;
    stopShooting(): void;
    moveGun(): void;
    stopMovingGun(): void;
}

class Chaingun implements Gun {
    readonly attributes: any[] = ["chaingun", 114, 20, 50, 20];
    moveTick = 0;
    private image!: Image;

    constructor(private _ui: UIManager) {}

    init() {
        const [a, b, c, d, e] = this.attributes;
        this.image = createGunImage(a, b, c, d, e);
        this._ui.GUI.addControl(this.image);
    }

    shoot() {
        const arr = [114, 228];

        this._ui.tick += 1;
        this.moveTick = 0;
        if (this._ui.tick % 7 === 0) {
            const pickInfo = getCameraRayCastPickInfoWithOffset();
            if (
                pickInfo &&
                pickInfo.pickedMesh &&
                pickInfo.pickedMesh.name == "imp"
            ) {
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

                decal.material = this._ui.materials.bulletHoleMaterial;

                monsterManager.list[pickInfo.pickedMesh.id].getHurt(10, 1);
                monsterManager.list[pickInfo.pickedMesh.id].emitBloodAt(
                    pickInfo.pickedPoint,
                );
            } else {
                particleManager.emit("bulletPuff", pickInfo!.pickedPoint);
            }

            this._ui.index += 1;
            sounds.chaingun.play(0.8);
        }

        if (this._ui.index > 1) {
            this._ui.index = 0;
        }
        this._ui.guns[this._ui.currentGun].image.sourceLeft =
            arr[this._ui.index];
        this._ui.guns[this._ui.currentGun].image.top =
            0.05 * Math.sin(2 * (0.05 * this.moveTick)) + 0.2;
    }

    stopShooting() {
        const arr = [0, 114, 228];
        this._ui.guns[this._ui.currentGun].image.sourceLeft = arr[0];
    }

    moveGun() {
        this.moveTick++;
        this.image.top = 0.05 * Math.sin(2 * (0.05 * this.moveTick)) + 0.2;
        this.image.left = 300 * 0.1 * Math.sin(0.05 * this.moveTick);
    }

    stopMovingGun() {
        const left = this.image.left as string;
        const top = this.image.top as string;

        let imageLeftInt = parseInt(left.match(/(.+)px/)![1]);
        if (imageLeftInt > 0) {
            imageLeftInt -= 1;
            this.image.left = imageLeftInt;
        }
        if (imageLeftInt < 0) {
            imageLeftInt += 1;
            this.image.left = imageLeftInt;
        }

        let imageTopInt = parseInt(top.match(/(.+)%/)![1]);
        const originalTop = parseInt(top.match(/(.+)%/)![1]);
        if (imageTopInt > originalTop) {
            imageTopInt -= 1;
            this.image.top = imageTopInt + "%";
        }

        if (imageTopInt < originalTop) {
            imageTopInt += 1;
            this.image.top = imageTopInt + "%";
        }
    }
}

class Shotgun implements Gun {
    image = new Image("shotgun", "sprites/shotgun.png");
    sourceWidth = 114;
    width = "30%";
    height = "70%";
    top = "0%";
    moveTick = 0;
    canShoot = true;
    fireRate = 7;
    pallets = 7;

    constructor(private _ui: UIManager) {}

    init() {
        const shotgunImage = this.image;
        shotgunImage.sourceWidth = this.sourceWidth;
        shotgunImage.width = this.width;
        shotgunImage.height = this.height;
        shotgunImage.top = this.top;
        this._ui.GUI.addControl(shotgunImage);
        shotgunImage.isVisible = false;
        this._ui.tick = 0;
    }

    shoot() {
        const arr = [375, 125, 250, 375, 500, 625, 750, 625, 500, 375];
        if (this.canShoot) {
            sounds.shotgun.play(0.8);
            this.canShoot = false;
            this._ui.canSwitchGuns = false;
            for (let i = 0; i < this.pallets; i++) {
                const pickInfo = getCameraRayCastPickInfoWithOffset()!;
                if (pickInfo.pickedMesh) {
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

                    decal.material = this._ui.materials.bulletHoleMaterial;

                    if (
                        pickInfo &&
                        pickInfo.pickedMesh &&
                        pickInfo.pickedMesh.name === "imp"
                    ) {
                        // find the monster in the list, play the death animation, then dispose
                        monsterManager.list[pickInfo.pickedMesh.id].getHurt(
                            15,
                            10,
                        );
                        monsterManager.list[pickInfo.pickedMesh.id].emitBloodAt(
                            pickInfo.pickedPoint,
                        );
                        //monsterManager.list[pickInfo.pickedMesh.id].sprite.dispose();
                    }
                }
            }
            this._ui.tick = arr.length * this.fireRate;
            this._ui.index = 0;
        }

        this.stopShooting();
    }

    stopShooting() {
        const arr = [375, 125, 250, 375, 500, 625, 750, 625, 500, 375];
        if (this._ui.tick > 0) {
            this._ui.tick -= 1;
            if (this._ui.tick % this.fireRate == 0) {
                this._ui.index += 1;
            }
            if (this._ui.tick == 0) {
                this._ui.index = 0;
                this._ui.canSwitchGuns = true;
                this.canShoot = true;
            }
        }
        this._ui.guns[this._ui.currentGun].image.sourceLeft =
            arr[this._ui.index];
    }

    moveGun() {
        if (this.canShoot) {
            this.moveTick++;
            this.image.top = 0.05 * Math.sin(2 * (0.05 * this.moveTick)) + 0.05;
            this.image.left = 300 * 0.1 * Math.sin(0.05 * this.moveTick);
        }
    }

    stopMovingGun() {
        const left = this.image.left as string;
        const top = this.image.top as string;

        let imageLeftInt = parseInt(left.match(/(.+)px/)![1]);
        if (imageLeftInt > 0) {
            imageLeftInt -= 1;
            this.image.left = imageLeftInt;
        }
        if (imageLeftInt < 0) {
            imageLeftInt += 1;
            this.image.left = imageLeftInt;
        }

        let imageTopInt = parseInt(top.replace("%", ""));
        const originalTop = parseInt(this.top.replace("%", ""));
        if (imageTopInt > originalTop) {
            imageTopInt -= 1;
            this.image.top = imageTopInt + "%";
        }

        if (imageTopInt < originalTop) {
            imageTopInt += 1;
            this.image.top = imageTopInt + "%";
        }
    }
}

type DisplayType = "health" | "armor" | "ammo";

export class UIManager {
    health = 10;
    healthContainer = new Rectangle();
    armor = 10;
    armorContainer = new Rectangle();
    ammo = 0;
    ammoContainer = new Rectangle();
    GUI = AdvancedDynamicTexture.CreateFullscreenUI("hud");
    index = 0;
    tick = 0;
    moving = false;
    shooting = false;
    canShoot = true;
    canSwitchGuns = false;
    currentGun = "";
    materials: Record<string, Material> = {};
    guns: Record<string, any> = {};

    init(materials: Record<string, Material>) {
        this.materials = materials;
        for (const gunName in this.guns) {
            this.guns[gunName].init();
        }
        this.canSwitchGuns = true;
        this.bringOutCurrentGun("chaingun");

        const image = new Image("but", "textures/hud.png");
        image.verticalAlignment = 1;
        image.width = "100%";
        image.height = "14.81%";

        this.GUI.addControl(image);
        this.display("armor");
        this.display("ammo");
        this.display("health");
        this.displayDoomGuyFace();

        // Init guns.
        this.guns = {
            chaingun: new Chaingun(this),
            shotgun: new Shotgun(this),
        };
    }

    bringOutCurrentGun(gunName: string) {
        if (this.canSwitchGuns) {
            this.tick = 0;
            this.index = 0;
            // If we have a gun equipped
            if (this.currentGun) {
                // Set its visibily to false
                this.guns[this.currentGun].image.isVisible = false;
                // Set current gun to the new gun
                this.currentGun = gunName;
                this.guns[gunName].image.isVisible = true;
            } else {
                this.currentGun = gunName;
                this.guns[gunName].image.isVisible = true;
            }
        }
    }

    shootGun() {
        this.guns[this.currentGun].shoot();
    }

    stopShooting() {
        this.guns[this.currentGun].stopShooting();
    }

    moveGun() {
        this.guns[this.currentGun].moveGun();
    }

    stopMovingGun() {
        this.guns[this.currentGun].stopMovingGun();
    }

    display(type: DisplayType) {
        const containerName = `${type}Container` as keyof typeof UIManager;
        if (containerName in this) {
            this[containerName as keyof typeof UIManager] = new Rectangle();
        }
        const array = this[type]
            .toString()
            .split("")
            .map((e) => {
                return parseInt(e);
            });

        for (let i = 0; i < array.length; i++) {
            const numbersImage = new Image("but", "textures/doomnumbers.png");
            numbersImage.sourceWidth = 18;
            numbersImage.sourceLeft = 1 + 17 * array[i];
            numbersImage.height = "9%";
            numbersImage.width = "6%";

            if (type === "health") {
                if (this.health == 100) {
                    numbersImage.left = (-20 + 5 * i).toString() + "%"; //'-20%';
                } else if (this.health < 10) {
                    numbersImage.left = (-15.0 + 5 * i).toString() + "%"; //'-20%';
                } else {
                    numbersImage.left = (-17.5 + 5 * i).toString() + "%"; //'-20%';
                }
            }

            if (type === "armor") {
                if (this.armor == 100) {
                    numbersImage.left = (33.5 + 5 * i).toString() + "%"; //'-20%';
                } else if (this.armor < 10) {
                    numbersImage.left = (38.5 + 5 * i).toString() + "%"; //'-20%';
                } else {
                    numbersImage.left = (36 + 5 * i).toString() + "%"; //'-20%';
                }
            }

            if (type === "ammo") {
                if (this.ammo >= 100) {
                    numbersImage.left = (-43 + 5 * i).toString() + "%"; //'-20%';
                } else if (this.ammo < 10) {
                    numbersImage.left = (-38 + 5 * i).toString() + "%"; //'-20%';
                } else {
                    numbersImage.left = (-40.5 + 5 * i).toString() + "%"; //'-20%';
                }
            }

            numbersImage.top = "40.5%";
            if (type == "health") {
                this.healthContainer.addControl(numbersImage);
            }

            if (type == "armor") {
                this.armorContainer.addControl(numbersImage);
            }

            if (type == "ammo") {
                this.ammoContainer.addControl(numbersImage);
            }
        }
        this.GUI.addControl(this.ammoContainer);
        this.GUI.addControl(this.healthContainer);
        this.GUI.addControl(this.armorContainer);
    }

    takeDamage(n: number) {
        if (this.health > 0) {
            this.health -= n;
            if (this.health < 0) {
                this.health = 0;
            }
            this.healthContainer.dispose();
            this.display("health");
        }
    }

    reduceAmmo(n: number) {
        if (this.ammo > 0) {
            this.ammo -= n;
        }
        this.ammoContainer.dispose();
        this.display("ammo");
    }

    displayDoomGuyFace() {
        const doomGuyFace = new Image("doomGuyFace", "textures/doomface.png");
        doomGuyFace.height = "14.81%";
        doomGuyFace.width = "13%";
        doomGuyFace.left = "3.2%";
        doomGuyFace.verticalAlignment = 1;
        doomGuyFace.sourceWidth = 30;
        doomGuyFace.sourceLeft = 0;
        this.GUI.addControl(doomGuyFace);
    }

    update() {
        if (this.moving && !this.shooting) {
            this.moveGun();
        } else {
            this.stopMovingGun();
        }

        if (this.shooting) {
            this.shootGun();
        } else {
            this.stopShooting();
        }

        if (this.shooting && this.moving) {
            this.stopMovingGun();
        }
    }
}

export const uiManager = new UIManager();
