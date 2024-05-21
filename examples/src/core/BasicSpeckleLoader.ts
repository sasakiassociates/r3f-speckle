import { SpeckleLoader, speckleStore } from "@strategies/r3f-speckle/index.ts";
import type { BasicVisualizerStore } from "./BasicVisualizerStore.ts";
import type { SpeckleDataManager } from "./SpeckleDataManager.ts";

export class BasicSpeckleLoader extends SpeckleLoader {
    speckleDataManager: SpeckleDataManager;

    constructor(speckleDataManager: SpeckleDataManager, visualizerStore: BasicVisualizerStore) {
        super();
        this.speckleDataManager = speckleDataManager;
        this.speckleDataManager.speckleLoader = this;

        speckleStore.setVisualizerStore(visualizerStore);
    }

    getLoader() {
        return this.loader;
    }

    speckleArray(data: any) {
        const format = 'flat'; //vs nested
        // the data format of 75pleasant and rhinoCapital from speckle are different
        if (format === 'flat') {
            if (data['@{0}'] && data['@{0}'][0].Items) {
                // eg. slice data from 75pleasant
                return data['@{0}'][0].Items;
            } else if (data['@{0}']) {
                // eg. building data from rhinoCapital
                return data['@{0}'];
            } else if (data['@{0;0}']) {
                return data['@{0;0}'];
            } else {
                console.error('speckle data format is not recognized');
                return;
            }
        }
        // never reached
        return data['@{0}'][0].Items;
    }

    protected processSpeckleData(c: any) {
        const { loader, streamId } = this;
        if (!loader) return;
        this.speckleDataManager.processSpeckleData(c)
    }
}
