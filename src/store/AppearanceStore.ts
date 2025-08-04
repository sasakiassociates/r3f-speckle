import type { NodeDataWrapper } from "../speckle";
import { hexStringToNumber } from "../utils.ts";
import type { MeshMaterialStyle } from "../r3f";

export type AppearanceAttributes = {//this is a mix of properties for lines as well as meshes - only valid ones apply, but this format keeps it simple
    visible: boolean,
    color: string,
    label?: string,
    opacity?: number,
    emissiveIntensity?: number,
    outerGlow?: boolean,
    transparent?: boolean,
    style?: MeshMaterialStyle,
    lineWidth?: number,
    options?: Record<string, any>
};

export abstract class AppearanceStore {
    abstract computeAppearance(n: NodeDataWrapper): AppearanceAttributes;

    getOuterGlowValues() {
        const { visibleEdgeColor, hiddenEdgeColor, ...rest } = this.outerGlowProperties;
        return {
            visibleEdgeColor: hexStringToNumber(visibleEdgeColor),
            hiddenEdgeColor: hexStringToNumber(hiddenEdgeColor),
            ...rest,
        }
    }

    get outerGlowProperties() {
        return {
            visibleEdgeColor: '#31adf1',
            hiddenEdgeColor: '#555c9e',
            edgeStrength: 12,
        }
    };
}
