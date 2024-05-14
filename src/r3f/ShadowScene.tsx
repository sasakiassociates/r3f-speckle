import { useEffect, useRef, useState } from 'react'
import { Box, CameraControls, Line, Sphere, Plane } from '@react-three/drei'
import { button, useControls } from 'leva'
import { Box3, DirectionalLight, Group, Vector3 } from 'three';
import { intersectGroundPlane } from "../three/raycasting";
import { calculateCameraAlignedBounds, transformToShadowCamera } from "../three/cameraMath";
import { useShadowHelper } from "./helpers";

type V3 = Vector3 | [x: number, y: number, z: number];

function generateVector3(seed: number, size: number): Vector3 {
    function mulberry32(a: number) {
        return function () {
            var t = a += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    }

    // Initialize the PRNG with the seed and create different seeds for each component
    const randX = mulberry32(seed);
    const randY = mulberry32(randX() * 0xffffffff);
    const randZ = mulberry32(randY() * 0xffffffff);

    // Generate pseudorandom numbers for x, y, and z
    const x = randX() * size - (size / 2);
    const y = randY() * size - (size / 2);
    const z = randZ() * size - (size / 2);

    return new Vector3(x, y, z);
}



// function B3({ position }: { position: V3 }) {
//     return (
//         <mesh position={position}>
//             <boxGeometry/>
//             <meshStandardMaterial color="green"/>
//         </mesh>
//     )
//
// }
//
// function Plane3({ position, rotation }: { position: V3, rotation: V3 }) {
//     return (
//         <mesh position={position}>
//             <planeGeometry/>
//             <meshStandardMaterial color="pink"/>
//         </mesh>
//     )
//
// }




type ShadowSceneProps = {
    /** if specified, bounding box values below this will be ignored */
    minimumGroundY?: number,
    /** when lights get low, the far extent can push out really far causing artifacts. this provides some control. */
    maxFarExtents?: number,
};

export function ShadowScene(props: ShadowSceneProps) {
    const { minimumGroundY = 0, maxFarExtents = 500 } = props;

    const lightRef = useRef<DirectionalLight>(null);
    const boxesRef = useRef<Group>(null);

    const boundingBoxCalc = useRef<Box3>(new Box3());

    const [trigger, updateTrigger] = useState<number>(0);

    const { lightPosition, numTestBoxes, showHelper, shadowMapResolution } = useControls({
        lightPosition: { value: [3, 5, 2], label: 'vec' },
        numTestBoxes: { value: 3, min: 0, max: 250, step: 1 },
        showHelper: false,
        shadowMapResolution: { value: 9, min: 4, max: 12, step: 1 },
    })

    const shadowCameraControls = useControls('Shadow Camera', {
        manual: true,
        near: { value: 0.5, min: 0.1, max: 100, step: 0.1 },
        far: { value: 50, min: 0, max: 100, step: 1 },
        width: { value: 50, min: 1, max: 50, step: 1 },
        height: { value: 50, min: 1, max: 50, step: 1 },
        adjust: button(() => {
            updateShadowBox(numTestBoxes, lightPosition);
        }),
    });

    const helperRef = useShadowHelper(lightRef, showHelper);

    const updateShadowBox = (numTestBoxes: number, lightPosition: any) => {
        if (lightRef.current) {
            const shadowCameraProps = {
                near: shadowCameraControls.near,
                far: shadowCameraControls.far,
                left: -shadowCameraControls.width / 2,
                right: shadowCameraControls.width / 2,
                top: shadowCameraControls.height / 2,
                bottom: -shadowCameraControls.height / 2,
            };
            const shadowCamera = lightRef.current.shadow.camera;

            Object.assign(shadowCamera, shadowCameraProps);
            shadowCamera.updateProjectionMatrix();

            if (boxesRef.current && lightRef.current) {
                boundingBoxCalc.current = calculateCameraAlignedBounds(boxesRef.current, lightRef.current);
            }
            updateTrigger(trigger + 1);

        }
    }

    useEffect(() => {
        console.log('use effect triggered', numTestBoxes, lightPosition);
        updateShadowBox(numTestBoxes, lightPosition);
    }, [numTestBoxes, lightPosition]);


    const testBoxes = [];
    const refSpheres = [];

    if (numTestBoxes) {
        for (let i = 0; i < numTestBoxes; i++) {
            testBoxes.push(<Box castShadow position={generateVector3(i, 5 + i)}>
                <meshStandardMaterial color="pink"/>
            </Box>);
        }
    }

    const debugPositions: { color: string, point: V3 }[] = [];

    if (boundingBoxCalc.current) {
        debugPositions.push({ color: '#9ef64a', point: boundingBoxCalc.current.min });
        debugPositions.push({ color: '#cb7c33', point: boundingBoxCalc.current.max });
    }

    // Update shadow camera properties
    if (lightRef.current) {
        // console.log('test points >')
        debugPositions.push({ color: '#f00', point: transformToShadowCamera(new Vector3(0, 0, 0), lightRef.current) });
        debugPositions.push({ color: '#6f15ce', point: transformToShadowCamera(new Vector3(6, 0, 0), lightRef.current) });
        debugPositions.push({ color: '#e7953a', point: transformToShadowCamera(new Vector3(3, 0, 6), lightRef.current) });
        debugPositions.push({ color: '#17654a', point: transformToShadowCamera(new Vector3(6, 3, 6), lightRef.current) });

        const shadowMapSize = Math.pow(2, shadowMapResolution);

        const shadowCamera = lightRef.current.shadow.camera;

        if (shadowCameraControls.manual) {
            const shadowCameraProps = {
                near: shadowCameraControls.near,
                far: shadowCameraControls.far,
                left: -shadowCameraControls.width / 2,
                right: shadowCameraControls.width / 2,
                top: shadowCameraControls.height / 2,
                bottom: -shadowCameraControls.height / 2,
            };

            Object.assign(shadowCamera, shadowCameraProps);
        } else {
            const shadowCameraProps = {
                far: -boundingBoxCalc.current.min.z,
                near: -boundingBoxCalc.current.max.z,
                left: boundingBoxCalc.current.min.x,
                right: boundingBoxCalc.current.max.x,
                top: boundingBoxCalc.current.max.y,
                bottom: boundingBoxCalc.current.min.y
            };

            //TODO we also need to ensure that the 'far' value will ensure that the top
            //of the frustrum box will intersect the ground plane

            //Optionally also ignore any other values below the ground plane

            Object.assign(shadowCamera, shadowCameraProps);
        }
        shadowCamera.updateProjectionMatrix();

        const { intersection, distance } = intersectGroundPlane(shadowCamera, minimumGroundY);

        if (intersection) {
            console.log('distance', distance, 'shadowCamera.far', shadowCamera.far);
            refSpheres.push(<Sphere scale={0.1} position={intersection}/>);
            if (distance != 0) {
                const farAtGround = shadowCamera.far + distance;
                shadowCamera.far = Math.min(farAtGround, maxFarExtents);
                shadowCamera.updateProjectionMatrix();
            }
            console.log('FAR', 'shadowCamera.far', shadowCamera.far);
        }

        lightRef.current.shadow.mapSize.width = shadowMapSize;
        lightRef.current.shadow.mapSize.height = shadowMapSize;
        lightRef.current.shadow.map?.dispose();
        lightRef.current.shadow.map = null;


        if (helperRef.current) {
            helperRef.current.update();
        }
    }

    const debugPlaneSize = 20;
    const d = debugPlaneSize / 2;

    return (
        <>
            <group position={[0, 5, -20]}>
                <Line
                    points={[[-d, -d, 0], [-d, d, 0], [d, d, 0], [d, -d, 0], [-d, -d, 0]]}
                    color={'blue'}
                    lineWidth={1}
                />
                {debugPositions.map((pt) => (
                    <Line
                        points={[[0, 0, 0], pt.point]}
                        color={pt.color}
                        lineWidth={1}
                    />
                ))}
            </group>
            <group>
                {refSpheres}
            </group>
            <group>
                <directionalLight
                    layers={0}
                    ref={lightRef}
                    position={lightPosition}
                    castShadow
                />
                <directionalLight
                    layers={0}
                    position={lightPosition}
                />


                <group ref={boxesRef}  layers={1}>

                    <Box castShadow position={[6, 3, 16]}>
                        <meshStandardMaterial color="teal"/>
                    </Box>

                    <Box castShadow position={[6, 0, 10]}>
                        <meshStandardMaterial color="purple"/>
                    </Box>
                    <Box castShadow position={[3, 0, 16]}>
                        <meshStandardMaterial color="orange"/>
                    </Box>
                    {testBoxes}
                </group>


                <Box scale={[0.1, 0.1, 0.1]} position={lightPosition}>
                    <meshBasicMaterial color="#ffff99"/>
                </Box>
                <Box castShadow position={[0, -0.03, 0]} scale={[0.2, 0.2, 0.2]}>
                    <meshStandardMaterial color="teal"/>
                </Box>
                <Line
                    points={[[0, 0, 0], lightPosition]}
                    color="red"
                    lineWidth={1}
                />
                <group>
                <Box  layers={0} receiveShadow position={[0, minimumGroundY, 0]} scale={[30, 0.2, 30]}>
                    <meshStandardMaterial color="#ffaa99"/>
                </Box>
                </group>

                <Plane layers={0} receiveShadow scale={[50, 50, 0.3]} position={[0, minimumGroundY, 1]}
                       rotation={[-Math.PI / 2, 0, 0]}>
                    <meshStandardMaterial color="#ffcc99"/>
                </Plane>
            </group>
            <CameraControls/>
        </>
    );
}
