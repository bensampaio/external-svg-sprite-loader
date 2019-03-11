import React, { memo } from 'react';
import { array } from 'prop-types';

import styles from './SvgExample.css';

/**
 * @returns {ReactElement}
 */
const SvgExample = ({ list }) => (
    <div>
        <p>These are SVG icons rendered via SVG</p>
        <ul className={styles.icons}>
            {list.map((icon, index) => (
                <li key={index}>
                    <svg viewBox={icon.viewBox} title={icon.title} role="img">
                        <use xlinkHref={icon.symbol} />
                    </svg>
                </li>
            ))}
        </ul>
    </div>
);

SvgExample.propTypes = {
    list: array.isRequired,
};

export default memo(SvgExample);
