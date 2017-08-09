import React, { Component } from 'react';

import codeIcon from '../../images/code.svg';
import tailIcon from '../../images/tail.svg';
import styles from './ExampleSVGIcon.css';

/**
 * @class ExampleSVGIcon
 */
export default class ExampleSVGIcon extends Component {

    /**
     * Renders the SVG Icon example.
     * @returns {XML}
     */
    render() {
        return (
            <div>
                <h1>Example SVG Icon</h1>
                <p>This is an SVG icon rendered via SVG</p>
                <div className={styles.icons}>
                    <svg className={styles.icon} viewBox={codeIcon.viewBox} title={codeIcon.title}>
                        <use xlinkHref={codeIcon.symbol} />
                    </svg>
                    <svg className={styles.icon} viewBox={tailIcon.viewBox} title={tailIcon.title}>
                        <use xlinkHref={tailIcon.symbol} />
                    </svg>
                </div>
            </div>
        );
    }

}
