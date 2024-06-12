import { Line } from "@react-three/drei";
import type { BufferGeometry } from "three";

type Tuple = [number, number, number];

function convertBufferGeometryToPoints(bufferGeometry: BufferGeometry): [number, number, number][] {
    const points: [number, number, number][] = [];
    const positionAttribute = bufferGeometry.getAttribute('position');

    if (positionAttribute) {
        for (let i = 0; i < positionAttribute.count; i++) {
            const x = positionAttribute.getX(i);
            const y = positionAttribute.getY(i);
            const z = positionAttribute.getZ(i);

            points.push([x, y, z]);
        }
    }

    return points;
}

type LineMaterialAttr = {
    lineWidth?: number,
    color?: string,
    opacity?: number
}
export const LineBuffer = (props: {bufferGeometry:BufferGeometry, appearance?: LineMaterialAttr})=> {
    const points: Tuple[] = convertBufferGeometryToPoints(props.bufferGeometry);
    const { appearance } = props;
    const lineProps = {
        // Example properties
        scale: [1, 1, 1] as Tuple, // Scale of the line
        position: [0, 0, 0] as Tuple, // Position in the scene
    };

    let opacity = appearance?.opacity || 0.2;
    const materialProps = {
        lineWidth: appearance?.lineWidth || 2.5,
        color: appearance?.color || "#333333",
        opacity: opacity,
        transparent: opacity < 1,
    };
    return <Line
        points={points}
        dashed={false}                  // Default
        {...lineProps} // All THREE.Line2 props are valid
        {...materialProps} // All THREE.LineMaterial props are valid
    />;
}
