import React from 'react';
import { array } from 'prop-types';

import styles from './CssExample.css';

/**
 * @returns {ReactElement}
 */
const CssExample = ({ list }) => (
    <div>
        <p>These are SVG icons rendered via CSS</p>
        <ul className={styles.icons}>
            {list.map((style, index) => (
                <li key={index}>
                    <i className={style} />
                </li>
            ))}
        </ul>
    </div>
);

CssExample.propTypes = {
    list: array.isRequired,
};

export default CssExample;
