import React from 'react';
import App from './basic/App';

import { createRoot } from "react-dom/client";

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}
