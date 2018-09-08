import { hot } from 'react-hot-loader';
import React from 'react';
import ExampleCSSIcon from './ExampleCSSIcon.jsx';
import ExampleSVGIcon from './ExampleSVGIcon.jsx';

const App = () => (
    <div>
        <ExampleCSSIcon />
        <ExampleSVGIcon />
    </div>
);

export default hot(module)(App);
