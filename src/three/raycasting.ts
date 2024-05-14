import { Camera, Raycaster, Vector3 } from "three";
import { Plane } from "three";

export function intersectGroundPlane(camera: Camera, yPosition: number): { intersection: Vector3 | null, distance: number } {

    // Vector representing the top-left corner in NDC at the near and far clipping planes
    const topLeftNdcNear = new Vector3(-1, 1, 0);
    const topLeftNdcFar = new Vector3(-1, 1, 1);

    // Convert to world space
    const topLeftWorldNear = topLeftNdcNear.unproject(camera);
    const topLeftWorldFar = topLeftNdcFar.unproject(camera);

    const cloneTL = topLeftWorldFar.clone();

    const direction = topLeftWorldFar.y > yPosition ? 1 : -1;

    // Create a raycaster
    const raycaster = new Raycaster(topLeftWorldNear, cloneTL.sub(topLeftWorldNear).normalize());

    // Raycast against the Y=0 plane
    const planeY0 = new Plane(new Vector3(0, 1, 0), -yPosition);
    const intersection = new Vector3();
    raycaster.ray.intersectPlane(planeY0, intersection);

    let distance = 0;

    if (intersection) {
        distance = direction * intersection.distanceTo(topLeftWorldFar);
    }

    return { intersection, distance };
}
