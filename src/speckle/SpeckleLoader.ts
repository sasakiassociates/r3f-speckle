import ObjectLoader from '@speckle/objectloader';
import { EventEmitter } from '@strategies/react-events';
import LZString from 'lz-string';
import type { NodeDataWrapper } from './NodeDataWrapper';

type Item = {
    [key: string]: NodeDataWrapper;
};

type EventArgs = {
    progress: { stage: string; progress: number };
};

export abstract class SpeckleLoader extends EventEmitter<EventArgs> {
    data: { [key: string]: Item[] } = {};
    // psuedoCode() {
    //     //somewhere we're also creating the data for a program chunk...
    //     //where does the line exist between what happens in the Visualizer
    //     //and what is specific to the application stores?
    //
    //     //does the ViewerState for a Speckle Visualizer item just contain
    //     //the mesh and line references to a NodeWrapper in the "viewerSpecific" data?
    //     //this seems more in line with how we can normalize the same treatment for different
    //     //visualizers, but take advantage of how Speckle combines metadata with geometry.
    //
    //     //somewhere we need to inject assumptions about how to represent each ViewerState item
    //     //e.g. how do we handle "highlighting" as it relates to the mesh and the outline.
    //
    //     //currently we're using viewerStates.type of 'line' or 'mesh' to control what shows up, but it means
    //     //keeping track of multiple different 3D elements when it should probably be simplified to a single
    //     //element and then some stylistic choices about whether to show outlines or not...?
    //
    //     //we don't actually have to use a Visualizer SpeckleViewer here - we could just use a custom
    //     //Speckle R3F viewer as its almost certain to be viewed primarily in Speckle as 3D
    //     //but it does seem smart to keep to the Visualizer abstraction just in case we want to
    //     //e.g. connect it to a Colorizer viewer built from the same model - we might want to 'hot swap' the
    //     //Colorizer 2D rendering with the SpeckleViewer - even if we're getting the data from Speckle
    //     //we'd just want to
    //     const { data } = this;
    //     //pseudocode of how this might look on the MagpieWeb side
    //
    //     for (let item of data['ProgramChunks']) {
    //
    //         sceneStore.addProgramChunk(item['ProgramGeometry'], item['ProgramOutlines']);
    //     }
    //
    //     for (let item of data['Parcels']) {
    //         speckleStore.addParcel(item['ParcelGeometry']);
    //     }
    //
    //     //if Node doesn't contain Items, then it's a singular element - but we should probably allow arrays for base images at least
    //     for (let baseImage:NodeDataWrapper of data['BaseImage']) {
    //         speckleStore.addBaseImage(baseImage);
    //     }
    //
    // }
    protected loader?: ObjectLoader;
    protected streamId: string = '';
    async construct(serverUrl: string, token: string, streamId: string, objectId: string) {
        console.log('✅*speckle* constructing speckle loader', {
            serverUrl,
            token,
            streamId,
            objectId,
        });

        this.streamId = streamId;
        this.loader = new ObjectLoader({
            serverUrl,
            token,
            streamId,
            objectId,
            options: {
                enableCaching: false, //has to be false because of this bug: https://github.com/specklesystems/speckle-server/issues/1973
                excludeProps: [],
            },
        });

        let commitObj;

        try {
            // if the request is denied by speckle, getAndConstructObject will throw an err and break
            [commitObj] = await Promise.all([
                this.loader.getAndConstructObject(e => {
                    this.emit('progress', { stage: e.stage, progress: e.current / e.total });
                }),
            ]);
        } catch (e) {
            console.warn('failed to get and construct: ', e);
        }

        const LOCALSTORAGE_KEY = `speckle-data-${streamId}-${objectId}`;

        //@ts-expect-error - error is a property of the object
        if (commitObj?.error || !commitObj) {
            console.error('❌*speckle* Error getting and constructing', commitObj);
            console.log('❌*speckle* failed to get and construct', commitObj);

            const storedData = localStorage.getItem(LOCALSTORAGE_KEY);
            if (storedData) {
                const decompressed = LZString.decompress(storedData);
                const parsedCommitObj = JSON.parse(decompressed);
                console.log('✅*speckle* got and constructed from local storage', parsedCommitObj);
                this.processSpeckleData(parsedCommitObj);
            }

            return;
        }

        console.log('✅*speckle* got and constructed', commitObj);

        // store the data in local storage
        try {
            const dataString = JSON.stringify(commitObj);
            const compressed = LZString.compress(dataString);
            localStorage.setItem(LOCALSTORAGE_KEY, compressed);

            //#region test lz-string and implementation: decompress and parse the data
            const decompressed = LZString.decompress(compressed);
            const parsedCommitObj = JSON.parse(decompressed);
            if (JSON.stringify(parsedCommitObj) !== JSON.stringify(commitObj))
                console.error(
                    '❌*speckle* decompressed and parsed data does not match original data',
                    parsedCommitObj,
                    commitObj
                );
            //#endregion end test

            console.log('✅*speckle* stored compressed data', compressed.length, dataString.length);
        } catch (e) {
            console.error('failed to compress and store', e);
        }

        // data from speckle.
        const c = commitObj as any;

        if (c) {
            this.processSpeckleData(c);
        } else {
            console.warn('⚠️*speckle* No data from speckle', c);
        }

        // const elems = [parcel.displayValue, chunk];
        // for (let el of elems) {
        //     const nodeDataWrapper = new NodeDataWrapper(el);
        //     nodeDataWrapper.asThreeGeometry();
        //     const geometryData = GeometryConverter.convertNodeToGeometryData(nodeDataWrapper)
        //     console.log(geometryData);
        // }
    }

    protected processSpeckleData(c: any) {}
}
