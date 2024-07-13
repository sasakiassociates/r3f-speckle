import { AppearanceAttributes, AppearanceStore, NodeDataWrapper } from "@strategies/r3f-speckle/index.ts";
import { action, computed, makeObservable, observable, override } from "mobx";
import type { AppearanceNodeWrapper } from "./AppearanceNodeWrapper.ts";

export class BasicAppearanceStore extends AppearanceStore {
    computeAppearance(n: NodeDataWrapper): AppearanceAttributes {
        const node = n as AppearanceNodeWrapper;
        if (!node) throw 'All NodeDataWrappers must be of type AppearanceNodeWrapper'
        return node.appearance;
    }

    @observable
    currentIndex: number = 0;

    @observable
    opacity: number = 0.25;

    @observable
    flatMaterials: boolean = false;

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
        console.log('toggleSelectOnNode', nodeId, this.selectedNodeIds)
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

    nodeIsSelected(id: string) {
        if (!id) return false;
        return this.selectedNodeIds.indexOf(id) >= 0;
    }
}
