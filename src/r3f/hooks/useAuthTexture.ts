import { useEffect, useState } from 'react';
import { TextureLoader, Texture } from 'three';

export function useAuthTexture(imageUrl?: string, token?: string) {
    const [texture, setTexture] = useState<Texture | null>(null);

    useEffect(() => {
        if (!imageUrl) {
            setTexture(null);
            return;
        }

        // If no token, load normally
        if (!token) {
            const loader = new TextureLoader();
            const tex = loader.load(imageUrl, (t) => setTexture(t));
            return () => {
                tex.dispose();
            };
        }

        // Token path
        let objectUrl: string | null = null;
        const loader = new TextureLoader();

        fetch(imageUrl, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
                return res.blob();
            })
            .then((blob) => {
                objectUrl = URL.createObjectURL(blob);
                loader.load(objectUrl, (tex) => setTexture(tex));
            })
            .catch((err) => {
                console.error('Texture load failed:', err);
                setTexture(null);
            });

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [imageUrl, token]);

    return texture;
}
