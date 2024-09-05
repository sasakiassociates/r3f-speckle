import { Vector3 } from "three";
import { NodeDataWrapper, speckleStore } from "@strategies/r3f-speckle/speckle";
import type { BasicSpeckleLoader } from "./BasicSpeckleLoader.ts";
import type ObjectLoader from "@speckle/objectloader";

export abstract class SpeckleDataManager {
    speckleLoader?: BasicSpeckleLoader;
    offset?: Vector3;

    abstract processSpeckleData(c: any): void;

    figureAutoOffset(wrapper: NodeDataWrapper) {
        if (!this.offset) {
            const firstVertex = new Vector3().fromArray(wrapper.makeMeshBuffer()!.attributes.position.array, 0);
            this.offset = firstVertex.negate(); // This will invert the coordinates of the first vertex
            console.log('Calculated auto offset', this.offset.x, this.offset.y, this.offset.z);
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

    getNodeWrapper(loader: ObjectLoader, data: any, metadata?: { [key: string]: any }) {
        return new NodeDataWrapper(loader, data, metadata)
    }

    addLine(data: any, metadata?: { [key: string]: any; }) {
        if (!this.speckleLoader) return;
        const loader = this.speckleLoader.getLoader();
        if (!loader) return;
        const wrapper = this.getNodeWrapper(loader, data, metadata)
        speckleStore.addLine(wrapper);
        this.figureAutoOffset(wrapper);
    }

    addBaseImage(baseImage: any, streamUrl?: string) {
        if (!this.speckleLoader) return;
        const loader = this.speckleLoader.getLoader();
        if (!loader) return;
        if (baseImage.Rectangle) {
            const baseWrapper = this.getNodeWrapper(loader, baseImage.Rectangle);
            this.figureAutoOffset(baseWrapper);

            const basePositions = baseWrapper.lineGeometry.getAttribute('position').array;

            let xMin = Infinity;
            let xMax = -Infinity;
            let zMin = Infinity;
            let zMax = -Infinity;
            let yMin = Infinity;

            for (let i = 0; i < basePositions.length; i += 3) {
                const x = basePositions[i];
                const y = basePositions[i + 1];
                const z = basePositions[i + 2];

                xMin = Math.min(xMin, x);
                xMax = Math.max(xMax, x);
                zMin = Math.min(zMin, z);
                zMax = Math.max(zMax, z);

                yMin = Math.min(yMin, y);

            }
        }

        let mesh = baseImage.Mesh;
        if (!mesh) {
            mesh = baseImage;
        }
        if (mesh.displayValue) {//e.g. if it's a Brep, it will also carry a displayValue which is a mesh
            mesh = mesh.displayValue[0];
        }
        const baseMesh = this.getNodeWrapper(loader, mesh);
        speckleStore.addMesh(baseMesh);
        this.figureAutoOffset(baseMesh);
        let imageUrl: string;
        if (streamUrl) {
            imageUrl = `${streamUrl}/blob/${baseImage.BlobID}`;
        } else {
            imageUrl = './img/uv-check-texture.png'
        }

        // speckleStore.addLine(baseWrapper);
        //


        baseMesh.setMetadata(
            { isBaseImage: true, imageUrl }
        );

        // baseMesh.setUvBoundsRectangle(
        //     {
        //         x: xMin,
        //         y: zMax,//not sure why it needs to be zMax but this aligns with the outline
        //         width: xMax - xMin,
        //         height: zMax - zMin
        //     }
        // )
        // baseWrapper.setMetadata(
        //     { isBaseImage: true, y:yMin, imageUrl }
        // );


        // speckleStore.addBaseImage(baseWrapper);
    }
}
