import { Box, Html } from "@react-three/drei";
import { cullSpaces } from "../utils.ts";
import { Material, Mesh, MeshBasicMaterial, MeshStandardMaterial, TextureLoader, Vector3 } from "three";
import type { NodeDataWrapper } from "../speckle";
import { DoubleSide } from "three";
import type { AppearanceAttributes } from "../store";
import { MeshFlatMaterial } from "./materials/MeshFlatMaterial.ts";
import { useEffect, useMemo, useRef } from "react";
import TrackPosition from "./TrackPosition.tsx";
import { useMaterial } from "./hooks/useMaterial.ts";
import type { MeshProps } from "@react-three/fiber";



type MeshViewProps = MeshProps & {
    geometryWrapper: NodeDataWrapper,
    appearance: AppearanceAttributes,
    materialCache: { [key: string]: Material }
}

export const MeshView = ((props: MeshViewProps) => {
        const { geometryWrapper, appearance, materialCache, ...rest } = props;
        const ref = useRef<Mesh>(null);

        const material = useMaterial(appearance, materialCache);

        const { trackPoints, center } = useMemo(() => {
            geometryWrapper.meshGeometry?.computeBoundingBox();
            const boxCenter = new Vector3();
            const trackPoints: Vector3[] = [];
            const boundingBox = geometryWrapper.meshGeometry?.boundingBox;
            if (boundingBox) {
                boundingBox.getCenter(boxCenter);
                trackPoints.push(boundingBox.min);
                trackPoints.push(boxCenter);
                trackPoints.push(boundingBox.max);
            }
            return { center: boxCenter, trackPoints };
        }, [geometryWrapper.meshGeometry]);

        const label = appearance.label;
        //`${center.x.toFixed(1)},${center.y.toFixed(1)},${center.z.toFixed(1)}`;
        // if (appearance.style === 'texture') {
        //     return <TempBox appearance={appearance} materialCache={materialCache}/>
        // }
        return <>
            <mesh ref={ref}
                  key={geometryWrapper.id}
                  geometry={geometryWrapper.meshGeometry}
                  material={material}
                  renderOrder={appearance.style === "texture" ? 0 : 1}
                  {...rest}
            >
                {label && (
                    <Html position={center}>
                        <div onClick={() => {
                            geometryWrapper.events.broadcast('click')
                        }}><span className={'unit-tag'}>{label}</span></div>
                    </Html>
                )}
            </mesh>
            <TrackPosition points={trackPoints} onPositionUpdate={(positions) => {
                // console.log('positionUpdate', position)
                geometryWrapper.events.broadcast('positionUpdate', { positions })
            }} objectRef={ref}/>
        </>
    })
;
