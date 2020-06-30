import React from 'react';

import tail from '../../images/complex/tail.svg';

import CssExample from './CssExample.jsx';
import styles from './Complex.css';
import SvgExample from './SvgExample.jsx';

const Complex = () => (
    <>
        <h1>Complex icons</h1>
        <CssExample list={Object.values(styles)} />
        <SvgExample list={[tail]} />
    </>
);

export default Complex;
