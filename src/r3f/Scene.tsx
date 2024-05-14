import * as THREE from 'three'
import { useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { Grid, CameraControls } from '@react-three/drei'
import { useControls, button, buttonGroup, folder } from 'leva'

const { DEG2RAD } = THREE.MathUtils

export function Scene() {
    const cameraControlsRef = useRef<CameraControls>(null)

    const { camera } = useThree()

    // All same options as the original "basic" example: https://yomotsu.github.io/camera-controls/examples/basic.html
    // @ts-ignore
    const { minDistance, enabled, verticalDragToForward, dollyToCursor, infinityDolly } = useControls({
        thetaGrp: buttonGroup({
            label: 'rotate theta',
            opts: {
                '+45º': () => cameraControlsRef.current?.rotate(45 * DEG2RAD, 0, true),
                '-90º': () => cameraControlsRef.current?.rotate(-90 * DEG2RAD, 0, true),
                '+360º': () => cameraControlsRef.current?.rotate(360 * DEG2RAD, 0, true)
            }
        }),
        phiGrp: buttonGroup({
            label: 'rotate phi',
            opts: {
                '+20º': () => cameraControlsRef.current?.rotate(0, 20 * DEG2RAD, true),
                '-40º': () => cameraControlsRef.current?.rotate(0, -40 * DEG2RAD, true)
            }
        }),
        truckGrp: buttonGroup({
            label: 'truck',
            opts: {
                '(1,0)': () => cameraControlsRef.current?.truck(1, 0, true),
                '(0,1)': () => cameraControlsRef.current?.truck(0, 1, true),
                '(-1,-1)': () => cameraControlsRef.current?.truck(-1, -1, true)
            }
        }),
        dollyGrp: buttonGroup({
            label: 'dolly',
            opts: {
                '1': () => cameraControlsRef.current?.dolly(1, true),
                '-1': () => cameraControlsRef.current?.dolly(-1, true)
            }
        }),
        zoomGrp: buttonGroup({
            label: 'zoom',
            opts: {
                '/2': () => cameraControlsRef.current?.zoom(camera.zoom / 2, true),
                '/-2': () => cameraControlsRef.current?.zoom(-camera.zoom / 2, true)
            }
        }),
        minDistance: { value: 0 },
        moveTo: folder(
            {
                vec1: { value: [3, 5, 2], label: 'vec' },
                //@ts-ignore
                'moveTo(…vec)': button((get) => cameraControlsRef.current?.moveTo(...get('moveTo.vec1'), true))
            },
            { collapsed: true }
        ),
        setPosition: folder(
            {
                vec2: { value: [-5, 2, 1], label: 'vec' },
                //@ts-ignore
                'setPosition(…vec)': button((get) => cameraControlsRef.current?.setPosition(...get('setPosition.vec2'), true))
            },
            { collapsed: true }
        ),
        setTarget: folder(
            {
                vec3: { value: [3, 0, -3], label: 'vec' },
                //@ts-ignore
                'setTarget(…vec)': button((get) => cameraControlsRef.current?.setTarget(...get('setTarget.vec3'), true))
            },
            { collapsed: true }
        ),
        setLookAt: folder(
            {
                vec4: { value: [1, 2, 3], label: 'position' },
                vec5: { value: [1, 1, 0], label: 'target' },
                //@ts-ignore
                'setLookAt(…position, …target)': button((get) => cameraControlsRef.current?.setLookAt(...get('setLookAt.vec4'), ...get('setLookAt.vec5'), true))
            },
            { collapsed: true }
        ),
        lerpLookAt: folder(
            {
                vec6: { value: [-2, 0, 0], label: 'posA' },
                vec7: { value: [1, 1, 0], label: 'tgtA' },
                vec8: { value: [0, 2, 5], label: 'posB' },
                vec9: { value: [-1, 0, 0], label: 'tgtB' },
                t: { value: Math.random(), label: 't', min: 0, max: 1 },
                //@ts-ignore
                'f(…posA,…tgtA,…posB,…tgtB,t)': button((get) => {
                    return cameraControlsRef.current?.lerpLookAt(
                        //@ts-ignore
                        ...get('lerpLookAt.vec6'),
                        ...get('lerpLookAt.vec7'),
                        ...get('lerpLookAt.vec8'),
                        ...get('lerpLookAt.vec9'),
                        get('lerpLookAt.t'),
                        true
                    )
                })
            },
            { collapsed: true }
        ),
        saveState: button(() => cameraControlsRef.current?.saveState()),
        reset: button(() => cameraControlsRef.current?.reset(true)),
        enabled: { value: true, label: 'controls on' },
        verticalDragToForward: { value: false, label: 'vert. drag to move forward' },
        dollyToCursor: { value: false, label: 'dolly to cursor' },
        infinityDolly: { value: false, label: 'infinity dolly' }
    })

    return (
        <>
            <group position-y={-0.5}>
                {/*<Ground/>*/}
                {/*<Shadows/>*/}

                {/*<directionalLight*/}
                {/*    position={[0, 5, 5]}*/}
                {/*    castShadow*/}
                {/*    shadow-mapSize-height={1024}*/}
                {/*    shadow-mapSize-width={1024}*/}
                {/*    shadow-radius={100}*/}
                {/*    shadow-bias={-0.0001}*/}
                {/*/>*/}

                <CameraControls
                    ref={cameraControlsRef}
                    minDistance={minDistance}
                    enabled={enabled}
                    verticalDragToForward={verticalDragToForward}
                    dollyToCursor={dollyToCursor}
                    infinityDolly={infinityDolly}
                />
                {/*<Environment files={suspend(city).default} />*/}
            </group>
        </>
    )
}

function Ground() {
    const gridConfig = {
        cellSize: 0.5,
        cellThickness: 0.5,
        cellColor: '#6f6f6f',
        sectionSize: 5,
        sectionThickness: 1,
        sectionColor: '#494747',
        fadeDistance: 100,
        fadeStrength: 1,
        followCamera: true,
        infiniteGrid: true
    }
    return <Grid position={[0, -0.01, 0]} args={[100, 100]} {...gridConfig} />
}

// const Shadows = () => {
//     const { color, amount, frames, radius, position } = useControls({
//         color: '#ffffff',
//         amount: 8,
//         radius: 4,
//         frames: 100,
//         position: [50, 50, 10]
//     });
//     return <AccumulativeShadows temporal frames={frames} color={color} colorBlend={0.5} alphaTest={0.9} scale={200}>
//         <RandomizedLight amount={amount} radius={radius} position={position}/>
//     </AccumulativeShadows>
// };
