import { runInAction } from "mobx";

import { SpeckleDataManager } from "./SpeckleDataManager.ts";
import type { MainStore } from "./MainStore.ts";
import type ObjectLoader from "@speckle/objectloader";
import type { NodeDataWrapper } from "@strategies/r3f-speckle/speckle";
import { data } from "autoprefixer";
import { AppearanceNodeWrapper } from "./AppearanceNodeWrapper.ts";

export class BasicDataManager extends SpeckleDataManager {
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

        console.log("speckleData");
        console.log(speckleData);

        //material color gleaned from displayValue.renderMaterial.name
//elements[0].elements[0]["@displayValue"][0].renderMaterial.name

        const meshes: any = [];
        for (let collection of speckleData.elements) {
            for (let element of collection.elements) {
                if (!element["@displayValue"]) {
                    //probably a polycurve
                    continue;
                }
                meshes.push(element);
            }
        }
        runInAction(() => {//lots of mobx updates better to batch them
            // mainStore.clearData();
            // // let rootObj = commitObj['@Data']["@{0}"][0];
            // let rootObj = speckleData;

            for (let mesh of meshes) {
                const geometryObj = mesh["@displayValue"][0];
                let materialName = geometryObj.renderMaterial.name;
                let textureCoordinates = geometryObj.textureCoordinates;
                if (textureCoordinates && textureCoordinates.length > 0) {
                    console.log('textureCoordinates', textureCoordinates);
                }
                // console.log("mesh", mesh);
                const w = this.addMesh(geometryObj,
                    { id: mesh.id, materialName });
                if (w) w.events.on('click', (e) => {
                    // console.log('calling toggleSelectOnNode');
                    this.mainStore.appearanceStore.toggleSelectOnNode(mesh.id)
                });
                // mainStore.addElement(programChunkObj);
            }


            // this.addMesh(programGeometry, {id});
            //
            // mainStore.onLoadFromSpeckle();
        })
    }

}
