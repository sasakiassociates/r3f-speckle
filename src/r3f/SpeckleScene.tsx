import { CameraControls, OrbitControls } from '@react-three/drei';
import { PlanViewOrbitControls } from './PlanViewOrbitControls.tsx';
import type { Material } from 'three';
import { useControls } from 'leva';
import { speckleStore, NodeDataWrapper } from '../speckle';
import { LineBuffer } from './LineBuffer';
import BaseImage, { type BaseImageProps } from './BaseImage';
import { observer } from 'mobx-react-lite';
import { cullSpaces } from '../utils';
import { useRef } from "react";

import './SpeckleScene.scss';
import { type MaterialAttributes, MeshView } from "./MeshView.tsx";

const getMaterialAttributes = (geometry: NodeDataWrapper): MaterialAttributes => {
    const { visualizerStore } = speckleStore;
    if (!visualizerStore) return { color: '#ffffff' };

    let id = visualizerStore.getId(geometry);

    let colorState = visualizerStore.colorById[id];

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

type SceneProps = {
    planViewMode?: boolean,
    baseImages?: BaseImageProps[]
};

function Scene(props: SceneProps) {
    const { baseImages, planViewMode } = props;

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

    return (
        <>
            <ambientLight color={'#999'}/>
            <directionalLight position={lightPosition} intensity={lightIntensity}/>
            {planViewMode ?
                <PlanViewOrbitControls/> :
                <OrbitControls enableRotate={true}/>
            }
            {displayMeshes &&
                speckleStore.includedMeshes.map(geometry =>
                    <MeshView
                        key={geometry.id}
                        geometryWrapper={geometry}
                        materialAttributes={getMaterialAttributes(geometry)}
                        materialCache={materialCache.current}
                        castShadow
                        receiveShadow={selfShading}
                        label={nameGeometry(geometry)}
                    />
                )}
            {displayLines &&
                speckleStore.includedLines.map(geometry => {
                    return <LineBuffer key={geometry.id} bufferGeometry={geometry.lineGeometry}/>;
                })}
            {displayBase && baseImages && baseImages.map(b => <BaseImage {...b}/>)}
        </>
    );
}

export default observer(Scene);
