import { Html } from "@react-three/drei";
import { cullSpaces } from "../utils.ts";
import { Material, MeshBasicMaterial, MeshStandardMaterial, Vector3 } from "three";
import type { NodeDataWrapper } from "../speckle";
import type { MeshProps, ThreeEvent } from "@react-three/fiber";
import { DoubleSide } from "three";

export type MaterialAttributes = { color: string, opacity?: number, transparent?: boolean, flat?: boolean };

const generateMaterialKey = (props: MaterialAttributes) => JSON.stringify(props);

//another r3f method is to share materials via useResource https://codesandbox.io/p/sandbox/billowing-monad-bgnnt?file=%2Fsrc%2FApp3d.tsx
const getMaterial = (materialProps: MaterialAttributes, materialCache: { [key: string]: Material }) => {
    const key = generateMaterialKey(materialProps);
    if (!materialCache[key]) {
        let newMaterial;
        const { flat, ...matProps } = materialProps;
        if (flat) {
            newMaterial = new MeshBasicMaterial(matProps);
        } else {
            newMaterial = new MeshStandardMaterial({side: DoubleSide, ...matProps, });
        }
        materialCache[key] = newMaterial;
    }
    return materialCache[key];
}
type MeshViewProps = MeshProps & {
    geometryWrapper: NodeDataWrapper,
    materialAttributes: MaterialAttributes,
    materialCache: { [key: string]: Material }
    label?: string,
}
export const MeshView = ((props: MeshViewProps) => {
        const { geometryWrapper, materialAttributes, materialCache, label, ...rest } = props;
        geometryWrapper.meshGeometry?.computeBoundingBox();
        const center = new Vector3();
        geometryWrapper.meshGeometry?.boundingBox?.getCenter(center);
        // const noCache: { [key: string]: Material; } = {};
        const material = getMaterial(materialAttributes, materialCache);
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
