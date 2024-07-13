import { type BufferGeometry, Float32BufferAttribute } from "three";
import type { Rect } from "../r3f";

export function generateUVs(geometry: BufferGeometry, yUp: boolean = false, uvBoundsRectangle?: Rect): void {
    geometry.computeBoundingBox();

    //we either receive a rectangle that defines the image extents or we derive them from the bounding box
    if (!uvBoundsRectangle) {
        const boundingBox = geometry.boundingBox;
        if (!boundingBox) {
            throw new Error("Bounding box computation failed");
        }

        //note uvBoundsRectangle is 2D and always x,y regardless of yUp
        const max = boundingBox.max;
        const min = boundingBox.min;

        uvBoundsRectangle = {
            x: min.x,
            y:  yUp ? min.z : min.y,
            width: max.x - min.x,
            height: yUp ? (max.z - min.z) : (max.y - min.y)
        }
    }

    //this is confusing, but here we're using coordinates that are yUp in the scene, zUp in the data and a
    //2D rectangle that is just x/y
    //TODO investigate whether we can do everything as zUp throughout
    const yUp2 = !yUp;
    const uvs: number[] = [];
    const positionAttribute = geometry.attributes.position;

    for (let i = 0; i < positionAttribute.count; i++) {
        const x = positionAttribute.getX(i);
        const yOrZ = yUp2 ? positionAttribute.getY(i) : positionAttribute.getZ(i);

        const u = (x - uvBoundsRectangle.x) / uvBoundsRectangle.width;
        const v = (yOrZ - uvBoundsRectangle.y) / uvBoundsRectangle.height;

        uvs.push(u, v);
    }

    geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
}
