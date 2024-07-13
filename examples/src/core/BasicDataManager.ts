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

        const addElement = (collection: any) => {
            if (!collection.elements) return;
            for (let element of collection.elements) {
                if (element.speckle_type === 'Objects.Geometry.Mesh') {
                    meshes.push([element]);
                    continue;
                }
                if (element["@displayValue"]) {
                    meshes.push(element["@displayValue"]);
                    continue;
                }
                if (element["displayValue"]) {
                    meshes.push(element["displayValue"]);
                    continue;
                }
                addElement(element);
            }
        }
        addElement(speckleData);

        runInAction(() => {//lots of mobx updates better to batch them
            // mainStore.clearData();
            // // let rootObj = commitObj['@Data']["@{0}"][0];
            // let rootObj = speckleData;
            // const testBlobStream = 'https://sasaki.speckle.xyz/streams/2a7f62dd54';//TEMP too specific
            const testBlobStream = '';
            for (let mesh of meshes) {
                for (let geometryObj of mesh) {
                    let materialName = geometryObj.renderMaterial?.name;
                    let textureCoordinates = geometryObj.textureCoordinates;
                    if (textureCoordinates && textureCoordinates.length > 0) {
                        // console.log('textureCoordinates', textureCoordinates);
                    }
                    if (!materialName || materialName === 'Material') {
                        this.addBaseImage(geometryObj);
                    } else {
                        // console.log("mesh", mesh);
                        const w = this.addMesh(geometryObj,
                            { id: mesh.id, materialName });
                        if (w) w.events.on('click', (e) => {
                            // console.log('calling toggleSelectOnNode');
                            this.mainStore.appearanceStore.toggleSelectOnNode(mesh.id)
                        });
                    }

                }
                // mainStore.addElement(programChunkObj);
            }


            // this.addMesh(programGeometry, {id});
            //
            // mainStore.onLoadFromSpeckle();
        })
    }

}
