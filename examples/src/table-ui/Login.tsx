import { useEffect } from "react";
import GoogleButton from 'react-google-button';
import { observer } from "mobx-react-lite";
import { TableUiStore } from "./TableUiStore.ts";
import { authService } from "./AuthService.ts";

const Login = observer(() => {
    const user = TableUiStore.Instance.user;

    // Redirect to dashboard if user is signed in (observes MainStore)
    useEffect(() => {
        if (user !== null) {
            TableUiStore.Instance.initFirebase();
        }
    }, [user]);

    const handleSignIn = async () => {
        try {
            await authService.signInWithGoogle();
        } catch (error) {
            console.error(error);
        }
    };

    if (TableUiStore.Instance.isAuthenticated) return <div style={{background: 'white', padding: 10, position: 'fixed', top: 100, left: 100, zIndex:2 , pointerEvents: 'all'}}>
        <p>TableUI</p>
        <div style={{ opacity: 0.8 }}>
            HELLO
            <svg width={800} height={450}>
                {TableUiStore.Instance.activeMarkers.map((m:any) => <g transform={`translate(${m.x},${m.y}) rotate(${m.rotation})`}>
                    <rect width={20} height={10}/>
                </g>)}
            </svg>
        </div>

    </div>;

    return (
        <div style={{background: 'white', padding: 10, position: 'fixed', top: 100, left: 100, zIndex:2 , pointerEvents: 'all'}}>
            <p>Sign in to connect to TableUI</p>
            <GoogleButton onClick={handleSignIn}/>
        </div>
    );
});

export default Login;
