import { Html } from "@react-three/drei";
import { cullSpaces } from "../utils.ts";
import { Material, MeshStandardMaterial, Vector3 } from "three";
import type { NodeDataWrapper } from "../speckle";
import type { MeshProps } from "@react-three/fiber";

export type MaterialAttributes = { color: string, opacity?: number, transparent?: boolean };

const generateMaterialKey = (props: MaterialAttributes) => JSON.stringify(props);

const getMaterial = (materialProps: MaterialAttributes, materialCache: { [key: string]: Material }) => {
    const key = generateMaterialKey(materialProps);
    if (!materialCache[key]) {
        materialCache[key] = new MeshStandardMaterial(materialProps);
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
                <span className={'unit-tag'}>{label}</span>
            </Html>
        )}
    </mesh>
});
