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

export const LineBuffer = (props: {bufferGeometry:BufferGeometry})=> {
    const points: Tuple[] = convertBufferGeometryToPoints(props.bufferGeometry);

    const lineProps = {
        // Example properties
        scale: [1, 1, 1] as Tuple, // Scale of the line
        position: [0, 0, 0] as Tuple, // Position in the scene
    };

    const materialProps = {
        // Example properties
        lineWidth: 2.5, // Width of the line
        color: "#333333", // Color of the line
        opacity: 0.2, // Opacity of the line
        transparent: true, // Whether the material is transparent
        // You can add more material properties as needed
    };
    return <Line
        points={points}
        dashed={false}                  // Default
        {...lineProps} // All THREE.Line2 props are valid
        {...materialProps} // All THREE.LineMaterial props are valid
    />;
}
