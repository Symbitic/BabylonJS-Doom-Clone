import { AssetsManager } from "@babylonjs/core/Misc/assetsManager.js";
import { Engine } from "@babylonjs/core/Engines/engine.js";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder.js";
import { Scene } from "@babylonjs/core/scene.js";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera.js";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";

import "@babylonjs/core/Audio/audioSceneComponent.js";
import "@babylonjs/core/Collisions/collisionCoordinator.js";
import "@babylonjs/core/Helpers/sceneHelpers.js";
import "@babylonjs/core/Loading/loadingScreen.js";
import "@babylonjs/core/Materials/standardMaterial.js";

// Show debug info.
export const debug = false;

// Get the canvas DOM element.
export const canvas = document.getElementById(
    "renderCanvas",
) as HTMLCanvasElement;
canvas.addEventListener("click", () => {
    canvas.requestPointerLock();
});

// Load the 3D engine.
export const engine = new Engine(canvas, true);
engine.loadingUIText = "DOOM";
engine.loadingUIBackgroundColor = "black";

// Create a basic BJS Scene object
export const scene = new Scene(engine);
scene.gravity = new Vector3(0, -9.81, 0);
scene.collisionsEnabled = true;

// create the asset manager
export const assetsManager = new AssetsManager(scene);

// create the camera
export const camera = new UniversalCamera(
    "camera1",
    new Vector3(5, 5, -5),
    scene,
);
camera.applyGravity = false;
camera.checkCollisions = true;
camera.ellipsoid = new Vector3(0.1, 1.5, 0.2);
// target the camera to scene origin
camera.setTarget(Vector3.Zero());

// attach the camera to the canvas
camera.attachControl(canvas, true);

// give camera WASD movement
camera.keysUp.push(87);
camera.keysDown.push(83);
camera.keysLeft.push(65);
camera.keysRight.push(68);

// limit camera speed
camera.speed = 1;

// create a FreeCamera, and set its position to (x:0, y:5, z:-10)
export const cambox = MeshBuilder.CreateBox(
    "cam",
    {
        height: 0.8,
        width: 1,
        depth: 1,
    },
    scene,
);
cambox.isPickable = false;
