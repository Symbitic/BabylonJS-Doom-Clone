import { camera } from './globals';
import { uiManager } from './UIManager';
import { youiManager } from './YOUIManager';

// 61 plus key
export class KeyboardManager {
    keys: Record<string, boolean> = {
        'leftClick': false,
        'plus': false,
        'w': false,
        'a': false,
        's': false,
        'd': false
    }

    init() {
        // Attach eventhandlers to the render canvas
        const renderCanvas = document.getElementById('renderCanvas')!;
        renderCanvas.addEventListener('mousedown', () => {
            this.keys['leftClick'] = true;
        });
        renderCanvas.addEventListener('mouseup', () => {
            this.keys['leftClick'] = false;
        });
        renderCanvas.addEventListener('keydown', (e) => {
            switch (e.keyCode) {
                case 187: // +
                    camera.applyGravity = true;
                    break;
                case 87: // W
                    this.keys['w'] = true;
                    break;
                case 65:
                    this.keys['a'] = true;
                    break;
                case 83:
                    this.keys['s'] = true;
                    break;
                case 68:
                    this.keys['d'] = true;
                    break;
                case 51: // 3
                    youiManager.switchGuns(3);
                    break;
                case 52: // 4 
                    youiManager.switchGuns(4);
                    break;
                case 53: // 5
                    youiManager.switchGuns(5);
                    break;
                default:
                    break;
            }
        });

        renderCanvas.addEventListener('keyup', (e) => {
            switch (e.keyCode) {
                case 61:
                    camera.applyGravity = true;
                    break;
                case 87:
                    this.keys['w'] = false;
                    break;
                case 65:
                    this.keys['a'] = false;
                    break;
                case 83:
                    this.keys['s'] = false;
                    break;
                case 68:
                    this.keys['d'] = false;
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

export default keyboardManager;
