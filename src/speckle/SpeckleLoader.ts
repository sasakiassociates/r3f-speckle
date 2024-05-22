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

    useLocalStorageBackup = true;

    protected constructor(useLocalStorageBackup = true) {
        super();
        this.useLocalStorageBackup = useLocalStorageBackup;
    }

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

        const localStorageKey = `speckle-data-${streamId}-${objectId}`;

        //@ts-expect-error - error is a property of the object
        if (commitObj?.error || !commitObj) {
            if (this.useLocalStorageBackup) {
                console.error('❌*speckle* Error getting and constructing', commitObj);
                console.log('attempting to load from local storage...');

                const storedData = localStorage.getItem(localStorageKey);
                if (storedData) {
                    const decompressed = LZString.decompress(storedData);
                    const parsedCommitObj = JSON.parse(decompressed);
                    console.log('✅*speckle* got and constructed from local storage', parsedCommitObj);
                    this.processSpeckleData(parsedCommitObj);
                }

                return;
            }
            //@ts-expect-error - error is a property of the object
            throw new Error(`SpeckleLoader error in construct: ${commitObj?.error}`)

        }

        console.log('✅*speckle* got and constructed', commitObj);

        if (this.useLocalStorageBackup) {
            // store the data in local storage
            try {
                const dataString = JSON.stringify(commitObj);
                const compressed = LZString.compress(dataString);
                localStorage.setItem(localStorageKey, compressed);

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
        }

        // data from speckle.
        const c = commitObj as any;

        if (c) {
            this.processSpeckleData(c);
        } else {
            console.warn('⚠️*speckle* No data from speckle', c);
        }
    }

    protected processSpeckleData(c: any) {}
}
