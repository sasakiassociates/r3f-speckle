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
    Stack as Icon45
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
    </div>;
});
