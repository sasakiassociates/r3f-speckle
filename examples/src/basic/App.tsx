import { observer } from 'mobx-react-lite';
import './App.scss';
import { useEffect, useRef } from "react";
import { mainStore } from "../core/MainStore.ts";
import { useControls } from 'leva';
import { MapControls, Toolbar } from "./Toolbar.tsx";
import { Viewer } from "@strategies/r3f-speckle/r3f";

export type AppProps = {};

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
                setTimeout(() => {
                    mapControls.current.setView('45')
                }, 100)
            })();
        }
    }, []);

    useEffect(() => {
        mapControls.current.useSimplifiedPanning = simplifiedPanning;
    }, [simplifiedPanning]);

    useEffect(() => {
        mainStore.appearanceStore.setOpacity(opacity)
    }, [opacity]);

    useEffect(() => {
        mainStore.appearanceStore.setFlatMaterials(flat)
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
        {!(mainStore.isConnecting || mainStore.connectedToStream) && <div>
            <p>
                <a href={generateUrlWithParams('25a13f78fa', '9d3ee826aa4e567d504e2ba0a0a075d5')}>Simple Example
                    stream</a>
            </p>
            <p>
                <a href={generateUrlWithParams('25a13f78fa', 'd447a9eabc12cf6ac8603a5c8685491e')}>Yumana Example
                    stream</a>
            </p>
        </div>}

        {mainStore.connectedToStream &&
            <div>
                <Viewer
                    cameraController={mapControls.current}
                />
                <Toolbar mapControls={mapControls.current}/>
            </div>
        }
    </div>;
};

export default observer(App);
