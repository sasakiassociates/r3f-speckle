import { IconButton } from "@strategies/ui";
import {
    BoundingBox as PlanIcon,
    CodesandboxLogo as OrthoIcon,
    Eye as PerspectiveIcon,
    FileMagnifyingGlass as ZoomExtentsIcon,
    ListMagnifyingGlass as ZoomSelectedIcon,
    MagnifyingGlassMinus as ZoomOutIcon,
    MagnifyingGlassPlus as ZoomInIcon,
    Rows as SideIcon,
    Stack as Icon45,
    FolderOpen as LoadIcon,
    FloppyDisk as SaveIcon

} from "@phosphor-icons/react";
import { EventEmitter } from "@strategies/react-events";
import type { ViewerZoomEvents, ViewModeEvents } from "@strategies/r3f-speckle/r3f";
import { action, computed, makeObservable, observable } from "mobx";
import { observer } from "mobx-react-lite";

export class MapControls extends EventEmitter<ViewerZoomEvents & ViewModeEvents> {
    constructor() {
        super();
        makeObservable(this);
    }

    savedView: {
        orthoMode: boolean,
        viewState?: string;
    } = { orthoMode: false };

    @observable
    orthoMode = false;

    @observable
    useSimplifiedPanning = false;

    @observable
    zoomStrength = 2.5;

    @computed
    get settings() {
        return {
            orthoMode: this.orthoMode,
            useSimplifiedPanning: this.useSimplifiedPanning,
            initialView: localStorage.getItem('mapControls_initial_view') ?? undefined,
        }
    }

    @action
    setOrtho() {
        this.orthoMode = true;
    }

    @action
    setPerspective() {
        this.orthoMode = false;
    }

    zoomExtents() {
        this.emit('zoomExtents');
    }

    zoomToSelected() {
        this.emit('zoomToSelected');
    }

    zoomIn() {
        this.emit('zoomIn', this.zoomStrength);
    }

    zoomOut() {
        this.emit('zoomOut', this.zoomStrength);
    }

    setView(view: 'top' | 'side' | '45') {
        this.emit('setView', view);
        // this.recenter();
    }

    recenter() {
        setTimeout(() => {
            this.emit('zoomExtents');
        }, 300);
    }

    @action
    restoreView() {
        if (!this.savedView.viewState) return;
        this.orthoMode = this.savedView.orthoMode;
        this.emit('restoreView', {viewJson:  this.savedView.viewState, transition: true})
    }

    saveView() {
        this.emit('requestViewState', (viewState) => {
            this.savedView = {
                orthoMode: this.orthoMode,
                viewState
            };
            localStorage.setItem('mapControls_initial_view', viewState);
        })
    }
}

export const Toolbar = observer(({ mapControls }: {
    mapControls: MapControls
}) => {
    return <div className={"toolbar"}>
        <IconButton onClick={() => mapControls.zoomExtents()}>
            <ZoomExtentsIcon/>
        </IconButton>
        <IconButton onClick={() => mapControls.zoomToSelected()}>
            <ZoomSelectedIcon/>
        </IconButton>
        <IconButton onClick={() => mapControls.zoomIn()}>
            <ZoomInIcon/>
        </IconButton>
        <IconButton onClick={() => mapControls.zoomOut()}>
            <ZoomOutIcon/>
        </IconButton>
        <IconButton className={mapControls.orthoMode ? "selected" : ""} onClick={() => mapControls.setOrtho()}>
            <OrthoIcon/>
        </IconButton>
        <IconButton className={mapControls.orthoMode ? "" : "selected"} onClick={() => mapControls.setPerspective()}>
            <PerspectiveIcon/>
        </IconButton>
        <IconButton onClick={() => mapControls.setView('45')}>
            <Icon45/>
        </IconButton>
        <IconButton onClick={() => mapControls.setView('top')}>
            <PlanIcon/>
        </IconButton>
        <IconButton onClick={() => mapControls.setView('side')}>
            <SideIcon/>
        </IconButton>
        <IconButton onClick={() => mapControls.restoreView()}>
            <LoadIcon/>
        </IconButton>
        <IconButton onClick={() => mapControls.saveView()}>
            <SaveIcon/>
        </IconButton>
    </div>;
});
