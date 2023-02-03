import { Material } from "@babylonjs/core";
import {
    AdvancedDynamicTexture,
    Image,
    Rectangle,
} from "@babylonjs/gui";
import { sounds } from "./sounds";
import { getCameraRayCastPickInfoWithOffset } from "./utils";
import { decalManager } from "./DecalManager";
import { monsterManager } from "./MonsterManager";
import { projectileManager } from "./ProjectileManager"

function parseNumbersToArrayOfNumbers(nums: number) {
    return nums.toString().split("").map((e) => {
        return parseInt(e, 10);
    });
}

function setNumbersImageDimensions(numbersImage: Image, num: number) {
    numbersImage.sourceWidth = 18;
    numbersImage.sourceLeft = 1 + (17 * num);
    numbersImage.height = "9%";
    numbersImage.width = "6%";
    numbersImage.top = "40.5%";
}

function applyNumbersImageOffset(numbersImage: Image, i: number, number: number, type: string) {
    if (type === "ammo") {
        if (number >= 100) {
            numbersImage.left = (-43 + (5 * i)).toString() + "%";//"-20%";
        } else if (number < 10) {
            numbersImage.left = (-38 + (5 * i)).toString() + "%";//"-20%";
        } else {
            numbersImage.left = (-40.5 + (5 * i)).toString() + "%";//"-20%";
        }
    }

    if (type === "health") {
        if (number == 100) {
            numbersImage.left = (-20 + (5 * i)).toString() + "%";//"-20%";
        } else if (number < 10) {
            numbersImage.left = (-15.0 + (5 * i)).toString() + "%";//"-20%";
        } else {
            numbersImage.left = (-17.5 + (5 * i)).toString() + "%";//"-20%";
        }
    }

    if (type === "armor") {
        if (number == 100) {
            numbersImage.left = (33.5 + (5 * i)).toString() + "%";//"-20%";
        } else if (number < 10) {
            numbersImage.left = (38.5 + (5 * i)).toString() + "%";//"-20%";
        } else {
            numbersImage.left = (36 + (5 * i)).toString() + "%";//"-20%";
        }
    }
}

function createGunImage(gunName: string, sourceWidth: number, width: number, height: number, top: number) {
    const image = new Image(gunName, `sprites/${gunName}.png`);
    image.sourceWidth = sourceWidth;
    image.width = width + "%";
    image.height = height + "%";
    image.top = top + "%";
    image.isVisible = false;
    return image;
}

export abstract class Gun {
    tick = 0;
    animationIndex = 0;
    moveTick = 0;
    fireRate = 0;
    materials: Record<string, Material> = {};
    protected originalTop = "";
    abstract gunImage: Image;
    abstract animationFrames: number[];
    abstract ammo: number;

    init(materials: Record<string, Material>) {
        this.materials = materials;
    }

    stopMovingGun() {
        this.moveTick = 0;
        const left = this.gunImage.left as string;
        const top = this.gunImage.top as string;
        let imageLeftInt = parseInt(left.match(/(.+)px/)![1])
        if (imageLeftInt > 0) {
            imageLeftInt -= 1;
            this.gunImage.left = imageLeftInt;
        }
        if (imageLeftInt < 0) {
            imageLeftInt += 1;
            this.gunImage.left = imageLeftInt;
        }

        let imageTopInt = parseInt(top.match(/(.+)%/)![1])
        const originalTop = parseInt(this.originalTop.match(/(.+)%/)![1])
        if (imageTopInt > originalTop) {
            imageTopInt -= 1;
            this.gunImage.top = imageTopInt + "%";
        }

        if (imageTopInt < originalTop) {
            imageTopInt += 1;
            this.gunImage.top = imageTopInt + "%";
        }
    }

    abstract shoot(): void;
    abstract stopShooting(): void;
    abstract moveGun(): void;

    update() {
        this.moveTick++;
        if (this.tick > 0) {
            this.tick--;
            if (this.tick % this.fireRate === 0) {
                this.animationIndex += 1
            }
            if (this.animationIndex > this.animationFrames.length - 1) {
                this.animationIndex = 0;
            }
        }

        this.gunImage.sourceLeft = this.animationFrames[this.animationIndex];
    }
}

export class Shotgun extends Gun {
    animationFrames = [375, 125, 250, 375, 500, 625, 750, 625, 500, 375];
    gunImage = createGunImage("shotgun", 114, 30, 70, 0);
    originalTop = "0%";
    fireRate = 7;
    pallets = 7;
    ammo = 100;

    shoot() {
        if (this.tick === 0 && this.ammo > 0) {
            sounds.shotgun.play(0.8);
            this.ammo--;
            youiManager.showAmmo();
            this.tick = this.fireRate * this.animationFrames.length;
            for (let i = 0; i < this.pallets; i++) {
                const pickInfo = getCameraRayCastPickInfoWithOffset()!;
                if (!pickInfo) {
                    continue;
                }
                const pickedMesh = pickInfo.pickedMesh!;
                if (pickedMesh && pickedMesh.name === "imp") {
                    monsterManager.list[pickInfo.pickedMesh!.id].getHurt(15, 10);
                    monsterManager.list[pickInfo.pickedMesh!.id].emitBloodAt(pickInfo.pickedPoint);
                } else {
                    decalManager.createBulletHoleAt(pickInfo.pickedPoint!, pickInfo.getNormal(false)!);
                }
            }
        }
    }

    stopShooting() { }

    moveGun() {
        this.gunImage.top = (0.05) * Math.sin(2 * (0.05 * this.moveTick)) + 0.05;
        this.gunImage.left = 300 * (0.1) * Math.sin(0.05 * this.moveTick);
    }
}

export class Chaingun extends Gun {
    animationFrames = [0, 114, 228];
    gunImage = createGunImage("chaingun", 114, 20, 50, 20);
    originalTop = "20%";
    fireRate = 3;
    pallets = 1;
    ammo = 600;

    shoot() {
        if (this.tick === 0 && this.ammo > 0) {
            sounds.chaingun.play(0.5);
            this.ammo--;
            youiManager.showAmmo();
            this.tick = this.fireRate * this.animationFrames.length;
            for (let i = 0; i < this.pallets; i++) {
                const pickInfo = getCameraRayCastPickInfoWithOffset()!;
                if (!pickInfo) {
                    continue;
                }
                const pickedMesh = pickInfo.pickedMesh;
                if (pickedMesh && pickedMesh.name === "imp") {
                    monsterManager.list[pickInfo.pickedMesh!.id].getHurt(15, 10);
                    monsterManager.list[pickInfo.pickedMesh!.id].emitBloodAt(pickInfo.pickedPoint);
                } else {
                    decalManager.createBulletHoleAt(pickInfo.pickedPoint!, pickInfo.getNormal(true)!);
                }
            }
        }
    }

    stopShooting() {
        this.gunImage.sourceLeft = this.animationFrames[0]
    }

    moveGun() {
        this.gunImage.top = (0.05) * Math.sin(2 * (0.05 * this.moveTick)) + 0.2;
        this.gunImage.left = 300 * (0.1) * Math.sin(0.05 * this.moveTick);
    }

    update() {
        this.moveTick++;
        if (this.tick > 0) {
            this.tick--;
            if (this.tick % this.fireRate === 0) {
                this.animationIndex += 1
            }
            if (this.animationIndex > this.animationFrames.length - 1) {
                this.animationIndex = 0;
            }
        }
        this.gunImage.sourceLeft = this.animationFrames[this.animationIndex];
    }
}

export class RocketLauncher extends Gun {
    animationFrames = [0, 120, 240, 360, 480, 600];
    gunImage = createGunImage("rocketlauncher", 120, 30, 70, 20);
    originalTop = "20%";
    fireRate = 7;
    pallets = 1;
    ammo = 999;

    shoot() {
        if (this.tick == 0 && this.ammo > 0) {
            sounds.shoot_rocketlauncher.play(0.8);
            this.ammo--;
            youiManager.showAmmo();
            this.tick = this.fireRate * this.animationFrames.length;
            projectileManager.createRocket();
        }
    }

    moveGun() {
        this.gunImage.top = (0.05) * Math.sin(2 * (0.05 * this.moveTick)) + 0.3;
        this.gunImage.left = 300 * (0.1) * Math.sin(0.05 * this.moveTick);
    }

    stopShooting() {
        if (this.tick == 0) {
            this.gunImage.sourceLeft = this.animationFrames[5];
        }
    }
}

export class YOUIManager {
    mGUI = AdvancedDynamicTexture.CreateFullscreenUI("hud");
    healthContainer = new Rectangle();
    armorContainer = new Rectangle();
    ammoContainer = new Rectangle();

    index = 0;
    tick = 0;
    health = 100;
    armor = 0;
    ammo = 100;
    currentGun!: Gun;
    moving = false;
    shooting = false;
    canShoot = false;
    guns: (Gun | null)[] = [];

    init(materials: Record<string, Material>) {
        this.guns.push(null, null, null, new Shotgun(), new Chaingun(), new RocketLauncher());
        this.initializeGuns(materials);

        this.currentGun = this.guns[3]!;
        this.showGun();
        this.showHud();
        this.showHealth();
        this.showAmmo();
        this.showArmor();
        this.showDoomGuy();
    }

    showHud() {
        const hudImage = new Image("but", "textures/hud.png");
        hudImage.verticalAlignment = 1;
        hudImage.width = "100%";
        hudImage.height = "14.81%";
        this.mGUI.addControl(hudImage);
    }

    showHealth() {
        const healthArray = parseNumbersToArrayOfNumbers(this.health);
        for (let i = 0; i < healthArray.length; i++) {
            const numbersImage = new Image("numbersImage", "textures/doomnumbers.png");
            setNumbersImageDimensions(numbersImage, healthArray[i]);
            applyNumbersImageOffset(numbersImage, i, this.health, "health");
            this.healthContainer.addControl(numbersImage);
        }
        this.mGUI.addControl(this.healthContainer);
    }

    showAmmo() {
        this.mGUI.removeControl(this.ammoContainer);
        this.ammoContainer = new Rectangle()
        this.ammo = this.currentGun.ammo;
        const ammoArray = parseNumbersToArrayOfNumbers(this.ammo);
        for (let i = 0; i < ammoArray.length; i++) {
            const numbersImage = new Image("numbersImage", "textures/doomnumbers.png");
            setNumbersImageDimensions(numbersImage, ammoArray[i]);
            applyNumbersImageOffset(numbersImage, i, this.ammo, "ammo");
            this.ammoContainer.addControl(numbersImage);
        }
        this.mGUI.addControl(this.ammoContainer);
    }

    showArmor() {
        const armorArray = parseNumbersToArrayOfNumbers(this.armor);
        for (let i = 0; i < armorArray.length; i++) {
            const numbersImage = new Image("numbersImage", "textures/doomnumbers.png");
            setNumbersImageDimensions(numbersImage, armorArray[i]);
            applyNumbersImageOffset(numbersImage, i, this.armor, "armor");
            this.armorContainer.addControl(numbersImage);
        }
        this.mGUI.addControl(this.armorContainer);
    }

    clearUI() {
        this.mGUI.removeControl(this.ammoContainer);
        this.ammoContainer = new Rectangle();
    }

    showDoomGuy() {
        const doomGuyFace = new Image("doomGuyFace", "textures/doomface.png");
        doomGuyFace.height = "14.81%";
        doomGuyFace.width = "13%";
        doomGuyFace.left = "3.2%";
        doomGuyFace.verticalAlignment = 1;
        doomGuyFace.sourceWidth = 30;
        doomGuyFace.sourceLeft = 0;
        this.mGUI.addControl(doomGuyFace);
    }

    initializeGuns(materials: Record<string, Material>) {
        for (const gun of this.guns) {
            if (gun) {
                gun.init(materials);
                this.mGUI.addControl(gun.gunImage);
            }
        }
    }

    showGun() {
        this.currentGun.gunImage.isVisible = true;
    }

    hideGun() {
        this.currentGun.gunImage.isVisible = false;
    }

    switchGuns(e: number) {
        // e is the number to switch to
        if (this.guns[e]) {
            this.currentGun.gunImage.isVisible = false;
            this.currentGun = this.guns[e]!;
            this.ammo = this.currentGun.ammo;
            this.showAmmo();
            this.showGun();
        }
    }

    update() {
        for (const gun of this.guns) {
            if (gun) {
                gun.update();
            }
        }

        if (this.shooting) {
            this.currentGun.shoot();
        } else {
            this.currentGun.stopShooting();
        }
        if (this.moving && !this.shooting) {
            this.currentGun.moveGun();
        } else {
            this.currentGun.stopMovingGun();
        }
    }
}

export const youiManager = new YOUIManager();

export default youiManager;
