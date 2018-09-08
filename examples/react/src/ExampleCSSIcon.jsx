import React from 'react';

import styles from './ExampleCSSIcon.css';

/**
 * @returns {ReactElement}
 */
const ExampleCSSIcon = () => (
    <div>
        <h1>Example CSS Icon</h1>
        <p>This is an SVG icon rendered via CSS</p>

        <ul className={styles.icons}>
            <li>
                <i className={styles.code} />
            </li>
            <li>
                <i className={styles.tail} />
            </li>
        </ul>
    </div>
);

export default ExampleCSSIcon;
