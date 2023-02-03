import { Ray, Vector3 } from "@babylonjs/core";
import { camera, scene } from "./globals";

export function getCameraRay() {
    return new Ray(camera.globalPosition, camera.getTarget().subtract(camera.globalPosition).normalize());
}

export function getCameraRayCastPickInfoWithOffset() {
    const target = camera.getTarget().clone();
    target.x += Math.random() * 0.05 * (Math.floor(Math.random() * 2) == 1 ? 1 : -1) * 0.7;
    target.y += Math.random() * 0.05 * (Math.floor(Math.random() * 2) == 1 ? 1 : -1) * 0.7;
    const ray = new Ray(camera.globalPosition, target.subtract(camera.globalPosition).normalize());
    const pickInfo = scene.pickWithRay(ray);
    return pickInfo;
}

export function getCameraRayCastPosition() {
    const ray = new Ray(camera.globalPosition, camera.getTarget().subtract(camera.globalPosition).normalize());
    const pickInfo = scene.pickWithRay(ray);
    return pickInfo!.pickedPoint;
}

export function getCameraRayCastPickInfo() {
    const ray = new Ray(camera.globalPosition, camera.getTarget().subtract(camera.globalPosition).normalize());
    const pickInfo = scene.pickWithRay(ray);
    return pickInfo;
}

export function getNearestRound(num: number, nearest: number) {
    const diff = num % nearest;
    const n = num - diff;
    return n;
}

export function getCameraFrontBy() {
    const dir = camera.getTarget().subtract(camera.globalPosition).normalize();
    return dir.scaleInPlace(3);
}

export function getDirectionBetweenTwoVectors(start: Vector3, end: Vector3) {
    return start.subtract(end).normalize();
}

export function getRadiansBetweenTwoVectors(origin: Vector3, point: Vector3) {
    // Returns radian angle with respect to X-Z plane, useful to rotate an object to view a certain point
    const signedAngle = Math.atan2(point.z - origin.z, point.x - origin.x);
    return -signedAngle;
}

export function getDegreesBetweenTwoVectors(origin: Vector3, point: Vector3) {
    let degs = getRadiansBetweenTwoVectors(origin, point) * 180 / Math.PI;
    if (degs < 0) {
        degs += 360
    }
    return degs;
}

export function flipDirection(objectFacing: any, cameraRelativeToObject: any) {
    const arr: string[] = ["down", "downRight", "right", "upRight", "up", "upLeft", "left", "downLeft"];
    const o: Record<string, number> = {
        down: 0,
        downRight: 1,
        right: 2,
        upRight: 3,
        up: 4,
        upLeft: 5,
        left: 6,
        downLeft: 7
    };

    const s = o[objectFacing] - o[cameraRelativeToObject];
    if (s < 0) {
        return arr[arr.length - Math.abs(s)];
    } else {
        return arr[s];
    }
}

export function getRelativePosition(deg: number) {
    if (deg <= 30 && deg >= 0 || deg > 330 && deg <= 360) {
        return "right";
    } else if (deg <= 60) {
        return "downRight";
    } else if (deg <= 120) {
        return "down";
    } else if (deg <= 150) {
        return "downLeft";
    } else if (deg <= 210) {
        return "left";
    } else if (deg <= 240) {
        return "upLeft";
    } else if (deg <= 300) {
        return "up";
    } else if (deg <= 330) {
        return "upRight";
    }
    return "";
}
