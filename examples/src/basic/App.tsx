import { observer } from 'mobx-react-lite';
import './App.scss';
import { useEffect, useRef } from "react";
import { mainStore } from "../core/MainStore.ts";
import { Viewer } from "@strategies/r3f-speckle/r3f";
import type { ViewerZoomEvents, ViewModeEvents } from "@strategies/r3f-speckle/r3f";
import { useControls } from 'leva';
import { CameraStore } from "@strategies/r3f-speckle/store";
import { IconButton } from "@strategies/ui";
import {
    FileMagnifyingGlass as ZoomExtentsIcon,
    ListMagnifyingGlass as ZoomSelectedIcon,
    MagnifyingGlassPlus as ZoomInIcon,
    MagnifyingGlassMinus as ZoomOutIcon,
    Eye as PerspectiveIcon,
    CodesandboxLogo as OrthoIcon,
    BoundingBox as PlanIcon,
    Rows as SideIcon,
    Stack as Icon45,
} from "@phosphor-icons/react";
import { EventEmitter } from "@strategies/react-events";
import { action, computed, makeObservable, observable } from "mobx";

export type AppProps = {};

class MapControls extends EventEmitter<ViewerZoomEvents & ViewModeEvents> {
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
        this.recenter();
    }

    recenter() {
        setTimeout(() => {
            this.emit('zoomExtents');
        }, 300);
    }
}

const App = (props: AppProps) => {
    const mapControls = useRef(new MapControls());

    const { flat, opacity, simplifiedPanning } = useControls({
        opacity: { value: 50, min: 0, max: 100, step: 5 },
        flat: true,
        simplifiedPanning: false
    });

    useEffect(() => {
        if (!mainStore.isConnecting) {
            (async () => {
                await mainStore.loadFromUrlParams();
                setTimeout(()=> {
                    mapControls.current.zoomExtents()
                }, 100)
            })();
        }
    }, []);

    useEffect(() => {
        mapControls.current.useSimplifiedPanning = simplifiedPanning;
    }, [simplifiedPanning]);

    useEffect(() => {
        mainStore.visualizerStore.setOpacity(opacity)
    }, [opacity]);

    useEffect(() => {
        mainStore.visualizerStore.setFlatMaterials(flat)
    }, [flat]);

    const location = window.location;

    const generateUrlWithParams = (streamId: string, commitObjectId: string) => {
        const searchParams = new URLSearchParams(location.search);

        searchParams.set('streamId', streamId);
        searchParams.set('commitObjectId', commitObjectId);

        return `${location.pathname}?${searchParams.toString()}`;
    };
    return <div>
        <h1>Basic example</h1>
        <p>A bare-bones example showing how to load a speckle stream and connect it to the 3D viewer. This does not rely
            on Rhino/GH/Magpie and is therefore intended to show Speckle + R3F connector very generally.</p>

        {mainStore.connectionError && <div className={'error-message'}>{mainStore.connectionError}</div>}
        {!(mainStore.isConnecting || mainStore.connectedToStream) &&
            <a href={generateUrlWithParams('25a13f78fa', '9d3ee826aa4e567d504e2ba0a0a075d5')}>Example stream</a>}

        {mainStore.connectedToStream &&
            <div>
                <Viewer
                    cameraController={mapControls.current}
                    baseImages={[
                        // { imageUrl: baseImgUrl, rectangle: baseImgRect }
                    ]}/>
                <div className={'toolbar'}>
                    <IconButton onClick={() => mapControls.current.zoomExtents()}>
                        <ZoomExtentsIcon/>
                    </IconButton>
                    <IconButton onClick={() => mapControls.current.zoomToSelected()}>
                        <ZoomSelectedIcon/>
                    </IconButton>
                    <IconButton onClick={() => mapControls.current.zoomIn()}>
                        <ZoomInIcon/>
                    </IconButton>
                    <IconButton onClick={() => mapControls.current.zoomOut()}>
                        <ZoomOutIcon/>
                    </IconButton>
                    <IconButton className={mapControls.current.orthoMode ? 'selected' : ''} onClick={() => mapControls.current.setOrtho()}>
                        <OrthoIcon/>
                    </IconButton>
                    <IconButton className={mapControls.current.orthoMode ? '' : 'selected'} onClick={() => mapControls.current.setPerspective()}>
                        <PerspectiveIcon/>
                    </IconButton>
                    <IconButton onClick={() => mapControls.current.setView('45')}>
                        <Icon45/>
                    </IconButton>
                    <IconButton onClick={() => mapControls.current.setView('top')}>
                        <PlanIcon/>
                    </IconButton>
                    <IconButton onClick={() => mapControls.current.setView('side')}>
                        <SideIcon/>
                    </IconButton>
                </div>
            </div>
        }
    </div>;
};

export default observer(App);
