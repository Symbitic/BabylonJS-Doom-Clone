import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight.js";
import { Material } from "@babylonjs/core/Materials/material.js";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";
import { scene, engine, camera, cambox } from "./globals.js";
import { options } from "./options.js";
import { showAxis } from "./axis.js";
import { monsterManager } from "./MonsterManager.js";
import { projectileManager } from "./ProjectileManager.js";
import { mapEditor } from "./MapEditor.js";
import { keyboardManager } from "./KeyboardManager.js";
import { particleManager } from "./ParticleManager.js";
import { decalManager } from "./DecalManager.js";
import { mapManager } from "./MapManager.js";
import { youiManager } from "./YOUIManager.js";

export class Game {
    init(materials: Record<string, Material>) {
        if (options.showAxis) {
            showAxis(10);
        }

        decalManager.init(materials);
        particleManager.init();
        monsterManager.init();
        mapManager.init(materials);

        // uiManager.init(materials);
        youiManager.init(materials);
        mapEditor.init();
        keyboardManager.init();

        // @ts-ignore
        const light = new HemisphericLight(
            "light1",
            new Vector3(0, 1, 0),
            scene,
        );

        for (let i = 0; i < 1; i++) {
            const Imp = monsterManager.create("cacodemon");
            Imp.hitbox.position = new Vector3(
                0,
                Imp.hitboxProps.height / 2,
                40,
            );
        }

        let tick = 0;
        const fpsLabel = document.getElementById("fpsLabel")!;
        engine.runRenderLoop(() => {
            tick++;
            if (tick % 100 == 0) {
                if (options.hell) {
                    const Imp = monsterManager.create("cacodemon");
                    const mVertex = new Vector3(
                        Math.random() * 50,
                        Imp.hitboxProps.height / 2,
                        Math.random() * 50,
                    );
                    Imp.hitbox.position = new Vector3(
                        0,
                        Imp.hitboxProps.height / 2,
                        -mVertex.z,
                    );
                    Imp.sprite.position = Imp.hitbox.position;
                }
                tick = 0;
            }
            mapEditor.update();
            keyboardManager.update();
            monsterManager.update();
            // uiManager.update();
            youiManager.update();
            cambox.position = camera.position;
            cambox.rotation = camera.rotation;
            projectileManager.update();
            scene.render();

            fpsLabel.innerHTML = engine.getFps().toFixed() + " fps";
        });
    }
}
