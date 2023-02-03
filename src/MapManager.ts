import {
    AbstractMesh,
    Material,
    Matrix,
    Mesh,
    MeshBuilder,
    VertexData,
} from "@babylonjs/core";
import { scene } from "./globals";

const bustomMesh = new Mesh("wall", scene);

export class Vertex {
    constructor(public x: number, public y: number, public z: number) { }
}

export type Wall = [Vertex, Vertex];

export type SavedMap = Wall[];

export interface WallMesh extends AbstractMesh {
    startVertex: Vertex;
    endVertex: Vertex;
}

export class MapManager {
    list: Record<string, WallMesh> = {};
    saved: SavedMap = [];
    private _materials: Record<string, Material> = {};

    init(materials: Record<string, Material>) {
        this._materials = materials;

        if (localStorage.getItem("map")) {
            this.saved = JSON.parse(window.localStorage.getItem("map")!) as SavedMap;
            this.saved.forEach(([a, b]: Wall) => {
                this.createWall(new Vertex(a.x, a.y, a.z), new Vertex(b.x, b.y, b.z), 5);
            });
        }

        const ground = MeshBuilder.CreateGround("ground", { width: 500, height: 500, subdivisions: 1 }, scene) as unknown as WallMesh;
        ground.checkCollisions = true;
        ground.material = this._materials.e1m1floor;
        (ground.material as any).diffuseTexture.uScale = 500;
        (ground.material as any).diffuseTexture.vScale = 500;
        ground.setPivotMatrix(Matrix.Translation(50 / 2, 0, 50 / 2));
        ground.id = `ground_${Math.random()}`;
        this.list[ground.id] = ground;
    }

    createWall(startVertex: Vertex, endVertex: Vertex, height: number) {
        this.saved.push([startVertex, endVertex]);
        const wallInstance = bustomMesh.clone("wall") as any;

        // Give wallInstance an id 
        wallInstance.id = `wall_${Math.random()}`;

        // Create custom mesh positions from vertices
        const { x, z } = startVertex;
        const positions = [
            x, height, z, x, 0, z, endVertex.x, 0, endVertex.z,
            x, height, z, endVertex.x, 0, endVertex.z, endVertex.x, height, endVertex.z
        ];

        // Create indices for each of the vertex positions
        const indices = [0, 1, 2, 3, 4, 5];

        // Calculate normals
        const normals: any[] = [];
        VertexData.ComputeNormals(positions, indices, normals);

        // Create UVS for textures
        const uvs = [0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1];

        // Create vertexData object to apply to the custom mesh, uses positions and indices
        const vertexData = new VertexData();
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normals;
        vertexData.uvs = uvs;

        // Apply vertexData to custom mesh
        vertexData.applyToMesh(wallInstance);

        // Find length between vertices
        const length = Math.sqrt(Math.pow(endVertex.x - startVertex.x, 2) + Math.pow(endVertex.z - startVertex.z, 2));

        // Expose startVertex and endVertex objects for map drawing
        wallInstance.startVertex = startVertex;
        wallInstance.endVertex = endVertex;

        wallInstance.material = this._materials.e1m1wall.clone("");
        wallInstance.material.diffuseTexture.uScale = length / 4;
        wallInstance.material.diffuseTexture.vScale = 2;
        //wallInstance.material.bumpTexture.uScale = length / 4;
        //wallInstance.material.bumpTexture.vScale = 2;
        wallInstance.material.backFaceCulling = true;

        wallInstance.checkCollisions = true;

        this.list[wallInstance.id] = wallInstance;

        return wallInstance;
    }

}

export const mapManager = new MapManager();

export default mapManager;
