import { observer } from 'mobx-react-lite';
import './App.scss';
import { useEffect, useRef } from "react";
import { mainStore } from "../core/MainStore.ts";
import { useControls } from 'leva';
import { MapControls, Toolbar } from "./Toolbar.tsx";
import { Viewer } from "@strategies/r3f-speckle/r3f";
import BasicOverlay from "./BasicOverlay.tsx";

export type AppProps = {};

const streamOptions: { name: string, streamId: string, commitObjectId: string, magpie?: boolean }[] = [

    { name: 'Simple Rhino named objects stream', streamId: 'fe5fd4f37c', commitObjectId: '127bbf253d7aa72e1d3c4425ebd2b168' },
    { name: 'Simple Blender stream', streamId: '25a13f78fa', commitObjectId: '5679176eb6a4057f42553de135911fd6' },
    { name: 'Yumana Blender stream', streamId: '25a13f78fa', commitObjectId: 'd447a9eabc12cf6ac8603a5c8685491e' },
    {
        name: 'SLP Magpie stream',
        streamId: '2a7f62dd54',
        commitObjectId: '158d6ad2474520a3003fae9aaf689c98',
        magpie: true
    },
    {
        name: 'SLP Magpie lite',
        streamId: 'ee8f2a416d',
        commitObjectId: '66991266e6bb10638518abdcdced09c6',
        magpie: true
    },
];

const App = (props: AppProps) => {
    const mapControls = useRef(new MapControls());

    const { flat, opacity, emissiveIntensity, simplifiedPanning } = useControls({
        opacity: { value: 50, min: 0, max: 100, step: 5 },
        emissiveIntensity: { value: 50, min: 0, max: 200, step: 5 },
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
        mainStore.appearanceStore.setEmissiveIntensity(emissiveIntensity)
    }, [emissiveIntensity]);

    useEffect(() => {
        mainStore.appearanceStore.setFlatMaterials(flat)
    }, [flat]);

    const location = window.location;

    const generateUrlWithParams = (streamId: string, commitObjectId: string, magpie?: boolean) => {
        const searchParams = new URLSearchParams(location.search);

        searchParams.set('streamId', streamId);
        searchParams.set('commitObjectId', commitObjectId);
        if (magpie) {
            searchParams.set('magpie', 'true');
        }

        return `${location.pathname}?${searchParams.toString()}`;
    };
    return <div>
        <h1>Basic example</h1>
        <p>Example showing how to load a speckle stream and connect it to the 3D viewer. This may not rely
            on Rhino/GH/Magpie and is therefore intended to show Speckle + R3F connector very generally.</p>

        {mainStore.connectionError && <div className={'error-message'}>{mainStore.connectionError}</div>}
        {!(mainStore.isConnecting || mainStore.connectedToStream) && <div>
            {streamOptions.map(p =>
                <p key={p.name}>
                    <a href={generateUrlWithParams(p.streamId, p.commitObjectId, p.magpie)}>{p.name}</a>
                </p>
            )}
        </div>}

        {mainStore.connectedToStream &&
            <div>
                <Viewer
                    cameraController={mapControls.current}>
                    <BasicOverlay/>
                </Viewer>
                <Toolbar mapControls={mapControls.current}/>
            </div>
        }
    </div>;
};

export default observer(App);
