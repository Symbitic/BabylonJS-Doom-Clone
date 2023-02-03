import { HemisphericLight, Material, Vector3 } from "@babylonjs/core";
import { scene, engine, camera, cambox } from "./globals";
import { options } from "./options";
import { showAxis } from "./axis"
import { monsterManager } from "./MonsterManager";
import { projectileManager } from "./ProjectileManager";
import { mapEditor } from "./MapEditor";
import { keyboardManager } from "./KeyboardManager";
import { particleManager } from "./ParticleManager";
import { decalManager } from "./DecalManager";
import { mapManager } from "./MapManager";
import { youiManager } from "./YOUIManager";

export class Game {
    init(materials: Record<string, Material>) {
        console.log("Initializing the game");

        if (options.showAxis) {
            showAxis(10);
        }

        console.log("Initialzing assets");

        console.log("Initializing Monster Manager");
        decalManager.init(materials);
        particleManager.init();
        monsterManager.init();
        mapManager.init(materials);

        //uiManager.init(materials);
        youiManager.init(materials);
        mapEditor.init();
        keyboardManager.init();

        // @ts-ignore
        const light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);

        console.log("Adding a beautiful floor");

        for (let i = 0; i < 1; i++) {
            let Imp = monsterManager.create("cacodemon");
            Imp.hitbox.position = new Vector3(0, Imp.hitboxProps.height / 2, 40);
        }

        let tick = 0;
        console.log("Running the engine loop");
        const fpsLabel = document.getElementById("fpsLabel")!;
        engine.runRenderLoop(() => {
            tick++;
            if (tick % 100 == 0) {
                if (options.hell) {
                    let Imp = monsterManager.create("cacodemon");
                    const mVertex = new Vector3(Math.random() * 50, Imp.hitboxProps.height / 2, Math.random() * 50);
                    Imp.hitbox.position = new Vector3(0, Imp.hitboxProps.height / 2, -mVertex.z);
                    Imp.sprite.position = Imp.hitbox.position;
                }
                tick = 0;
            }
            mapEditor.update();
            keyboardManager.update();
            monsterManager.update();
            //uiManager.update();
            youiManager.update();
            cambox.position = camera.position;
            cambox.rotation = camera.rotation;
            projectileManager.update();
            scene.render();

            fpsLabel.innerHTML = engine.getFps().toFixed() + " fps";
        });
    }
}
