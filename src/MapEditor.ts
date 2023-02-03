import { Vector3 } from "@babylonjs/core";
import { monsterManager } from "./MonsterManager";
import { mapManager } from "./MapManager";

function convertToNearest(vector: Vector3, closest: number) {
    const x = closest * Math.round(vector.x / closest) / 10;
    const y = closest * Math.round(vector.y / closest) / 10;
    const z = closest * Math.round(vector.z / closest) / 10;
    return new Vector3(x, y, -z);
}

function getSelectItem(id: string) {
    const el = document.getElementById(id) as HTMLSelectElement;
    return el.value;
}

export class MapEditor {
    canvas!: HTMLCanvasElement;
    ctx!: CanvasRenderingContext2D;
    map: any[] = [];
    startVertex!: Vector3 | null;
    endVertex!: Vector3 | null;
    centers = 60;
    holdingMouse = false;

    init() {
        this.canvas = document.getElementById("mapEditor") as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d")!;

        this.createGrid();

        const saveMapButton = document.getElementById("saveMap")!;
        saveMapButton.addEventListener("click", () => {
            window.localStorage.setItem("map", JSON.stringify(mapManager.saved));
        });

        const deleteMapButton = document.getElementById("deleteMap")!;
        deleteMapButton.addEventListener("click", () => {
            window.localStorage.removeItem("map");
        });

        this.canvas.addEventListener("mousedown", (e) => {
            if (getSelectItem("mainSelect") == "wall") {
                this.holdingMouse = true;
                this.startVertex = convertToNearest(new Vector3(e.offsetX, 5, e.offsetY), 30);
            }
        });

        this.canvas.addEventListener("mousemove", (e) => {
            if (this.holdingMouse && this.startVertex) {
                this.endVertex = convertToNearest(new Vector3(e.offsetX, 5, e.offsetY), 30);
            }
        });

        this.canvas.addEventListener("mouseup", () => {
            this.holdingMouse = false;
            if (getSelectItem("mainSelect") == "wall") {
                mapManager.createWall(this.startVertex!, this.endVertex!, 10);
            }
            this.startVertex = null;
            this.endVertex = null;
        });

        this.canvas.addEventListener("click", (e) => {
            if (getSelectItem("mainSelect") == "Imp") {
                const vertex = convertToNearest(new Vector3(e.offsetX, 5, e.offsetY), 30);
                const Imp = monsterManager.create("cacodemon");

                Imp.hitbox.position = new Vector3(vertex.x, Imp.hitboxProps.height / 2, vertex.z);
                Imp.sprite.position = Imp.hitbox.position;

            }
        });
    }

    createGrid() {
        // Create the map data array
        for (let i = 0; i < 90; i++) {
            let row: any[] = [];
            for (let j = 0; j < 90; j++) {
                this.ctx.fillRect(i * 30, j * 30, 5, 5);
            }
            this.map.push(row);
        }
    }

    update() {
        this.ctx.clearRect(0, 0, 1000, 1000)
        this.createGrid();
        if (this.startVertex && this.endVertex) {
            this.ctx.beginPath()
            this.ctx.moveTo(this.startVertex.x, this.startVertex.y);
            this.ctx.lineTo(this.endVertex.x, this.endVertex.y);
            this.ctx.stroke();
        }
        for (const id in mapManager.list) {
            const wall = mapManager.list[id];
            if (wall.name == "wall") {
                this.ctx.beginPath()
                this.ctx.moveTo(wall.startVertex.x * 10, -wall.startVertex.z * 10);
                this.ctx.lineTo(wall.endVertex.x * 10, -wall.endVertex.z * 10);
                this.ctx.stroke();
            }
        }
    }
}

export const mapEditor = new MapEditor();
