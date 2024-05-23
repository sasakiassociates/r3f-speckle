import {
    Box3,
    Camera,
    Sphere,
    DirectionalLight,
    Group,
    Object3D,
    PerspectiveCamera,
    OrthographicCamera,
    Vector3, BufferGeometry
} from "three";
import type { OrbitControls } from "three-stdlib";
import type { CameraControls } from "@react-three/drei";

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

export const computeBoundingBox = (scene: Object3D) => {
    const box = new Box3().setFromObject(scene);
    return { box };
};

export const computeBoundingBoxMulti = (geometries: BufferGeometry[]) => {
    if (geometries.length === 0) return {box: new Box3()};
    for (let g of geometries) {
        g.computeBoundingBox();
    }
    const box = geometries[0].boundingBox!.clone()
    for (let i = 1; i < geometries.length; i++) {
        box.union(geometries[i].boundingBox!);
    }
    return { box };
};

export const computeBoundingSphere = (scene: Object3D) => {
    const sphere = new Sphere();
    new Box3().setFromObject(scene).getBoundingSphere(sphere);
    return { sphere };
};

// Compute the bounding sphere for multiple geometries
export const computeBoundingSphereMulti = (geometries: BufferGeometry[]) => {
    if (geometries.length === 0) return { sphere: new Sphere() };

    for (let g of geometries) {
        g.computeBoundingSphere();
    }

    const sphere = geometries[0].boundingSphere!.clone();
    const tempSphere = new Sphere();

    for (let i = 1; i < geometries.length; i++) {
        tempSphere.copy(geometries[i].boundingSphere!);
        sphere.union(tempSphere);
    }

    return { sphere };
};

export const adjustCameraToFitBox = (
    camera: Camera,
    controls: CameraControls,
    box: Box3,
    view: "top" | "side" = "top"
) => {
    if (!controls) return;
    const size = box.getSize(new Vector3());
    const sphere = box.getBoundingSphere(new Sphere());
    const { center, radius } = sphere;

    // fitToBox

    // controls.target.copy(center);  // Set orbit target to the center of the bounding box
    // controls.minDistance = size.length() * 0.1; // Example minimum distance
    // controls.maxDistance = size.length() * 10;   // Example maximum distance
    // controls.update();
    //
    // if (camera instanceof PerspectiveCamera) {
    //     const maxDim = Math.max(size.x, size.y, size.z);
    //     const fovInRad = camera.fov * (Math.PI / 180);
    //     const distance = maxDim / 2 / Math.tan(fovInRad / 2);
    //
    //     const distanceFactor = 0.7;
    //     //
    //     camera.up.set(0, 0, 1);
    //     camera.position.copy(center.clone().add(new Vector3(distanceFactor * radius, -1.0 * distanceFactor * radius, distanceFactor * radius)));
    //     camera.far = 25 * radius;
    //     camera.near = radius / 100;
    //
    //     // camera.position.copy(center);
    //     // camera.position.z = distance;
    //
    //     camera.lookAt(center);
    //     camera.updateProjectionMatrix();
    //     //this.forceUpdate();//not sure why this is needed, but the camera doesn't render correctly without it
    //
    // } else if (camera instanceof OrthographicCamera) {
    //
    //     camera.left = center.x - size.x / 2;
    //     camera.right = center.x + size.x / 2;
    //     camera.top = center.y + size.y / 2;
    //     camera.bottom = center.y - size.y / 2;
    //
    //     camera.zoom = 1;
    //
    //     camera.far = 25 * radius;
    //     camera.near = radius / 1000;
    //
    //     if (view === 'top') {
    //         camera.position.copy(center.clone().add(new Vector3(0, 0, radius)));
    //     } else {
    //         camera.position.copy(center.clone().add(new Vector3(radius, 0, 0)));
    //     }
    //
    //     camera.lookAt(center);
    //     camera.updateProjectionMatrix();
    //     // this.forceUpdate();//not sure why this is needed, but the camera doesn't render correctly without it
    // }
    // const center = new Vector3();
    // box.getCenter(center);
    //
    // const maxDim = Math.max(size.x, size.y, size.z);
    // const fov = camera.fov * (Math.PI / 180);
    // let cameraZ = Math.abs(maxDim / 4 * Math.tan(fov * 2));
    //
    // camera.position.set(center.x, center.y, cameraZ);
    // camera.lookAt(center);
    //
    // if (controls) {
    //     controls.target.set(center.x, center.y, center.z);
    //     controls.update();
    // }
    //
    // camera.updateProjectionMatrix();
};
