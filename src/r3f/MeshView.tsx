import { Html } from "@react-three/drei";
import { cullSpaces } from "../utils.ts";
import { Material, MeshBasicMaterial, MeshStandardMaterial, Vector3 } from "three";
import type { NodeDataWrapper } from "../speckle";
import type { MeshProps, ThreeEvent } from "@react-three/fiber";
import { DoubleSide } from "three";
import type { AppearanceAttributes } from "../store";
import { MeshFlatMaterial } from "./materials/MeshFlatMaterial.ts";

const generateMaterialKey = (props: MaterialAttributes) => JSON.stringify(props);
export type MeshMaterialStyle = 'flat' | 'solid' | 'translucent';
export type MaterialAttributes = { color: string, opacity?: number, transparent?: boolean, style?: MeshMaterialStyle };

//another r3f method is to share materials via useResource https://codesandbox.io/p/sandbox/billowing-monad-bgnnt?file=%2Fsrc%2FApp3d.tsx
const getMaterial = (materialProps: MaterialAttributes, materialCache: { [key: string]: Material }) => {
    const pickMaterialAttributes = ({ color, opacity, style }: MaterialAttributes) => {
        const opacityApplied = (opacity === undefined) ? 1 : opacity;
        return ({
            color,
            opacity: opacityApplied,
            transparent: opacityApplied < 1,
            style: style || 'solid'
        });
    };
    const filteredProps = pickMaterialAttributes(materialProps);
    const key = generateMaterialKey(filteredProps);
    if (!materialCache[key]) {
        let newMaterial;
        const { style, ...matProps } = filteredProps;
        switch (style) {
            case "translucent":
                newMaterial = new MeshFlatMaterial({
                    color: matProps.color,
                    opacity: matProps.opacity,
                    maxOpacity: matProps.opacity * 4
                });
                break;
            case "flat":
                newMaterial = new MeshBasicMaterial(matProps);
                break;
            default:
                newMaterial = new MeshStandardMaterial({ side: DoubleSide, ...matProps, });
        }
        materialCache[key] = newMaterial;
    }
    return materialCache[key];
}
type MeshViewProps = MeshProps & {
    geometryWrapper: NodeDataWrapper,
    appearance: AppearanceAttributes,
    materialCache: { [key: string]: Material }
}
export const MeshView = ((props: MeshViewProps) => {
        const { geometryWrapper, appearance, materialCache, ...rest } = props;
        geometryWrapper.meshGeometry?.computeBoundingBox();
        const center = new Vector3();
        geometryWrapper.meshGeometry?.boundingBox?.getCenter(center);
        // const noCache: { [key: string]: Material; } = {};
        const material = getMaterial(appearance, materialCache);
        const label = appearance.label;
        return <mesh
            key={geometryWrapper.id}
            geometry={geometryWrapper.meshGeometry}
            {...rest}
            material={material}
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
