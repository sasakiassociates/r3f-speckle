import type { NodeDataWrapper } from "../speckle";

export type AppearanceAttributes = {
    visible: boolean,
    label: string,
    color: string,
    opacity?: number,
    outerGlow?: boolean,
    transparent?: boolean,
    flat?: boolean,
    lineWidth?: number
};

export abstract class AppearanceStore {
    visibleEdgeColor = '#509fc9';
    hiddenEdgeColor = '#7e86b9';

    abstract computeAppearance(n: NodeDataWrapper): AppearanceAttributes;
}
