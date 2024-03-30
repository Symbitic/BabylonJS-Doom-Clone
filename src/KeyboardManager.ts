import { camera } from "./globals.js";
import { uiManager } from "./UIManager.js";
import { youiManager } from "./YOUIManager.js";

export class KeyboardManager {
    keys: Record<string, boolean> = {
        leftClick: false,
        plus: false,
        w: false,
        a: false,
        s: false,
        d: false,
    };

    init() {
        // Attach eventhandlers to the render canvas
        const renderCanvas = document.getElementById("renderCanvas")!;
        renderCanvas.addEventListener("mousedown", () => {
            this.keys["leftClick"] = true;
        });
        renderCanvas.addEventListener("mouseup", () => {
            this.keys["leftClick"] = false;
        });
        renderCanvas.addEventListener("keydown", (e) => {
            switch (e.key) {
                case "+":
                    camera.applyGravity = true;
                    break;
                case "w":
                    this.keys["w"] = true;
                    break;
                case "a":
                    this.keys["a"] = true;
                    break;
                case "s":
                    this.keys["s"] = true;
                    break;
                case "d":
                    this.keys["d"] = true;
                    break;
                case "3":
                    youiManager.switchGuns(3);
                    break;
                case "4":
                    youiManager.switchGuns(4);
                    break;
                case "5":
                    youiManager.switchGuns(5);
                    break;
                default:
                    break;
            }
        });

        renderCanvas.addEventListener("keyup", (e) => {
            switch (e.key) {
                case "=":
                    camera.applyGravity = true;
                    break;
                case "w":
                    this.keys["w"] = false;
                    break;
                case "a":
                    this.keys["a"] = false;
                    break;
                case "s":
                    this.keys["s"] = false;
                    break;
                case "d":
                    this.keys["d"] = false;
                    break;
                default:
                    break;
            }
        });
    }

    update() {
        if (this.keys.leftClick) {
            youiManager.shooting = true;
            uiManager.shooting = true;
        } else {
            uiManager.shooting = false;
            youiManager.shooting = false;
        }

        // Check each movement key to see if it is moving
        const { w, a, s, d } = this.keys;
        if (w || a || s || d) {
            youiManager.moving = true;
        } else {
            youiManager.moving = false;
        }
    }
}

export const keyboardManager = new KeyboardManager();
