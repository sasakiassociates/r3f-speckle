import { runInAction } from "mobx";

import { SpeckleDataManager } from "./SpeckleDataManager.ts";
import type { MainStore } from "./MainStore.ts";

export class BasicDataManager extends SpeckleDataManager {
    private mainStore: MainStore;

    constructor(mainStore: MainStore) {
        super();
        this.mainStore = mainStore;
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
        for (let mesh of meshes) {
            let materialName = mesh["@displayValue"][0].renderMaterial.name;
            // console.log("MATERIAL NAME", materialName);
            this.mainStore.visualizerStore.setMaterialName(mesh.id, materialName);
        }

        runInAction(() => {//lots of mobx updates better to batch them
            // mainStore.clearData();
            // // let rootObj = commitObj['@Data']["@{0}"][0];
            // let rootObj = speckleData;

            for (let mesh of meshes) {
                const geometryObj = mesh["@displayValue"][0];
                // console.log("mesh", mesh);
                const w = this.addMesh(geometryObj,
                    { id: mesh.id });
                if (w) w.events.on('click', (e) => {
                    // console.log('calling toggleSelectOnNode');
                    this.mainStore.visualizerStore.toggleSelectOnNode(mesh.id)
                });
                // mainStore.addElement(programChunkObj);
            }


            // this.addMesh(programGeometry, {id});
            //
            // mainStore.onLoadFromSpeckle();
        })
    }

}
