import { useFrame, useThree } from '@react-three/fiber';
import { type MutableRefObject, useRef, useState } from "react";
import { Box3, type Object3D, Vector3 } from "three";

interface TrackPositionProps {
    objectRef: MutableRefObject<Object3D | null>;
    onPositionUpdate: (positions: { x: number, y: number }[]) => void;
    points: Vector3[];
}

const TrackPosition = ({ onPositionUpdate, objectRef, points }: TrackPositionProps) => {
    const { camera, size } = useThree();
    const [lastPositions, setLastPositions] = useState<{ x: number; y: number }[]>([]);

    const boxRef = useRef(new Box3());
    const centerRef = useRef(new Vector3());

    useFrame(() => {
        if (objectRef.current) {
            const pointsV3: Vector3[] = [];

            if (points.length > 0) {
                for (let point of points) {
                    pointsV3.push(new Vector3(
                        point.x,
                        point.y,
                        point.z
                    ));
                }
            } else {
                // Update the bounding box from the object
                boxRef.current.setFromObject(objectRef.current);
                // Get the center of the bounding box
                boxRef.current.getCenter(centerRef.current);
                // Project the center to screen coordinates
                centerRef.current.project(camera);

                pointsV3.push(new Vector3(
                    centerRef.current.x,
                    centerRef.current.y,
                    centerRef.current.z
                ));

            }

            const positions: { x: number; y: number }[] = [];
            for (let pointV3 of pointsV3) {
                pointV3.project(camera);

                if (pointV3.z >= -1 && pointV3.z <= 1 && pointV3.x >= -1 && pointV3.y >= -1 && pointV3.x <= 1 && pointV3.y <= 1) {
                    const x = (pointV3.x * 0.5 + 0.5) * size.width;
                    const y = (pointV3.y * -0.5 + 0.5) * size.height;
                    positions.push({ x, y })
                } else {
                    // console.log('point behind camera', pointV3);
                }
            }

            let changed = false;
            if (lastPositions.length != positions.length) {
                changed = true;
            } else {
                for (let i = 0; i < positions.length; i++) {
                    const p1 = positions[i];
                    const p2 = lastPositions[i];
                    if (p1.x !== p2.x || p1.y !== p2.y) {
                        changed = true;
                        break;
                    }
                }
            }

            if (changed) {
                onPositionUpdate(positions);
                setLastPositions(positions);
            }
        }
    });

    return null;
};

export default TrackPosition;
