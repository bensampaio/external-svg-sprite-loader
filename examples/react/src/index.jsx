import React from 'react';
import ReactDom from 'react-dom';

import ExampleCSSIcon from './ExampleCSSIcon.jsx';
import ExampleSVGIcon from './ExampleSVGIcon.jsx';

ReactDom.render(
    <div>
        <ExampleCSSIcon />
        <ExampleSVGIcon />
    </div>,
    document.getElementById('root')
);
