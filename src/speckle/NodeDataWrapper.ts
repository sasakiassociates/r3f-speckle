import { BufferAttribute, BufferGeometry, Matrix4, Vector3 } from "three";
import { GeometryConverter } from "./modules/converter/GeometryConverter";
import { NodeData, TreeNode, WorldTree } from "./modules/tree/WorldTree";
import Converter from "./modules/converter/Converter";
import { makeObservable, observable, runInAction } from "mobx";
import { generateUUID } from "../utils";
import type ObjectLoader from "@speckle/objectloader";
import type { GeometryData } from "./modules/converter/Geometry";
import { EventEmitter } from "@strategies/react-events";
import type { ThreeEvent } from "@react-three/fiber";

type NodeEventArgs = {
    click: { event: ThreeEvent<MouseEvent> };
};

export class NodeEvents extends EventEmitter<NodeEventArgs> {
    broadcast(event: keyof NodeEventArgs, data?: NodeEventArgs[keyof NodeEventArgs]) {
        //'broadcast' is an external trigger for an 'emit'
        this.emit(event, data)
    }

}

export class NodeDataWrapper implements NodeData {
    raw: { [prop: string]: any };
    atomic: boolean = true;
    private _meshGeometry?: BufferGeometry;
    private _lineGeometry?: BufferGeometry;
    private offset?: Vector3;
    private tree: WorldTree;

    displayScale = 1;

    speckleType: string;
    id: string = generateUUID();

    events = new NodeEvents();

    @observable
    conversionComplete = false;

    @observable
    metadata?: { [key:string] : string } = {};
    constructor(objectLoader: ObjectLoader, data: any, metadata?: { [key:string] : string }) {
        makeObservable(this);
        this.raw = data;
        this.metadata = metadata;
        this.speckleType = GeometryConverter.getSpeckleType(this);

        this.tree = new WorldTree();
        const converter = new Converter(objectLoader, this.tree);

        const runConversion = async () => {
            try {
                await converter.traverse('', data, async () => {
                });
            } catch (e) {
                console.error(e);
            }
            // if (this.speckleType === SpeckleType.Polycurve) {
            //     // console.log(this.speckleType, 'TREE after traverse', this.tree);
            //     const geom = GeometryConverter.convertNodeToGeometryData(this);
            //     console.log(this.speckleType, 'GEOM after conversion', geom);
            // }

        }

        runConversion().then(() => {
            runInAction(() => {
                this.conversionComplete = true;
            });
        });

    }


    get children(): TreeNode[] {
        if (!this.tree) return [];
        return this.tree.root.model.children;
    }

    get nestedNodes(): TreeNode[] {
        if (!this.tree) return [];
        //to what extent do we need to replicate the tree structure here
        // or do we just simplify
        const nestedNodeParent = this.tree.findFirst(node => {
            return node.model.nestedNodes && node.model.nestedNodes.length > 0;
        });
        if (nestedNodeParent) return nestedNodeParent.model.nestedNodes;
        return [];
    }

    get meshGeometry() {
        if (!this._meshGeometry) {
            this._meshGeometry = this.makeMeshBuffer();
        }
        return this._meshGeometry;
    }

    get lineGeometry() {
        if (!this._lineGeometry) {
            this._lineGeometry = this.makeLineBuffer();
        }
        return this._lineGeometry;
    }

    applyTransforms(geometry: BufferGeometry, geometryData: GeometryData) {
        if (geometryData.bakeTransform) {
            const transform = geometryData.bakeTransform.elements;
            // Apply the transformation matrix
            const matrix = new Matrix4();
            matrix.fromArray(transform);
            geometry.applyMatrix4(matrix);
        }

        const { displayScale } = this;
        geometry.scale(displayScale, displayScale, displayScale);
        geometry.rotateX(-Math.PI/2);

        const { offset } = this;
        if (offset) geometry.translate(offset.x, offset.y, offset.z);

        // const adjustForView = new Matrix4();
        // adjustForView.makeScale(0.1, 0.1, 0.1);



    }

    get geometryData() {
        return GeometryConverter.convertNodeToGeometryData(this);
    }

    makeLineBuffer(): BufferGeometry {
        const geometry = new BufferGeometry();
        const {geometryData} = this;
        if (!geometryData) return geometry;
        const positions = geometryData.attributes.POSITION;
        const positions32 = new Float32Array(positions);
        geometry.setAttribute('position', new BufferAttribute(positions32, 3));

        this.applyTransforms(geometry, geometryData);

        return geometry;
    }

    makeMeshBuffer() {
        const geom = new BufferGeometry();

        const geometryData = GeometryConverter.convertNodeToGeometryData(this);
        if (!geometryData) return;
        const indices = geometryData.attributes.INDEX;
        const positions = geometryData.attributes.POSITION;

        // Set the positions from the props
        geom.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));

        // Set the indices from the props
        geom.setIndex(new BufferAttribute(new Uint16Array(indices), 1));

        this.applyTransforms(geom, geometryData);

        // Compute normals
        geom.computeVertexNormals();

        return geom;
    }

    setOffset(offset: Vector3) {
        this.offset = offset;
    }
}

