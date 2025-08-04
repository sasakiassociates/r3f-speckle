import { initializeApp, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, set, child, get, Database, onValue, onChildRemoved } from 'firebase/database';

// TODO: Replace the following with more dynamic configuration
const firebaseConfig = {
  apiKey: "AIzaSyCk1d0e-ScRevqIK7Uhb59g0CiZPHg9wOU",
  authDomain: "magpietable.firebaseapp.com",
  databaseURL: "https://magpietable-default-rtdb.firebaseio.com",
  projectId: "magpietable",
  storageBucket: "magpietable.appspot.com",
  messagingSenderId: "97797397511",
  appId: "1:97797397511:web:3ed538c98364abfb861ea2"
};

export class FirebaseService {
  private app: FirebaseApp;
  private db: Database;

  constructor(firebaseConfig: any) {
    this.app = initializeApp(firebaseConfig);
    this.db = getDatabase(this.app);
  }

  getDatabaseRef(path: string) {
    return ref(this.db, path);
  }

  writeTestData() {
    set(ref(this.db, 'test'), {
      name: 'test'
    });
  }

  writeData(path: string, data: any) {
    set(ref(this.db, path), data);
  }

  addMessage(message: string) {
    set(ref(this.db, 'messages/' + Date.now()), {
      message
    });
  }

  async readDatabase() {
    const snapshot = await get(child(ref(this.db), 'bases'));
    if (snapshot.exists()) {
      console.log(snapshot.val());
    } else {
      console.log("No data available");
    }
  }

  subscribeToNode(path: string, callback: (snapshot: any) => void) {
    const nodeRef = ref(this.db, path);
    onValue(nodeRef, (snapshot) => {
      callback(snapshot);
    });
  }

  // Watch for when an object is deleted from this node
  subscribeForDeletion(path: string, callback: (snapshot: any) => void) {
    const nodeRef = ref(this.db, path);
    onChildRemoved(nodeRef, (snapshot) => {
      callback(snapshot);
    });
  }

  async pullOnce(path: string) {
    const snapshot = await get(child(ref(this.db), path));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return null;
    }
  }
}

export const firebaseService = new FirebaseService(firebaseConfig);