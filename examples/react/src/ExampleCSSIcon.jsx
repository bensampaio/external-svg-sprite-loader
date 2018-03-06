import React from 'react';

import styles from './ExampleCSSIcon.css';

/**
 * @returns {ReactElement}
 */
const ExampleCSSIcon = () => (
    <div>
        <h1>Example CSS Icon</h1>
        <p>This is an SVG icon rendered via CSS</p>
        <div className={styles.code} />
        <div className={styles.tail} />
    </div>
);

export default ExampleCSSIcon;
