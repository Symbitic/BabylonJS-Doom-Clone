import { Color3 } from "@babylonjs/core/Maths/math.color.js";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture.js";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder.js";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial.js";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";
import { scene } from "./globals.js";

function makeTextPlane(text: string, color: string, size: number) {
    const dynamicTexture = new DynamicTexture(
        "DynamicTexture",
        50,
        scene,
        true,
    );
    dynamicTexture.hasAlpha = true;
    dynamicTexture.drawText(
        text,
        5,
        40,
        "bold 36px Arial",
        color,
        "transparent",
        true,
    );
    const plane = MeshBuilder.CreatePlane(
        "TextPlane",
        { size, updatable: true },
        scene,
    );

    plane.material = new StandardMaterial("TextPlaneMaterial", scene);
    plane.material.backFaceCulling = false;
    (plane.material as StandardMaterial).specularColor = new Color3(0, 0, 0);
    (plane.material as StandardMaterial).diffuseTexture = dynamicTexture;
    return plane;
}

export function showAxis(size: number) {
    const axisX = MeshBuilder.CreateLines(
        "axisX",
        {
            points: [
                Vector3.Zero(),
                new Vector3(size, 0, 0),
                new Vector3(size * 0.95, 0.05 * size, 0),
                new Vector3(size, 0, 0),
                new Vector3(size * 0.95, -0.05 * size, 0),
            ],
        },
        scene,
    );
    axisX.color = new Color3(1, 0, 0);
    const xChar = makeTextPlane("X", "red", size / 10);
    xChar.position = new Vector3(0.9 * size, -0.05 * size, 0);

    const axisY = MeshBuilder.CreateLines(
        "axisY",
        {
            points: [
                Vector3.Zero(),
                new Vector3(0, size, 0),
                new Vector3(-0.05 * size, size * 0.95, 0),
                new Vector3(0, size, 0),
                new Vector3(0.05 * size, size * 0.95, 0),
            ],
        },
        scene,
    );
    axisY.color = new Color3(0, 1, 0);
    const yChar = makeTextPlane("Y", "green", size / 10);
    yChar.position = new Vector3(0, 0.9 * size, -0.05 * size);

    const axisZ = MeshBuilder.CreateLines(
        "axisZ",
        {
            points: [
                Vector3.Zero(),
                new Vector3(0, 0, size),
                new Vector3(0, -0.05 * size, size * 0.95),
                new Vector3(0, 0, size),
                new Vector3(0, 0.05 * size, size * 0.95),
            ],
        },
        scene,
    );
    axisZ.color = new Color3(0, 0, 1);
    const zChar = makeTextPlane("Z", "blue", size / 10);
    zChar.position = new Vector3(0, 0.05 * size, 0.9 * size);
}
