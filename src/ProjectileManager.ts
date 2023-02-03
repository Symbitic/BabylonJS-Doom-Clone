import {
    MeshBuilder,
    Sprite,
    StandardMaterial,
    Vector3,
} from "@babylonjs/core";
import { scene, camera } from './globals';
import { sounds } from './sounds';
import { sprites } from './SpriteManager';
import { monsterManager } from './MonsterManager';
import { keyboardManager } from './KeyboardManager';

const playerRocketMesh = MeshBuilder.CreateBox('playerRocket', { height: 1, width: 1, depth: 1 }, scene);
playerRocketMesh.material = new StandardMaterial('asd', scene);
playerRocketMesh.material.alpha = 0;
playerRocketMesh.position.y = -40;

const explosionMesh = MeshBuilder.CreateSphere("sphere", { diameter: 7 }, scene);
explosionMesh.position.y -= 40;
explosionMesh.material = new StandardMaterial('asd', scene);
explosionMesh.material.alpha = 0.5;

function explode(position: Vector3) {
    const sprite = new Sprite("explosionSprite", sprites.Explosion)
    sprite.size = 5;
    const explosion = explosionMesh.createInstance("");
    explosion.position = position;
    explosion.computeWorldMatrix();
    sprite.position = explosion.position;
    const sound = sounds.explode_rocketlauncher;
    sound.attachToMesh(explosion);
    sound.play(1);
    sprite.playAnimation(0, 2, false, 400, () => {
        sprite.dispose();
    });
    for (const id in monsterManager.list) {
        if (monsterManager.list[id].hitbox.intersectsMesh(explosion)) {
            monsterManager.list[id].getHurt(100, 5, explosion.position);

        }
    }
    explosion.dispose();
}

class PlayerRocket {
    speed = 1;
    sprite = new Sprite("rocket", sprites.Rocket);
    cellIndexKey = "";
    id = Math.random();
    mesh = playerRocketMesh.createInstance("");
    blewUp = false;

    velocityVector: Vector3;

    constructor() {
        this.velocityVector = camera.getTarget().subtract(camera.globalPosition).normalize();
        this.sprite = new Sprite("rocket", sprites.Rocket);
        this.sprite.size = 3;

        // Dumb trick
        if (keyboardManager.keys.a) {
            this.cellIndexKey = 'a';
            this.sprite.cellIndex = 3;
        } else if (keyboardManager.keys.d) {
            this.cellIndexKey = 'd';
            this.sprite.cellIndex = 2;
        } else {
            this.sprite.cellIndex = 0;
        }

        this.mesh = playerRocketMesh.createInstance("");

        // Set mesh properties
        this.mesh.id = `playerRocket_${this.id}`;
        this.mesh.position = camera.position.clone().add(this.velocityVector.scale(3));
        this.mesh.position.y -= 0.5;

        this.mesh.onCollide = () => {
            this.blewUp = true;
        };
    }

    remove() {
        this.mesh.dispose();
        delete projectileManager.list[this.id];
        this.sprite.dispose();
    }

    update() {
        if (!keyboardManager.keys[this.cellIndexKey]) {
            this.sprite.cellIndex = 0;
        }
        if (this.blewUp) {
            explode(this.mesh.position);
            this.remove();
        } else {
            this.mesh.moveWithCollisions(this.velocityVector);
        }
        this.sprite.position = this.mesh.position;
    }
}

export class ProjectileManager {
    list: Record<number, PlayerRocket> = {};

    createRocket() {
        const rocket = new PlayerRocket();
        this.list[rocket.id] = rocket;
        return rocket;
    }

    update() {
        for (let id in this.list) {
            this.list[id].update();
        }
    }
}

export const projectileManager = new ProjectileManager();

export default projectileManager;
