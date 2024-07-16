import { useFrame, useThree } from '@react-three/fiber';
import { type MutableRefObject, useRef, useState } from "react";
import { Box3, type Object3D, Vector3 } from "three";

interface TrackPositionProps {
    objectRef: MutableRefObject<Object3D | null>;
    onPositionUpdate: (position: { x: number, y: number }) => void;
    center?: Vector3;
}

const TrackPosition = ({ onPositionUpdate, objectRef, center }: TrackPositionProps) => {
    const { camera, size } = useThree();
    const [lastPosition, setLastPosition] = useState<{ x: number; y: number } | null>(null);

    const boxRef = useRef(new Box3());
    const centerRef = useRef(new Vector3());

    useFrame(() => {
        if (objectRef.current) {
            let centerV3;
            if (center) {
                centerV3 = new Vector3(
                    center.x,
                    center.y,
                    center.z
                );
            } else {
                // Update the bounding box from the object
                boxRef.current.setFromObject(objectRef.current);
                // Get the center of the bounding box
                boxRef.current.getCenter(centerRef.current);
                // Project the center to screen coordinates
                centerRef.current.project(camera);

                centerV3 = new Vector3(
                    centerRef.current.x,
                    centerRef.current.y,
                    centerRef.current.z
                );

            }

            centerV3.project(camera);

            const x = (centerV3.x * 0.5 + 0.5) * size.width;
            const y = (centerV3.y * -0.5 + 0.5) * size.height;

            if (!lastPosition || x !== lastPosition.x || y !== lastPosition.y) {
                onPositionUpdate({ x, y });
                setLastPosition({ x, y });
            }
        }
    });

    return null;
};

export default TrackPosition;
