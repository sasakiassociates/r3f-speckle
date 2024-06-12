import { Vector3 } from "three";
import { NodeDataWrapper, speckleStore } from "@strategies/r3f-speckle/speckle";
import type { BasicSpeckleLoader } from "./BasicSpeckleLoader.ts";
import { AppearanceNodeWrapper } from "./AppearanceNodeWrapper.ts";
import type ObjectLoader from "@speckle/objectloader";

export abstract class SpeckleDataManager {
    speckleLoader?: BasicSpeckleLoader;
    offset?: Vector3;

    abstract processSpeckleData(c: any): void;

    figureAutoOffset(wrapper: NodeDataWrapper) {
        if (!this.offset) {
            const firstVertex = new Vector3().fromArray(wrapper.makeMeshBuffer()!.attributes.position.array, 0);
            this.offset = firstVertex.negate(); // This will invert the coordinates of the first vertex
        }
        wrapper.setOffset(this.offset);
    }

    addMesh(data: any, metadata?: { [key: string]: string; }) {
        if (!this.speckleLoader) return;
        const loader = this.speckleLoader.getLoader();
        if (!loader) return;

        const wrapper = this.getNodeWrapper(loader, data, metadata);
        speckleStore.addMesh(wrapper);
        this.figureAutoOffset(wrapper);
        return wrapper;

    }

    getNodeWrapper(loader: ObjectLoader, data: any, metadata?: { [key:string] : string }) {
        return new NodeDataWrapper(loader, data, metadata)
    }

    addLine(data: any, metadata?: { [key: string]: string; }) {
        if (!this.speckleLoader) return;
        const loader = this.speckleLoader.getLoader();
        if (!loader) return;
        const wrapper = this.getNodeWrapper(loader, data, metadata)
        speckleStore.addLine(wrapper);
        this.figureAutoOffset(wrapper);
    }
}
