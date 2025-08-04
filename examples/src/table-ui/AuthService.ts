// AuthService.ts
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { TableUiStore } from "./TableUiStore.ts";

class AuthService {
    // Firebase Auth
    // Sign in with Google
    async signInWithGoogle(): Promise<void> {
        const auth = getAuth();
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                // The signed-in user info.
                const user = result.user;
                console.log(user);
                TableUiStore.Instance.setUserAuth(user, auth);
            }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            console.log(errorCode, errorMessage, email, credential);
        });
    }

    constructor() {
    }

    signOut() {
        if (TableUiStore.Instance.auth) {
            signOut(TableUiStore.Instance.auth)
                .then(() => {
                    TableUiStore.Instance.clearUserAuth();
                }).catch((error) => {
                console.error(error);
            });
        }
    }
}

export const authService = new AuthService();
