import React, { memo } from 'react';
import { hot } from 'react-hot-loader';

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

export default hot(module)(memo(App));
