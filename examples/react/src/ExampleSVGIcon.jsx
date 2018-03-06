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
        <div className={styles.icons}>
            <svg className={styles.icon} viewBox={codeIcon.viewBox} title={codeIcon.title} role="img">
                <use xlinkHref={codeIcon.symbol} />
            </svg>
            <svg className={styles.icon} viewBox={tailIcon.viewBox} role="presentation">
                <use xlinkHref={tailIcon.symbol} />
            </svg>
        </div>
    </div>
);

export default ExampleSVGIcon;
