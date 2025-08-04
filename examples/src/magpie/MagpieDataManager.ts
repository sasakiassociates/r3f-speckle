import { runInAction } from "mobx";

import { SpeckleDataManager } from "../core/SpeckleDataManager.ts";
import type { MainStore } from "../core/MainStore.ts";
import type ObjectLoader from "@speckle/objectloader";
import type { NodeDataWrapper } from "@strategies/r3f-speckle/speckle";
import { AppearanceNodeWrapper } from "../core/AppearanceNodeWrapper.ts";

export const tagsToDictionary = (tagList: string[]) => {
    const ans: { [key: string]: string; } = {};
    for (let tagPair of tagList) {
        const bits = tagPair.split(':');
        if (bits.length === 2) {
            ans[bits[0]] = bits[1];
        }
    }
    return ans;
};

export class MagpieDataManager extends SpeckleDataManager {
    private mainStore: MainStore;

    constructor(mainStore: MainStore) {
        super();
        this.mainStore = mainStore;
    }

    getNodeWrapper(loader: ObjectLoader, data: any, metadata?: { [p: string]: string }): NodeDataWrapper {
        return new AppearanceNodeWrapper(this.mainStore.appearanceStore, loader, data, metadata)
    }

    processSpeckleData(speckleData: any): void {
        const { mainStore } = this;
        const { streamUrl } = mainStore;
        const baseMapOnly = true;
        const parcelFilter = (parcelId: string) => {
            return true;
            // return parcelId !== '8f17028d08afc35dd4ac3a710019ee31';
            // return parcelId !== '10960ebf2b0de987e91de57375945023';
        }

        runInAction(() => {//lots of mobx updates better to batch them
            // mainStore.clearData();
            // let rootObj = commitObj['@Data']["@{0}"][0];
            let rootObj = speckleData;

            // const rhinoUnits = rootObj["@GlobalDocumentData"]["@{0}"][0].RhinoUnit;//e.g. Meters
            // mainStore.unitsStore.setUnits(rhinoUnits === 'Meters' ? 'm2' : 'sf');
            for (let programChunk of rootObj['@ProgramChunks']["@{0}"][0].Items) {//NOTE if changing access path, also change in findObject
                if (!parcelFilter(programChunk.ParcelID)) continue;
                let programGeometry = programChunk['@ProgramGeometry'];
                if (!programGeometry) {
                    console.log('Missing geometry for ', programChunk);
                    continue;
                }

                const id = programChunk.id;

                this.addMesh(programGeometry, { id, ...tagsToDictionary(programChunk.ProgramTags.Items) });

                const outline = programChunk["@ProgramOutlines"];
                if (outline) this.addLine(outline, { id, isFloorLine: true });

            }

            //TEMP
            // for (let context of rootObj['@Contexts']["@{0}"][0].Items) {
            //     if (!context['@ContextGeometry']) continue;
            //     if (Array.isArray(context['@ContextGeometry'])) {
            //         for (let g of context['@ContextGeometry']) {
            //             const id = g.id;
            //             this.addMesh(g, { id });
            //         }
            //     } else {
            //         const id = context.id;
            //         this.addMesh(context['@ContextGeometry'], { id });
            //     }
            // }

            let unnamedCount = 0;
            for (let parcel of rootObj['@Parcels']["@{0}"][0].Items) {
                if (!parcel['@ParcelGeometry']) continue;
                const id = parcel.id;
                if (!parcel.ParcelName) {
                    unnamedCount++;
                    parcel.ParcelName = `Unnamed ${unnamedCount}`;
                }
                this.addLine(parcel['@ParcelGeometry'], { id, isParcelLine: true });
            }

            if (rootObj["@Basemap"]) {
                let baseImage = rootObj["@Basemap"]["@{0}"][0];

                this.addBaseImage(baseImage, streamUrl);
            }
            // mainStore.onLoadFromSpeckle();
        })
    }

}
