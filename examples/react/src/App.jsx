import React from 'react';
import { hot } from 'react-hot-loader/root';

import Complex from './Complex.jsx';
import Glypho from './Glypho.jsx';
import Education from './Education.jsx';

const App = () => (
    <>
        <Complex />
        <Education />
        <Glypho />
    </>
);

export default process.env.EXAMPLE_HMR ? hot(App) : App;
