import type { Material } from 'three';
import { useControls } from 'leva';
import { speckleStore, NodeDataWrapper } from '../speckle';
import { LineBuffer } from './LineBuffer';
import BaseImage, { type BaseImageProps, type Rect } from './BaseImage';
import { observer } from 'mobx-react-lite';
import { cullSpaces } from '../utils';
import { useRef } from "react";
import { EffectComposer, Outline, Select, Selection } from "@react-three/postprocessing";
// import { BlendFunction } from "postprocessing";
import { type MaterialAttributes, MeshView } from "./MeshView.tsx";
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
    colorById: { [id: string]: ColorProps },
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
                                         colorById
                                     }: MeshListSelectViewProps) => {
    const { visualizerStore } = speckleStore;
    return <Select enabled={selectIsEnabled}>
        {allMeshes.map(geometry => (
            <MeshView
                onClick={(e) => {
                    console.log('MESH VIEW ONLCLICK');
                    e.stopPropagation();
                    geometry.events.broadcast('click', { event: e });
                }}
                key={geometry.id}
                geometryWrapper={geometry}
                materialAttributes={getMaterialAttributes(geometry, colorById)}
                materialCache={materialCache}
                castShadow
                receiveShadow={receiveShadow}
                visible={visibleMeshes.indexOf(geometry) >= 0}
                label={nameGeometry(geometry)}
            />
        ))}
    </Select>
});

const getLineMaterialAttributes = (geometry: NodeDataWrapper, colorById: {
    [id: string]: ColorProps
}): MaterialAttributes & {lineWidth:number} => {
    //TODO a lot this is getting pretty use-case specific
    //in the general r3f-speckle viewer we should only be passing
    //material attributes
    //even concepts like "selection" don't belong here
    //although we do need a way to manage the outer glow elements
    //perhaps those could just have a 'glow' attribute?

    let lineWidth = 2;
    const { visualizerStore } = speckleStore;
    if (visualizerStore) {
        if (visualizerStore.nodeIsSelected(geometry)) {
            lineWidth = 4;
        }
    }
    return { ...getMaterialAttributes(geometry, colorById), lineWidth };
}

const getMaterialAttributes = (geometry: NodeDataWrapper, colorById: {
    [id: string]: ColorProps
}): MaterialAttributes => {
    const { visualizerStore } = speckleStore;
    if (!visualizerStore) return { color: '#ffffff' };

    let id = visualizerStore.getId(geometry);

    let colorState = colorById[id];

    if (colorState && colorState.opacity < 1) {
        return {
            ...colorState,
            transparent: true,
        };
    }
    return colorState || { color: '#ffffff' };
}

const nameGeometry = (geometry: NodeDataWrapper) => {
    const { visualizerStore } = speckleStore;
    if (!visualizerStore) return '-';
    let id = visualizerStore.getId(geometry);
    const ans = visualizerStore.nameById[id] || '';
    return cullSpaces(ans);
};

export type CameraController = EventEmitter<ViewerZoomEvents & ViewModeEvents> & { settings: CameraControlSettings };
type SceneProps = {
    cameraController: CameraController
};

function Scene(props: SceneProps) {
    const { cameraController } = props;

    //we get better efficiency if we share materials between meshes
    const materialCache = useRef<{ [key: string]: Material }>({});

    const { lightPosition, lightIntensity } = useControls({
        lightPosition: { value: [3, 5, 2], label: 'vec' },
        lightIntensity: { value: 2, min: 0, max: 10, step: 0.1 },
    });
    const { displayLines, displayBase, selfShading, displayMeshes } = useControls({
        displayMeshes: true,
        displayLines: false,
        displayBase: true,
        selfShading: false,
    });

    const { visualizerStore } = speckleStore;
    let colorById: { [id: string]: ColorProps } = {}
    if (visualizerStore) {
        colorById = visualizerStore.colorById;
    }

    const controlsRef = useRef<CameraControls>(null);

    useZoomControls(controlsRef, cameraController, speckleStore.selectedMeshes);

    return (
        <>
            <ambientLight color={'#999'}/>
            <directionalLight position={lightPosition} intensity={lightIntensity}/>
            <CameraSwitcher eventEmitter={cameraController} settings={cameraController.settings} ref={controlsRef}/>
            <Selection>
                <EffectComposer autoClear={false}>
                    <Outline
                        // blendFunction={BlendFunction.ALPHA}
                        visibleEdgeColor={0x509fc9}
                        hiddenEdgeColor={0x7e86b9}
                        blur={true}
                        edgeStrength={8}/>
                </EffectComposer>
                <MeshListSelectView
                    selectIsEnabled={true}
                    colorById={colorById}
                    allMeshes={speckleStore.includedMeshes}
                    visibleMeshes={speckleStore.selectedMeshes}
                    materialCache={materialCache.current}
                    receiveShadow={selfShading}
                />
                <MeshListSelectView
                    selectIsEnabled={false}
                    colorById={colorById}
                    allMeshes={speckleStore.includedMeshes}
                    visibleMeshes={speckleStore.unselectedMeshes}
                    materialCache={materialCache.current}
                    receiveShadow={selfShading}
                />
            </Selection>

            {displayLines &&
                speckleStore.includedLines.map(geometry => {
                    return <LineBuffer key={geometry.id}
                                       materialAttributes={getLineMaterialAttributes(geometry, colorById)}
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
