import { CameraControls, OrbitControls } from '@react-three/drei';
import { PlanViewOrbitControls } from './PlanViewOrbitControls.tsx';
import { Vector3 } from 'three';
import { useControls } from 'leva';
import { speckleStore, NodeDataWrapper } from '../speckle';
import { LineBuffer } from './LineBuffer';
import BaseImage, { type BaseImageProps } from './BaseImage';
import { useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Html } from '@react-three/drei';
import { cullSpaces } from '../utils';
import { toJS } from 'mobx';

import './SpeckleScene.scss';

const colorGeometry = (geometry: NodeDataWrapper) => {
    const { visualizerStore } = speckleStore;
    if (!visualizerStore) return '#ffffff';

    let id = visualizerStore.getId(geometry);

    return visualizerStore.colorById[id] || '#ffffff';
};

const nameGeometry = (geometry: NodeDataWrapper) => {
    const { visualizerStore } = speckleStore;
    if (!visualizerStore) return '-';
    let id = visualizerStore.getId(geometry);
    return visualizerStore.nameById[id] || '';
};

//TODO REFACTOR can't have activeFloorId in generic r3f
//pass baseImage: {url, rect} instead

type SceneProps = {
    planViewMode?: boolean,
    baseImages?: BaseImageProps[]
};

function Scene(props: SceneProps) {
    const { baseImages, planViewMode } = props;

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
                <OrbitControls enableRotate={false}/>
            }
            {displayMeshes &&
                speckleStore.includedMeshes.map(geometry => {
                    geometry.meshGeometry?.computeBoundingBox();
                    const center = new Vector3();
                    geometry.meshGeometry?.boundingBox?.getCenter(center);
                    return (
                        <mesh
                            key={geometry.id}
                            geometry={geometry.meshGeometry}
                            castShadow
                            receiveShadow={selfShading}
                        >
                            {/* filled COLOR */}
                            <meshStandardMaterial color={colorGeometry(geometry)}/>
                            {/* each unit's name appears as a label*/}
                            {nameGeometry(geometry) && (
                                <Html key={`label-${geometry.id}`} position={center}>
                                    {/* Remove the spaces in the string, or the line will break */}
                                    <span className={'unit-tag'}>
                                        {cullSpaces(nameGeometry(geometry))}
                                    </span>
                                </Html>
                            )}
                        </mesh>
                    );
                })}
            {displayLines &&
                speckleStore.includedLines.map(geometry => {
                    return <LineBuffer key={geometry.id} bufferGeometry={geometry.lineGeometry}/>;
                })}
            {displayBase && baseImages && baseImages.map(b => <BaseImage {...b}/>)}
        </>
    );
}

export default observer(Scene);
