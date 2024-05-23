import { observer } from 'mobx-react-lite';
import './App.scss';
import { useEffect, useRef } from "react";
import { mainStore } from "../core/MainStore.ts";
import { Viewer, type ViewerZoomEvents, ViewModeEvents } from "@strategies/r3f-speckle/r3f";
import { useControls } from 'leva';
import { CameraStore } from "@strategies/r3f-speckle/store";
import { IconButton } from "@strategies/ui";
import {
    FileMagnifyingGlass as ZoomExtentsIcon,
    ListMagnifyingGlass as ZoomSelectedIcon,
    MagnifyingGlassPlus as ZoomInIcon,
    MagnifyingGlassMinus as ZoomOutIcon,
    Eye as PerspectiveIcon,
    CodesandboxLogo  as OrthoIcon,
} from "@phosphor-icons/react";
import { EventEmitter } from "@strategies/react-events";
import { action, makeObservable, observable } from "mobx";

export type AppProps = {};

const cameraStore = new CameraStore();//TODO figure out how to integrate this with Visualizer

class MapControls extends EventEmitter<ViewerZoomEvents & ViewModeEvents> {
    constructor() {
        super();
        makeObservable(this);
    }

    @observable
    zoomStrength = 2.5

    @observable
    perspectiveMode = true;

    @action
    setOrtho() {
        this.perspectiveMode = false;
        this.emit('setOrtho');//TODO isn't it better to just observe 'perspectiveMode'?
    }

    @action
    setPerspective() {
        this.perspectiveMode = true;
        this.emit('setPerspective')
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
    }
}

const App = (props: AppProps) => {
    const mapControls = useRef(new MapControls());

    const { flat, opacity } = useControls({
        opacity: { value: 50, min: 0, max: 100, step: 5 },
        flat: true
    });

    useEffect(() => {
        if (!mainStore.isConnecting) {
            mainStore.loadFromUrlParams();
        }
    }, []);

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
                    eventEmitter={mapControls.current}
                    planViewMode={false}
                    cameraStore={cameraStore}
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
                    <IconButton onClick={() => mapControls.current.setOrtho()}>
                        <OrthoIcon/>
                    </IconButton>
                    <IconButton onClick={() => mapControls.current.setPerspective()}>
                        <PerspectiveIcon/>
                    </IconButton>
                    <IconButton onClick={() => mapControls.current.setView('45')}>
                        <PerspectiveIcon/>
                    </IconButton>
                </div>
            </div>
        }
    </div>;
};

export default observer(App);
