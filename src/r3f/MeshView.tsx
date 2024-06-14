import { Box, Html } from "@react-three/drei";
import { cullSpaces } from "../utils.ts";
import { Material, MeshBasicMaterial, MeshStandardMaterial, TextureLoader, Vector3 } from "three";
import type { NodeDataWrapper } from "../speckle";
import { type MeshProps, type ThreeEvent, useLoader } from "@react-three/fiber";
import { DoubleSide } from "three";
import type { AppearanceAttributes } from "../store";
import { MeshFlatMaterial } from "./materials/MeshFlatMaterial.ts";
import { useMemo } from "react";

const generateMaterialKey = (props: any) => JSON.stringify(props);
export type MeshMaterialStyle = 'flat' | 'solid' | 'translucent' | 'texture';
export type MaterialAttributes = {
    color: string,
    opacity?: number,
    transparent?: boolean,
    style?: MeshMaterialStyle
};

//another r3f method is to share materials via useResource https://codesandbox.io/p/sandbox/billowing-monad-bgnnt?file=%2Fsrc%2FApp3d.tsx
const useMaterial = (materialProps: MaterialAttributes, materialCache: { [key: string]: Material }) => {
    const pickMaterialAttributes = ({ color, opacity, style }: MaterialAttributes) => {
        const opacityApplied = opacity === undefined ? 1 : opacity;
        return {
            color,
            opacity: opacityApplied,
            transparent: opacityApplied < 1,
            style: style || 'solid'
        };
    };

    const filteredProps = pickMaterialAttributes(materialProps);
    const key = generateMaterialKey(filteredProps);

    return useMemo(() => {
        if (!materialCache[key]) {
            let newMaterial;
            const { style, ...matProps } = filteredProps;
            switch (style) {
                case 'translucent':
                    newMaterial = new MeshFlatMaterial({
                        color: matProps.color,
                        opacity: matProps.opacity,
                        maxOpacity: matProps.opacity * 4
                    });
                    break;
                case 'flat':
                    newMaterial = new MeshBasicMaterial(matProps);
                    break;
                case 'texture':
                    const { color, ...remProps } = matProps;
                    const texture = useLoader(TextureLoader, color);
                    newMaterial = new MeshBasicMaterial({...remProps, map: texture });
                    break;
                default:
                    newMaterial = new MeshStandardMaterial({ side: DoubleSide, ...matProps });
            }
            materialCache[key] = newMaterial;
        }
        return materialCache[key];
    }, [key, materialCache, filteredProps]);
};

type MeshViewProps = MeshProps & {
    geometryWrapper: NodeDataWrapper,
    appearance: AppearanceAttributes,
    materialCache: { [key: string]: Material }
}

export const MeshView = ((props: MeshViewProps) => {
        const { geometryWrapper, appearance, materialCache, ...rest } = props;

        const material = useMaterial(appearance, materialCache);

        const center = useMemo(() => {
            geometryWrapper.meshGeometry?.computeBoundingBox();
            const boxCenter = new Vector3();
            geometryWrapper.meshGeometry?.boundingBox?.getCenter(boxCenter);
            return boxCenter;
        }, [geometryWrapper.meshGeometry]);

        const label = appearance.label;
        // if (appearance.style === 'texture') {
        //     return <TempBox appearance={appearance} materialCache={materialCache}/>
        // }
        return <mesh
            key={geometryWrapper.id}
            geometry={geometryWrapper.meshGeometry}
            material={material}
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
    })
;
