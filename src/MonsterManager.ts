import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh.js";
import { Mesh } from "@babylonjs/core/Meshes/mesh.js";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder.js";
import { Nullable } from "@babylonjs/core/types.js";
import { Sound } from "@babylonjs/core/Audio/sound.js";
import { Sprite } from "@babylonjs/core/Sprites/sprite.js";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial.js";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";
import { scene, camera } from "./globals.js";
import { sounds as Sounds } from "./sounds.js";
import { sprites as Sprites } from "./SpriteManager.js";
import { particleManager } from "./ParticleManager.js";
import {
    flipDirection,
    getDegreesBetweenTwoVectors,
    getRelativePosition,
} from "./utils.js";

export interface Box {
    width: number;
    height: number;
    depth: number;
}

export interface Monster {
    hitboxProps: Box;
    hitbox: Mesh;
    animations: Record<string, [number, number, boolean, number]>;
    sounds: Record<string, Sound>;
    blood: Record<string, unknown>;
    includeFlight?(vector: Vector3): Vector3;
}

const impHitbox = MeshBuilder.CreateBox(
    "imp",
    { height: 3, width: 2, depth: 2 },
    scene,
);

const monsters: Record<string, Monster> = {
    cacodemon: {
        hitboxProps: {
            height: 3,
            width: 2,
            depth: 2,
        },
        hitbox: MeshBuilder.CreateBox(
            "imp",
            { height: 3, width: 2, depth: 2 },
            scene,
        ),
        animations: {
            hurt: [0, 0, true, 300],
            dead: [0, 0, true, 300],
            down: [0, 0, true, 300],
        },
        sounds: {
            hurt: Sounds[`hurt_${"cacodemon"}`],
            death: Sounds[`death_${"cacodemon"}`],
        },
        blood: {},
        includeFlight: (vector: Vector3) => {
            if (Math.random() < 0.5) {
                vector.y = 1;
            } else {
                vector.y = -1;
            }
            return vector;
        },
    },
};

// Hide the original meshes
for (const name in monsters) {
    monsters[name].hitbox.position.y -= 100 * Math.random();
    monsters[name].hitbox.position.x += 100 * Math.random();
}

export class Imp {
    id: number;
    moveVector: Vector3;
    hitbox: AbstractMesh;

    sounds = {
        hurt: Sounds["hurt_imp"],
        death1: Sounds["impDeath1"],
        death2: Sounds["impDeath2"],
    };

    animations = {
        walkForward: [0, 3, true, 300],
        dead: [15, 19, false, 150],
        hurt: [24, 25, false, 150],
    };

    constructor() {
        this.id = Math.random();
        this.moveVector = new Vector3(0, 0, 0);
        this.hitbox = impHitbox.createInstance("");
    }

    selectMoveVector() {}

    update() {}
}

export class Demon {
    id = Math.random();
    state = 0;
    health = 100;
    speed = 0.08;
    inPain = false;
    painStarted = false;
    dead = false;
    moveVector = new Vector3(0, 0, 0);
    moves: Record<string, Vector3> = {
        up: new Vector3(0, 0, 1),
        down: new Vector3(0, 0, -1),
        left: new Vector3(-1, 0, 0),
        right: new Vector3(1, 0, 0),
        upRight: new Vector3(1, 0, 1),
        upLeft: new Vector3(-1, 0, 1),
        downRight: new Vector3(1, 0, -1),
        downLeft: new Vector3(-1, 0, -1),
    };
    moveFrames = 0;
    currentMoveAnimation = "down";
    animations = {
        hurt: [9, 10, true, 300],
        dead: [10, 15, false, 200],
        down: [0, 0, true, 300],
        up: [4, 4, true, 300],
        upRight: [5, 5, true, 300],
        right: [6, 6, true, 300],
        downRight: [8, 8, true, 300],
        left: [7, 7, true, 300],
        upLeft: [3, 3, true, 300],
        downLeft: [1, 1, true, 300],
    };
    moveVectors: Record<string, Vector3> = {};

    sprite: Sprite;
    hitbox: AbstractMesh;
    hitboxProps: Box;
    private _monsterType: Monster;

    constructor(name: string) {
        this._monsterType = monsters[name];

        // Set monster hitbox properties
        this.hitboxProps = this._monsterType.hitboxProps;
        // Create monster hitbox
        this.hitbox = this._monsterType.hitbox.createInstance("");
        this.hitbox.name = "imp";
        // Give hitbox the same ID as the monster object
        this.hitbox.id = String(this.id);

        // Create monster sprite.
        this.sprite = new Sprite("cacodemonSprite", Sprites.Cacodemon);
        this.sprite.size = 4;
        this.sprite.position = this.hitbox.position;

        this.hitbox.checkCollisions = true;
        this.hitbox.ellipsoid = new Vector3(
            1,
            this.hitboxProps.height / 2 / 2,
            1,
        );
        this.hitbox.onCollide = (mesh?: AbstractMesh | undefined) => {
            if (mesh && mesh.name == "wall") {
                this.setRandomMoveVector();
            } else if (mesh && mesh.name == "imp") {
                // TODO
            }
        };
    }

    // Set monster animations
    // Animation properties are an array that is spread to fit the sprite.animation arguments
    // The playAnimation function is a wrapper to allow 0 to 0 frame animations
    playAnimation(
        from: number,
        to: number,
        loop: boolean,
        delay: number,
        cb?: () => void,
    ) {
        if (cb || from !== to) {
            this.sprite.playAnimation(from, to, loop, delay, cb);
        } else {
            this.sprite.cellIndex = from;
            this.sprite.stopAnimation();
        }
    }

    // Monster can move, fire balls, can be in a state of pain... and die.
    setMoveVector() {
        if (Math.random() < 0.7) {
            this.setRandomMoveVector();
            return;
        }
        // create a list of vectors
        const currentPosition = this.hitbox.position.clone();
        // Up movement
        const up = currentPosition.clone();
        up.z += 1;
        // Down movement
        const down = currentPosition.clone();
        down.z -= 1;
        // Left movement
        const left = currentPosition.clone();
        left.x -= 1;
        // Right movement
        const right = currentPosition.clone();
        right.x += 1;

        // Up Right movement
        const upRight = currentPosition.clone();
        upRight.z += 1;
        upRight.x += 1;
        // Down movement
        const downRight = currentPosition.clone();
        downRight.z -= 1;
        downRight.x += 1;
        // Left movement
        const upLeft = currentPosition.clone();
        upLeft.x -= 1;
        upLeft.z += 1;
        // Right movement
        const downLeft = currentPosition.clone();
        downLeft.x -= 1;
        downLeft.z -= 1;

        this.moveVectors = {
            up,
            down,
            left,
            right,
            upRight,
            upLeft,
            downRight,
            downLeft,
        };

        const mapped: Record<string, any> = {};
        // check distance between each move vector with player position
        for (let move in this.moveVectors) {
            mapped[Vector3.Distance(this.moveVectors[move], camera.position)] =
                move;
        }

        // get the movement name of the smallest distance
        const distanceArr = Object.keys(mapped);
        const distanceKey = distanceArr
            .map((n) => parseFloat(n))
            .sort((a, b) => a - b)[0];

        const direction = mapped[distanceKey];
        this.moveFrames = 50;
        if (this._monsterType.includeFlight) {
            this.moveVector = this._monsterType.includeFlight(this.moveVector);
        }

        this.moveVector = this.moves[direction];
        this.currentMoveAnimation = direction;
    }

    setRandomMoveVector() {
        this.moveFrames = 50;
        const arr = [
            "up",
            "down",
            "left",
            "right",
            "upLeft",
            "upRight",
            "downLeft",
            "downRight",
        ];
        const rand = arr[Math.floor(Math.random() * arr.length)];
        this.moveVector = this.moves[rand];
        this.currentMoveAnimation = rand;
        if (this._monsterType.includeFlight) {
            this.moveVector = this._monsterType.includeFlight(this.moveVector);
        }
    }

    fire() {}

    emitBloodAt(_point: Nullable<Vector3>) {
        particleManager.emit("blueBlood", this.hitbox, 40);
    }

    pushBack(power: number, pushedFrom?: Vector3) {
        if (!pushedFrom) {
            pushedFrom = camera.globalPosition;
        }
        this.moveVector = this.hitbox.position
            .subtract(pushedFrom)
            .normalize()
            .scale(power);
    }

    getHurt(pain: number, pushBack: number, pushedFrom?: Vector3) {
        this.pushBack(pushBack, pushedFrom);
        this.inPain = true;
        this.painStarted = true;
        this.health -= pain;
    }

    die() {
        this.dead = true;
        const params = this.animations["dead"] as any[];
        this.playAnimation(params[0], params[1], params[2], params[3]);
        Math.random() < 0.5
            ? this._monsterType.sounds.death.play(1)
            : this._monsterType.sounds.death.play(1);
    }

    getAnimation() {}

    update() {
        // Set sprite position to that of hitbox
        this.sprite.position = this.hitbox.position;
        // Set animation
        if (!this.inPain && !this.dead) {
            const degs = getDegreesBetweenTwoVectors(
                this.hitbox.position,
                camera.position,
            );
            const relativePosition = getRelativePosition(degs);
            const monsterDirection = flipDirection(
                this.currentMoveAnimation,
                relativePosition,
            );
            const params = (this.animations as any)[monsterDirection] as any[];
            this.playAnimation(
                params[0],
                params[1],
                params[2],
                params[3],
                params[4],
            );
        }

        if (this.health < 0 && !this.dead) {
            this.die();
            return;
        }

        if (this.dead) {
            this.moveVector = new Vector3(0, -4, 0);
            this.moveFrames = 1000;
            this.hitbox.onCollide = (mesh?: AbstractMesh) => {
                if (mesh && mesh.name == "ground") {
                    this.hitbox.dispose();
                }
            };
        }

        if (this.painStarted && this.inPain && !this.dead) {
            this._monsterType.sounds.hurt.attachToMesh(this.hitbox);
            this._monsterType.sounds.hurt.play(0.7);
            this.sprite.playAnimation(9, 10, false, 300, () => {
                this.inPain = false;
            });
            this.painStarted = false;
        }

        if (!this.dead && this.moveFrames <= 0 && !this.inPain) {
            this.setMoveVector();
        }

        if (this.moveFrames > 0 || this.inPain) {
            this.hitbox.moveWithCollisions(this.moveVector.scale(0.06));
            this.moveFrames--;
        }
    }
}

export class MonsterManager {
    list: Record<string, Demon> = {};

    init() {
        monsters.cacodemon.hitbox.material = new StandardMaterial("asd", scene);
        monsters.cacodemon.hitbox.material.alpha = 0;
    }

    create(name: string) {
        const monsterInstance = new Demon(name);

        // Add monster to list
        this.list[monsterInstance.id] = monsterInstance;
        return monsterInstance;
    }

    update() {
        for (let id in this.list) {
            this.list[id].update();
        }
    }
}

export const monsterManager = new MonsterManager();
