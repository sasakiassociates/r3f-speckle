import type { NodeDataWrapper } from "../speckle";
import { hexStringToNumber } from "../utils.ts";

export type AppearanceAttributes = {//this is a mix of properties for lines as well as meshes - only valid ones apply, but this format keeps it simple
    visible: boolean,
    color: string,
    label?: string,
    opacity?: number,
    outerGlow?: boolean,
    transparent?: boolean,
    flat?: boolean,
    lineWidth?: number
};

export abstract class AppearanceStore {
    abstract computeAppearance(n: NodeDataWrapper): AppearanceAttributes;

    get outerGlowProperties() {
        return {
            visibleEdgeColor: hexStringToNumber('#31adf1'),
            hiddenEdgeColor: hexStringToNumber('#555c9e'),
            edgeStrength: 12,
        }
    };
}
