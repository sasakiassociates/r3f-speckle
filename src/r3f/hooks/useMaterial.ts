import { DoubleSide, type Material, MeshBasicMaterial, MeshStandardMaterial, TextureLoader } from "three";
import { useMemo } from "react";
import { MeshFlatMaterial } from "../materials/MeshFlatMaterial.ts";
import { useAuthTexture } from "./useAuthTexture.ts";

//another r3f method is to share materials via useResource https://codesandbox.io/p/sandbox/billowing-monad-bgnnt?file=%2Fsrc%2FApp3d.tsx

const generateMaterialKey = (props: any) => JSON.stringify(props);

export type MeshMaterialStyle = 'flat' | 'solid' | 'translucent' | 'texture';
export type MaterialAttributes = {
    color: string,
    opacity?: number,
    emissiveIntensity?: number,
    transparent?: boolean,
    style?: MeshMaterialStyle,
    options?: { token?: string}
};

export const useMaterial = (materialProps: MaterialAttributes, materialCache: { [key: string]: Material }) => {
    const pickMaterialAttributes = ({ color, opacity, style, emissiveIntensity, options }: MaterialAttributes) => {
        const opacityApplied = opacity === undefined ? 1 : opacity;
        return {
            color,
            opacity: opacityApplied,
            emissiveIntensity: emissiveIntensity,
            transparent: opacityApplied < 1,
            style: style || 'solid',
            token: options?.token
        };
    };

    const filteredProps = pickMaterialAttributes(materialProps);

    // Load texture if needed
    const texture =
        filteredProps.style === 'texture'
            ? useAuthTexture(filteredProps.color, filteredProps.token)
            : null;

    const key = generateMaterialKey({...filteredProps, hasTexture: !!texture});

    return useMemo(() => {
        if (!materialCache[key]) {
            let newMaterial;
            const { style, token, ...matProps } = filteredProps;

            switch (style) {
                case 'translucent':
                    newMaterial = new MeshFlatMaterial({
                        color: matProps.color,
                        opacity: matProps.opacity,
                        maxOpacity: matProps.opacity * 4
                    });
                    break;
                case 'flat': {
                    const { emissiveIntensity, ...remProps } = matProps;
                    newMaterial = new MeshBasicMaterial({ side: DoubleSide, ...remProps });
                    break;
                }
                case 'texture': {
                    const { color, emissiveIntensity, ...remProps } = matProps;
                    newMaterial = new MeshBasicMaterial({
                        ...remProps,
                        depthWrite: false,
                        map: texture || undefined
                    });
                    break;
                }
                default:
                    newMaterial = new MeshStandardMaterial({ side: DoubleSide, emissive: matProps.color, flatShading: true, ...matProps });
            }
            materialCache[key] = newMaterial;
        }
        return materialCache[key];
    }, [key, materialCache, filteredProps, texture]);
};
