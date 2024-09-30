import { NodeDataWrapper } from "@strategies/r3f-speckle/speckle";
import { action, computed, makeObservable } from "mobx";
import type ObjectLoader from "@speckle/objectloader";
import type { AppearanceAttributes } from "@strategies/r3f-speckle/store";
import type { BasicAppearanceStore } from "./BasicAppearanceStore";
import type { MeshMaterialStyle } from "@strategies/r3f-speckle/r3f/MeshView.tsx";

//this approach allows the NodeDataWrapper itself to also control appearance.
//in this case the AppearanceStore simply cedes control over appearance to the AppearanceNodeWrapper
//which contains a reference to AppearanceStore for any centrally stored states
//other solutions may choose to handle the appearance choices outside of the node
//for example a filter and color by solution like Visualizer would want to control those externally
export class AppearanceNodeWrapper extends NodeDataWrapper {
    private appearanceStore: BasicAppearanceStore;

    constructor(appearanceStore: BasicAppearanceStore, objectLoader: ObjectLoader, data: any, metadata?: {
        [key: string]: string
    }) {
        super(objectLoader, data, metadata);
        this.appearanceStore = appearanceStore;
        makeObservable(this);
    }

    @computed
    get appearance(): AppearanceAttributes {
        let isSelected = this.appearanceStore.nodeIsSelected(this.metadata?.id || '');
        const general = {
            outerGlow: isSelected,
            opacity: isSelected ? 1 : this.appearanceStore.opacity / 100,
            emissiveIntensity: isSelected ? 0 : this.appearanceStore.emissiveIntensity / 100,
            style: 'solid' as MeshMaterialStyle,// (isSelected ? 'solid' : (this.appearanceStore.flatMaterials) ? 'flat' : 'solid') as MeshMaterialStyle,
            visible: true,
        };
        if (isSelected) {
            console.log('node selected', general);
        }

        if (this.materialName.startsWith('Pinkish')) {
            return { ...general, color: "#dc69d2" };
        }
        if (this.materialName.startsWith('Bluish') || this.materialName.startsWith('Blueish')) {
            return { ...general, color: "#238bb8" };
        }
        if (this.metadata?.isBaseImage) {
            return { ...general, style:'texture', color: this.metadata?.imageUrl };
        }
        // if (this.materialName.startsWith('Texture') || this.metadata?.isBaseImage) {
        //     return { ...general, style:'texture', color: "https://sasaki.speckle.xyz/api/stream/2a7f62dd54/blob/4b8470d1f6" };
        // }
        if (this.metadata?.Color) {
            return { ...general, color: this.metadata?.Color };
        }
        return { ...general, color: "#5f7f91" };
    }

    @computed
    get materialName() {
        return this.metadata?.materialName || ''
    }
}
