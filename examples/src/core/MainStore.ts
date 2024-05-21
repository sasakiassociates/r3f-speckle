import { computed, makeObservable, observable, runInAction } from "mobx";
import { BasicVisualizerStore } from "./BasicVisualizerStore.ts";
import { BasicSpeckleLoader } from "./BasicSpeckleLoader.ts";
import { BasicDataManager } from "./BasicDataManager.ts";
import type { SpeckleDataManager } from "./SpeckleDataManager.ts";

const settings = { server: 'https://sasaki.speckle.xyz' };

export class MainStore {
    @observable
    connectedToStream = false;

    @observable
    isConnecting = false;

    @observable
    connectionError = '';

    @observable
    isReady = false;

    visualizerStore: BasicVisualizerStore;
    speckleLoader: BasicSpeckleLoader;
    dataManager: SpeckleDataManager;
    private server?: string;

    constructor() {
        makeObservable(this);
        this.dataManager = new BasicDataManager(this);
        this.visualizerStore = new BasicVisualizerStore()
        this.speckleLoader = new BasicSpeckleLoader(this.dataManager, this.visualizerStore);
        this.speckleLoader.on('progress', progress => {
            // progressCallback(progress.progress);
        });
    }

    loadFromUrlParams() {
        const { urlParams } = this;
        this.server = urlParams.get('server') || settings.server;
        const streamId = urlParams.get('streamId');
        const commitObjectId = urlParams.get('commitObjectId');

        if (!streamId || !commitObjectId) return;
        this.connectSpeckle(this.server, streamId, commitObjectId);
    }

    @computed
    get urlParams() {
        const queryString = window.location.search;
        return new URLSearchParams(queryString);
    }

    async connectSpeckle(server: string, streamId: string, commitObjectId: string) {
        const { urlParams } = this;

        const authToken = urlParams.get('AuthToken') || localStorage.getItem('AuthToken');

        if (!authToken) {
            runInAction(()=> this.connectionError = 'No AuthToken provided, see https://www.notion.so/sasaki-associates/Speckle-AuthToken-for-Magpie-Web-d3e224b70e6040dd99791d0781791734?pvs=4')
            return;
        }
        if (streamId && authToken && commitObjectId) {
            runInAction(() => this.isConnecting = true);

            await this.speckleLoader.construct(server, authToken, streamId, commitObjectId);

            runInAction(() => {
                this.isConnecting = false
                this.connectedToStream = true
                this.isReady = true
            });


            // dataManager.connectLocal(mainStore, 'option1');
            // dataManager.connectSpeckle(mainStore, server, streamName, +commitOffset);
            //
            // mainStore.actionHooks.reload = ()=> {
            //     dataManager.connectSpeckle(mainStore, server, streamName, +commitOffset);
            // }
// console.log('authToken got', authToken);
        }
    }
}

export const mainStore = new MainStore();
