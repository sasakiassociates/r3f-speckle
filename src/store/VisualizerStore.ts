import { computed, makeAutoObservable, makeObservable, observable } from "mobx";
import type { NodeDataWrapper, SpeckleStore } from "../speckle";

/**
 * root class for OspVisualizer store
 */
export abstract class VisualizerStore {
    speckleStore?: SpeckleStore;
     protected constructor() {
        makeObservable(this);
    }
    @computed
    get colorById(): { [id: string]: string } {
        throw new Error('colorById not implemented');
    }

    @computed
    get nameById(): { [id: string]: string } {
        throw new Error('nameById not implemented');
    }

    getId(n: NodeDataWrapper) {
        return n.raw['id'];
    }

    includeNode(n: NodeDataWrapper) {
        return true;
    }

    setSpeckleStore(speckleStore: SpeckleStore) {
        this.speckleStore = speckleStore;
        this.initSpeckleStore();
    }

    protected initSpeckleStore() {
        console.warn('initSpeckleStore not implemented');
    }
}
