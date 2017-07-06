import React, { Component } from 'react';

import basicIcon from '../../images/basic.svg';
import clipPathIcon from '../../images/clipPath.svg';
import gradientIcon from '../../images/gradient.svg';
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
                    <svg className={styles.icon} viewBox={basicIcon.viewBox}>
                        <use xlinkHref={basicIcon.symbol} />
                    </svg>
                    <svg className={styles.icon} viewBox={clipPathIcon.viewBox}>
                        <use xlinkHref={clipPathIcon.symbol} />
                    </svg>
                    <svg className={styles.icon} viewBox={gradientIcon.viewBox}>
                        <use xlinkHref={gradientIcon.symbol} />
                    </svg>
                </div>
            </div>
        );
    }

}
