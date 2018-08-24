import React from 'react';

import codeIcon from '../../images/code.svg';
import tailIcon from '../../images/tail.svg';
import styles from './ExampleSVGIcon.css';

/**
 * @returns {ReactElement}
 */
const ExampleSVGIcon = () => (
    <div>
        <h1>Example SVG Icon</h1>
        <p>This is an SVG icon rendered via SVG</p>
        <ul className={styles.icons}>
            <li>
                <svg viewBox={codeIcon.viewBox} title={codeIcon.title} role="img">
                    <use xlinkHref={codeIcon.symbol} />
                </svg>
            </li>
            <li>
                <svg viewBox={tailIcon.viewBox} role="presentation">
                    <use xlinkHref={tailIcon.symbol} />
                </svg>
            </li>
        </ul>
    </div>
);

export default ExampleSVGIcon;
