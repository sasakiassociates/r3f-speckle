import { observer } from 'mobx-react-lite';
import './App.scss';
import { useEffect } from "react";
import { mainStore } from "../core/MainStore.ts";
import { Viewer } from "@strategies/r3f-speckle/r3f";
import { useControls } from 'leva';
import { CameraStore } from "@strategies/r3f-speckle/store";

export type AppProps = {
};

const cameraStore = new CameraStore();//TODO figure out how to integrate this with Visualizer

const App = (props:AppProps) => {
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

    const generateUrlWithParams = (streamId:string, commitObjectId:string) => {
        const searchParams = new URLSearchParams(location.search);

        searchParams.set('streamId', streamId);
        searchParams.set('commitObjectId', commitObjectId);

        return `${location.pathname}?${searchParams.toString()}`;
    };
    return <div>
        <h1>Basic example</h1>
        <p>A bare-bones example showing how to load a speckle stream and connect it to the 3D viewer. This does not rely on Rhino/GH/Magpie and is therefore intended to show Speckle + R3F connector very generally.</p>

        {mainStore.connectionError && <div className={'error-message'}>{mainStore.connectionError}</div>}
        {!mainStore.isConnecting && <a href={generateUrlWithParams('25a13f78fa', 'd5f07c82ad5d55ce54d4f8c0193d4f85')}>Example stream</a>}

        <div>
            <Viewer
                planViewMode={false}
                cameraStore={cameraStore}
                baseImages={[
                    // { imageUrl: baseImgUrl, rectangle: baseImgRect }
                ]}/>

        </div>
    </div>;
};

export default observer(App);