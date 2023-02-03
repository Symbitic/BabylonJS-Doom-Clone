import { Material, MeshBuilder, Vector3 } from "@babylonjs/core";
import { scene } from './globals';
import type { AbstractMesh } from "@babylonjs/core";

export class DecalManager {
    private _bulletHoles: AbstractMesh[] = [];
    private _bulletHoleIndex: number = 0;
    private _materials: Record<string, Material> = {};

    init(materials: Record<string, Material>) {
        this._materials = materials;
        this.run();
    }

    run() {
        const hiddenPosition = new Vector3(0, -30, 0);
        const decalMesh = MeshBuilder.CreatePlane("decalMesh", { size: 0.1 }, scene);
        decalMesh.isPickable = false;
        decalMesh.position = hiddenPosition;
        decalMesh.material = this._materials["test"];
        for (let i = 0; i < 50; i++) {
            const bulletHoleInstance = decalMesh.createInstance("");
            bulletHoleInstance.isPickable = false;
            this._bulletHoles.push(bulletHoleInstance);
        }
    }

    createBulletHoleAt(pos: Vector3, normal: Vector3) {
        if (!pos || !normal) {
            return;
        }
        this._bulletHoles[this._bulletHoleIndex].position = pos;
        this._bulletHoles[this._bulletHoleIndex].lookAt(this._bulletHoles[this._bulletHoleIndex].position.add(normal));
        this._bulletHoleIndex++;
        if (this._bulletHoleIndex > this._bulletHoles.length - 1) {
            this._bulletHoleIndex = 0;
        }
    }
}

export const decalManager = new DecalManager();

export default decalManager;
