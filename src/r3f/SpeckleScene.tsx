import type { Material } from 'three';
import { useControls } from 'leva';
import { speckleStore, NodeDataWrapper } from '../speckle';
import { LineBuffer } from './LineBuffer';
import BaseImage, { type BaseImageProps, type Rect } from './BaseImage';
import { observer } from 'mobx-react-lite';
import { cullSpaces, hexStringToNumber } from '../utils';
import { useRef } from "react";
import { EffectComposer, Outline, Select, Selection, Bloom } from "@react-three/postprocessing";
// import { BlendFunction } from "postprocessing";
import { MeshView } from "./MeshView.tsx";
import './SpeckleScene.scss';
import { useZoomControls, type ViewerZoomEvents } from "./hooks/useZoomControls.ts";
import type { EventEmitter } from "@strategies/react-events";
import { type CameraControlSettings, CameraSwitcher, type ViewModeEvents } from "./CameraSwitcher.tsx";
import type { CameraControls } from "@react-three/drei";

type MeshListSelectViewProps = {
    selectIsEnabled: boolean,
    allMeshes: NodeDataWrapper[],
    visibleMeshes: NodeDataWrapper[],
    materialCache: { [key: string]: Material },
    receiveShadow: boolean
};



//NOTE: we use allMeshes and visibleMeshes because it's better to not mount/unmount components for fast updates - so we mount them all, but control visibility
type ColorProps = { color: string, opacity: number, flat?: boolean };

//https://docs.pmnd.rs/react-three-fiber/advanced/pitfalls#don't-mount-indiscriminately
const MeshListSelectView = observer(({
                                         selectIsEnabled,
                                         allMeshes,
                                         visibleMeshes,
                                         materialCache,
                                         receiveShadow,
                                     }: MeshListSelectViewProps) => {
    const { appearanceStore } = speckleStore;
    return <Select enabled={selectIsEnabled}>
        {allMeshes.map(geometry => (
            <MeshView
                onClick={(e) => {
                    // console.log('MESH VIEW ONLCLICK');
                    e.stopPropagation();
                    geometry.events.broadcast('click', { event: e });
                }}
                key={geometry.id}
                geometryWrapper={geometry}
                appearance={appearanceStore!.computeAppearance(geometry)}
                materialCache={materialCache}
                castShadow
                receiveShadow={receiveShadow}
                visible={visibleMeshes.indexOf(geometry) >= 0}
            />
        ))}
    </Select>
});

export type CameraController = EventEmitter<ViewerZoomEvents & ViewModeEvents> & { settings: CameraControlSettings };
type SceneProps = {
    lightIntensity: number,
    cameraController: CameraController
};

function Scene(props: SceneProps) {
    const { cameraController } = props;

    //we get better efficiency if we share materials between meshes
    const materialCache = useRef<{ [key: string]: Material }>({});

    const { lightPosition, lightIntensity } = useControls({
        lightPosition: { value: [3, 5, 2], label: 'vec' },
        lightIntensity: { value: props.lightIntensity, min: 0, max: 10, step: 0.1 },
    });
    const { displayLines, displayBase, selfShading, displayMeshes } = useControls({
        displayMeshes: true,
        displayLines: true,
        displayBase: true,
        selfShading: false,
    });

    const { appearanceStore } = speckleStore;

    const controlsRef = useRef<CameraControls>(null);

    useZoomControls(controlsRef, cameraController, speckleStore.glowMeshes);

    const outlineProperties = appearanceStore!.getOuterGlowValues();
    return (
        <>
            <ambientLight color={'#999'}/>
            <directionalLight position={lightPosition} intensity={lightIntensity}/>
            <CameraSwitcher eventEmitter={cameraController} settings={cameraController.settings} ref={controlsRef}/>
            <Selection>
                <EffectComposer autoClear={false}>
                    <Outline
                        // blendFunction={BlendFunction.ALPHA}
                        {...outlineProperties}
                        blur={true}
                    />
                </EffectComposer>
                <MeshListSelectView
                    selectIsEnabled={true}
                    allMeshes={speckleStore.includedMeshes}
                    visibleMeshes={speckleStore.glowMeshes}
                    materialCache={materialCache.current}
                    receiveShadow={selfShading}
                />
                <MeshListSelectView
                    selectIsEnabled={false}
                    allMeshes={speckleStore.includedMeshes}
                    visibleMeshes={speckleStore.noGlowMeshes}
                    materialCache={materialCache.current}
                    receiveShadow={selfShading}
                />
            </Selection>

            {displayLines &&
                speckleStore.includedLines.map(geometry => {
                    return <LineBuffer key={geometry.id}
                                       appearance={appearanceStore!.computeAppearance(geometry)}
                                       bufferGeometry={geometry.lineGeometry}/>;
                })}
            {displayBase &&
                speckleStore.includedBaseImages.map(wrapper => {
                    const metadata = wrapper.metadata!;
                    const imageUrl: string = metadata.imageUrl;
                    const y: number = metadata.y;
                    const rectangle: Rect = metadata.rectangle;
                    return <BaseImage y={y} key={wrapper.id} imageUrl={imageUrl} rectangle={rectangle}/>;
                })}
        </>
    );
}

export default observer(Scene);
