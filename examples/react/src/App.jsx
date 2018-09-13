import React, { Fragment } from 'react';
import { hot } from 'react-hot-loader';

import Complex from './Complex.jsx';
import Glypho from './Glypho.jsx';
import Education from './Education.jsx';

const App = () => (
    <Fragment>
        <Complex />
        <Education />
        <Glypho />
    </Fragment>
);

export default hot(module)(App);
