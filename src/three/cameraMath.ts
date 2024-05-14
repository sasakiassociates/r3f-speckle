import { Box3, DirectionalLight, Group, Vector3 } from "three";

export const transformToShadowCamera = (point: Vector3, light: DirectionalLight): Vector3 => {
    if (!light) return new Vector3();
    const shadowCamera = light.shadow.camera;

    const {x, y, z} = point;
    const v = new Vector3(x, y, z);

    //Project the vector from world space to camera space
    v.project(shadowCamera);

    v.x *= (shadowCamera.right - shadowCamera.left) / 2;
    v.y *= (shadowCamera.top - shadowCamera.bottom) / 2;

    //A z value of -1 corresponds to a point on the near plane of the camera's frustum, while a z value of 1 corresponds to a point on the far plane.
    let z_depth = shadowCamera.near * (1 - v.z) / 2 + shadowCamera.far * (1 + v.z) / 2;
    v.z = -z_depth;

    return v;
};

export const calculateCameraAlignedBounds = (group: Group, light: DirectionalLight) => {
    if (!light || !group) return new Box3();
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    group.traverseVisible((object) => {
        const bbox = new Box3().setFromObject(object);
        const corners = [
            new Vector3(bbox.min.x, bbox.min.y, bbox.min.z),
            new Vector3(bbox.min.x, bbox.min.y, bbox.max.z),
            new Vector3(bbox.min.x, bbox.max.y, bbox.min.z),
            new Vector3(bbox.min.x, bbox.max.y, bbox.max.z),
            new Vector3(bbox.max.x, bbox.min.y, bbox.min.z),
            new Vector3(bbox.max.x, bbox.min.y, bbox.max.z),
            new Vector3(bbox.max.x, bbox.max.y, bbox.min.z),
            new Vector3(bbox.max.x, bbox.max.y, bbox.max.z)
        ];

        corners.forEach(corner => {
            const c = transformToShadowCamera(corner, light);
            minX = Math.min(minX, c.x);
            minY = Math.min(minY, c.y);
            minZ = Math.min(minZ, c.z);
            maxX = Math.max(maxX, c.x);
            maxY = Math.max(maxY, c.y);
            maxZ = Math.max(maxZ, c.z);
        });
    });

    return new Box3(new Vector3(minX, minY, minZ), new Vector3(maxX, maxY, maxZ))
};
