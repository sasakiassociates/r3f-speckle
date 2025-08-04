import { action, computed, makeObservable, observable } from 'mobx';
import { firebaseService } from "./FirebaseService.ts";
import type { User, Auth } from 'firebase/auth';

type Marker = {
    "id": number,
    "is_deleted": boolean,
    "rotation": number,
    "x": number,
    "y": number
}

export class TableUiStore {
    private static _instance: TableUiStore;

    public static get Instance() {
        if (!TableUiStore._instance) {
            TableUiStore._instance = new TableUiStore();
        }
        return TableUiStore._instance;
    }

    @observable
    public markers: Record<string, Marker> | null = null;
    @observable
    public user: User | null = null;
    @observable
    public auth: Auth | null = null;

    constructor() {
        makeObservable(this);
    }

    public initFirebase() {
        // Watch the database for changes to the detector state and change it locally when it does
        firebaseService.subscribeToNode('bases/test_proj/flags/detector_state', (snapshot) => {
            if (snapshot.exists()) {
                //this.setState(snapshot.val());
            }
        });

        firebaseService.subscribeToNode('bases/test_proj/marker', (snapshot) => {
            if (snapshot.exists()) {
                this.setMarkers(snapshot.val());
            } else {
                this.setMarkers([]);
            }
        });

    }

    @action
    public setUserAuth = (user: User, auth: Auth) => {
        this.user = user;
        this.auth = auth;
    }
    @action
    public clearUserAuth = () => {
        this.user = null;
        this.auth = null;
    }

    @action
    setMarkers = (markers: any) => {
        this.markers = markers;
    }

    @computed
    get isAuthenticated() {
        return !!this.user;
    }

    @computed
    get activeMarkers(): Marker[] {
        if (!this.markers) return [];
        return Object.values(this.markers).filter((m: any) => !m.is_deleted);
    }
}
