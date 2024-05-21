import { NodeDataWrapper, VisualizerStore } from "@strategies/r3f-speckle/index.ts";
import { action, computed, makeObservable, observable, override } from "mobx";

export class BasicVisualizerStore extends VisualizerStore {
    @observable
    currentIndex: number = 0;

    @observable
    opacity: number = 0.25;

    @observable
    flatMaterials: boolean = false;

    @observable
    materialNamesByElementId: { [key: string]: string; } = {}

    @observable
    selectedNodeIds: string[] = [];

    constructor() {
        super();
        makeObservable(this);
    }

    @action
    selectNode(nodeId: string, select = true) {
        const selIdx = this.selectedNodeIds.indexOf(nodeId);
        if (select) {
            if (selIdx < 0) this.selectedNodeIds.push(nodeId);
        } else {
            if (selIdx >= 0) this.selectedNodeIds.splice(selIdx, 1);
        }
    }

    @action
    toggleSelectOnNode(nodeId:string) {
        const selIdx = this.selectedNodeIds.indexOf(nodeId);
        this.selectNode(nodeId, selIdx < 0)
    }

    @action
    setOpacity(opacity: number) {
        this.opacity = opacity;
    }

    @action
    setFlatMaterials(flatMaterials: boolean) {
        this.flatMaterials = flatMaterials;
    }

    @action
    setMaterialName(id: string, name: string) {
        this.materialNamesByElementId[id] = name;
    }

    override getId(n: NodeDataWrapper) {
        return n.metadata && n.metadata.id;
    }

    protected override initSpeckleStore() {

    }

    override includeNode(n: NodeDataWrapper) {
        return true;
    }

    override nodeIsSelected(n: NodeDataWrapper) {
        const id = this.getId(n);
        if (!id) return false;
        return this.selectedNodeIds.indexOf(id) >= 0;
    }

    @override
    get colorById(): { [id: string]: { color: string, opacity: number } } {
        const ans: { [id: string]: { color: string, opacity: number, flat?: boolean } } = {};
        for (let id in this.materialNamesByElementId) {
            ans[id] = this.color(this.materialNamesByElementId[id])
        }
        return ans;
    }

    @override
    get nameById(): { [id: string]: string } {
        const ans: { [id: string]: string } = {};
        for (let id in this.materialNamesByElementId) {
            ans[id] = this.materialNamesByElementId[id]
            if (this.selectedNodeIds.indexOf(id) >= 0) {
                ans[id] += '*'
            }
        }
        return ans;
    }

    private color(name: string) {
        if (name.startsWith('Pinkish')) {
            return { color: "#dc69d2", opacity: (this.opacity / 100), flat: this.flatMaterials };
        }
        if (name.startsWith('Bluish')) {
            return { color: "#238bb8", opacity: (this.opacity / 100), flat: this.flatMaterials };
        }
        return { color: "#d8c362", opacity: 1 };
    }
}
