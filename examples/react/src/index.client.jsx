import React, { StrictMode } from 'react';
import { render } from 'react-dom';

import App from './App.jsx';

render(
    <StrictMode>
        <App />
    </StrictMode>,
    document.getElementById('root')
);
