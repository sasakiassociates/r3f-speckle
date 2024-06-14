import { type BufferGeometry, Float32BufferAttribute } from "three";

export function generateUVs(geometry: BufferGeometry, yUp: boolean = false): void {
    geometry.computeBoundingBox();

    const boundingBox = geometry.boundingBox;
    if (!boundingBox) {
        throw new Error("Bounding box computation failed");
    }

    const max = boundingBox.max;
    const min = boundingBox.min;

    const rangeX = max.x - min.x;
    const rangeYOrZ = yUp ? (max.y - min.y) : (max.z - min.z);

    const uvs: number[] = [];
    const positionAttribute = geometry.attributes.position;

    for (let i = 0; i < positionAttribute.count; i++) {
        const x = positionAttribute.getX(i);
        const yOrZ = yUp ? positionAttribute.getY(i) : positionAttribute.getZ(i);

        const u = (x - min.x) / rangeX;
        const v = (yOrZ - (yUp ? min.y : min.z)) / rangeYOrZ;

        uvs.push(u, v);
    }

    geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
}
